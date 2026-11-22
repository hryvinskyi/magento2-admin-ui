/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * A short state in a table cell or a row, always a glyph and a word:
 *
 * - `error`: a filled pill in the error tint, for something that needs action ("Not sent").
 * - `ok`: a plain muted line with a check in the positive colour ("Sent"); filled, a pill in the positive tint
 *   ("Met").
 * - `muted`: a plain muted line, for a state that asks nothing; filled, a grey pill ("No result").
 *
 * A filled pill draws the filled variant of its glyph. Where a list sets verdicts side by side, filling every pill
 * gives each the same weight; a table cell keeps the plain lines. For "on with a reservation" the kit's `warn` badge
 * is the part to use.
 */
import type { ComponentChildren, JSX } from 'preact';
import { Icon, type IconName } from './icons.tsx';

export type PillTone = 'error' | 'ok' | 'muted';

const TONE_ICON = {
    error: 'error',
    ok: 'check',
    muted: 'info',
} as const satisfies Record<PillTone, IconName>;

export interface StatePillProps {
    readonly tone: PillTone;
    /** A glyph in place of the tone's own. */
    readonly icon?: string | undefined;
    /** A pill in the tone's tint rather than a plain line; an `error` pill is always filled. */
    readonly filled?: boolean | undefined;
    /** The word; translated. */
    readonly children: ComponentChildren;
}

export function StatePill({ tone, icon, filled = false, children }: StatePillProps): JSX.Element {
    const solid = filled || tone === 'error';
    return (
        <span class={filled ? 'hui-pill hui-pill--filled' : 'hui-pill'} data-tone={tone}>
            <Icon name={icon ?? TONE_ICON[tone]} size={14} filled={solid} class="hui-pill__icon" />
            {children}
        </span>
    );
}
