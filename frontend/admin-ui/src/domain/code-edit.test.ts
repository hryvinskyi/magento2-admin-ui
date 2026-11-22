/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { indentSelection, lineAt, outdentSelection, replaceRange } from '@hryvinskyi/admin-ui';

describe('lineAt', () => {
    it('finds the line of an offset and where it starts', () => {
        const text = 'ab\ncd\n\nef';
        assert.deepEqual(lineAt(text, 0), { index: 0, start: 0 });
        assert.deepEqual(lineAt(text, 2), { index: 0, start: 0 });
        assert.deepEqual(lineAt(text, 3), { index: 1, start: 3 });
        assert.deepEqual(lineAt(text, 6), { index: 2, start: 6 });
        assert.deepEqual(lineAt(text, 9), { index: 3, start: 7 });
    });
});

describe('indentSelection', () => {
    it('puts two spaces at the caret, or in place of a selection within one line', () => {
        assert.deepEqual(indentSelection('ab', 1, 1), { text: 'a  b', selectionStart: 3, selectionEnd: 3 });
        assert.deepEqual(indentSelection('abcd', 1, 3), { text: 'a  d', selectionStart: 3, selectionEnd: 3 });
    });

    it('indents every line of a selection over several lines and keeps it selected', () => {
        const text = 'a\nb\nc';
        assert.deepEqual(indentSelection(text, 0, 3), { text: '  a\n  b\nc', selectionStart: 2, selectionEnd: 7 });
    });

    it('leaves out a last line the selection only reaches the start of', () => {
        assert.deepEqual(indentSelection('a\nb\nc', 0, 4), { text: '  a\n  b\nc', selectionStart: 2, selectionEnd: 8 });
    });
});

describe('outdentSelection', () => {
    it('takes up to two leading spaces from the caret\'s line, wherever the caret is on it', () => {
        assert.deepEqual(outdentSelection('    ab', 5, 5), { text: '  ab', selectionStart: 3, selectionEnd: 3 });
        assert.deepEqual(outdentSelection(' ab', 2, 2), { text: 'ab', selectionStart: 1, selectionEnd: 1 });
        assert.deepEqual(outdentSelection('ab', 1, 1), { text: 'ab', selectionStart: 1, selectionEnd: 1 });
    });

    it('outdents every line of a selection, moving a selection end that sat in the removed spaces to the line start', () => {
        const text = '  a\n    b\nc';
        assert.deepEqual(outdentSelection(text, 1, 8), { text: 'a\n  b\nc', selectionStart: 0, selectionEnd: 4 });
    });
});

describe('replaceRange', () => {
    it('puts the value in place of the range with the caret after it', () => {
        assert.deepEqual(
            replaceRange('"{{prod"', 3, 7, 'product.sku}}'),
            { text: '"{{product.sku}}"', selectionStart: 16, selectionEnd: 16 },
        );
        assert.deepEqual(replaceRange('ab', 1, 1, 'X'), { text: 'aXb', selectionStart: 2, selectionEnd: 2 });
    });
});
