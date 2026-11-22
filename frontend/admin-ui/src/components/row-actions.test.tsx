/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * The parts a list of rows acts through, found by role and accessible name: the row menu (opening, the keys inside
 * it, closing from outside, choosing an action), a switch that says "On" and "Off" in the page's words, and a message
 * strip the person can dismiss.
 */
import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { cleanup, fireEvent, screen } from '@testing-library/preact';
import type { JSX } from 'preact';
import { useState } from 'preact/hooks';
import { MenuButton, MessageStrip, Switch } from '@hryvinskyi/admin-ui';
import { phraseLog, renderWithKit, testKit } from '../../test/support/kit.tsx';

afterEach(cleanup);

describe('MenuButton', () => {
    function RowMenu({ chosen }: { readonly chosen: string[] }): JSX.Element {
        const [open, setOpen] = useState(false);
        return (
            <div>
                <MenuButton
                    label="More for Product"
                    menuLabel="Product"
                    open={open}
                    onOpenChange={setOpen}
                    actions={[
                        { key: 'copy', label: 'Duplicate', icon: 'content_copy', onSelect: () => chosen.push('copy') },
                        { key: 'export', label: 'Export', icon: 'download', onSelect: () => chosen.push('export') },
                        { key: 'delete', label: 'Delete', icon: 'delete', tone: 'danger', onSelect: () => chosen.push('delete') },
                    ]}
                />
                <button type="button">Elsewhere</button>
            </div>
        );
    }

    it('says it opens a menu, and opens a named menu with the first action focused', () => {
        renderWithKit(<RowMenu chosen={[]} />);
        const button = screen.getByRole('button', { name: 'More for Product' });
        assert.equal(button.getAttribute('aria-haspopup'), 'menu');
        assert.equal(button.getAttribute('aria-expanded'), 'false');
        assert.equal(screen.queryByRole('menu'), null);

        fireEvent.click(button);

        assert.equal(button.getAttribute('aria-expanded'), 'true');
        const menu = screen.getByRole('menu', { name: 'Product' });
        assert.equal(button.getAttribute('aria-controls'), menu.id);
        assert.deepEqual(screen.getAllByRole('menuitem').map((item) => item.textContent), ['Duplicate', 'Export', 'Delete']);
        assert.equal(document.activeElement, screen.getByRole('menuitem', { name: 'Duplicate' }));
        assert.equal(screen.getByRole('menuitem', { name: 'Delete' }).getAttribute('data-tone'), 'danger');
    });

    it('moves between the actions with the arrow keys, wrapping, and to the ends with Home and End', () => {
        renderWithKit(<RowMenu chosen={[]} />);
        fireEvent.click(screen.getByRole('button', { name: 'More for Product' }));
        const menu = screen.getByRole('menu');

        fireEvent.keyDown(menu, { key: 'ArrowDown' });
        assert.equal(document.activeElement, screen.getByRole('menuitem', { name: 'Export' }));
        fireEvent.keyDown(menu, { key: 'End' });
        assert.equal(document.activeElement, screen.getByRole('menuitem', { name: 'Delete' }));
        fireEvent.keyDown(menu, { key: 'ArrowDown' });
        assert.equal(document.activeElement, screen.getByRole('menuitem', { name: 'Duplicate' }));
        fireEvent.keyDown(menu, { key: 'ArrowUp' });
        assert.equal(document.activeElement, screen.getByRole('menuitem', { name: 'Delete' }));
        fireEvent.keyDown(menu, { key: 'Home' });
        assert.equal(document.activeElement, screen.getByRole('menuitem', { name: 'Duplicate' }));
    });

    it('closes on Escape and gives focus back to its button', () => {
        renderWithKit(<RowMenu chosen={[]} />);
        const button = screen.getByRole('button', { name: 'More for Product' });
        fireEvent.click(button);

        fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });

        assert.equal(screen.queryByRole('menu'), null);
        assert.equal(button.getAttribute('aria-expanded'), 'false');
        assert.equal(document.activeElement, button);
    });

    it('closes when something outside it is pressed, and stays open for a press inside', () => {
        renderWithKit(<RowMenu chosen={[]} />);
        fireEvent.click(screen.getByRole('button', { name: 'More for Product' }));

        fireEvent.pointerDown(screen.getByRole('menuitem', { name: 'Export' }));
        assert.ok(screen.getByRole('menu'));

        fireEvent.pointerDown(screen.getByRole('button', { name: 'Elsewhere' }));
        assert.equal(screen.queryByRole('menu'), null);
    });

    it('closes before the chosen action runs, and runs only that one', () => {
        const chosen: string[] = [];
        renderWithKit(<RowMenu chosen={chosen} />);
        fireEvent.click(screen.getByRole('button', { name: 'More for Product' }));

        fireEvent.click(screen.getByRole('menuitem', { name: 'Delete' }));

        assert.deepEqual(chosen, ['delete']);
        assert.equal(screen.queryByRole('menu'), null);
        assert.equal(document.activeElement, screen.getByRole('button', { name: 'More for Product' }));
    });
});

describe('Switch with the page\'s words', () => {
    it('says the page\'s words beside the track in place of the kit\'s, and reads none of the kit\'s', () => {
        const log = phraseLog();
        function Product(): JSX.Element {
            const [on, setOn] = useState(true);
            return <Switch checked={on} onChange={setOn} label="Product" size="small" words={{ on: 'On', off: 'Off' }} />;
        }
        renderWithKit(<Product />, testKit(log));
        const control = screen.getByRole('switch', { name: 'Product' });
        assert.equal(control.textContent, 'On');

        fireEvent.click(control);

        assert.equal(control.getAttribute('aria-checked'), 'false');
        assert.equal(control.textContent, 'Off');
        assert.equal(log.asked.has('kit.switch.yes'), false);
        assert.equal(log.asked.has('kit.switch.no'), false);
    });
});

describe('MessageStrip that can be dismissed', () => {
    it('ends in a close button that takes it away, and has none unless asked', () => {
        function Toast(): JSX.Element {
            const [shown, setShown] = useState(true);
            return shown
                ? <MessageStrip tone="success" onDismiss={() => setShown(false)}>Product was duplicated.</MessageStrip>
                : <p>Gone</p>;
        }
        renderWithKit(<div><Toast /><MessageStrip tone="info">Plain</MessageStrip></div>);
        assert.equal(screen.getAllByRole('button').length, 1);
        assert.ok(screen.getByRole('status'));

        fireEvent.click(screen.getByRole('button', { name: 'kit.strip.dismiss' }));

        assert.equal(screen.queryByText('Product was duplicated.'), null);
        assert.ok(screen.getByText('Gone'));
    });
});

describe('MessageStrip with a link', () => {
    it('ends in a real link to the screen where the person goes on, drawn as a tertiary button with an arrow', () => {
        renderWithKit(
            <MessageStrip tone="success" link={{ label: 'Open it', href: '/admin/snippets/edit/?id=7' }}>
                Product was added.
            </MessageStrip>,
        );
        const link = screen.getByRole('link', { name: 'Open it' });

        assert.equal(link.getAttribute('href'), '/admin/snippets/edit/?id=7');
        assert.equal(link.className, 'hui-button hui-button--tertiary hui-button--anchor');
        assert.equal(link.querySelectorAll('svg').length, 1);
        assert.equal(screen.queryByRole('button'), null);
    });
});
