/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * Small labels next to values:
 *
 * - `neutral`: a plain fact ("Store view").
 * - `source`: where a value comes from, with a leading glyph.
 * - `fixed`: something that cannot be changed (dashed, with a lock).
 * - `override`: a value set at this level in place of an inherited one.
 * - `on` / `off`: whether something runs (with a dot, and the words say which).
 * - `warn`: something on with a reservation, or that needs attention, in the warning tone: with a dot, or with the
 *   glyph given in its place.
 * - `recommended`: the suggested option.
 * - `code`: an identifier in monospace.
 */
import type { ComponentChildren, JSX } from 'preact';
import { Icon } from './icons.tsx';

export type BadgeVariant =
    | 'neutral'
    | 'source'
    | 'fixed'
    | 'override'
    | 'on'
    | 'off'
    | 'warn'
    | 'recommended'
    | 'code';

export interface BadgeProps {
    readonly variant?: BadgeVariant | undefined;
    readonly icon?: string | undefined;
    /** A tooltip explaining the badge; also its accessible description. */
    readonly title?: string | undefined;
    readonly children: ComponentChildren;
}

const DOTTED: ReadonlySet<BadgeVariant> = new Set<BadgeVariant>(['on', 'off']);

/** Variants with a dot unless a glyph is given, which takes its place. */
const DOTTED_WITHOUT_GLYPH: ReadonlySet<BadgeVariant> = new Set<BadgeVariant>(['warn']);

export function Badge({ variant = 'neutral', icon, title, children }: BadgeProps): JSX.Element {
    const glyph = icon ?? (variant === 'fixed' ? 'lock' : undefined);
    const dotted = DOTTED.has(variant) || (DOTTED_WITHOUT_GLYPH.has(variant) && glyph === undefined);
    return (
        <span class={`hui-badge hui-badge--${variant}`} title={title}>
            {dotted ? <span class="hui-badge__dot" aria-hidden="true" /> : null}
            {glyph === undefined ? null : <Icon name={glyph} size={14} />}
            {children}
        </span>
    );
}
