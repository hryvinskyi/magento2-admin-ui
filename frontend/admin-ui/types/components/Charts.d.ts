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
export declare function StackedBar({ title, summary, parts, format }: StackedBarProps): JSX.Element;
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
export declare function DayBars({ title, summary, periodLabel, series, days, format }: DayBarsProps): JSX.Element;
