/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
/**
 * The kit's buttons and links, drawn by its button classes:
 *
 * - `primary`: the one forward action of the page (the accent colour).
 * - `secondary`: an ordinary action (white, bordered).
 * - `tertiary`: an action inside a message or a card (smaller, white, bordered).
 * - `quiet`: a light action in the page header (white, light border).
 * - `link`: an action that reads like a link (Override here, Skip this step).
 * - `control`: an ordinary action in a row of fields, as high as the input or select beside it, with their border and
 *   radius.
 *
 * A busy button does nothing when pressed and says so to assistive technology (`aria-busy`, `aria-disabled`), but
 * stays focusable, so focus is not lost while the work runs; its label is the caller's ("Saving…").
 */
import type { ComponentChildren, JSX } from 'preact';
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'quiet' | 'link' | 'control';
export interface ButtonProps {
    readonly variant?: ButtonVariant | undefined;
    /** A glyph before the text. */
    readonly icon?: string | undefined;
    /** A glyph after the text. */
    readonly iconEnd?: string | undefined;
    readonly onClick?: (() => void) | undefined;
    readonly disabled?: boolean | undefined;
    /** In progress: does nothing when pressed, marked busy, still focusable. */
    readonly busy?: boolean | undefined;
    /** The accessible name when the button shows only a glyph. */
    readonly label?: string | undefined;
    /** For a button that shows or hides a region. */
    readonly expanded?: boolean | undefined;
    readonly controls?: string | undefined;
    readonly id?: string | undefined;
    readonly children?: ComponentChildren | undefined;
}
export declare function Button({ variant, icon, iconEnd, onClick, disabled, busy, label, expanded, controls, id, children, }: ButtonProps): JSX.Element;
export interface ExternalLinkProps {
    readonly href: string;
    readonly variant?: 'secondary' | 'quiet' | undefined;
    readonly children: ComponentChildren;
}
/** A link to another site, opened in a new tab without handing it this page. */
export declare function ExternalLink({ href, variant, children }: ExternalLinkProps): JSX.Element;
export interface DisclosureButtonProps {
    readonly expanded: boolean;
    readonly onToggle: () => void;
    /** The id of the region it shows and hides. */
    readonly controls?: string | undefined;
    readonly children: ComponentChildren;
}
/** Shows or hides an optional part of a card (advanced options under the usual ones). */
export declare function DisclosureButton({ expanded, onToggle, controls, children }: DisclosureButtonProps): JSX.Element;
