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
export function selectionState(keys: readonly string[], selected: ReadonlySet<string>): SelectionState {
    const ticked = keys.filter((key) => selected.has(key)).length;
    if (ticked === 0) {
        return 'none';
    }
    return ticked === keys.length ? 'all' : 'some';
}

/** The selection after the select-all box is pressed: every row in view cleared when all were ticked, else ticked. */
export function afterSelectAll(keys: readonly string[], selected: ReadonlySet<string>): ReadonlySet<string> {
    const next = new Set(selected);
    const clear = selectionState(keys, selected) === 'all';
    for (const key of keys) {
        if (clear) {
            next.delete(key);
        } else {
            next.add(key);
        }
    }
    return next;
}

/** The selection after one row's box is pressed. */
export function afterToggle(selected: ReadonlySet<string>, key: string): ReadonlySet<string> {
    const next = new Set(selected);
    if (!next.delete(key)) {
        next.add(key);
    }
    return next;
}
