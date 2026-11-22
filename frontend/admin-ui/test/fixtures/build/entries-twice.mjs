/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * An output list the build refuses: two entries bundling the same module.
 */
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export default {
    root: dirname(fileURLToPath(import.meta.url)),
    shared: [{ specifier: '@fixture/shared', directory: 'shared' }],
    outputs: [
        { file: 'bare.js', entry: 'entry-bare.js', external: ['@fixture/shared'] },
        { file: 'other.js', entry: 'entry-other.js', external: [] },
    ],
};
