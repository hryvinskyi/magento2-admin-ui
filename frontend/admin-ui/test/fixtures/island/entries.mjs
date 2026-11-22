/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * The fixture island's output list for the kit's build script: one module, every shared specifier left to the
 * page's import map, so the island carries no copy of the UI library or of the kit.
 */
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SHARED } from '../../../scripts/entries.mjs';

export default {
    root: dirname(fileURLToPath(import.meta.url)),
    tsconfig: 'tsconfig.json',
    shared: SHARED.map((specifier) => ({ specifier })),
    outputs: [{ file: 'island.js', entry: 'src/index.tsx', external: SHARED }],
};
