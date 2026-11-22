/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * How much of a whole each value is, as the charts and bars draw it, in whole percent. The values arrive from the
 * server; these only turn them into lengths. A value below zero or not a finite number counts as nothing, and a
 * whole of nothing draws nothing: every result is a number from 0 to 100, never NaN.
 */

const amount = (value: number): number => (Number.isFinite(value) && value > 0 ? value : 0);

/**
 * Each value's share of their sum, in whole percent that add up to exactly 100 (the largest remainders take the
 * rounding, the earlier value first on a tie); all zero when the sum is nothing.
 */
export function sharesOf(values: readonly number[]): number[] {
    const counted = values.map(amount);
    const sum = counted.reduce((total, value) => total + value, 0);
    if (sum === 0) {
        return counted.map(() => 0);
    }
    const exact = counted.map((value) => (value / sum) * 100);
    const shares = exact.map(Math.floor);
    const left = 100 - shares.reduce((total, share) => total + share, 0);
    const byRemainder = exact
        .map((value, index) => ({ index, remainder: value - Math.floor(value) }))
        .sort((one, other) => other.remainder - one.remainder || one.index - other.index);
    for (const { index } of byRemainder.slice(0, left)) {
        shares[index] = (shares[index] ?? 0) + 1;
    }
    return shares;
}

/**
 * Each value as a percent of the largest, rounded; a value above nothing is drawn at least 1 % high, so it does not
 * vanish beside a large one. All zero when the largest is nothing.
 */
export function heightsOf(values: readonly number[]): number[] {
    const counted = values.map(amount);
    const largest = Math.max(0, ...counted);
    return counted.map((value) => fractionOf(value, largest));
}

/**
 * `value` as a percent of `whole`, rounded and kept within 0 and 100; above nothing, at least 1 %. Nothing when the
 * whole is nothing.
 */
export function fractionOf(value: number, whole: number): number {
    const part = amount(value);
    const of = amount(whole);
    if (of === 0 || part === 0) {
        return 0;
    }
    return Math.min(100, Math.max(1, Math.round((part / of) * 100)));
}
