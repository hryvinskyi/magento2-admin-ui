/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * How far something has got, as a filled track: a progress bar with its range and value for assistive technology,
 * named by `label`. The fill is the value's share of the maximum; a value above nothing shows at least a sliver,
 * and a maximum of nothing draws an empty track. The tone is the caller's to choose (the accent, a warning as a
 * limit nears, an error once it is reached); the words that say the same stand beside the bar.
 */
import type { JSX } from 'preact';
import { fractionOf } from '../domain/proportions.ts';

export type ProgressTone = 'accent' | 'warning' | 'error';

export interface ProgressBarProps {
    /** The bar's accessible name ("Budget used"); translated. */
    readonly label: string;
    readonly value: number;
    readonly max: number;
    readonly tone?: ProgressTone | undefined;
    /** How the value reads aloud when a number alone would not say it ("€3.40 of €5.00"); translated. */
    readonly valueText?: string | undefined;
}

const within = (value: number, max: number): number => Math.min(Math.max(value, 0), max);

export function ProgressBar({ label, value, max, tone = 'accent', valueText }: ProgressBarProps): JSX.Element {
    const top = Number.isFinite(max) && max > 0 ? max : 0;
    const now = Number.isFinite(value) ? within(value, top) : 0;
    return (
        <div
            class="hui-progress"
            data-tone={tone}
            role="progressbar"
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={top}
            aria-valuenow={now}
            aria-valuetext={valueText}
        >
            <div class="hui-progress__fill" style={{ width: `${String(fractionOf(value, max))}%` }} />
        </div>
    );
}
