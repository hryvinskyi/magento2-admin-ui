/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { codeLines, plainTokens, sameSegments, visibleRows, type CodeLine } from '@hryvinskyi/admin-ui';

/** Each line as `kind:text` pieces, for short assertions. */
const pieces = (lines: readonly CodeLine[]): string[][] =>
    lines.map((line) => line.segments.map((segment) => `${segment.kind}:${segment.text}`));

describe('codeLines', () => {
    it('cuts the text into lines, plain where no token is, one line for an empty text', () => {
        assert.deepEqual(pieces(codeLines('a\n\nb', plainTokens('a\n\nb'))), [['plain:a'], [], ['plain:b']]);
        assert.deepEqual(codeLines('', []).map((line) => line.text), ['']);
        assert.deepEqual(codeLines('x\n', []).map((line) => line.text), ['x', '']);
    });

    it('colours the ranges the tokens name and leaves the gaps plain', () => {
        const text = '"sku": "{{product.sku}}",';
        const lines = codeLines(text, [
            { kind: 'key', from: 0, to: 5 },
            { kind: 'punctuation', from: 5, to: 6 },
            { kind: 'string', from: 7, to: 8 },
            { kind: 'field', from: 8, to: 23 },
            { kind: 'string', from: 23, to: 24 },
            { kind: 'punctuation', from: 24, to: 25 },
        ]);
        assert.deepEqual(pieces(lines), [[
            'key:"sku"', 'punctuation::', 'plain: ', 'string:"', 'field:{{product.sku}}', 'string:"', 'punctuation:,',
        ]]);
    });

    it('takes tokens in any order, colours each line of a token that spans lines, and keeps every character', () => {
        const text = '{\n  "a": 1\n}';
        const lines = codeLines(text, [
            { kind: 'number', from: 9, to: 10 },
            { kind: 'string', from: 0, to: 6 },
        ]);
        assert.deepEqual(pieces(lines), [['string:{'], ['string:  "a', 'plain:": ', 'number:1'], ['plain:}']]);
        assert.equal(lines.map((line) => line.segments.map((segment) => segment.text).join('')).join('\n'), text);
    });

    it('ignores empty, reversed and out-of-range tokens, and clips one that overlaps an earlier one', () => {
        const lines = codeLines('abcdef', [
            { kind: 'key', from: 0, to: 3 },
            { kind: 'string', from: 2, to: 5 },
            { kind: 'number', from: 4, to: 4 },
            { kind: 'number', from: 5, to: 2 },
            { kind: 'field', from: 10, to: 12 },
            { kind: 'directive', from: -4, to: 0 },
            { kind: 'directive', from: 0.5, to: 2 },
        ]);
        assert.deepEqual(pieces(lines), [['key:abc', 'string:de', 'plain:f']]);
    });

    it('keys a line by its text, telling identical lines apart, so a line keeps its key when lines move', () => {
        const before = codeLines('a\n}\nb\n}', []).map((line) => line.key);
        const after = codeLines('new\na\n}\nb\n}', []).map((line) => line.key);
        assert.equal(new Set(before).size, 4);
        assert.deepEqual(after.slice(1), before);
    });
});

describe('sameSegments', () => {
    it('is true only for the same pieces of the same kinds in the same order', () => {
        const [line] = codeLines('ab', [{ kind: 'key', from: 0, to: 1 }]);
        const [same] = codeLines('ab', [{ kind: 'key', from: 0, to: 1 }]);
        const [recoloured] = codeLines('ab', [{ kind: 'string', from: 0, to: 1 }]);
        const [plain] = codeLines('ab', []);
        assert.ok(line !== undefined && same !== undefined && recoloured !== undefined && plain !== undefined);
        assert.equal(sameSegments(line.segments, same.segments), true);
        assert.equal(sameSegments(line.segments, recoloured.segments), false);
        assert.equal(sameSegments(line.segments, plain.segments), false);
    });
});

describe('visibleRows', () => {
    it('shows every line, at least the minimum, and at most the maximum when there is one', () => {
        assert.equal(visibleRows(2, 4), 4);
        assert.equal(visibleRows(54, 4), 54);
        assert.equal(visibleRows(54, 4, 20), 20);
        assert.equal(visibleRows(3, 4, 20), 4);
    });
});
