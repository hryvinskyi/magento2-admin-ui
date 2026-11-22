/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
/**
 * Each value's share of their sum, in whole percent that add up to exactly 100 (the largest remainders take the
 * rounding, the earlier value first on a tie); all zero when the sum is nothing.
 */
export declare function sharesOf(values: readonly number[]): number[];
/**
 * Each value as a percent of the largest, rounded; a value above nothing is drawn at least 1 % high, so it does not
 * vanish beside a large one. All zero when the largest is nothing.
 */
export declare function heightsOf(values: readonly number[]): number[];
/**
 * `value` as a percent of `whole`, rounded and kept within 0 and 100; above nothing, at least 1 %. Nothing when the
 * whole is nothing.
 */
export declare function fractionOf(value: number, whole: number): number;
