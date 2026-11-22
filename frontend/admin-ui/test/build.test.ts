/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * The build script, run as `npm run build` runs it, over fixture output lists.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { after, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const WORKSPACE = fileURLToPath(new URL('..', import.meta.url));
const FIXTURES = fileURLToPath(new URL('fixtures/build/', import.meta.url));
const scratch = mkdtempSync(join(tmpdir(), 'admin-ui-kit-build-test-'));
after(() => rmSync(scratch, { recursive: true, force: true }));

interface Run {
    readonly status: number | null;
    readonly output: string;
    readonly out: string;
}

let runs = 0;

function build(entries: string | null): Run {
    const out = join(scratch, `run-${++runs}`);
    const list = entries === null ? [] : ['--entries', join(FIXTURES, entries)];
    const args = [join(WORKSPACE, 'scripts/build.mjs'), '--out', out, ...list];
    const result = spawnSync(process.execPath, args, { cwd: WORKSPACE, encoding: 'utf8' });
    return { status: result.status, output: `${result.stdout}${result.stderr}`, out };
}

function filesIn(dir: string): readonly string[] {
    return readdirSync(dir, { recursive: true, withFileTypes: true })
        .filter((entry) => entry.isFile())
        .map((entry) => relative(dir, join(entry.parentPath, entry.name)))
        .sort();
}

describe('the build script', () => {
    it('builds the kit and the UI library\'s three entry points, all sharing one copy of each', () => {
        const run = build(null);

        assert.equal(run.status, 0, run.output);
        assert.deepEqual(filesIn(run.out), [
            'kit.js',
            'vendor/preact-hooks.js',
            'vendor/preact-jsx-runtime.js',
            'vendor/preact.js',
        ]);
        const importsOf = (file: string): readonly string[] => [...new Set(
            [...readFileSync(join(run.out, file), 'utf8').matchAll(/from"([^"]+)"/g)].map((match) => match[1] ?? ''),
        )].sort();
        assert.deepEqual(importsOf('kit.js'), ['preact', 'preact/hooks', 'preact/jsx-runtime']);
        assert.deepEqual(importsOf('vendor/preact-hooks.js'), ['preact']);
        assert.deepEqual(importsOf('vendor/preact-jsx-runtime.js'), ['preact']);
        assert.deepEqual(importsOf('vendor/preact.js'), []);
    });

    it('builds each listed output as a minified ES module, the shared specifier left to the import map', () => {
        const run = build('entries-valid.mjs');

        assert.equal(run.status, 0, run.output);
        assert.deepEqual(filesIn(run.out), ['bare.js', 'shared.js', 'vendor/preact.js']);
        const bare = readFileSync(join(run.out, 'bare.js'), 'utf8');
        assert.match(bare, /from"@fixture\/shared"/);
        assert.doesNotMatch(bare, /\n./, 'minified onto one line');
    });

    it('gives identical bytes on every run', () => {
        const first = build('entries-valid.mjs');
        const second = build('entries-valid.mjs');

        assert.equal(first.status, 0, first.output);
        assert.equal(second.status, 0, second.output);
        for (const file of filesIn(first.out)) {
            assert.ok(readFileSync(join(first.out, file)).equals(readFileSync(join(second.out, file))), file);
        }
        assert.deepEqual(filesIn(second.out), filesIn(first.out));
    });

    it('fails on a relative import across the shared boundary, naming it, and writes nothing', () => {
        const run = build('entries-relative.mjs');

        assert.notEqual(run.status, 0);
        assert.match(run.output, /relative\.js imports \.\/shared\/greeting\.js; only bare specifiers are allowed/);
        assert.equal(existsSync(run.out), false);
    });

    it('fails on a module bundled into two outputs, naming it, and writes nothing', () => {
        const run = build('entries-twice.mjs');

        assert.notEqual(run.status, 0);
        assert.match(run.output, /common\.js is bundled into both bare\.js and other\.js/);
        assert.equal(existsSync(run.out), false);
    });
});
