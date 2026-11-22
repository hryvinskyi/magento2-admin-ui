/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
/**
 * Which rows of a paged list one page shows: "13–24 of 48,210". Pages are numbered from 1, as the admin's own lists
 * number them. A page past the last one (the list shrank while it was open) is read as the last page, and the range
 * says which page that is, so the caller can follow it.
 */
export interface PageRange {
    /** The page shown, from 1; never past the last page. */
    readonly page: number;
    /** How many pages the list has; at least 1, an empty list being one empty page. */
    readonly pageCount: number;
    /** The number of the first row shown, from 1; 0 when the list is empty. */
    readonly first: number;
    /** The number of the last row shown; 0 when the list is empty. */
    readonly last: number;
    readonly total: number;
    readonly hasPrevious: boolean;
    readonly hasNext: boolean;
}
/** The rows page `page` of `pageSize` rows shows out of `total`; throws a `RangeError` for a number out of range. */
export declare function pageRange(page: number, pageSize: number, total: number): PageRange;
