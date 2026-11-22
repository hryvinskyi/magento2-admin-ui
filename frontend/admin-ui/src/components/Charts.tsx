/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * The kit's two charts, drawn in the series colours `--hui-series-1` … `--hui-series-4` (a fifth series takes the
 * first colour again):
 *
 * - `StackedBar`: one bar split into the parts of a whole, with a legend under it giving each part's share and
 *   value. A whole of nothing draws an empty track.
 * - `DayBars`: a bar per day (or week), as high as its total against the highest, split by series from the bottom
 *   up, each day's label under its bar and its `title` on hover. With one series the bars take the first colour; a
 *   highlighted day stands out in it while the others take the second.
 *
 * Each chart is an image to assistive technology, named by `summary`, and is followed by the same numbers as a
 * table only a screen reader sees (captioned with the chart's `title` in the kit's words), so the values are read
 * out and not only the summary. The proportions come from the kit's pure functions; the values from the caller,
 * shown through `format` (the locale's numbers when left out).
 */
import type { JSX } from 'preact';
import { heightsOf, sharesOf } from '../domain/proportions.ts';
import { useKit } from './kit-context.tsx';

/** The series colour slot, 1 to 4, of the series at `index`. */
const slotOf = (index: number): number => (index % 4) + 1;

export interface StackedBarPart {
    /** Translated. */
    readonly label: string;
    readonly value: number;
    /** The value as shown ("1,234 visits"); the formatted value when left out. */
    readonly display?: string | undefined;
}

export interface StackedBarProps {
    /** The chart's short name, for the caption of its table ("Orders by status"); translated. */
    readonly title: string;
    /** What the chart shows, read in place of it ("Paid 62 %, …"); translated. */
    readonly summary: string;
    readonly parts: readonly StackedBarPart[];
    readonly format?: ((value: number) => string) | undefined;
}

export function StackedBar({ title, summary, parts, format }: StackedBarProps): JSX.Element {
    const { t, n } = useKit().translator;
    const shown = format ?? n;
    const shares = sharesOf(parts.map((part) => part.value));
    const share = (index: number): string => t('kit.chart.share', n(shares[index] ?? 0));
    const valueOf = (part: StackedBarPart): string => part.display ?? shown(part.value);
    return (
        <div class="hui-chart">
            <div class="hui-stackbar" role="img" aria-label={summary}>
                {parts.map((part, index) => (!Number.isFinite(part.value) || part.value <= 0 ? null : (
                    <span
                        key={part.label}
                        class="hui-stackbar__part"
                        data-series={slotOf(index)}
                        style={{ flexGrow: part.value }}
                    />
                )))}
            </div>
            <div class="hui-chart__legend" aria-hidden="true">
                {parts.map((part, index) => (
                    <div key={part.label} class="hui-chart__entry">
                        <span class="hui-chart__name">
                            <span class="hui-chart__swatch" data-series={slotOf(index)} />
                            {part.label}
                        </span>
                        <span class="hui-chart__share">{share(index)}</span>
                        <span class="hui-chart__value">{valueOf(part)}</span>
                    </div>
                ))}
            </div>
            <table class="hui-sr-only">
                <caption>{t('kit.chart.values', title)}</caption>
                <tbody>
                    {parts.map((part, index) => (
                        <tr key={part.label}>
                            <th scope="row">{part.label}</th>
                            <td>{share(index)}</td>
                            <td>{valueOf(part)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export interface ChartDay {
    /** Under the bar and in the table ("3 Nov"); translated. Empty to leave the place under the bar blank. */
    readonly label: string;
    /** Shown on hover ("3 Nov · €0.42"); translated. */
    readonly title: string;
    /** One value per series, in the order of `series`. */
    readonly values: readonly number[];
    /** Draws this day in the first colour and the others in the second (one series only). */
    readonly highlight?: boolean | undefined;
    /** The day's name in the table when `label` is blank under the bar ("4 Nov"); `label` when left out. */
    readonly name?: string | undefined;
}

export interface DayBarsProps {
    /** The chart's short name, for the caption of its table ("Cost per day"); translated. */
    readonly title: string;
    /** What the chart shows, read in place of it; translated. */
    readonly summary: string;
    /** The heading of the table's first column ("Day", "Week"); translated. */
    readonly periodLabel: string;
    /** The series' names, bottom up; translated. A legend shows them when there is more than one. */
    readonly series: readonly string[];
    readonly days: readonly ChartDay[];
    readonly format?: ((value: number) => string) | undefined;
}

const totalOf = (values: readonly number[]): number =>
    values.reduce((sum, value) => sum + (Number.isFinite(value) && value > 0 ? value : 0), 0);

export function DayBars({ title, summary, periodLabel, series, days, format }: DayBarsProps): JSX.Element {
    const { t, n } = useKit().translator;
    const shown = format ?? n;
    const heights = heightsOf(days.map((day) => totalOf(day.values)));
    const highlighting = series.length === 1 && days.some((day) => day.highlight === true);
    return (
        <div class="hui-chart">
            <div
                class="hui-daybars"
                role="img"
                aria-label={summary}
                data-highlighting={highlighting ? 'true' : 'false'}
            >
                {days.map((day, index) => (
                    <div
                        key={`${String(index)}-${day.label}`}
                        class="hui-daybars__bar"
                        title={day.title}
                        data-highlight={day.highlight === true ? 'true' : 'false'}
                        style={{ height: `${String(heights[index] ?? 0)}%` }}
                    >
                        {series.map((name, slot) => {
                            const value = day.values[slot] ?? 0;
                            return value > 0 ? (
                                <span
                                    key={name}
                                    class="hui-daybars__part"
                                    data-series={slotOf(slot)}
                                    style={{ flexGrow: value }}
                                />
                            ) : null;
                        })}
                    </div>
                ))}
            </div>
            <div class="hui-daybars__labels" aria-hidden="true">
                {days.map((day, index) => (
                    <span key={`${String(index)}-${day.label}`} class="hui-daybars__label">{day.label}</span>
                ))}
            </div>
            {series.length < 2 ? null : (
                <div class="hui-chart__legend hui-chart__legend--inline" aria-hidden="true">
                    {series.map((name, slot) => (
                        <span key={name} class="hui-chart__name">
                            <span class="hui-chart__swatch" data-series={slotOf(slot)} />
                            {name}
                        </span>
                    ))}
                </div>
            )}
            <table class="hui-sr-only">
                <caption>{t('kit.chart.values', title)}</caption>
                <thead>
                    <tr>
                        <th scope="col">{periodLabel}</th>
                        {series.map((name) => <th key={name} scope="col">{name}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {days.map((day, index) => (
                        <tr key={`${String(index)}-${day.label}`}>
                            <th scope="row">{day.name ?? day.label}</th>
                            {series.map((name, slot) => <td key={name}>{shown(day.values[slot] ?? 0)}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
