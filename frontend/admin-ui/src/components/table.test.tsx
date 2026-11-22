/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * The data table, used the way a page uses it: rows found by their names, opened by a click anywhere on them,
 * ticked one by one or all at once, grouped, flagged, and drawn as placeholders while they load.
 */
import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { cleanup, fireEvent, screen, within } from '@testing-library/preact';
import type { JSX } from 'preact';
import { useState } from 'preact/hooks';
import {
    DataTable,
    rowOpenerId,
    StatePill,
    Switch,
    type TableColumn,
    type TableItem,
} from '@hryvinskyi/admin-ui';
import { phraseLog, renderWithKit, testKit } from '../../test/support/kit.tsx';

afterEach(cleanup);

interface Feed {
    readonly name: string;
    readonly by: string;
    readonly when: 'failed' | 'sent';
}

const FEEDS: readonly Feed[] = [
    { name: 'catalog', by: 'Nightly', when: 'sent' },
    { name: 'prices', by: 'Hourly', when: 'sent' },
    { name: 'stock', by: 'By hand', when: 'failed' },
];

const COLUMNS: readonly TableColumn<Feed>[] = [
    { key: 'name', header: 'Name', width: 'minmax(0,1.4fr)', cell: (row) => <span class="mono">{row.name}</span> },
    { key: 'by', header: 'Runs', width: '150px', narrowWidth: '112px', cell: (row) => row.by },
    {
        key: 'when',
        header: 'Last run',
        width: '150px',
        align: 'end',
        cell: (row) => <StatePill tone={row.when === 'failed' ? 'error' : 'ok'}>{row.when}</StatePill>,
    },
];

const rowsOf = (feeds: readonly Feed[]): TableItem<Feed>[] => feeds.map((row) => ({ kind: 'row', row }));

interface ListProps {
    readonly selectable?: boolean;
    readonly opened?: string[];
}

function List({ selectable = false, opened = [] }: ListProps): JSX.Element {
    const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
    const [open, setOpen] = useState<string | null>(null);
    return (
        <DataTable
            id="feeds"
            label="Feeds"
            columns={COLUMNS}
            items={rowsOf(FEEDS)}
            rowKey={(row) => row.name}
            rowName={(row) => row.name}
            onOpen={(row) => {
                opened.push(row.name);
                setOpen(row.name);
            }}
            openKey={open}
            flagOf={(row) => (row.when === 'failed' ? 'error' : undefined)}
            selection={selectable ? { selected, onChange: setSelected } : undefined}
        />
    );
}

const rowOf = (name: string): HTMLElement => {
    const row = screen.getByRole('button', { name }).closest<HTMLElement>('[role="row"]');
    assert.ok(row !== null);
    return row;
};

