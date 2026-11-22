/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * The parts the admin pages share beyond the base kit, found the way a person finds them: by role and accessible
 * name. The kit's phrases are their own keys here, so a part's own words show as `kit.*`.
 */
import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { cleanup, fireEvent, screen } from '@testing-library/preact';
import { render, type JSX } from 'preact';
import { useState } from 'preact/hooks';
import {
    CardState,
    ColourInput,
    FilterChip,
    FilterChips,
    Icon,
    ModuleNav,
    Pager,
    ProgressBar,
    SegmentedControl,
    StatePill,
    storeLineId,
    StoreViewPicker,
    TabPanel,
    Tabs,
    TextArea,
    type StoreView,
} from '@hryvinskyi/admin-ui';
import { phraseLog, renderWithKit, testKit } from '../../test/support/kit.tsx';

afterEach(cleanup);

describe('TextArea', () => {
    function Message({ start, max }: { readonly start: string; readonly max?: number }): JSX.Element {
        const [text, setText] = useState(start);
        return <TextArea id="message" label="Message" value={text} onInput={setText} rows={6} max={max} />;
    }

    it('is as high as its rows and grows only vertically, with no count when given no limit', () => {
        renderWithKit(<Message start="Hello" />);
        const area = screen.getByRole('textbox', { name: 'Message' });
        assert.equal(area.tagName, 'TEXTAREA');
        assert.equal(area.getAttribute('rows'), '6');
        assert.ok(area.classList.contains('hui-input--area'));
        assert.equal(area.getAttribute('aria-describedby'), null);
        assert.equal(area.getAttribute('aria-invalid'), 'false');
    });

    it('counts the characters typed against the limit, in the kit\'s words, as the text area\'s description', () => {
        renderWithKit(<Message start="Grüße 🍪" max={1000} />, testKit(phraseLog(), { 'kit.text.count': '%1 of %2 characters' }));
        const area = screen.getByRole('textbox', { name: 'Message' });
        const count = document.getElementById(area.getAttribute('aria-describedby') ?? '');
        assert.equal(count?.textContent, '7 of 1,000 characters');
        assert.equal(count?.getAttribute('data-state'), 'within');
    });

    it('turns to the warning tone near the limit and marks the text invalid past it, keeping every character', () => {
        renderWithKit(<Message start="Hello" max={10} />);
        const area = screen.getByRole('textbox', { name: 'Message' });
        const count = (): Element | null => document.getElementById('message-count');

        fireEvent.input(area, { target: { value: 'Hello wor' } });
        assert.equal(count()?.getAttribute('data-state'), 'near');
        assert.equal(area.getAttribute('aria-invalid'), 'false');

        fireEvent.input(area, { target: { value: 'Hello world, again' } });
        assert.equal(count()?.getAttribute('data-state'), 'over');
        assert.equal(area.getAttribute('aria-invalid'), 'true');
        assert.equal(area.getAttribute('maxlength'), null);
        assert.equal((area as HTMLTextAreaElement).value, 'Hello world, again');
    });

    it('keeps the caller\'s description beside the count', () => {
        renderWithKit(<TextArea id="d" label="D" value="" onInput={() => undefined} max={5} describedBy="d-help" />);
        assert.equal(screen.getByRole('textbox', { name: 'D' }).getAttribute('aria-describedby'), 'd-help d-count');
    });
});

