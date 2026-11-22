/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
/**
 * The line under a paged list: which rows it shows ("13–24 of 48,210", numbers formatted for the locale) and the
 * buttons to the previous and the next page, named in the kit's words. The range is a polite status, so moving to
 * another page is announced. At either end the button that leads nowhere is marked unavailable and does nothing, but
 * keeps its place in the Tab order, so focus is not lost on the last press.
 */
import type { JSX } from 'preact';
export interface PagerProps {
    /** The page shown, from 1. */
    readonly page: number;
    readonly pageSize: number;
    readonly total: number;
    /** Asked for the page to show next. */
    readonly onPage: (page: number) => void;
}
export declare function Pager({ page, pageSize, total, onPage }: PagerProps): JSX.Element;
