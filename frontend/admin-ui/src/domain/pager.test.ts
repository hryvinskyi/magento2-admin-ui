/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { pageRange } from '@hryvinskyi/admin-ui';

describe('pageRange', () => {
    it('gives the rows of a page in the middle, with both neighbours', () => {
        assert.deepEqual(pageRange(2, 12, 48210), {
            page: 2,
            pageCount: 4018,
            first: 13,
            last: 24,
            total: 48210,
            hasPrevious: true,
            hasNext: true,
        });
    });

    it('has no previous page on the first and no next page on the last, which may be short', () => {
        const first = pageRange(1, 12, 30);
        assert.deepEqual([first.first, first.last, first.hasPrevious, first.hasNext], [1, 12, false, true]);
        const last = pageRange(3, 12, 30);
        assert.deepEqual([last.first, last.last, last.hasPrevious, last.hasNext], [25, 30, true, false]);
    });

    it('reads a page past the end as the last page', () => {
        const range = pageRange(9, 12, 30);
        assert.deepEqual([range.page, range.pageCount, range.first, range.last], [3, 3, 25, 30]);
    });

    it('shows an empty list as one empty page with nowhere to go', () => {
        assert.deepEqual(pageRange(1, 12, 0), {
            page: 1,
            pageCount: 1,
            first: 0,
            last: 0,
            total: 0,
            hasPrevious: false,
            hasNext: false,
        });
    });

    it('refuses a page, a page size or a total out of range', () => {
        assert.throws(() => pageRange(0, 12, 30), RangeError);
        assert.throws(() => pageRange(1, 0, 30), RangeError);
        assert.throws(() => pageRange(1, 12, -1), RangeError);
        assert.throws(() => pageRange(1.5, 12, 30), RangeError);
        assert.throws(() => pageRange(1, 12, Number.NaN), RangeError);
    });
});