describe('SegmentedControl', () => {
    const OPTIONS = [
        { value: 'square', label: 'Square' },
        { value: 'soft', label: 'Soft' },
        { value: 'round', label: 'Round' },
    ];

    function Corners({ disabled = false }: { readonly disabled?: boolean }): JSX.Element {
        const [value, setValue] = useState('soft');
        return <SegmentedControl label="Corners" value={value} options={OPTIONS} onChange={setValue} disabled={disabled} />;
    }

    it('is a named group with the chosen option pressed, the one Tab stop of the group', () => {
        renderWithKit(<Corners />);
        assert.ok(screen.getByRole('group', { name: 'Corners' }));
        const soft = screen.getByRole('button', { name: 'Soft' });
        assert.equal(soft.getAttribute('aria-pressed'), 'true');
        assert.equal(soft.tabIndex, 0);
        assert.equal(screen.getByRole('button', { name: 'Round' }).getAttribute('aria-pressed'), 'false');
        assert.equal(screen.getByRole('button', { name: 'Round' }).tabIndex, -1);
    });

    it('chooses a pressed option', () => {
        renderWithKit(<Corners />);
        fireEvent.click(screen.getByRole('button', { name: 'Round' }));
        assert.equal(screen.getByRole('button', { name: 'Round' }).getAttribute('aria-pressed'), 'true');
        assert.equal(screen.getByRole('button', { name: 'Soft' }).getAttribute('aria-pressed'), 'false');
    });

    it('moves the choice and the focus with the arrow keys, wrapping at the ends', () => {
        renderWithKit(<Corners />);
        const soft = screen.getByRole('button', { name: 'Soft' });
        soft.focus();
        fireEvent.keyDown(soft, { key: 'ArrowRight' });
        const round = screen.getByRole('button', { name: 'Round' });
        assert.equal(round.getAttribute('aria-pressed'), 'true');
        assert.equal(document.activeElement, round);

        fireEvent.keyDown(round, { key: 'ArrowRight' });
        const square = screen.getByRole('button', { name: 'Square' });
        assert.equal(square.getAttribute('aria-pressed'), 'true');
        assert.equal(document.activeElement, square);
    });

    it('passes over an option out of reach', () => {
        function Device(): JSX.Element {
            const [value, setValue] = useState('a');
            return (
                <SegmentedControl
                    label="Device"
                    value={value}
                    onChange={setValue}
                    options={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B', disabled: true }, { value: 'c', label: 'C' }]}
                />
            );
        }
        renderWithKit(<Device />);
        fireEvent.keyDown(screen.getByRole('button', { name: 'A' }), { key: 'ArrowRight' });
        assert.equal(screen.getByRole('button', { name: 'C' }).getAttribute('aria-pressed'), 'true');
    });

    it('draws an option\'s glyph before its label, hidden from assistive technology, and none for an option without one', () => {
        const { container } = renderWithKit(
            <SegmentedControl
                label="Test"
                value="page"
                onChange={() => undefined}
                options={[{ value: 'page', label: 'One page', icon: 'web' }, { value: 'catalog', label: 'Whole catalog', icon: 'inventory' }, { value: 'plain', label: 'Plain' }]}
            />,
        );
        const glyph = (name: string): string | null => {
            const host = document.createElement('div');
            render(<Icon name={name} />, host);
            return host.querySelector('path')?.getAttribute('d') ?? null;
        };

        const page = screen.getByRole('button', { name: 'One page' });
        const drawn = page.firstElementChild;
        assert.equal(drawn?.tagName.toLowerCase(), 'svg');
        assert.equal(drawn?.getAttribute('aria-hidden'), 'true');
        assert.equal(drawn?.classList.contains('hui-icon--18'), true);
        assert.equal(drawn?.querySelector('path')?.getAttribute('d'), glyph('web'));
        assert.equal(screen.getByRole('button', { name: 'Whole catalog' }).querySelector('path')?.getAttribute('d'), glyph('inventory'));
        assert.equal(screen.getByRole('button', { name: 'Plain' }).querySelector('svg'), null);
        assert.equal(container.querySelectorAll('.hui-segmented__option svg').length, 2);
    });

    it('locked, is marked so and chooses nothing, by click or key', () => {
        renderWithKit(<Corners disabled />);
        const group = screen.getByRole('group', { name: 'Corners' });
        assert.equal(group.getAttribute('aria-disabled'), 'true');
        const round = screen.getByRole('button', { name: 'Round' });
        assert.equal(round.hasAttribute('disabled'), true);
        fireEvent.click(round);
        fireEvent.keyDown(screen.getByRole('button', { name: 'Soft' }), { key: 'ArrowRight' });
        assert.equal(screen.getByRole('button', { name: 'Soft' }).getAttribute('aria-pressed'), 'true');
    });
});

describe('FilterChip', () => {
    function Chip(props: { readonly tone?: 'neutral' | 'warning' | 'error'; readonly count?: number | string }): JSX.Element {
        const [pressed, setPressed] = useState(false);
        return (
            <FilterChips label="Filter">
                <FilterChip label="Changed" pressed={pressed} onToggle={() => setPressed(!pressed)} {...props} />
            </FilterChips>
        );
    }

    it('toggles its pressed state, inside a named group', () => {
        renderWithKit(<Chip count={3} />);
        assert.ok(screen.getByRole('group', { name: 'Filter' }));
        const chip = screen.getByRole('button', { name: 'Changed 3' });
        assert.equal(chip.getAttribute('aria-pressed'), 'false');
        fireEvent.click(chip);
        assert.equal(chip.getAttribute('aria-pressed'), 'true');
    });

    it('formats a count for the locale and shows a text count as given', () => {
        renderWithKit(<div><Chip count={48210} /><Chip count="…" /></div>);
        assert.ok(screen.getByRole('button', { name: 'Changed 48,210' }));
        assert.ok(screen.getByRole('button', { name: 'Changed …' }));
    });

    it('carries its tone, and the error tone draws the error glyph as well as its colour', () => {
        renderWithKit(<div><Chip tone="warning" /><Chip tone="error" /><Chip /></div>);
        const chips = screen.getAllByRole('button', { name: 'Changed' });
        assert.deepEqual(chips.map((chip) => chip.getAttribute('data-tone')), ['warning', 'error', 'neutral']);
        assert.deepEqual(chips.map((chip) => chip.querySelectorAll('svg').length), [0, 1, 0]);
    });
});

describe('Tabs', () => {
    const TABS = [
        { value: 'new', label: 'New', count: 7, countTone: 'accent' as const },
        { value: 'added', label: 'Added', count: 12 },
        { value: 'ignored', label: 'Ignored', count: '…' },
    ];

    function Catalogue(): JSX.Element {
        const [tab, setTab] = useState('new');
        return (
            <div>
                <Tabs id="catalogue" label="Catalogue" value={tab} tabs={TABS} onChange={setTab} />
                <TabPanel id="catalogue" value={tab}>{`panel ${tab}`}</TabPanel>
            </div>
        );
    }

    it('is a named tab list whose selected tab controls the panel it names', () => {
        renderWithKit(<Catalogue />);
        assert.ok(screen.getByRole('tablist', { name: 'Catalogue' }));
        const tab = screen.getByRole('tab', { name: 'New 7' });
        assert.equal(tab.getAttribute('aria-selected'), 'true');
        assert.equal(tab.tabIndex, 0);
        assert.equal(screen.getByRole('tab', { name: 'Added 12' }).tabIndex, -1);
        const panel = screen.getByRole('tabpanel', { name: 'New 7' });
        assert.equal(tab.getAttribute('aria-controls'), panel.id);
        assert.equal(panel.textContent, 'panel new');
        assert.equal(tab.querySelector('.hui-tabs__count')?.getAttribute('data-tone'), 'accent');
    });

    it('selects with the arrow keys, Home and End, focus following', () => {
        renderWithKit(<Catalogue />);
        const first = screen.getByRole('tab', { name: 'New 7' });
        first.focus();
        fireEvent.keyDown(first, { key: 'ArrowRight' });
        const added = screen.getByRole('tab', { name: 'Added 12' });
        assert.equal(added.getAttribute('aria-selected'), 'true');
        assert.equal(document.activeElement, added);
        assert.equal(screen.getByRole('tabpanel').textContent, 'panel added');

        fireEvent.keyDown(added, { key: 'End' });
        assert.equal(document.activeElement, screen.getByRole('tab', { name: 'Ignored …' }));
        fireEvent.keyDown(document.activeElement ?? added, { key: 'ArrowRight' });
        assert.equal(document.activeElement, screen.getByRole('tab', { name: 'New 7' }));
        fireEvent.keyDown(document.activeElement ?? added, { key: 'ArrowLeft' });
        assert.equal(document.activeElement, screen.getByRole('tab', { name: 'Ignored …' }));
        fireEvent.keyDown(document.activeElement ?? added, { key: 'Home' });
        assert.equal(screen.getByRole('tab', { name: 'New 7' }).getAttribute('aria-selected'), 'true');
    });

    it('selects a clicked tab', () => {
        renderWithKit(<Catalogue />);
        fireEvent.click(screen.getByRole('tab', { name: 'Ignored …' }));
        assert.equal(screen.getByRole('tabpanel').textContent, 'panel ignored');
    });
});

describe('ModuleNav', () => {
    it('is a named navigation of real links, the current page marked, a waiting count beside its link', () => {
        renderWithKit(
            <ModuleNav
                label="Feeds"
                items={[
                    { href: '/overview', label: 'Overview', current: true },
                    { href: '/waiting', label: 'Waiting', count: 7 },
                    { href: '/records', label: 'Records' },
                ]}
            />,
        );
        const nav = screen.getByRole('navigation', { name: 'Feeds' });
        assert.equal(screen.getAllByRole('link').length, 3);
        assert.equal(screen.getByRole('link', { name: 'Overview' }).getAttribute('aria-current'), 'page');
        const waiting = screen.getByRole('link', { name: 'Waiting 7' });
        assert.equal(waiting.getAttribute('href'), '/waiting');
        assert.equal(waiting.getAttribute('aria-current'), null);
        assert.equal(nav.querySelectorAll('[role="tab"]').length, 0);
    });
});

describe('Pager', () => {
    function Records({ total }: { readonly total: number }): JSX.Element {
        const [page, setPage] = useState(1);
        return <Pager page={page} pageSize={12} total={total} onPage={setPage} />;
    }

    it('says the rows shown with the locale\'s numbers in a polite status, and pages back and forth', () => {
        renderWithKit(<Records total={48210} />, testKit(phraseLog(), { 'kit.pager.range': '%1–%2 of %3' }));
        const status = screen.getByRole('status');
        assert.equal(status.textContent, '1–12 of 48,210');
        const next = screen.getByRole('button', { name: 'kit.pager.next' });
        const previous = screen.getByRole('button', { name: 'kit.pager.previous' });
        assert.equal(previous.getAttribute('aria-disabled'), 'true');
        assert.equal(next.getAttribute('aria-disabled'), null);

        fireEvent.click(next);
        assert.equal(status.textContent, '13–24 of 48,210');
        assert.equal(previous.getAttribute('aria-disabled'), null);
        fireEvent.click(previous);
        assert.equal(previous.getAttribute('aria-disabled'), 'true');
    });

    it('does nothing past either end, keeping its buttons focusable', () => {
        const asked: number[] = [];
        renderWithKit(<Pager page={3} pageSize={12} total={30} onPage={(page) => void asked.push(page)} />);
        const next = screen.getByRole('button', { name: 'kit.pager.next' });
        assert.equal(next.getAttribute('aria-disabled'), 'true');
        assert.equal(next.hasAttribute('disabled'), false);
        fireEvent.click(next);
        fireEvent.click(screen.getByRole('button', { name: 'kit.pager.previous' }));
        assert.deepEqual(asked, [2]);
    });
});

describe('CardState', () => {
    it('announces a failure at once and offers Try again in the kit\'s words', () => {
        let retried = 0;
        renderWithKit(
            <CardState
                kind="failed"
                title="The records could not be loaded"
                text="New orders still arrive."
                action={{ onClick: () => void retried++ }}
            />,
        );
        const alert = screen.getByRole('alert');
        assert.match(alert.textContent ?? '', /The records could not be loaded/);
        assert.match(alert.textContent ?? '', /New orders still arrive\./);
        fireEvent.click(screen.getByRole('button', { name: 'kit.state.retry' }));
        assert.equal(retried, 1);
        assert.equal(alert.getAttribute('data-tone'), 'error');
    });

    it('offers Clear filters when nothing matches, and the caller\'s own action when nothing is there yet', () => {
        renderWithKit(
            <div>
                <CardState kind="no-match" title="No record matches" action={{ onClick: () => undefined }} />
                <CardState kind="empty" title="No rules yet" icon="lock" action={{ label: 'Add a rule', onClick: () => undefined }} />
                <CardState kind="empty" title="No records yet" text="The first appears after an order." />
            </div>,
        );
        assert.ok(screen.getByRole('button', { name: 'kit.state.clear' }));
        assert.ok(screen.getByRole('button', { name: 'Add a rule' }));
        assert.equal(screen.queryByRole('alert'), null);
        assert.equal(screen.getAllByRole('button').length, 2);
    });
});

describe('StatePill', () => {
    it('says each state as a glyph and a word', () => {
        renderWithKit(
            <div>
                <StatePill tone="error">Not sent</StatePill>
                <StatePill tone="ok">Sent</StatePill>
                <StatePill tone="muted">Not seen</StatePill>
            </div>,
        );
        for (const [word, tone] of [['Not sent', 'error'], ['Sent', 'ok'], ['Not seen', 'muted']] as const) {
            const pill = screen.getByText(word);
            assert.equal(pill.getAttribute('data-tone'), tone);
            assert.equal(pill.querySelectorAll('svg[aria-hidden="true"]').length, 1);
            assert.equal(pill.classList.contains('hui-pill--filled'), false);
        }
    });

    it('fills an ok or a muted pill in its tint when asked, with the filled variant of its glyph', () => {
        renderWithKit(
            <div>
                <StatePill tone="ok" icon="check_circle" filled>Met</StatePill>
                <StatePill tone="muted" icon="remove_circle" filled>No result</StatePill>
                <StatePill tone="muted" icon="remove_circle">Left out</StatePill>
            </div>,
        );
        const path = (word: string): string | null | undefined =>
            screen.getByText(word).querySelector('svg path')?.getAttribute('d');
        const met = screen.getByText('Met');
        const none = screen.getByText('No result');

        assert.equal(met.getAttribute('data-tone'), 'ok');
        assert.equal(met.classList.contains('hui-pill--filled'), true);
        assert.equal(none.getAttribute('data-tone'), 'muted');
        assert.equal(none.classList.contains('hui-pill--filled'), true);
        assert.equal(screen.getByText('Left out').classList.contains('hui-pill--filled'), false);
        assert.notEqual(path('No result'), path('Left out'), 'the filled pill draws the filled glyph');
    });
});

describe('ProgressBar', () => {
    it('is a named progress bar with its range, value and tone, filled by its share', () => {
        renderWithKit(<ProgressBar label="Budget used" value={3.4} max={5} tone="warning" valueText="68 %" />);
        const bar = screen.getByRole('progressbar', { name: 'Budget used' });
        assert.deepEqual(
            ['aria-valuemin', 'aria-valuemax', 'aria-valuenow', 'aria-valuetext', 'data-tone'].map((name) => bar.getAttribute(name)),
            ['0', '5', '3.4', '68 %', 'warning'],
        );
        assert.equal(bar.querySelector<HTMLElement>('.hui-progress__fill')?.style.width, '68%');
    });

    it('keeps the value within the range and draws an empty track for a maximum of nothing', () => {
        renderWithKit(<div><ProgressBar label="Over" value={9} max={5} /><ProgressBar label="None" value={2} max={0} /></div>);
        const over = screen.getByRole('progressbar', { name: 'Over' });
        assert.equal(over.getAttribute('aria-valuenow'), '5');
        assert.equal(over.querySelector<HTMLElement>('.hui-progress__fill')?.style.width, '100%');
        const none = screen.getByRole('progressbar', { name: 'None' });
        assert.equal(none.getAttribute('aria-valuenow'), '0');
        assert.equal(none.querySelector<HTMLElement>('.hui-progress__fill')?.style.width, '0%');
    });
});

describe('ColourInput', () => {
    function Accent({ start }: { readonly start: string }): JSX.Element {
        const [colour, setColour] = useState(start);
        return <ColourInput id="accent" label="Accent colour" value={colour} onInput={setColour} />;
    }

    it('shows a valid colour in its swatch, with no message', () => {
        renderWithKit(<Accent start="#8C4A2B" />);
        const input = screen.getByRole('textbox', { name: 'Accent colour' });
        assert.equal(input.getAttribute('aria-invalid'), 'false');
        assert.equal(input.getAttribute('aria-describedby'), null);
        const swatch = input.closest('.hui-colour')?.querySelector<HTMLElement>('.hui-colour__swatch');
        assert.equal(swatch?.getAttribute('data-empty'), 'false');
        assert.equal(swatch?.style.backgroundColor === '' ? '' : 'set', 'set');
    });

    it('marks anything else invalid, with the kit\'s message as its description and a blank swatch', () => {
        renderWithKit(<Accent start="#8c4a2b" />);
        const input = screen.getByRole('textbox', { name: 'Accent colour' });
        fireEvent.input(input, { target: { value: '#8c4a2' } });
        assert.equal(input.getAttribute('aria-invalid'), 'true');
        const message = document.getElementById(input.getAttribute('aria-describedby') ?? '');
        assert.equal(message?.textContent, 'kit.colour.invalid');
        const swatch = input.closest('.hui-colour')?.querySelector<HTMLElement>('.hui-colour__swatch');
        assert.equal(swatch?.getAttribute('data-empty'), 'true');
        assert.equal(swatch?.style.backgroundColor, '');
    });
});

describe('StoreViewPicker', () => {
    const STORES: readonly StoreView[] = [
        { id: 1, name: 'English', locale: 'en_US' },
        { id: 2, name: 'Deutsch', locale: 'de_DE' },
    ];
    const line = (view: StoreView | null): string => (view === null ? 'Every store view together.' : `What ${view.name} outputs.`);

    function Scope({ start, onPick }: { readonly start: number | null; readonly onPick?: (value: number | null) => void }): JSX.Element {
        const [value, setValue] = useState(start);
        return (
            <StoreViewPicker
                id="scope"
                label="Store view"
                allLabel="All store views"
                stores={STORES}
                value={value}
                line={line}
                onChange={(next) => {
                    onPick?.(next);
                    setValue(next);
                }}
            />
        );
    }

    it('is a labelled strong select of every store view together and each view, described by the page\'s line', () => {
        renderWithKit(<Scope start={null} />);
        const select = screen.getByRole('combobox', { name: 'Store view' });
        assert.ok(select instanceof HTMLSelectElement);
        assert.deepEqual([...select.options].map((option) => [option.value, option.text]), [
            ['all', 'All store views'],
            ['1', 'English'],
            ['2', 'Deutsch'],
        ]);
        assert.equal(select.value, 'all');
        assert.deepEqual(
            [...(select.closest('.hui-select')?.classList ?? [])].sort(),
            ['hui-select', 'hui-select--auto', 'hui-select--strong'],
        );
        assert.equal(select.getAttribute('aria-describedby'), storeLineId('scope'));
        assert.equal(document.getElementById(storeLineId('scope'))?.textContent, 'Every store view together.');
        assert.ok(select.closest('.hui-storebar')?.querySelector('.hui-storebar__label svg'));
    });

    it('reports the view chosen, and every view together, and words the line for it', () => {
        const picked: (number | null)[] = [];
        renderWithKit(<Scope start={1} onPick={(value) => picked.push(value)} />);
        const select = screen.getByRole('combobox', { name: 'Store view' });
        assert.equal(document.getElementById(storeLineId('scope'))?.textContent, 'What English outputs.');

        fireEvent.change(select, { target: { value: '2' } });
        assert.equal(document.getElementById(storeLineId('scope'))?.textContent, 'What Deutsch outputs.');
        fireEvent.change(select, { target: { value: 'all' } });
        assert.deepEqual(picked, [2, null]);
        assert.equal(document.getElementById(storeLineId('scope'))?.textContent, 'Every store view together.');
    });

    it('leaves out every store view together when the page does, and draws no line when given none', () => {
        renderWithKit(
            <StoreViewPicker id="one" label="Store view" allowAll={false} stores={STORES} value={2} onChange={() => undefined} />,
        );
        const select = screen.getByRole('combobox', { name: 'Store view' });
        assert.ok(select instanceof HTMLSelectElement);
        assert.deepEqual([...select.options].map((option) => option.value), ['1', '2']);
        assert.equal(select.value, '2');
        assert.equal(select.getAttribute('aria-describedby'), null);
        assert.equal(document.querySelector('.hui-storebar__line'), null);
    });
});
