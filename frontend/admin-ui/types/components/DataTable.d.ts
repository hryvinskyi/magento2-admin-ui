/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
/**
 * A list of rows drawn as a table: the ARIA table roles on a CSS grid whose columns are declared once — heading,
 * width, how each cell is drawn, and the narrower width a column takes when the table's container is under 960 px.
 *
 * - **Rows.** With `onOpen`, a whole row is the target: its first cell holds a real button named after the row
 *   (`rowName`), a click anywhere on the row presses it, and a chevron at the end says so. A control inside a cell
 *   (a checkbox, a switch, a link) does its own job and does not open the row. The row whose drawer is open
 *   (`openKey`) takes the accent tint.
 * - **Flags.** `flagOf` marks a row that needs action with an edge in the error or the warning colour; a cell of
 *   the row says the same in words.
 * - **Selection.** With `selection`, a first column of checkboxes ticks rows (a ticked row takes the accent tint)
 *   and the heading's box ticks or clears every row shown: checked when all are ticked, mixed when some are.
 * - **Groups.** A group row (a label, a count, an aside) spans the table and shows or hides its rows with a button
 *   that says whether it is expanded; the caller passes the group's rows only while it is.
 * - **Loading.** `loading` draws that many placeholder rows, hidden from assistive technology, marks the table busy
 *   and says "Loading" in the kit's words.
 *
 * The table decides nothing about its rows: what a cell shows, which rows are flagged and what opening one does are
 * the caller's.
 */
import type { ComponentChildren, JSX } from 'preact';
export interface TableColumn<Row> {
    /** Unique among the columns. */
    readonly key: string;
    /** The column's heading; translated. Empty for a column without one. */
    readonly header: string;
    /** The column's track, as CSS writes it: `176px`, `minmax(0,1.5fr)`. */
    readonly width: string;
    /** The track when the table's container is narrow; `width` when left out. */
    readonly narrowWidth?: string | undefined;
    /** `end` aligns the heading and the cells to the end, for numbers. */
    readonly align?: 'start' | 'end' | undefined;
    readonly cell: (row: Row) => ComponentChildren;
}
/** A row that heads a group of rows. */
export interface TableGroup {
    /** Unique among the table's items. */
    readonly key: string;
    /** Translated. */
    readonly label: string;
    /** After the label ("3 feeds"); translated. */
    readonly count?: string | undefined;
    /** At the row's far end (a badge). */
    readonly aside?: ComponentChildren | undefined;
    readonly expanded: boolean;
    readonly onToggle: () => void;
}
/** What each kind of item carries. */
export interface TableItemData<Row> {
    readonly row: {
        readonly row: Row;
    };
    readonly group: {
        readonly group: TableGroup;
    };
}
/** A row of the table, or a group row heading the rows after it. */
export type TableItem<Row, K extends keyof TableItemData<Row> = keyof TableItemData<Row>> = {
    [P in K]: {
        readonly kind: P;
    } & TableItemData<Row>[P];
}[K];
/** An edge that marks a row needing action. */
export type RowFlag = 'error' | 'warning';
export interface TableSelection {
    /** The keys of the ticked rows, those not shown included. */
    readonly selected: ReadonlySet<string>;
    readonly onChange: (selected: ReadonlySet<string>) => void;
}
export interface DataTableProps<Row> {
    /** Unique on the page; the ids of the rows' buttons derive from it. */
    readonly id: string;
    /** The table's accessible name; translated. */
    readonly label: string;
    readonly columns: readonly TableColumn<Row>[];
    readonly items: readonly TableItem<Row>[];
    /** Unique among the rows. */
    readonly rowKey: (row: Row) => string;
    /** The row's accessible name: its button's, and its checkbox's after "Select"; translated. */
    readonly rowName: (row: Row) => string;
    /** Opens the row (its drawer); a row is the target only with it. */
    readonly onOpen?: ((row: Row) => void) | undefined;
    /** The key of the row whose drawer is open. */
    readonly openKey?: string | null | undefined;
    readonly flagOf?: ((row: Row) => RowFlag | undefined) | undefined;
    readonly selection?: TableSelection | undefined;
    /** Draws this many placeholder rows and marks the table busy; 0 or left out when loaded. */
    readonly loading?: number | undefined;
}
/** The id of the button that opens the row `rowKey` of the table `tableId`: where focus returns from its drawer. */
export declare const rowOpenerId: (tableId: string, rowKey: string) => string;
export declare function DataTable<Row>(props: DataTableProps<Row>): JSX.Element;
