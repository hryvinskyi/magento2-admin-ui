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
export declare const INDENT = "  ";
/** The line an offset is on: its index (from 0) and the offset of its first character. */
export declare function lineAt(text: string, offset: number): {
    readonly index: number;
    readonly start: number;
};
/**
 * Tab: a selection within one line (or none) is replaced by one indent and the caret goes after it; a selection over
 * several lines indents each of them and stays selected.
 */
export declare function indentSelection(text: string, start: number, end: number): TextEdit;
/** Shift+Tab: each line the selection (or the caret) touches loses up to one indent of leading spaces. */
export declare function outdentSelection(text: string, start: number, end: number): TextEdit;
/** Puts `value` in place of the range `from`–`to`, with the caret after it. */
export declare function replaceRange(text: string, from: number, to: number, value: string): TextEdit;
