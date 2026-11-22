/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
/**
 * A text of several lines: as high as `rows` lines, and the person may drag it higher. Given a `max`, a line under it
 * counts the characters typed ("120 of 400 characters", in the kit's words), linked to the text area as its
 * description. The line takes the warning tone in the limit's last tenth, and past the limit the text area is marked
 * invalid. Nothing is ever cut: whether a text past the limit can be saved is the caller's decision.
 */
import type { JSX } from 'preact';
import type { ControlWidth } from './TextInput.tsx';
export interface TextAreaProps {
    readonly id: string;
    readonly value: string;
    readonly onInput: (value: string) => void;
    /** Leaving the field: where a field marks itself touched. */
    readonly onBlur?: (() => void) | undefined;
    /** Its height in lines; 3 when left out. */
    readonly rows?: number | undefined;
    /** The length the field allows; with it, the count line is shown. */
    readonly max?: number | undefined;
    readonly disabled?: boolean | undefined;
    readonly invalid?: boolean | undefined;
    readonly describedBy?: string | undefined;
    readonly placeholder?: string | undefined;
    /** The whole row when left out. */
    readonly width?: ControlWidth | undefined;
    /** The accessible name when no label element names the text area. */
    readonly label?: string | undefined;
}
/** The id of a text area's count line, from the text area's id. */
export declare const countId: (id: string) => string;
export declare function TextArea({ id, value, onInput, onBlur, rows, max, disabled, invalid, describedBy, placeholder, width, label, }: TextAreaProps): JSX.Element;
