/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
/**
 * Tabs that switch the content of one card, each with a count beside its label ("Products 19"). The tab list is one
 * stop of the Tab key, on the selected tab; the arrow keys select the neighbour, Home the first tab and End the
 * last, and focus follows the selection. Each tab controls its panel, drawn with `TabPanel` under the same `id` and
 * value, and the panel is named by its tab.
 *
 * Tab values become parts of element ids, so a value holds no space. Tabs are for parts of one page; moving between
 * the pages of a module is `ModuleNav`, a row of links.
 */
import type { ComponentChildren, JSX } from 'preact';
export interface TabItem {
    readonly value: string;
    /** Translated. */
    readonly label: string;
    /** Beside the label: a number (formatted for the locale) or a text such as "…" while it is counted. */
    readonly count?: number | string | undefined;
    /** `accent` fills the count with the accent colour, for a count of things waiting for the person. */
    readonly countTone?: 'neutral' | 'accent' | undefined;
}
/** The ids of a tab and of its panel. */
export interface TabIds {
    readonly tab: string;
    readonly panel: string;
}
/** The ids of the tab of `value` in the tab list `id`, and of its panel. */
export declare function tabIds(id: string, value: string): TabIds;
export interface TabsProps {
    /** Unique on the page; the tabs' and panels' ids derive from it. */
    readonly id: string;
    /** The tab list's accessible name; translated. */
    readonly label: string;
    readonly value: string;
    readonly tabs: readonly TabItem[];
    readonly onChange: (value: string) => void;
}
export declare function Tabs({ id, label, value, tabs, onChange }: TabsProps): JSX.Element;
export interface TabPanelProps {
    /** The tab list's id. */
    readonly id: string;
    /** The value of the tab this panel belongs to. */
    readonly value: string;
    readonly children: ComponentChildren;
}
/** The content of the selected tab, named by it. */
export declare function TabPanel({ id, value, children }: TabPanelProps): JSX.Element;
