/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
/**
 * Text controls: a text input (monospace for identifiers), and a secret input that never shows a stored secret.
 *
 * The secret input is told only whether a secret is stored, never the secret. A stored secret shows as a mask the
 * input holds in place of any value, and offers Replace, which starts typing a new one; either way a note says the
 * value is stored encrypted. While a new one is typed over a stored one, "Keep the stored secret" takes the
 * replacement back. Whatever is typed is the caller's to send; the input never reads anything back.
 */
import type { JSX } from 'preact';
/** 90, 240 or 340 pixels, the whole row, or as wide as the content. */
export type ControlWidth = 'short' | 'medium' | 'long' | 'full' | 'auto';
export interface TextInputProps {
    readonly id: string;
    readonly value: string;
    readonly onInput: (value: string) => void;
    /** Leaving the field: where a field marks itself touched. */
    readonly onBlur?: (() => void) | undefined;
    readonly disabled?: boolean | undefined;
    readonly invalid?: boolean | undefined;
    readonly describedBy?: string | undefined;
    readonly placeholder?: string | undefined;
    /** Monospace, for identifiers and addresses. */
    readonly mono?: boolean | undefined;
    readonly width?: ControlWidth | undefined;
    /** A unit after the input ("days"); translated. */
    readonly suffix?: string | undefined;
    /** The accessible name when no label element names the input. */
    readonly label?: string | undefined;
    readonly type?: 'text' | 'search' | undefined;
}
export declare function TextInput({ id, value, onInput, onBlur, disabled, invalid, describedBy, placeholder, mono, width, suffix, label, type, }: TextInputProps): JSX.Element;
export interface SecretInputProps {
    readonly id: string;
    /** Whether a secret is stored on the server. */
    readonly stored: boolean;
    /** The replacement being typed; null while nothing is typed over the stored secret (or none was started). */
    readonly replacement: string | null;
    /** The replacement text; `''` starts a replacement of a stored secret. */
    readonly onReplace: (text: string) => void;
    /** Takes a replacement back, keeping the stored secret; offered only while a stored one is being replaced. */
    readonly onKeep: () => void;
    readonly onBlur?: (() => void) | undefined;
    readonly disabled?: boolean | undefined;
    readonly invalid?: boolean | undefined;
    readonly describedBy?: string | undefined;
    readonly width?: ControlWidth | undefined;
}
export declare function SecretInput({ id, stored, replacement, onReplace, onKeep, onBlur, disabled, invalid, describedBy, width, }: SecretInputProps): JSX.Element;
