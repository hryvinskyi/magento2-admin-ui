/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * The edits a code editor makes on its own, as pure functions of the text and the selection: indenting and outdenting
 * by a unit of spaces, and replacing a range with an inserted text. Each returns the new text and where the selection
 * goes, so the text a person had selected stays selected.
 *
 * A selection that ends at the very start of a line does not take that line in: selecting three whole lines by
 * dragging to the start of the fourth indents three.
 */

/** A text and the selection in it. */
export interface TextEdit {
    readonly text: string;
    readonly selectionStart: number;
    readonly selectionEnd: number;
}

/** The two spaces one indent level is. */
export const INDENT = '  ';

/** The line an offset is on: its index (from 0) and the offset of its first character. */
export function lineAt(text: string, offset: number): { readonly index: number; readonly start: number } {
    const before = text.slice(0, Math.max(0, offset));
    let index = 0;
    for (let at = before.indexOf('\n'); at !== -1; at = before.indexOf('\n', at + 1)) {
        index += 1;
    }
    return { index, start: before.lastIndexOf('\n') + 1 };
}

/** The offsets where the lines a selection touches begin. */
function lineStartsTouched(text: string, start: number, end: number): readonly number[] {
    const last = end > start && text[end - 1] === '\n' ? end - 1 : end;
    const first = lineAt(text, start).start;
    const starts = [first];
    for (let at = text.indexOf('\n', first); at !== -1 && at < last; at = text.indexOf('\n', at + 1)) {
        starts.push(at + 1);
    }
    return starts;
}

/** A change at one place: `removed` characters taken out at `at`, then `inserted` put in. */
interface Splice {
    readonly at: number;
    readonly removed: number;
    readonly inserted: string;
}

/** Applies splices (in ascending order, not overlapping) and moves the selection with them. */
function applySplices(text: string, start: number, end: number, splices: readonly Splice[]): TextEdit {
    const move = (position: number): number => splices.reduce((moved, splice) => {
        if (position < splice.at) {
            return moved;
        }
        if (position < splice.at + splice.removed) {
            return moved - (position - splice.at);
        }
        return moved + splice.inserted.length - splice.removed;
    }, position);
    let result = '';
    let from = 0;
    for (const splice of splices) {
        result += text.slice(from, splice.at) + splice.inserted;
        from = splice.at + splice.removed;
    }
    return { text: result + text.slice(from), selectionStart: move(start), selectionEnd: move(end) };
}

/**
 * Tab: a selection within one line (or none) is replaced by one indent and the caret goes after it; a selection over
 * several lines indents each of them and stays selected.
 */
export function indentSelection(text: string, start: number, end: number): TextEdit {
    if (!text.slice(start, end).includes('\n')) {
        const caret = start + INDENT.length;
        return { text: text.slice(0, start) + INDENT + text.slice(end), selectionStart: caret, selectionEnd: caret };
    }
    return applySplices(
        text,
        start,
        end,
        lineStartsTouched(text, start, end).map((at) => ({ at, removed: 0, inserted: INDENT })),
    );
}

/** Shift+Tab: each line the selection (or the caret) touches loses up to one indent of leading spaces. */
export function outdentSelection(text: string, start: number, end: number): TextEdit {
    const splices = lineStartsTouched(text, start, end).map((at) => {
        let spaces = 0;
        while (spaces < INDENT.length && text[at + spaces] === ' ') {
            spaces += 1;
        }
        return { at, removed: spaces, inserted: '' };
    });
    return applySplices(text, start, end, splices.filter((splice) => splice.removed > 0));
}

/** Puts `value` in place of the range `from`–`to`, with the caret after it. */
export function replaceRange(text: string, from: number, to: number, value: string): TextEdit {
    const caret = from + value.length;
    return { text: text.slice(0, from) + value + text.slice(to), selectionStart: caret, selectionEnd: caret };
}
