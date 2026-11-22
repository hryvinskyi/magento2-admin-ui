/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { choiceAfterKey, tabAfterKey } from '@hryvinskyi/admin-ui';

const VALUES = ['a', 'b', 'c'];

describe('choiceAfterKey', () => {
    it('moves to the next value on the forward arrows and the previous on the backward ones', () => {
        assert.equal(choiceAfterKey(VALUES, 'b', 'ArrowRight'), 'c');
        assert.equal(choiceAfterKey(VALUES, 'b', 'ArrowDown'), 'c');
        assert.equal(choiceAfterKey(VALUES, 'b', 'ArrowLeft'), 'a');
        assert.equal(choiceAfterKey(VALUES, 'b', 'ArrowUp'), 'a');
    });

    it('wraps around at both ends', () => {
        assert.equal(choiceAfterKey(VALUES, 'c', 'ArrowRight'), 'a');
        assert.equal(choiceAfterKey(VALUES, 'a', 'ArrowLeft'), 'c');
    });

    it('ignores other keys and a value outside the group', () => {
        assert.equal(choiceAfterKey(VALUES, 'a', 'Enter'), null);
        assert.equal(choiceAfterKey(VALUES, 'x', 'ArrowRight'), null);
        assert.equal(choiceAfterKey([], 'a', 'ArrowRight'), null);
    });
});

describe('tabAfterKey', () => {
    it('moves with the arrow keys as a radio group does, wrapping at the ends', () => {
        assert.equal(tabAfterKey(VALUES, 'a', 'ArrowRight'), 'b');
        assert.equal(tabAfterKey(VALUES, 'a', 'ArrowLeft'), 'c');
    });

    it('jumps to the first tab on Home and the last on End', () => {
        assert.equal(tabAfterKey(VALUES, 'b', 'Home'), 'a');
        assert.equal(tabAfterKey(VALUES, 'b', 'End'), 'c');
    });

    it('ignores other keys and a value outside the list', () => {
        assert.equal(tabAfterKey(VALUES, 'b', 'Tab'), null);
        assert.equal(tabAfterKey(VALUES, 'x', 'Home'), null);
        assert.equal(tabAfterKey([], 'a', 'End'), null);
    });
});
