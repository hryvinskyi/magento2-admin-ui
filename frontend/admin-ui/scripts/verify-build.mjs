/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * Proves the committed files are exactly what the sources build to: rebuilds the browser files and the kit's
 * declarations into a temporary directory and compares every file byte for byte with view/adminhtml/web/js/admin-ui/
 * and types/. A file that differs, is missing, or is committed without the build producing it fails the check (exit
 * code 1). Both directories belong to the build alone.
 */
import { execFileSync } from 'node:child_process';
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const COMMITTED = resolve(ROOT, '../../view/adminhtml/web/js/admin-ui');
const DECLARATIONS = resolve(ROOT, 'types');

/**
 * Every file under a directory, as paths relative to it; none when the directory does not exist.
 *
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
async function filesIn(dir) {
    try {
        const entries = await readdir(dir, { recursive: true, withFileTypes: true });
        return entries
            .filter((entry) => entry.isFile())
            .map((entry) => relative(dir, join(entry.parentPath, entry.name)))
            .sort();
    } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

/**
 * Compares what the build wrote into the scratch directory with the committed one.
 *
 * @param {string} fresh the scratch directory
 * @param {string} committedDir the committed directory
 * @returns {Promise<string[]>} one line per problem
 */
async function compare(fresh, committedDir) {
    const found = [];
    const built = await filesIn(fresh);
    const committed = new Set(await filesIn(committedDir));
    for (const file of built) {
        if (!committed.has(file)) {
            found.push(`missing: ${join(committedDir, file)} is built but not committed`);
            continue;
        }
        const [rebuilt, kept] = await Promise.all([readFile(join(fresh, file)), readFile(join(committedDir, file))]);
        if (!rebuilt.equals(kept)) {
            found.push(`differs: ${join(committedDir, file)} does not match what its sources build to`);
        }
        committed.delete(file);
    }
    for (const file of committed) {
        found.push(`stale: ${join(committedDir, file)} is committed but the build no longer produces it`);
    }
    return found;
}

const scratch = await mkdtemp(join(tmpdir(), 'admin-ui-kit-build-'));
let problems = [];
try {
    const fresh = join(scratch, 'js');
    const declared = join(scratch, 'types');
    execFileSync(process.execPath, [join(ROOT, 'scripts/build.mjs'), '--out', fresh], { stdio: 'inherit' });
    execFileSync(process.execPath, [join(ROOT, 'scripts/declarations.mjs'), '--out', declared], { stdio: 'inherit' });
    problems = [...await compare(fresh, COMMITTED), ...await compare(declared, DECLARATIONS)];
} finally {
    await rm(scratch, { recursive: true, force: true });
}

if (problems.length > 0) {
    console.error(`The committed build is out of date. Run npm run build.\n  ${problems.join('\n  ')}`);
    process.exit(1);
}
console.log(`The committed build in ${COMMITTED} and the declarations in ${DECLARATIONS} match their sources.`);