describe('DataTable', () => {
    it('is a named table of rows and cells under its column headings, its tracks declared once', () => {
        renderWithKit(<List />);
        const table = screen.getByRole('table', { name: 'Feeds' });
        assert.deepEqual(
            within(table).getAllByRole('columnheader').map((header) => header.textContent),
            ['Name', 'Runs', 'Last run'],
        );
        assert.equal(within(table).getAllByRole('row').length, 4);
        assert.equal(table.style.getPropertyValue('--hui-table-columns'), 'minmax(0,1.4fr) 150px 150px 40px');
        assert.equal(table.style.getPropertyValue('--hui-table-columns-narrow'), 'minmax(0,1.4fr) 112px 150px 30px');
        assert.equal(within(rowOf('catalog')).getAllByRole('cell')[2]?.getAttribute('data-align'), 'end');
    });

    it('opens a row from a click anywhere on it, through its first cell\'s button, which takes focus', () => {
        const opened: string[] = [];
        renderWithKit(<List opened={opened} />);
        const row = rowOf('prices');
        fireEvent.click(within(row).getByText('Hourly'));
        assert.deepEqual(opened, ['prices']);
        assert.equal(document.activeElement, screen.getByRole('button', { name: 'prices' }));
        assert.equal(document.activeElement?.id, rowOpenerId('feeds', 'prices'));
        assert.equal(row.getAttribute('data-open'), 'true', 'the open row takes the accent tint');

        fireEvent.click(screen.getByRole('button', { name: 'catalog' }));
        assert.deepEqual(opened, ['prices', 'catalog']);
        assert.equal(rowOf('prices').getAttribute('data-open'), null);
    });

    it('marks a row that needs action with its flag, its words saying the same', () => {
        renderWithKit(<List />);
        assert.equal(rowOf('stock').getAttribute('data-flag'), 'error');
        assert.ok(within(rowOf('stock')).getByText('failed'));
        assert.equal(rowOf('catalog').getAttribute('data-flag'), null);
    });

    it('ticks rows without opening them, and select-all shows none, some and all', () => {
        const opened: string[] = [];
        renderWithKit(<List selectable opened={opened} />);
        const all = screen.getByRole('checkbox', { name: 'kit.select.all' }) as HTMLInputElement;
        const boxes = screen.getAllByRole('checkbox', { name: 'kit.select.row' }) as HTMLInputElement[];
        assert.equal(boxes.length, 3);
        assert.deepEqual([all.checked, all.indeterminate], [false, false]);

        const first = boxes[0];
        assert.ok(first !== undefined);
        fireEvent.click(first);
        assert.deepEqual(opened, [], 'the checkbox does not open the row');
        assert.equal(first.checked, true);
        assert.equal(rowOf('catalog').getAttribute('data-selected'), 'true');
        assert.deepEqual([all.checked, all.indeterminate], [false, true]);

        fireEvent.click(all);
        assert.deepEqual(boxes.map((box) => box.checked), [true, true, true]);
        assert.deepEqual([all.checked, all.indeterminate], [true, false]);

        fireEvent.click(all);
        assert.deepEqual(boxes.map((box) => box.checked), [false, false, false]);
        assert.deepEqual([all.checked, all.indeterminate], [false, false]);
    });

    it('names each row\'s checkbox after the row', () => {
        renderWithKit(<List selectable />, testKit(phraseLog(), { 'kit.select.row': 'Select %1' }));
        assert.equal(within(rowOf('stock')).getByRole('checkbox'), screen.getByRole('checkbox', { name: 'Select stock' }));
    });

    it('leaves a control inside a cell to do its own job', () => {
        const opened: string[] = [];
        function Rules(): JSX.Element {
            const [on, setOn] = useState(true);
            return (
                <DataTable
                    id="rules"
                    label="Rules"
                    columns={[
                        { key: 'name', header: 'Rule', width: '1fr', cell: (row: string) => row },
                        { key: 'on', header: '', width: '100px', cell: (row: string) => <Switch checked={on} onChange={setOn} label={`${row} on`} /> },
                    ]}
                    items={[{ kind: 'row', row: 'alpha' }]}
                    rowKey={(row) => row}
                    rowName={(row) => row}
                    onOpen={(row) => void opened.push(row)}
                />
            );
        }
        renderWithKit(<Rules />);
        fireEvent.click(screen.getByRole('switch', { name: 'alpha on' }));
        assert.deepEqual(opened, []);
        assert.equal(screen.getByRole('switch', { name: 'alpha on' }).getAttribute('aria-checked'), 'false');
    });

    it('heads a group with a row whose button shows or hides its rows', () => {
        function Grouped(): JSX.Element {
            const [expanded, setExpanded] = useState(true);
            const items: TableItem<Feed>[] = [
                {
                    kind: 'group',
                    group: {
                        key: 'exports',
                        label: 'Exports',
                        count: '3 feeds',
                        aside: <span class="hui-badge">Active</span>,
                        expanded,
                        onToggle: () => setExpanded(!expanded),
                    },
                },
                ...(expanded ? rowsOf(FEEDS) : []),
            ];
            return <DataTable id="g" label="Grouped" columns={COLUMNS} items={items} rowKey={(row) => row.name} rowName={(row) => row.name} />;
        }
        renderWithKit(<Grouped />);
        const toggle = screen.getByRole('button', { name: 'Exports 3 feeds Active' });
        assert.equal(toggle.getAttribute('aria-expanded'), 'true');
        assert.equal(toggle.closest('[role="cell"]')?.getAttribute('aria-colspan'), '3');
        assert.equal(screen.getAllByRole('row').length, 5);

        fireEvent.click(toggle);
        assert.equal(toggle.getAttribute('aria-expanded'), 'false');
        assert.equal(screen.getAllByRole('row').length, 2);
    });

    it('draws placeholder rows hidden from assistive technology while it loads, marked busy and saying so', () => {
        renderWithKit(
            <DataTable id="l" label="Loading list" columns={COLUMNS} items={[]} rowKey={(row) => row.name} rowName={(row) => row.name} loading={8} />,
        );
        const table = screen.getByRole('table', { name: 'Loading list' });
        assert.equal(table.getAttribute('aria-busy'), 'true');
        const skeleton = table.querySelector('.hui-table__skeleton');
        assert.equal(skeleton?.getAttribute('aria-hidden'), 'true');
        assert.equal(skeleton?.querySelectorAll('.hui-table__row--skeleton').length, 8);
        assert.equal(screen.getByRole('status').textContent, 'kit.table.loading');
        assert.equal(within(table).getAllByRole('row').length, 1, 'only the heading row is announced');
    });

    it('is not busy once loaded', () => {
        renderWithKit(<List />);
        assert.equal(screen.getByRole('table').getAttribute('aria-busy'), null);
        assert.equal(screen.queryByRole('status'), null);
    });
});
