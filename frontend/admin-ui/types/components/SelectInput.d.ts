/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
/**
 * A native select in the admin's look, with the chevron drawn beside it. Options and their labels come from the
 * caller: the control knows no values of its own.
 */
import type { JSX } from 'preact';
import type { ControlWidth } from './TextInput.tsx';
export interface SelectOption {
    readonly value: string;
    /** Translated. */
    readonly label: string;
}
export interface SelectInputProps {
    readonly id?: string | undefined;
    readonly value: string;
    readonly options: readonly SelectOption[];
    readonly onChange: (value: string) => void;
    readonly disabled?: boolean | undefined;
    readonly invalid?: boolean | undefined;
    readonly describedBy?: string | undefined;
    readonly width?: ControlWidth | undefined;
    /** The table-row height (28 px) instead of the field height (34 px). */
    readonly compact?: boolean | undefined;
    /** Bold text, for a choice that heads what follows it. */
    readonly strong?: boolean | undefined;
    /** The accessible name when no label element names the select. */
    readonly label?: string | undefined;
}
export declare function SelectInput({ id, value, options, onChange, disabled, invalid, describedBy, width, compact, strong, label, }: SelectInputProps): JSX.Element;
