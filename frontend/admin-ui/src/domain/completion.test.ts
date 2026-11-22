/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { itemAfterKey, usableCompletion, type Completion } from '@hryvinskyi/admin-ui';

const ITEMS = [{ value: 'a', label: 'a' }];

describe('usableCompletion', () => {
    it('keeps an answer with items whose range lies within the text', () => {
        const answer: Completion = { from: 2, to: 4, items: ITEMS };
        assert.equal(usableCompletion(answer, 4), answer);
        assert.ok(usableCompletion({ from: 4, to: 4, items: ITEMS }, 4) !== null);
    });

    it('opens nothing for no answer, no items, or a range outside the text or backwards', () => {
        assert.equal(usableCompletion(null, 4), null);
        assert.equal(usableCompletion({ from: 0, to: 1, items: [] }, 4), null);
        assert.equal(usableCompletion({ from: 0, to: 5, items: ITEMS }, 4), null);
        assert.equal(usableCompletion({ from: -1, to: 1, items: ITEMS }, 4), null);
        assert.equal(usableCompletion({ from: 3, to: 2, items: ITEMS }, 4), null);
        assert.equal(usableCompletion({ from: 0.5, to: 2, items: ITEMS }, 4), null);
    });
});

describe('itemAfterKey', () => {
    it('moves down and up, wrapping at both ends, and ignores every other key', () => {
        assert.equal(itemAfterKey(0, 3, 'ArrowDown'), 1);
        assert.equal(itemAfterKey(2, 3, 'ArrowDown'), 0);
        assert.equal(itemAfterKey(0, 3, 'ArrowUp'), 2);
        assert.equal(itemAfterKey(0, 3, 'ArrowRight'), null);
        assert.equal(itemAfterKey(0, 0, 'ArrowDown'), null);
    });
});
