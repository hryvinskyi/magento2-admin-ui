/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
/**
 * The row of links under a module's page header that moves between the module's admin pages: real links, so each
 * page has its own address and opens in a new tab like any link. The current page is marked `aria-current="page"`
 * and underlined in the accent colour. A link may carry a count of things waiting on its page.
 */
import type { JSX } from 'preact';
export interface NavItem {
    readonly href: string;
    /** Translated. */
    readonly label: string;
    /** The page shown now. */
    readonly current?: boolean | undefined;
    /** After the label: a number (formatted for the locale) or a short text. */
    readonly count?: number | string | undefined;
}
export interface ModuleNavProps {
    /** The navigation's accessible name, usually the module's name; translated. */
    readonly label: string;
    readonly items: readonly NavItem[];
}
export declare function ModuleNav({ label, items }: ModuleNavProps): JSX.Element;
