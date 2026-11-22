/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
/**
 * Filter chips: rounded toggle buttons above a list ("All 19", "Changed 3"), each pressed while its filter applies,
 * with an optional count after the label and an optional glyph before it. A chip has a tone:
 *
 * - `neutral`: white while idle, the accent tint while pressed.
 * - `warning`: the warning tint while idle, to draw the eye to rows that need something ("Needs a category"); the
 *   accent tint while pressed.
 * - `error`: white while idle, the error tint while pressed ("Failed"), with the error glyph.
 *
 * The tone is said by the chip's words and glyph as well as by its colour; the chip never decides what it filters.
 */
import type { ComponentChildren, JSX } from 'preact';
export type ChipTone = 'neutral' | 'warning' | 'error';
export interface FilterChipProps {
    /** Translated. */
    readonly label: string;
    readonly pressed: boolean;
    readonly onToggle: () => void;
    /** Shown after the label: a number (formatted for the locale) or a text such as "…" while it is counted. */
    readonly count?: number | string | undefined;
    readonly tone?: ChipTone | undefined;
    /** A glyph before the label, in place of the tone's own. */
    readonly icon?: string | undefined;
    /** The height of an input (34 px) for a chip in a row of controls, instead of 30 px. */
    readonly size?: 'regular' | 'control' | undefined;
    readonly disabled?: boolean | undefined;
}
export declare function FilterChip({ label, pressed, onToggle, count, tone, icon, size, disabled, }: FilterChipProps): JSX.Element;
export interface FilterChipsProps {
    /** The group's accessible name ("Filter by category"); translated. */
    readonly label: string;
    readonly children: ComponentChildren;
}
/** A named row of filter chips that wraps when the line is full. */
export declare function FilterChips({ label, children }: FilterChipsProps): JSX.Element;
