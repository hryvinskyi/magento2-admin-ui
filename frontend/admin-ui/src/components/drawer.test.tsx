/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * The drawer as a person meets it: opened from a row, named by its title, closed by Escape, the scrim or Close,
 * keeping focus inside while open, and handing focus back to the row's button when it closes — also when the row
 * was drawn anew while the drawer was open.
 */
import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { cleanup, fireEvent, screen } from '@testing-library/preact';
import type { JSX } from 'preact';
import { useState } from 'preact/hooks';
import { Button, DataTable, Drawer, rowOpenerId, TextInput } from '@hryvinskyi/admin-ui';
import { renderWithKit } from '../../test/support/kit.tsx';

afterEach(() => {
    cleanup();
    document.body.style.overflow = '';
});

interface PageProps {
    /** Each row's key carries this, so changing it draws every row anew. */
    readonly generation?: number;
    readonly closes?: string[];
    readonly removed?: string[];
}

function RecordsPage({ closes = [], removed = [] }: PageProps): JSX.Element {
    const [open, setOpen] = useState<string | null>(null);
    const [generation, setGeneration] = useState(0);
    const close = (how: string) => (): void => {
        closes.push(how);
        setOpen(null);
    };
    return (
        <div>
            <DataTable
                key={generation}
                id="records"
                label="Records"
                columns={[{ key: 'id', header: 'Order', width: '1fr', cell: (row: string) => row }]}
                items={['r-1', 'r-2'].map((row) => ({ kind: 'row' as const, row }))}
                rowKey={(row) => row}
                rowName={(row) => `Record ${row}`}
                onOpen={setOpen}
                openKey={open}
            />
            {open === null ? null : (
                <Drawer
                    title={`Record ${open}`}
                    eyebrow="Order record"
                    titleStyle="code"
                    aside={<Button variant="link" onClick={() => setGeneration(generation + 1)}>Refresh rows</Button>}
                    onClose={close('close')}
                    returnFocusId={rowOpenerId('records', open)}
                    actions={<Button variant="primary" onClick={close('save')}>Save</Button>}
                    destructive={{ label: 'Remove', onClick: () => void removed.push(open) }}
                >
                    <TextInput id="note" label="Note" value="" onInput={() => undefined} />
                </Drawer>
            )}
        </div>
    );
}

/** Lets the work the drawer queued on closing run: focus moves back once the closing drawing is complete. */
const settle = (): Promise<void> => new Promise((resolve) => {
    setTimeout(resolve, 0);
});

const openRecord = (id: string): HTMLElement => {
    fireEvent.click(screen.getByRole('button', { name: `Record ${id}` }));
    return screen.getByRole('dialog', { name: `Record ${id}` });
};

describe('Drawer', () => {
    it('is a modal dialog named by its title, with focus moved into it and the page behind held still', async () => {
        renderWithKit(<RecordsPage />);
        const dialog = openRecord('r-2');
        assert.equal(dialog.getAttribute('aria-modal'), 'true');
        await settle();
        assert.ok(dialog.contains(document.activeElement));
        assert.equal(document.body.style.overflow, 'hidden');
        assert.ok(screen.getByText('Order record'));
        assert.ok(screen.getByRole('heading', { name: 'Record r-2' }).classList.contains('hui-drawer__title--code'));
    });

    it('draws the primary action first in the footer and the destructive one as a link at its far end', () => {
        const removed: string[] = [];
        renderWithKit(<RecordsPage removed={removed} />);
        const dialog = openRecord('r-1');
        const footer = dialog.querySelector('.hui-drawer__foot');
        const buttons = [...(footer?.querySelectorAll('button') ?? [])];
        assert.deepEqual(buttons.map((button) => button.textContent), ['Save', 'Remove']);
        assert.ok(buttons[1]?.classList.contains('hui-button--link'));
        fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
        assert.deepEqual(removed, ['r-1']);
    });

    for (const [how, leave] of [
        ['Escape', (dialog: HTMLElement): void => void fireEvent.keyDown(dialog.querySelector('input') ?? dialog, { key: 'Escape' })],
        ['the scrim', (dialog: HTMLElement): void => void fireEvent.click(dialog.parentElement?.querySelector('.hui-drawer__scrim') ?? dialog)],
        ['Close', (): void => void fireEvent.click(screen.getByRole('button', { name: 'kit.drawer.close' }))],
    ] as const) {
        it(`leaves through ${how} without saving, handing focus back to the row and the page its scrolling`, async () => {
            const closes: string[] = [];
            renderWithKit(<RecordsPage closes={closes} />);
            const dialog = openRecord('r-2');
            await settle();
        assert.ok(dialog.contains(document.activeElement));

            leave(dialog);

            assert.deepEqual(closes, ['close']);
            assert.equal(screen.queryByRole('dialog'), null);
            await settle();
        assert.equal(document.activeElement, screen.getByRole('button', { name: 'Record r-2' }));
            assert.equal(document.body.style.overflow, '');
        });
    }

    it('keeps Tab and Shift+Tab inside, wrapping at either end', async () => {
        renderWithKit(<RecordsPage />);
        const dialog = openRecord('r-1');
        await settle();
        assert.ok(dialog.contains(document.activeElement));
        const close = screen.getByRole('button', { name: 'kit.drawer.close' });
        const remove = screen.getByRole('button', { name: 'Remove' });

        remove.focus();
        fireEvent.keyDown(remove, { key: 'Tab' });
        assert.equal(document.activeElement, screen.getByRole('button', { name: 'Refresh rows' }), 'past the last, the first');

        fireEvent.keyDown(document.activeElement ?? dialog, { key: 'Tab', shiftKey: true });
        assert.equal(document.activeElement, remove, 'before the first, the last');

        close.focus();
        fireEvent.keyDown(close, { key: 'Tab' });
        assert.equal(document.activeElement, close, 'in the middle, Tab is left to the browser');
    });

    it('hands focus back to the row\'s button when the row was drawn anew while the drawer was open', async () => {
        renderWithKit(<RecordsPage />);
        const before = screen.getByRole('button', { name: 'Record r-1' });
        const dialog = openRecord('r-1');
        await settle();
        assert.ok(dialog.contains(document.activeElement));

        fireEvent.click(screen.getByRole('button', { name: 'Refresh rows' }));
        const after = screen.getByRole('button', { name: 'Record r-1' });
        assert.notEqual(after, before, 'the row\'s button is a new element');
        assert.equal(before.isConnected, false);

        fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
        await settle();
        assert.equal(document.activeElement, after);
    });

    it('without an id to return to, hands focus back to the element that had it when it opened', async () => {
        function Plain(): JSX.Element {
            const [open, setOpen] = useState(false);
            return (
                <div>
                    <Button onClick={() => setOpen(true)}>Edit settings</Button>
                    {open ? <Drawer title="Settings" onClose={() => setOpen(false)}><p>Body</p></Drawer> : null}
                </div>
            );
        }
        renderWithKit(<Plain />);
        const opener = screen.getByRole('button', { name: 'Edit settings' });
        opener.focus();
        fireEvent.click(opener);
        const dialog = screen.getByRole('dialog', { name: 'Settings' });
        await settle();
        assert.equal(document.activeElement, dialog, 'with nothing focusable but Close, the panel');
        assert.equal(dialog.querySelector('.hui-drawer__foot'), null, 'no footer without actions');

        fireEvent.keyDown(dialog, { key: 'Escape' });
        await settle();
        assert.equal(document.activeElement, opener);
    });
});
