/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * An output list the build refuses: an entry reaching into the shared sources' directory by a relative path.
 */
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export default {
    root: dirname(fileURLToPath(import.meta.url)),
    shared: [{ specifier: '@fixture/shared', directory: 'shared' }],
    outputs: [
        { file: 'relative.js', entry: 'entry-relative.js', external: ['@fixture/shared'] },
    ],
};
