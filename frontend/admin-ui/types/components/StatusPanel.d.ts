/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
/**
 * Where something stands, in a side panel: a state with its word and note, then labelled monospace lines (an
 * address, an identifier). The states are a small general set — idle, working, good, attention, failed — each shown
 * as a glyph and a word, never only as a colour; long lines wrap anywhere. The state word is announced when it
 * changes, since it may follow what is typed in the fields; the note and the lines are not, so typing does not read
 * the whole panel out on every key.
 *
 * The kit's stylesheet colours a panel by `data-state`: `ok` and `invalid` are its own; `attention`, `idle` and
 * `working` are drawn neutral, and a page's stylesheet may colour `attention` through the panel's tokens.
 */
import type { ComponentChildren, JSX } from 'preact';
export type PanelState = 'idle' | 'working' | 'good' | 'attention' | 'failed';
export interface StatusLine {
    /** Translated. */
    readonly label: string;
    readonly text: string;
    /** `muted` for a placeholder ("—"), `error` for a line that does not apply. */
    readonly tone?: 'normal' | 'muted' | 'error' | undefined;
}
export interface StatusPanelProps {
    /** The panel's title; translated. */
    readonly title: string;
    readonly state: PanelState;
    /** The state in a word or two; translated. */
    readonly word: string;
    /** What the state means; translated. */
    readonly note: string;
    readonly lines?: readonly StatusLine[] | undefined;
    /** Actions under the lines (a link to where the result can be checked). */
    readonly children?: ComponentChildren | undefined;
}
export declare function StatusPanel({ title, state, word, note, lines, children }: StatusPanelProps): JSX.Element;
