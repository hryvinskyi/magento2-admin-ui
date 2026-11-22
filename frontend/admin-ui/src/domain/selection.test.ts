/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { afterSelectAll, afterToggle, selectionState } from '@hryvinskyi/admin-ui';

const SHOWN = ['a', 'b', 'c'];

describe('the selection of a list', () => {
    it('is all, some or none of the rows shown, rows elsewhere aside', () => {
        assert.equal(selectionState(SHOWN, new Set(['a', 'b', 'c', 'z'])), 'all');
        assert.equal(selectionState(SHOWN, new Set(['b', 'z'])), 'some');
        assert.equal(selectionState(SHOWN, new Set(['z'])), 'none');
        assert.equal(selectionState([], new Set(['z'])), 'none');
    });

    it('ticks every row shown with select-all unless all were ticked, then clears them, keeping rows elsewhere', () => {
        assert.deepEqual([...afterSelectAll(SHOWN, new Set(['b', 'z']))].sort(), ['a', 'b', 'c', 'z']);
        assert.deepEqual([...afterSelectAll(SHOWN, new Set(['a', 'b', 'c', 'z']))], ['z']);
        assert.deepEqual([...afterSelectAll(SHOWN, new Set())].sort(), SHOWN);
    });

    it('ticks and clears one row', () => {
        assert.deepEqual([...afterToggle(new Set(['a']), 'b')].sort(), ['a', 'b']);
        assert.deepEqual([...afterToggle(new Set(['a', 'b']), 'a')], ['b']);
    });

    it('leaves the set it was given as it was', () => {
        const selected = new Set(['a']);
        afterToggle(selected, 'b');
        afterSelectAll(SHOWN, selected);
        assert.deepEqual([...selected], ['a']);
    });
});
