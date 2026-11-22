/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseHexColour } from '@hryvinskyi/admin-ui';

describe('parseHexColour', () => {
    it('accepts # and six hexadecimal digits, in lower case and without the spaces around them', () => {
        assert.equal(parseHexColour('#8c4a2b'), '#8c4a2b');
        assert.equal(parseHexColour('#8C4A2B'), '#8c4a2b');
        assert.equal(parseHexColour('  #a9bafd '), '#a9bafd');
    });

    it('refuses every other form', () => {
        for (const text of ['', '#', '8c4a2b', '#8c4a2', '#8c4a2bb', '#fff', '#8c4a2g', '# 8c4a2b', 'red', 'rgb(1,2,3)', '#8c4a2b;']) {
            assert.equal(parseHexColour(text), null, text);
        }
    });
});
