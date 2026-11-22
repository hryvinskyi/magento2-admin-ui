/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * The built files, run as the page runs them. The build script builds the workspace's own outputs — the kit and the
 * UI library's three entry points — and the fixture island into a temporary directory; a resolve hook plays the
 * page's import map, sending the bare specifiers to the built files; then the island's entry module is imported on
 * the markup the server prints for the fixture island (`Test/_contract/island-page.html`).
 *
 * The island's view reads the kit through `useKit()`, and the kit's switch and pager inside it read the same
 * provider — the one the kit's island start set up. That only works when the page holds one copy of the UI library and one of the
 * kit: a second copy of either would leave the island's hooks without a provider. Tests of the sources cannot see
 * that, because there every import resolves to the same file.
 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import { registerHooks } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, it, mock } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { waitFor } from '@testing-library/preact';
import { ISLAND, placeIslandPage } from './support/island-page.ts';

const WORKSPACE = fileURLToPath(new URL('..', import.meta.url));

let built = '';

function build(entries: string): void {
    execFileSync(
        process.execPath,
        [join(WORKSPACE, 'scripts/build.mjs'), '--entries', join(WORKSPACE, entries), '--out', built],
        { stdio: 'pipe' },
    );
}

before(async () => {
    // The real path: module URLs name it, and a temporary directory is often reached through a symbolic link.
    built = await realpath(await mkdtemp(join(tmpdir(), 'admin-ui-kit-built-')));
    build('scripts/entries.mjs');
    build('test/fixtures/island/entries.mjs');
    // The browser runs every file as an ES module; so does Node, once the directory says so.
    await writeFile(join(built, 'package.json'), '{"type":"module"}');

    const importMap: Readonly<Record<string, string>> = {
        preact: pathToFileURL(join(built, 'vendor/preact.js')).href,
        'preact/hooks': pathToFileURL(join(built, 'vendor/preact-hooks.js')).href,
        'preact/jsx-runtime': pathToFileURL(join(built, 'vendor/preact-jsx-runtime.js')).href,
        '@hryvinskyi/admin-ui': pathToFileURL(join(built, 'kit.js')).href,
    };
    const builtUrl = pathToFileURL(built).href;
    registerHooks({
        resolve: (specifier, context, nextResolve) => {
            const url = importMap[specifier];
            return url !== undefined && context.parentURL?.startsWith(builtUrl) === true
                ? { url, shortCircuit: true, format: 'module' }
                : nextResolve(specifier, context);
        },
    });
});

after(async () => {
    await rm(built, { recursive: true, force: true });
});

it('starts the built island on the printed page, its hooks reading the kit the built kit provides', async () => {
    const logged = mock.method(console, 'error', () => undefined);
    const root = placeIslandPage(document);

    await import(pathToFileURL(join(built, 'island.js')).href);

    const kit = (): string | null | undefined => root.querySelector('[data-testid="kit"]')?.textContent;
    await waitFor(() => assert.equal(kit(), 'en_US · Yes'));
    assert.equal(root.querySelector(`[data-role="${ISLAND}-loading"]`), null, 'the loading line is gone');
    assert.equal(root.querySelector('.hui-card__title')?.textContent, 'Test island', 'the page\'s part reached the view');

    const control = root.querySelector('[role="switch"][aria-label="row"]');
    assert.ok(control instanceof HTMLElement);
    assert.deepEqual([control.getAttribute('aria-checked'), control.textContent], ['true', 'Yes']);
    control.click();
    await waitFor(() => assert.equal(
        root.querySelector('[role="switch"][aria-label="row"]')?.textContent,
        'No',
        'the built hooks and the built kit share one UI library',
    ));

    const range = (): string | null | undefined => root.querySelector('.hui-pager__range')?.textContent;
    assert.equal(range(), '1–1 of 1,200', 'the built pager words its range with the printed phrases');
    const next = root.querySelector('button[aria-label="Next page"]');
    assert.ok(next instanceof HTMLElement, 'the built pager names its buttons with the printed phrases');
    next.click();
    await waitFor(() => assert.equal(range(), '2–2 of 1,200'));

    assert.deepEqual(logged.mock.calls.map((call) => call.arguments.map(String).join(' ')), []);
});
