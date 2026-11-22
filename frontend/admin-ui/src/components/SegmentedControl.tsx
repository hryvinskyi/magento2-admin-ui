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
import { useRef } from 'preact/hooks';
import { choiceAfterKey } from '../domain/arrow-choice.ts';
import { Icon } from './icons.tsx';

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

export function SegmentedControl({
    label,
    value,
    options,
    onChange,
    disabled = false,
    describedBy,
}: SegmentedControlProps): JSX.Element {
    const buttons = useRef(new Map<string, HTMLButtonElement>());
    const reachable = disabled ? [] : options.filter((option) => option.disabled !== true).map((option) => option.value);
    const onKeyDown = (event: KeyboardEvent): void => {
        const next = choiceAfterKey(reachable, value, event.key);
        if (next === null) {
            return;
        }
        event.preventDefault();
        onChange(next);
        buttons.current.get(next)?.focus();
    };
    return (
        <div
            role="group"
            class="hui-segmented"
            aria-label={label}
            aria-describedby={describedBy}
            aria-disabled={disabled ? true : undefined}
            onKeyDown={onKeyDown}
        >
            {options.map((option) => {
                const chosen = option.value === value;
                return (
                    <button
                        key={option.value}
                        type="button"
                        class="hui-segmented__option"
                        aria-pressed={chosen}
                        tabIndex={chosen ? 0 : -1}
                        disabled={disabled || option.disabled === true}
                        ref={(element) => {
                            if (element === null) {
                                buttons.current.delete(option.value);
                            } else {
                                buttons.current.set(option.value, element);
                            }
                        }}
                        onClick={() => onChange(option.value)}
                    >
                        {option.icon === undefined ? null : <Icon name={option.icon} size={18} />}
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}
