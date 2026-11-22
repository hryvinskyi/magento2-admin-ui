/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * Publishes the kit's type declarations into types/ (or `--out <dir>`): what an island of another package
 * type-checks against, by mapping the kit's bare specifier to `types/index.d.ts` in its own tsconfig. Only the kit's
 * entry module and the modules it reaches are declared, with the workspace's own TypeScript and without the Node
 * types, so an island needs nothing but the UI library's own declarations beside them.
 *
 * The directory is replaced as a whole, so a declaration whose source is gone does not linger; trailing whitespace
 * the emitter leaves (after a union's `=` when a comment opens its first member) is trimmed. The output is
 * deterministic, so verify-build can compare it byte for byte.
 */
import { execFileSync } from 'node:child_process';
import { readdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const WORKSPACE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_OUT = resolve(WORKSPACE, 'types');
const TSC = resolve(WORKSPACE, 'node_modules/typescript/bin/tsc');

/**
 * Trims trailing whitespace from every declaration under a directory.
 *
 * @param {string} dir
 */
async function trim(dir) {
    const entries = await readdir(dir, { recursive: true, withFileTypes: true });
    for (const entry of entries.filter((item) => item.isFile())) {
        const file = join(entry.parentPath, entry.name);
        const text = await readFile(file, 'utf8');
        await writeFile(file, text.replace(/[ \t]+$/gm, ''));
    }
}

const { values } = parseArgs({ options: { out: { type: 'string' } } });
const outDir = resolve(values.out ?? DEFAULT_OUT);
const scratch = `${outDir}.tmp-${process.pid}`;

await rm(scratch, { recursive: true, force: true });
try {
    execFileSync(process.execPath, [TSC, '-p', resolve(WORKSPACE, 'tsconfig.kit.json'), '--outDir', scratch], {
        cwd: WORKSPACE,
        stdio: 'inherit',
    });
    await trim(scratch);
    await rm(outDir, { recursive: true, force: true });
    await rename(scratch, outDir);
} finally {
    await rm(scratch, { recursive: true, force: true });
}
console.log(`Declared the kit into ${outDir}`);
