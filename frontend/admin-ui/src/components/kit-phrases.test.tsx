/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * The kit's shared list of phrase keys (`Test/_contract/kit-phrases.json`) is exactly what the components ask for.
 * Every component is drawn in every state it words — a switch on and off, a strip that can be dismissed, a secret with nothing stored, stored, and
 * being replaced, a text area with a limit, a colour that is none, a table ticking rows and one loading, a pager, a
 * drawer, the card states with the kit's actions, the charts, the words of a failed request — with a translator
 * that records each phrase it reads and each one it lacks. Nothing may be missing, and every key of the list must
 * have been read.
 */
import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { cleanup, fireEvent, screen } from '@testing-library/preact';
import type { JSX } from 'preact';
import { useState } from 'preact/hooks';
import {
    Badge,
    Button,
    Card,
    CardState,
    CodeEditor,
    ColourInput,
    Columns,
    DataTable,
    DayBars,
    DisclosureButton,
    Drawer,
    ExternalLink,
    failureText,
    FieldRow,
    FilterChip,
    FilterChips,
    Icon,
    MessageStrip,
    ModuleNav,
    Notice,
    OriginLine,
    OriginNotice,
    Pager,
    Panel,
    ProgressBar,
    RadioCards,
    SecretInput,
    SegmentedControl,
    SelectInput,
    StackedBar,
    StatePill,
    StatusPanel,
    StoreViewPicker,
    Switch,
    TabPanel,
    Tabs,
    TextArea,
    TextInput,
} from '@hryvinskyi/admin-ui';
import { KIT_PHRASE_KEYS, phraseLog, renderWithKit, testKit } from '../../test/support/kit.tsx';

afterEach(cleanup);

/** One log across every drawing of this file. */
const log = phraseLog();
const kit = testKit(log);

function Secret({ stored }: { readonly stored: boolean }): JSX.Element {
    const [replacement, setReplacement] = useState<string | null>(null);
    return (
        <SecretInput
            id={`secret-${String(stored)}`}
            stored={stored}
            replacement={replacement}
            onReplace={setReplacement}
            onKeep={() => setReplacement(null)}
        />
    );
}

