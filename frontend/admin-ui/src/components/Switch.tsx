/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * An on/off control: a button with the switch role that reports its state (`aria-checked`) and says it in words
 * next to the track (the kit's `kit.switch.yes` and `kit.switch.no`, or the page's own words for a switch whose states
 * are not yes and no, such as "On" and "Off"), so the state never rests on the colour of the track.
 *
 * Its accessible name comes from a `<label for>` naming its id (inside a field) or from `label` (in a table row).
 */
import type { JSX } from 'preact';
import { useKit } from './kit-context.tsx';

export interface SwitchProps {
    readonly id?: string | undefined;
    readonly checked: boolean;
    readonly onChange: (checked: boolean) => void;
    readonly disabled?: boolean | undefined;
    /** The accessible name when no label element names the switch. */
    readonly label?: string | undefined;
    readonly describedBy?: string | undefined;
    /** The table-row size (36 × 20) instead of the field size (40 × 22). */
    readonly size?: 'regular' | 'small' | undefined;
    /** The words beside the track in each state, in place of the kit's yes and no; translated. */
    readonly words?: SwitchWords | undefined;
}

/** What a switch says beside its track when it is on and when it is off. */
export interface SwitchWords {
    readonly on: string;
    readonly off: string;
}

export function Switch({
    id,
    checked,
    onChange,
    disabled = false,
    label,
    describedBy,
    size = 'regular',
    words,
}: SwitchProps): JSX.Element {
    const { t } = useKit().translator;
    const said = words ?? { on: t('kit.switch.yes'), off: t('kit.switch.no') };
    return (
        <button
            type="button"
            role="switch"
            id={id}
            class={`hui-switch hui-switch--${size}`}
            aria-checked={checked}
            aria-label={label}
            aria-describedby={describedBy}
            disabled={disabled}
            onClick={() => onChange(!checked)}
        >
            <span class="hui-switch__track" aria-hidden="true"><span class="hui-switch__knob" /></span>
            <span class="hui-switch__text">{checked ? said.on : said.off}</span>
        </button>
    );
}
