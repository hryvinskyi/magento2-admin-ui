/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
/**
 * A choice of one among two to four short options drawn as one bar (a period, a device, a corner shape): a named
 * group of buttons, the chosen one pressed. The group is one stop of the Tab key, on the chosen button; the arrow
 * keys choose the neighbour and move to it, wrapping at the ends and passing over an option that is out of reach. A
 * locked group is dimmed and none of its buttons can be pressed. An option may carry a glyph before its label; the
 * glyph is decorative, the label names the option.
 */
import type { JSX } from 'preact';
export interface SegmentOption {
    readonly value: string;
    /** Translated. */
    readonly label: string;
    /** The name of a kit glyph drawn before the label. */
    readonly icon?: string | undefined;
    /** This option alone cannot be chosen now. */
    readonly disabled?: boolean | undefined;
}
export interface SegmentedControlProps {
    /** The group's accessible name; translated. */
    readonly label: string;
    readonly value: string;
    readonly options: readonly SegmentOption[];
    readonly onChange: (value: string) => void;
    /** Locked: dimmed, and none of the options can be chosen. */
    readonly disabled?: boolean | undefined;
    readonly describedBy?: string | undefined;
}
export declare function SegmentedControl({ label, value, options, onChange, disabled, describedBy, }: SegmentedControlProps): JSX.Element;