describe('the kit\'s phrases', () => {
    it('are read by a switch in both states', () => {
        renderWithKit(
            <div>
                <Switch checked label="on" onChange={() => undefined} />
                <Switch checked={false} label="off" onChange={() => undefined} />
            </div>,
            kit,
        );
        assert.ok(screen.getByRole('switch', { name: 'on' }));
    });

    it('are read by a message strip that can be dismissed', () => {
        renderWithKit(<MessageStrip tone="success" onDismiss={() => undefined}>Done</MessageStrip>, kit);
        assert.ok(screen.getByRole('button', { name: 'kit.strip.dismiss' }));
    });

    it('are read by a secret input with nothing stored, stored, and being replaced', () => {
        renderWithKit(<div><Secret stored={false} /><Secret stored /></div>, kit);
        fireEvent.click(screen.getByRole('button', { name: 'kit.secret.replace' }));
        assert.ok(screen.getByRole('button', { name: 'kit.secret.keep' }));
    });

    it('are read by a text area with a limit, and a colour input holding no colour', () => {
        renderWithKit(
            <div>
                <TextArea id="area" label="Area" value="text" onInput={() => undefined} max={10} />
                <ColourInput id="colour" label="Colour" value="#12" onInput={() => undefined} />
            </div>,
            kit,
        );
        assert.equal(screen.getByRole('textbox', { name: 'Colour' }).getAttribute('aria-invalid'), 'true');
    });

    it('are read by a table that ticks rows, a loading table, a pager and a drawer', () => {
        renderWithKit(
            <div>
                <DataTable
                    id="t"
                    label="Ticked"
                    columns={[{ key: 'a', header: 'A', width: '1fr', cell: (row: string) => row }]}
                    items={[{ kind: 'row', row: 'one' }]}
                    rowKey={(row) => row}
                    rowName={(row) => row}
                    selection={{ selected: new Set<string>(), onChange: () => undefined }}
                />
                <DataTable id="l" label="Loading" columns={[]} items={[]} rowKey={String} rowName={String} loading={2} />
                <Pager page={1} pageSize={10} total={25} onPage={() => undefined} />
                <Drawer title="Drawer" onClose={() => undefined}>Body</Drawer>
            </div>,
            kit,
        );
        assert.ok(screen.getByRole('dialog', { name: 'Drawer' }));
    });

    it('are read by a failed and an unmatched card state, and by both charts', () => {
        renderWithKit(
            <div>
                <CardState kind="failed" title="Failed" action={{ onClick: () => undefined }} />
                <CardState kind="no-match" title="No match" action={{ onClick: () => undefined }} />
                <StackedBar title="Bar" summary="Bar" parts={[{ label: 'a', value: 1 }]} />
                <DayBars title="Days" summary="Days" periodLabel="Day" series={['s']} days={[{ label: 'd', title: 'd', values: [1] }]} />
            </div>,
            kit,
        );
        assert.ok(screen.getByRole('alert'));
    });

    it('are read for the words of a request that failed because the session ended or the role forbids it', () => {
        const words = (['expired', 'forbidden'] as const).map((kind) =>
            failureText({ kind, reason: null }, kit.translator, 'place'));

        assert.deepEqual(words, ['kit.failure.expired', 'kit.failure.forbidden']);
    });

    it('are not read by the components that take their words from the page', () => {
        const asked = new Set(log.asked);
        renderWithKit(
            <Columns aside={<Panel title="Panel" icon="info"><StatusPanel title="S" state="good" word="w" note="n" /></Panel>}>
                <Card icon="tune" title="Card" aside={<Badge variant="fixed">Fixed</Badge>}>
                    <MessageStrip tone="warning" action={{ label: 'Act', onClick: () => undefined }}>Strip</MessageStrip>
                    <Notice tone="error">Notice</Notice>
                    <FieldRow
                        controlId="f"
                        label="Field"
                        tag="Tag"
                        help="Help"
                        problems={['Problem']}
                        origin={<OriginLine text="Origin" icon="edit" own action={{ label: 'Undo', onClick: () => undefined }} />}
                    >
                        <TextInput id="f" value="" onInput={() => undefined} />
                    </FieldRow>
                    <OriginNotice text="Why" icon="lock" />
                    <SelectInput value="a" options={[{ value: 'a', label: 'A' }]} onChange={() => undefined} label="Select" />
                    <RadioCards name="r" label="Radios" value="a" options={[{ value: 'a', label: 'A' }]} onChange={() => undefined} />
                    <Button icon="edit" iconEnd="arrow_forward">Button</Button>
                    <ExternalLink href="https://example.test/">Link</ExternalLink>
                    <DisclosureButton expanded onToggle={() => undefined}>More</DisclosureButton>
                    <Icon name="lock" label="Locked" />
                    <TextArea id="plain-area" label="Plain" value="" onInput={() => undefined} />
                    <ColourInput id="good-colour" label="Good colour" value="#8c4a2b" onInput={() => undefined} />
                    <SegmentedControl label="Seg" value="a" options={[{ value: 'a', label: 'A' }]} onChange={() => undefined} />
                    <FilterChips label="Chips">
                        <FilterChip label="Chip" pressed count={3} tone="error" onToggle={() => undefined} />
                    </FilterChips>
                    <Tabs id="tabs" label="Tabs" value="a" tabs={[{ value: 'a', label: 'A', count: 1 }]} onChange={() => undefined} />
                    <TabPanel id="tabs" value="a">Panel</TabPanel>
                    <ModuleNav label="Nav" items={[{ href: '/a', label: 'A', current: true, count: 2 }]} />
                    <StatePill tone="error">Pill</StatePill>
                    <Badge variant="warn">Warn</Badge>
                    <Button variant="control">Control</Button>
                    <StoreViewPicker
                        id="scope"
                        label="Store view"
                        allLabel="All"
                        stores={[{ id: 1, name: 'One' }]}
                        value={null}
                        line={() => 'Line'}
                        onChange={() => undefined}
                    />
                    <CodeEditor
                        id="code"
                        label="Code"
                        value={'{\n}'}
                        onChange={() => undefined}
                        markedLine={1}
                        status={{ tone: 'error', message: 'Wrong' }}
                        hint="Hint"
                        complete={(_text, caret) => ({ from: caret, to: caret, items: [{ value: 'a', label: 'a' }] })}
                        completionFooter="Footer"
                    />
                    <ProgressBar label="Progress" value={1} max={2} />
                    <CardState kind="empty" title="Empty" action={{ label: 'Add', onClick: () => undefined }} />
                    <DataTable
                        id="plain-table"
                        label="Plain table"
                        columns={[{ key: 'a', header: 'A', width: '1fr', cell: (row: string) => row }]}
                        items={[{ kind: 'row', row: 'one' }]}
                        rowKey={(row) => row}
                        rowName={(row) => row}
                        onOpen={() => undefined}
                        flagOf={() => 'warning'}
                    />
                </Card>
            </Columns>,
            kit,
        );
        fireEvent.input(screen.getByRole('textbox', { name: 'Code' }), { target: { value: '{{' } });
        assert.ok(screen.getByRole('listbox', { name: 'Code' }));
        assert.deepEqual([...log.asked].filter((key) => !asked.has(key)), []);
    });

    it('lacked no phrase, and read every key of the shared list and nothing outside it', () => {
        assert.deepEqual([...log.missing].sort(), [], 'every phrase the components read is in the shared list');
        assert.deepEqual([...log.asked].filter((asked) => !KIT_PHRASE_KEYS.includes(asked)).sort(), [], 'nothing outside it');
        assert.deepEqual(KIT_PHRASE_KEYS.filter((listed) => !log.asked.has(listed)), [], 'nothing spare in it');
    });
});
