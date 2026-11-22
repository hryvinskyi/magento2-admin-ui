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
import { useRef } from 'preact/hooks';
import { tabAfterKey } from '../domain/arrow-choice.ts';
import { useKit } from './kit-context.tsx';

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
export function tabIds(id: string, value: string): TabIds {
    return { tab: `${id}-tab-${value}`, panel: `${id}-panel-${value}` };
}

export interface TabsProps {
    /** Unique on the page; the tabs' and panels' ids derive from it. */
    readonly id: string;
    /** The tab list's accessible name; translated. */
    readonly label: string;
    readonly value: string;
    readonly tabs: readonly TabItem[];
    readonly onChange: (value: string) => void;
}

export function Tabs({ id, label, value, tabs, onChange }: TabsProps): JSX.Element {
    const { n } = useKit().translator;
    const elements = useRef(new Map<string, HTMLButtonElement>());
    const values = tabs.map((tab) => tab.value);
    const onKeyDown = (event: KeyboardEvent): void => {
        const next = tabAfterKey(values, value, event.key);
        if (next === null) {
            return;
        }
        event.preventDefault();
        onChange(next);
        elements.current.get(next)?.focus();
    };
    return (
        <div role="tablist" class="hui-tabs" aria-label={label} onKeyDown={onKeyDown}>
            {tabs.map((tab) => {
                const selected = tab.value === value;
                const ids = tabIds(id, tab.value);
                return (
                    <button
                        key={tab.value}
                        type="button"
                        role="tab"
                        id={ids.tab}
                        class="hui-tabs__tab"
                        aria-selected={selected}
                        aria-controls={ids.panel}
                        tabIndex={selected ? 0 : -1}
                        ref={(element) => {
                            if (element === null) {
                                elements.current.delete(tab.value);
                            } else {
                                elements.current.set(tab.value, element);
                            }
                        }}
                        onClick={() => onChange(tab.value)}
                    >
                        {tab.label}
                        {tab.count === undefined ? null : (
                            <span class="hui-tabs__count" data-tone={tab.countTone ?? 'neutral'}>
                                {typeof tab.count === 'number' ? n(tab.count) : tab.count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

export interface TabPanelProps {
    /** The tab list's id. */
    readonly id: string;
    /** The value of the tab this panel belongs to. */
    readonly value: string;
    readonly children: ComponentChildren;
}

/** The content of the selected tab, named by it. */
export function TabPanel({ id, value, children }: TabPanelProps): JSX.Element {
    const ids = tabIds(id, value);
    return (
        <div role="tabpanel" id={ids.panel} class="hui-tabpanel" aria-labelledby={ids.tab} tabIndex={0}>
            {children}
        </div>
    );
}
