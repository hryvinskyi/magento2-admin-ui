/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * The kit's pure part is a strict subset of its entry module: everything a pure module imports for its type check is
 * the very binding the page's kit hands it at run time.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import * as kit from './index.ts';
import * as pure from './pure.ts';

describe('the kit\'s pure part', () => {
    it('exports only what the entry module exports, as the same values', () => {
        const kitExports: Readonly<Record<string, unknown>> = kit;
        for (const [name, value] of Object.entries(pure)) {
            assert.ok(name in kitExports, `the entry module exports ${name}`);
            assert.equal(kitExports[name], value, `${name} is the same binding`);
        }
        assert.ok(Object.keys(pure).length > 0);
    });
});
