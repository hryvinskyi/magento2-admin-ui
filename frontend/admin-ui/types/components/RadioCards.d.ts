/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
/**
 * A choice of one among a few, as native radio buttons in a named group (arrow keys move between them). A single
 * option can be unavailable while the others are not; the whole group can be too:
 *
 * - `cards`: each option is a bordered card with an optional glyph tile, a description and a badge
 *   ("Recommended"); the chosen card is outlined and its tile filled.
 * - `plain`: a list of radio buttons with their labels, in a column or a row.
 */
import type { JSX } from 'preact';
export interface RadioOption {
    readonly value: string;
    /** Translated. */
    readonly label: string;
    readonly description?: string | undefined;
    readonly icon?: string | undefined;
    /** A short highlight next to the label ("Recommended"); translated. */
    readonly badge?: string | undefined;
    /** This option alone cannot be chosen now. */
    readonly disabled?: boolean | undefined;
}
export interface RadioCardsProps {
    /** The radio group's name; unique on the page. */
    readonly name: string;
    /** The group's accessible name; translated. */
    readonly label: string;
    readonly value: string;
    readonly options: readonly RadioOption[];
    readonly onChange: (value: string) => void;
    readonly disabled?: boolean | undefined;
    readonly variant?: 'cards' | 'plain' | undefined;
    readonly direction?: 'column' | 'row' | undefined;
    readonly describedBy?: string | undefined;
}
export declare function RadioCards({ name, label, value, options, onChange, disabled, variant, direction, describedBy, }: RadioCardsProps): JSX.Element;
