/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
/**
 * The choice of a store view: one of the views the page lists, or all of them together (`null`). A native select holds
 * strings, so each choice has an option value: a view's id as digits, and `all` for every view.
 */
/** A store view as the page lists it; the website and locale are for the caller's own wording. */
export interface StoreView {
    readonly id: number;
    /** Translated, or the store view's own name. */
    readonly name: string;
    readonly website?: string | undefined;
    readonly locale?: string | undefined;
}
/** One option of the select: its value and its text. */
export interface StoreViewOption {
    readonly value: string;
    readonly label: string;
}
/** The option value of every store view together. */
export declare const ALL_STORE_VIEWS = "all";
/** The option value of a choice. */
export declare function storeViewOption(value: number | null): string;
/**
 * The choice an option value stands for: `null` for every store view, a listed view's id, or `undefined` for a value
 * that names neither.
 */
export declare function storeViewFromOption(option: string, stores: readonly StoreView[]): number | null | undefined;
/** The listed store view a choice names; `null` for every view, and for an id the list does not hold. */
export declare function storeViewOf(stores: readonly StoreView[], value: number | null): StoreView | null;
/** The options of the select: every view together first when it is offered (`allLabel`), then each view by name. */
export declare function storeViewOptions(stores: readonly StoreView[], allLabel: string | null): readonly StoreViewOption[];
