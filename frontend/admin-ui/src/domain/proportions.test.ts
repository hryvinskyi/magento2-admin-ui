/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { fractionOf, heightsOf, sharesOf } from '@hryvinskyi/admin-ui';

describe('sharesOf', () => {
    it('gives whole percent that add up to exactly 100, the largest remainders taking the rounding', () => {
        assert.deepEqual(sharesOf([1, 1, 1]), [34, 33, 33]);
        assert.deepEqual(sharesOf([620, 120, 180, 80]), [62, 12, 18, 8]);
        const shares = sharesOf([2, 3, 5, 7, 11, 13]);
        assert.equal(shares.reduce((sum, share) => sum + share, 0), 100);
        assert.deepEqual(shares, [5, 7, 12, 17, 27, 32]);
    });

    it('gives one series the whole', () => {
        assert.deepEqual(sharesOf([42]), [100]);
    });

    it('draws nothing for a whole of nothing, never NaN', () => {
        assert.deepEqual(sharesOf([0, 0, 0]), [0, 0, 0]);
        assert.deepEqual(sharesOf([]), []);
    });

    it('counts a value below zero or not a number as nothing', () => {
        assert.deepEqual(sharesOf([-5, Number.NaN, 10, Number.POSITIVE_INFINITY]), [0, 0, 100, 0]);
    });
});

describe('heightsOf', () => {
    it('gives each value as a percent of the largest, rounded', () => {
        assert.deepEqual(heightsOf([50, 100, 25, 33]), [50, 100, 25, 33]);
    });

    it('draws a value above nothing at least 1 % high, and nothing as nothing', () => {
        assert.deepEqual(heightsOf([1, 1000, 0]), [1, 100, 0]);
    });

    it('draws only empty bars when every value is nothing, never NaN', () => {
        assert.deepEqual(heightsOf([0, 0]), [0, 0]);
        assert.deepEqual(heightsOf([]), []);
    });
});

describe('fractionOf', () => {
    it('gives the value as a percent of the whole, kept within 0 and 100', () => {
        assert.equal(fractionOf(3.4, 5), 68);
        assert.equal(fractionOf(7, 5), 100);
        assert.equal(fractionOf(0.001, 5), 1);
    });

    it('draws nothing for nothing, or for a whole of nothing', () => {
        assert.equal(fractionOf(0, 5), 0);
        assert.equal(fractionOf(-2, 5), 0);
        assert.equal(fractionOf(3, 0), 0);
        assert.equal(fractionOf(3, Number.NaN), 0);
    });
});
