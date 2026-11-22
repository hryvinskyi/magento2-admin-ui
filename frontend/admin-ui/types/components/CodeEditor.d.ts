/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
/**
 * A code editor in the kit's dark code colours: a real `textarea` (the input, its caret and its selection) over a
 * highlight layer that draws the same text in colour, beside a gutter of line numbers. The language is the caller's:
 * a `tokenize` function colours the text and an optional `complete` function offers choices at the caret. The editor
 * knows no language and holds no wording; its accessible name, the list's name and every line of its status bar come
 * from the page.
 *
 * - The highlight and the gutter are drawn from elements and text nodes only, so a text that looks like markup shows as
 *   the characters typed. They follow the text area's scrolling. Each line is redrawn only when its own text or colours
 *   change, so a long text costs little per keystroke.
 * - Tab inserts two spaces, or indents every line of a selection over several lines; Shift+Tab outdents. Escape and
 *   then Tab leave the editor, so the keyboard is never trapped in it.
 * - A completer's answer opens a list (`role="listbox"`) under the place the choice will go: ↑ and ↓ move, Enter or Tab
 *   inserts, Escape closes, and a click inserts too. Its place is measured once each time it opens, not per keystroke.
 * - `markedLine` marks one line (its background and its number): the line a problem is on. The status bar says the
 *   problem in words (`status`, read as an alert when its tone is `error`, else as a status), so colour is never the
 *   only signal; the text area is described by it.
 * - Read-only (`readOnly`, or no `onChange`): the text can be read, selected and copied, Tab moves on, and nothing is
 *   offered.
 */
import { type ComponentChildren, type JSX } from 'preact';
import { type Tokenizer } from '../domain/code-lines.ts';
import { type Completer } from '../domain/completion.ts';
/** How the status bar reads: the text is valid, being written, or wrong. */
export type EditorTone = 'ok' | 'pending' | 'error';
/** The status bar's message: its tone and its words (translated). */
export interface EditorStatus {
    readonly tone: EditorTone;
    readonly message: ComponentChildren;
}
export interface CodeEditorProps {
    /** The text area's id; the status line's and the list's ids are derived from it. */
    readonly id: string;
    readonly value: string;
    /** Every change of the text; left out, the editor is read-only. */
    readonly onChange?: ((value: string) => void) | undefined;
    /** The editor's accessible name; translated. */
    readonly label: string;
    /** Colours the text; left out, the text is plain. */
    readonly tokenize?: Tokenizer | undefined;
    /** Offers choices at the caret after each change of the text. */
    readonly complete?: Completer | undefined;
    /** The list's accessible name; translated. Left out, the editor's label. */
    readonly completionLabel?: string | undefined;
    /** A line under the list ("↑ ↓ to move, Enter to insert"); translated. */
    readonly completionFooter?: ComponentChildren | undefined;
    /** The line to mark, counted from 1. */
    readonly markedLine?: number | null | undefined;
    /** The status bar's message, on its left. */
    readonly status?: EditorStatus | undefined;
    /** A hint on the status bar's right ("Type {{ to pick a field"); translated. */
    readonly hint?: ComponentChildren | undefined;
    /** The fewest rows shown; 4 when left out. */
    readonly rows?: number | undefined;
    /** The most rows shown before the text scrolls; left out, the editor grows with the text. */
    readonly maxRows?: number | undefined;
    readonly readOnly?: boolean | undefined;
    /** Further descriptions of the text area (a field's help). */
    readonly describedBy?: string | undefined;
}
export declare function CodeEditor({ id, value, onChange, label, tokenize, complete, completionLabel, completionFooter, markedLine, status, hint, rows, maxRows, readOnly, describedBy, }: CodeEditorProps): JSX.Element;
