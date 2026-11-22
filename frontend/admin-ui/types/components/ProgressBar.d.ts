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
export declare function ProgressBar({ label, value, max, tone, valueText }: ProgressBarProps): JSX.Element;
