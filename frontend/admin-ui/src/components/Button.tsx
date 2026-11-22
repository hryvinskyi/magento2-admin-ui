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
import { Icon, type IconSize } from './icons.tsx';

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

const ICON_SIZE = {
    primary: 18,
    secondary: 18,
    tertiary: 16,
    quiet: 18,
    link: 18,
    control: 18,
} as const satisfies Record<ButtonVariant, IconSize>;

/** The classes of each variant; a control button keeps the secondary colours. */
const VARIANT_CLASSES = {
    primary: 'hui-button--primary',
    secondary: 'hui-button--secondary',
    tertiary: 'hui-button--tertiary',
    quiet: 'hui-button--quiet',
    link: 'hui-button--link',
    control: 'hui-button--secondary hui-button--control',
} as const satisfies Record<ButtonVariant, string>;

export function Button({
    variant = 'secondary',
    icon,
    iconEnd,
    onClick,
    disabled = false,
    busy = false,
    label,
    expanded,
    controls,
    id,
    children,
}: ButtonProps): JSX.Element {
    return (
        <button
            type="button"
            id={id}
            class={`hui-button ${VARIANT_CLASSES[variant]}`}
            onClick={busy || onClick === undefined ? undefined : () => onClick()}
            disabled={disabled}
            aria-busy={busy ? true : undefined}
            aria-disabled={busy && !disabled ? true : undefined}
            aria-label={label}
            aria-expanded={expanded}
            aria-controls={controls}
        >
            {icon === undefined ? null : <Icon name={icon} size={ICON_SIZE[variant]} />}
            {children}
            {iconEnd === undefined ? null : <Icon name={iconEnd} size={ICON_SIZE[variant]} />}
        </button>
    );
}

export interface ExternalLinkProps {
    readonly href: string;
    readonly variant?: 'secondary' | 'quiet' | undefined;
    readonly children: ComponentChildren;
}

/** A link to another site, opened in a new tab without handing it this page. */
export function ExternalLink({ href, variant = 'secondary', children }: ExternalLinkProps): JSX.Element {
    return (
        <a
            class={`hui-button hui-button--${variant} hui-button--anchor`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
        >
            {children}
            <Icon name="open_in_new" size={16} />
        </a>
    );
}

export interface DisclosureButtonProps {
    readonly expanded: boolean;
    readonly onToggle: () => void;
    /** The id of the region it shows and hides. */
    readonly controls?: string | undefined;
    readonly children: ComponentChildren;
}

/** Shows or hides an optional part of a card (advanced options under the usual ones). */
export function DisclosureButton({ expanded, onToggle, controls, children }: DisclosureButtonProps): JSX.Element {
    return (
        <button
            type="button"
            class="hui-button hui-button--link hui-disclosure"
            aria-expanded={expanded}
            aria-controls={controls}
            onClick={onToggle}
        >
            <Icon name={expanded ? 'expand_less' : 'expand_more'} size={18} />
            {children}
        </button>
    );
}
