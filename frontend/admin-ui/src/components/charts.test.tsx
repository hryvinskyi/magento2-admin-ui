/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * The charts: an image named by its summary for assistive technology, followed by the same numbers in a table only
 * a screen reader sees, with the proportions from the kit's pure functions.
 */
import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { cleanup, screen, within } from '@testing-library/preact';
import { DayBars, StackedBar } from '@hryvinskyi/admin-ui';
import { phraseLog, renderWithKit, testKit } from '../../test/support/kit.tsx';

afterEach(cleanup);

const english = (): ReturnType<typeof testKit> =>
    testKit(phraseLog(), { 'kit.chart.share': '%1%', 'kit.chart.values': 'Values of the chart: %1' });

const cellsOf = (table: HTMLElement): string[][] =>
    [...table.querySelectorAll('tr')].map((row) => [...row.children].map((cell) => cell.textContent ?? ''));

describe('StackedBar', () => {
    const PARTS = [
        { label: 'Paid', value: 620 },
        { label: 'Pending', value: 120 },
        { label: 'Failed', value: 180, display: '180 orders' },
        { label: 'Cancelled', value: 80 },
    ];

    it('is an image named by its summary, split into its parts in the series colours', () => {
        renderWithKit(<StackedBar title="Orders by status" summary="Paid 62%, Pending 12%" parts={PARTS} />, english());
        const image = screen.getByRole('img', { name: 'Paid 62%, Pending 12%' });
        const parts = [...image.querySelectorAll<HTMLElement>('.hui-stackbar__part')];
        assert.deepEqual(parts.map((part) => part.getAttribute('data-series')), ['1', '2', '3', '4']);
        assert.deepEqual(parts.map((part) => part.style.flexGrow), ['620', '120', '180', '80']);
    });

    it('holds every value in a table a screen reader reads, captioned with the chart\'s title', () => {
        renderWithKit(<StackedBar title="Orders by status" summary="s" parts={PARTS} />, english());
        const table = screen.getByRole('table', { name: 'Values of the chart: Orders by status' });
        assert.ok(table.classList.contains('hui-sr-only'));
        assert.deepEqual(cellsOf(table), [
            ['Paid', '62%', '620'],
            ['Pending', '12%', '120'],
            ['Failed', '18%', '180 orders'],
            ['Cancelled', '8%', '80'],
        ]);
        assert.deepEqual(
            within(table).getAllByRole('rowheader').map((header) => header.textContent),
            ['Paid', 'Pending', 'Failed', 'Cancelled'],
        );
    });

    it('rounds the shares so they add up to 100', () => {
        renderWithKit(
            <StackedBar title="T" summary="s" parts={[{ label: 'a', value: 1 }, { label: 'b', value: 1 }, { label: 'c', value: 1 }]} />,
            english(),
        );
        assert.deepEqual(cellsOf(screen.getByRole('table')).map((row) => row[1]), ['34%', '33%', '33%']);
    });

    it('draws an empty track for a whole of nothing, never NaN', () => {
        renderWithKit(<StackedBar title="T" summary="Nothing yet" parts={[{ label: 'a', value: 0 }, { label: 'b', value: 0 }]} />, english());
        assert.equal(screen.getByRole('img', { name: 'Nothing yet' }).querySelectorAll('.hui-stackbar__part').length, 0);
        assert.deepEqual(cellsOf(screen.getByRole('table')).map((row) => row[1]), ['0%', '0%']);
        assert.doesNotMatch(document.body.innerHTML, /NaN/);
    });
});

describe('DayBars', () => {
    const SERIES = ['Paid', 'Pending', 'Failed'];
    const DAYS = [
        { label: 'Mon', title: 'Mon · 40', values: [20, 10, 10] },
        { label: 'Tue', title: 'Tue · 80', values: [40, 20, 20] },
        { label: '', name: 'Wed', title: 'Wed · 0', values: [0, 0, 0] },
    ];

    it('draws a bar per day as high as its total against the highest, split by series, its title on hover', () => {
        renderWithKit(<DayBars title="Per day" summary="Orders per day" periodLabel="Day" series={SERIES} days={DAYS} />, english());
        const bars = [...screen.getByRole('img', { name: 'Orders per day' }).querySelectorAll<HTMLElement>('.hui-daybars__bar')];
        assert.deepEqual(bars.map((bar) => bar.style.height), ['50%', '100%', '0%']);
        assert.deepEqual(bars.map((bar) => bar.title), ['Mon · 40', 'Tue · 80', 'Wed · 0']);
        assert.deepEqual(
            [...(bars[0]?.querySelectorAll('.hui-daybars__part') ?? [])].map((part) => part.getAttribute('data-series')),
            ['1', '2', '3'],
        );
        assert.equal(bars[2]?.querySelectorAll('.hui-daybars__part').length, 0);
    });

    it('holds every value, day by series, in the screen reader\'s table, a blank label named in it', () => {
        renderWithKit(<DayBars title="Per day" summary="s" periodLabel="Day" series={SERIES} days={DAYS} />, english());
        const table = screen.getByRole('table', { name: 'Values of the chart: Per day' });
        assert.deepEqual(cellsOf(table), [
            ['Day', 'Paid', 'Pending', 'Failed'],
            ['Mon', '20', '10', '10'],
            ['Tue', '40', '20', '20'],
            ['Wed', '0', '0', '0'],
        ]);
    });

    it('with one series, formats its values as asked and lets a highlighted day stand out', () => {
        const money = (value: number): string => `€${value.toFixed(2)}`;
        renderWithKit(
            <DayBars
                title="Cost per day"
                summary="Cost per day from 1 to 3 November"
                periodLabel="Day"
                series={['Cost']}
                format={money}
                days={[
                    { label: '1 Nov', title: '1 Nov · €0.10', values: [0.1] },
                    { label: '', name: '2 Nov', title: '2 Nov · €0.40', values: [0.4], highlight: true },
                    { label: '3 Nov', title: '3 Nov · €0.20', values: [0.2] },
                ]}
            />,
            english(),
        );
        const image = screen.getByRole('img', { name: 'Cost per day from 1 to 3 November' });
        assert.equal(image.getAttribute('data-highlighting'), 'true');
        assert.deepEqual(
            [...image.querySelectorAll('.hui-daybars__bar')].map((bar) => bar.getAttribute('data-highlight')),
            ['false', 'true', 'false'],
        );
        assert.equal(document.querySelector('.hui-chart__legend'), null, 'one series needs no legend');
        assert.deepEqual(cellsOf(screen.getByRole('table')).slice(1), [['1 Nov', '€0.10'], ['2 Nov', '€0.40'], ['3 Nov', '€0.20']]);
    });

    it('draws only empty bars when every day is nothing, never NaN', () => {
        renderWithKit(
            <DayBars title="T" summary="s" periodLabel="Day" series={['Cost']} days={[{ label: 'a', title: 'a', values: [0] }]} />,
            english(),
        );
        assert.equal(document.querySelector<HTMLElement>('.hui-daybars__bar')?.style.height, '0%');
        assert.doesNotMatch(document.body.innerHTML, /NaN/);
    });
});
