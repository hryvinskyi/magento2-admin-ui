/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { characterCount, lengthState } from '@hryvinskyi/admin-ui';

describe('characterCount', () => {
    it('counts characters as code points, an emoji or an accented letter once', () => {
        assert.equal(characterCount(''), 0);
        assert.equal(characterCount('Grüße'), 5);
        assert.equal(characterCount('ok 🍪'), 4);
    });
});

describe('lengthState', () => {
    it('is within the limit up to its last tenth, near in it, and over past it', () => {
        assert.equal(lengthState(359, 400), 'within');
        assert.equal(lengthState(360, 400), 'near');
        assert.equal(lengthState(400, 400), 'near');
        assert.equal(lengthState(401, 400), 'over');
    });
});
