/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * An output list the build accepts: an entry importing the shared sources by their specifier, the shared
 * sources themselves, and a re-export of an installed package.
 */
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export default {
    root: dirname(fileURLToPath(import.meta.url)),
    shared: [{ specifier: '@fixture/shared', directory: 'shared' }],
    outputs: [
        { file: 'bare.js', entry: 'entry-bare.js', external: ['@fixture/shared'] },
        { file: 'shared.js', entry: 'shared/greeting.js', external: [] },
        { file: 'vendor/preact.js', reexport: 'preact', external: [] },
    ],
};
