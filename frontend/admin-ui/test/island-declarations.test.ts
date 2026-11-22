/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * The fixture island type-checks against what this package publishes — the declarations in types/ — and against
 * nothing else: pointed at a declaration file that is not there, its check fails on the kit's specifier. It is drawn
 * with the kit's components, and its build leaves every shared specifier to the page's import map.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

/** The kit's specifier, and every specifier the page's import map resolves for every island. */
const KIT = '@hryvinskyi/admin-ui';
const SHARED: readonly string[] = ['preact', 'preact/hooks', 'preact/jsx-runtime', KIT];

const WORKSPACE = fileURLToPath(new URL('..', import.meta.url));
const TSC = join(WORKSPACE, 'node_modules/typescript/bin/tsc');
const ISLAND_CONFIG = join(WORKSPACE, 'test/fixtures/island/tsconfig.json');
const ISLAND_ENTRIES = join(WORKSPACE, 'test/fixtures/island/entries.mjs');
const scratch = mkdtempSync(join(tmpdir(), 'admin-ui-kit-island-check-'));
after(() => rmSync(scratch, { recursive: true, force: true }));

function check(project: string): { readonly status: number | null; readonly output: string } {
    const result = spawnSync(process.execPath, [TSC, '--noEmit', '-p', project], { cwd: WORKSPACE, encoding: 'utf8' });
    return { status: result.status, output: `${result.stdout}${result.stderr}` };
}

describe('the fixture island', () => {
    it('type-checks against the published declarations', () => {
        const run = check(ISLAND_CONFIG);

        assert.equal(run.status, 0, run.output);
    });

    it('builds its kit-drawn view importing only the shared specifiers, so it carries no copy of the kit', () => {
        const out = join(scratch, 'built');
        const build = spawnSync(
            process.execPath,
            [join(WORKSPACE, 'scripts/build.mjs'), '--entries', ISLAND_ENTRIES, '--out', out],
            { cwd: WORKSPACE, encoding: 'utf8' },
        );
        assert.equal(build.status, 0, `${build.stdout}${build.stderr}`);

        const bundle = readFileSync(join(out, 'island.js'), 'utf8');
        const imports = new Set([...bundle.matchAll(/from"([^"]+)"/g)].map((match) => match[1]));
        assert.ok(imports.has(KIT), 'the kit comes from the one the page loads');
        assert.deepEqual([...imports].filter((specifier) => !SHARED.includes(specifier ?? '')), []);
    });

    it('fails its check when its tsconfig points the kit\'s specifier at nothing', () => {
        const project = join(scratch, 'tsconfig.json');
        writeFileSync(project, JSON.stringify({
            extends: ISLAND_CONFIG,
            compilerOptions: { paths: { [KIT]: ['./nothing/index.d.ts'] } },
        }));
        const run = check(project);

        assert.notEqual(run.status, 0);
        assert.match(run.output, /Cannot find module '@hryvinskyi\/admin-ui'/);
    });
});
