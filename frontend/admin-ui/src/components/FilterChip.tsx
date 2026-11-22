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
import { Icon, type IconName } from './icons.tsx';
import { useKit } from './kit-context.tsx';

export type ChipTone = 'neutral' | 'warning' | 'error';

/** The glyph a chip of each tone draws when it is given none. */
const TONE_ICON = {
    neutral: null,
    warning: null,
    error: 'error',
} as const satisfies Record<ChipTone, IconName | null>;

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

export function FilterChip({
    label,
    pressed,
    onToggle,
    count,
    tone = 'neutral',
    icon,
    size = 'regular',
    disabled = false,
}: FilterChipProps): JSX.Element {
    const { n } = useKit().translator;
    const glyph = icon ?? TONE_ICON[tone];
    return (
        <button
            type="button"
            class={size === 'control' ? 'hui-chip hui-chip--control' : 'hui-chip'}
            data-tone={tone}
            aria-pressed={pressed}
            disabled={disabled}
            onClick={() => onToggle()}
        >
            {glyph === null ? null : <Icon name={glyph} size={16} filled={icon === undefined} />}
            {label}
            {count === undefined ? null : (
                <span class="hui-chip__count">{typeof count === 'number' ? n(count) : count}</span>
            )}
        </button>
    );
}

export interface FilterChipsProps {
    /** The group's accessible name ("Filter by category"); translated. */
    readonly label: string;
    readonly children: ComponentChildren;
}

/** A named row of filter chips that wraps when the line is full. */
export function FilterChips({ label, children }: FilterChipsProps): JSX.Element {
    return <div role="group" class="hui-chips" aria-label={label}>{children}</div>;
}
