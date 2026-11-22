/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * Completion in a code editor: what a language's completer offers at the caret, and the moves through its list.
 *
 * A completer looks at the text and the caret and answers with the range its choice replaces and the items to choose
 * from, or `null` when it has nothing to offer there. The editor opens its list only for an answer whose range lies
 * within the text, ends at or after its start, and has at least one item.
 */

/** One choice: the text it inserts, the words the list shows, and an optional note beside them. */
export interface CompletionItem {
    readonly value: string;
    readonly label: string;
    readonly detail?: string | undefined;
}

/** What a completer offers: the range of the text a choice replaces, and the choices. */
export interface Completion {
    readonly from: number;
    readonly to: number;
    readonly items: readonly CompletionItem[];
}

/** Looks at the text and the caret; `null` when there is nothing to offer there. */
export type Completer = (text: string, caret: number) => Completion | null;

/** A completer's answer when the editor can open a list for it; `null` otherwise. */
export function usableCompletion(completion: Completion | null, textLength: number): Completion | null {
    if (completion === null || completion.items.length === 0) {
        return null;
    }
    const { from, to } = completion;
    const inText = Number.isInteger(from) && Number.isInteger(to) && from >= 0 && from <= to && to <= textLength;
    return inText ? completion : null;
}

/** How far each arrow key moves through the list. */
const STEP: ReadonlyMap<string, number> = new Map([
    ['ArrowDown', 1],
    ['ArrowUp', -1],
]);

/** The item an arrow key moves to from `active` in a list of `count`, wrapping at the ends; null for other keys. */
export function itemAfterKey(active: number, count: number, key: string): number | null {
    const step = STEP.get(key);
    if (step === undefined || count === 0) {
        return null;
    }
    return (active + step + count) % count;
}
