/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * What the build produces from this workspace: the one list of outputs, and the specifiers every output leaves to
 * the page's import map. An output is either an entry module of the sources or a re-export of a package:
 *
 *   { file: 'kit.js', entry: 'src/index.ts', external: [...the UI library's specifiers] }
 *   { file: 'vendor/preact.js', reexport: 'preact', external: [] }
 *
 * `file` is relative to the output directory, `entry` to this workspace; `external` names the shared specifiers the
 * output imports instead of bundling. A shared specifier that names a `directory` owns the sources in it: a module
 * outside it that reaches into it by a relative path fails the build, because the page would then hold two copies
 * of those sources.
 *
 * The page's import map names each shared output by its file: `kit.js` for the kit, `vendor/*.js` for the UI
 * library's three entry points. The UI library's hooks and JSX runtime import the library itself through its
 * specifier, so the page holds one copy of it; an island's entry module imports all four through their specifiers.
 */
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** The UI library's three entry points. */
export const UI_LIBRARY = ['preact', 'preact/hooks', 'preact/jsx-runtime'];

/** The kit's bare specifier. */
export const KIT = '@hryvinskyi/admin-ui';

/** Every specifier the page's import map resolves for every island. */
export const SHARED = [...UI_LIBRARY, KIT];

export default {
    root: resolve(dirname(fileURLToPath(import.meta.url)), '..'),
    tsconfig: 'tsconfig.json',
    shared: [
        { specifier: 'preact' },
        { specifier: 'preact/hooks' },
        { specifier: 'preact/jsx-runtime' },
        { specifier: KIT, directory: 'src' },
    ],
    outputs: [
        { file: 'kit.js', entry: 'src/index.ts', external: UI_LIBRARY },
        { file: 'vendor/preact.js', reexport: 'preact', external: [] },
        { file: 'vendor/preact-hooks.js', reexport: 'preact/hooks', external: ['preact'] },
        { file: 'vendor/preact-jsx-runtime.js', reexport: 'preact/jsx-runtime', external: ['preact'] },
    ],
};
