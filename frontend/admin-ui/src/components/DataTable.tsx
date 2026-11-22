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
import { selectionState, afterSelectAll, afterToggle } from '../domain/selection.ts';
import { Icon } from './icons.tsx';
import { useKit } from './kit-context.tsx';

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
    readonly row: { readonly row: Row };
    readonly group: { readonly group: TableGroup };
}

/** A row of the table, or a group row heading the rows after it. */
export type TableItem<Row, K extends keyof TableItemData<Row> = keyof TableItemData<Row>> = {
    [P in K]: { readonly kind: P } & TableItemData<Row>[P];
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
export const rowOpenerId = (tableId: string, rowKey: string): string => `${tableId}-open-${rowKey}`;

/** The tracks of the checkbox and the chevron columns, wide and narrow. */
const CHECK_TRACK = { wide: '46px', narrow: '40px' } as const;
const CHEVRON_TRACK = { wide: '40px', narrow: '30px' } as const;

/** The widths of the placeholder bars, cycled over the rows and the columns. */
const SKELETON_WIDTHS = ['62%', '50%', '78%', '70%', '44%', '58%'] as const;

/** What a click inside a row does its own job with, rather than open the row. */
const OWN_CONTROLS = 'a, button, input, select, textarea, label, summary, [role="switch"], [role="button"]';

function template<Row>(
    columns: readonly TableColumn<Row>[],
    size: 'wide' | 'narrow',
    selecting: boolean,
    opening: boolean,
): string {
    const tracks = columns.map((column) => (size === 'narrow' ? column.narrowWidth ?? column.width : column.width));
    return [selecting ? CHECK_TRACK[size] : null, ...tracks, opening ? CHEVRON_TRACK[size] : null]
        .filter((track) => track !== null)
        .join(' ');
}

interface RowContext<Row> {
    readonly props: DataTableProps<Row>;
    readonly selectLabel: (name: string) => string;
}

/** Opens the row unless the click was on a control of its own; the row's button takes focus first. */
function activate<Row>(event: MouseEvent, row: Row, onOpen: (row: Row) => void): void {
    const target = event.target;
    const opener = event.currentTarget instanceof Element
        ? event.currentTarget.querySelector<HTMLElement>('.hui-table__open')
        : null;
    const control = target instanceof Element ? target.closest(OWN_CONTROLS) : null;
    if (control !== null && control !== opener) {
        return;
    }
    opener?.focus();
    onOpen(row);
}

function DataRow<Row>({ row, context }: { readonly row: Row; readonly context: RowContext<Row> }): JSX.Element {
    const { props, selectLabel } = context;
    const key = props.rowKey(row);
    const name = props.rowName(row);
    const onOpen = props.onOpen;
    const selection = props.selection;
    const ticked = selection?.selected.has(key) === true;
    return (
        <div
            role="row"
            class="hui-table__row"
            data-open={props.openKey === key ? 'true' : undefined}
            data-selected={ticked ? 'true' : undefined}
            data-flag={props.flagOf?.(row)}
            data-target={onOpen === undefined ? undefined : 'true'}
            onClick={onOpen === undefined ? undefined : (event) => activate(event, row, onOpen)}
        >
            {selection === undefined ? null : (
                <div role="cell" class="hui-table__cell hui-table__cell--check">
                    <input
                        type="checkbox"
                        class="hui-table__check"
                        aria-label={selectLabel(name)}
                        checked={ticked}
                        onChange={() => selection.onChange(afterToggle(selection.selected, key))}
                    />
                </div>
            )}
            {props.columns.map((column, index) => (
                <div key={column.key} role="cell" class="hui-table__cell" data-align={column.align ?? 'start'}>
                    {index === 0 && onOpen !== undefined ? (
                        <button
                            type="button"
                            id={rowOpenerId(props.id, key)}
                            class="hui-table__open"
                            aria-label={name}
                        >
                            {column.cell(row)}
                        </button>
                    ) : column.cell(row)}
                </div>
            ))}
            {onOpen === undefined ? null : (
                <div class="hui-table__chevron" aria-hidden="true"><Icon name="chevron_right" size={20} /></div>
            )}
        </div>
    );
}

function GroupRow({ group, span }: { readonly group: TableGroup; readonly span: number }): JSX.Element {
    return (
        <div role="row" class="hui-table__group">
            <div role="cell" class="hui-table__group-cell" aria-colspan={span}>
                <button
                    type="button"
                    class="hui-table__group-toggle"
                    aria-expanded={group.expanded}
                    onClick={() => group.onToggle()}
                >
                    <Icon name={group.expanded ? 'expand_more' : 'chevron_right'} size={20} />
                    <span class="hui-table__group-label">{group.label}</span>
                    {group.count === undefined ? null : <span class="hui-table__group-count">{group.count}</span>}
                    {group.aside === undefined ? null : <span class="hui-table__group-aside">{group.aside}</span>}
                </button>
            </div>
        </div>
    );
}

/** How each kind of item is drawn. */
type ItemViews<Row> = { [K in keyof TableItemData<Row>]: (item: TableItem<Row, K>) => JSX.Element };

function drawItem<Row, K extends keyof TableItemData<Row>>(views: ItemViews<Row>, item: TableItem<Row, K>): JSX.Element {
    return views[item.kind](item);
}

function SkeletonRows({ rows, cells }: { readonly rows: number; readonly cells: number }): JSX.Element {
    return (
        <div class="hui-table__skeleton" aria-hidden="true">
            {Array.from({ length: rows }, (_row, row) => (
                <div key={row} class="hui-table__row hui-table__row--skeleton">
                    {Array.from({ length: cells }, (_cell, cell) => (
                        <span key={cell} class="hui-table__cell">
                            <span
                                class="hui-table__bone"
                                style={{ width: SKELETON_WIDTHS[(row + cell) % SKELETON_WIDTHS.length] }}
                            />
                        </span>
                    ))}
                </div>
            ))}
        </div>
    );
}

export function DataTable<Row>(props: DataTableProps<Row>): JSX.Element {
    const { t } = useKit().translator;
    const { id, label, columns, items, rowKey, selection, onOpen, loading = 0 } = props;
    const opening = onOpen !== undefined;
    const selecting = selection !== undefined;
    const context: RowContext<Row> = { props, selectLabel: (name: string): string => t('kit.select.row', name) };
    const span = columns.length + (selecting ? 1 : 0);
    const views: ItemViews<Row> = {
        row: (item) => <DataRow key={`row-${rowKey(item.row)}`} row={item.row} context={context} />,
        group: (item) => <GroupRow key={`group-${item.group.key}`} group={item.group} span={span} />,
    };
    const shownKeys = items.flatMap((item) => (item.kind === 'row' ? [rowKey(item.row)] : []));
    const state = selection === undefined ? 'none' : selectionState(shownKeys, selection.selected);
    const busy = loading > 0;
    return (
        <>
            <div
                role="table"
                id={id}
                class="hui-table"
                aria-label={label}
                aria-busy={busy ? true : undefined}
                style={{
                    '--hui-table-columns': template(columns, 'wide', selecting, opening),
                    '--hui-table-columns-narrow': template(columns, 'narrow', selecting, opening),
                }}
            >
                <div role="row" class="hui-table__row hui-table__row--head">
                    {selection === undefined ? null : (
                        <div role="columnheader" class="hui-table__cell hui-table__cell--check">
                            <input
                                type="checkbox"
                                class="hui-table__check"
                                aria-label={t('kit.select.all')}
                                checked={state === 'all'}
                                indeterminate={state === 'some'}
                                disabled={shownKeys.length === 0}
                                onChange={() => selection.onChange(afterSelectAll(shownKeys, selection.selected))}
                            />
                        </div>
                    )}
                    {columns.map((column) => (
                        <div key={column.key} role="columnheader" class="hui-table__cell" data-align={column.align ?? 'start'}>
                            {column.header}
                        </div>
                    ))}
                    {opening ? <div class="hui-table__chevron" aria-hidden="true" /> : null}
                </div>
                {items.map((item) => drawItem(views, item))}
                {busy ? <SkeletonRows rows={loading} cells={span + (opening ? 1 : 0)} /> : null}
            </div>
            {busy ? <p class="hui-sr-only" role="status">{t('kit.table.loading')}</p> : null}
        </>
    );
}
