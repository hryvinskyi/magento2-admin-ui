/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
/**
 * The ticked rows of a list, by row key, and what its select-all box shows: all of the rows in view, some of them,
 * or none. Rows ticked on another page or hidden by a filter stay ticked; select-all ticks or clears only the rows in
 * view. Every change returns a new set and leaves the one it was given as it was.
 */
/** What the select-all box shows: checked, mixed or clear. */
export type SelectionState = 'all' | 'some' | 'none';
/** How many of the rows in view are ticked, as the select-all box shows it; no rows in view is `none`. */
export declare function selectionState(keys: readonly string[], selected: ReadonlySet<string>): SelectionState;
/** The selection after the select-all box is pressed: every row in view cleared when all were ticked, else ticked. */
export declare function afterSelectAll(keys: readonly string[], selected: ReadonlySet<string>): ReadonlySet<string>;
/** The selection after one row's box is pressed. */
export declare function afterToggle(selected: ReadonlySet<string>, key: string): ReadonlySet<string>;
