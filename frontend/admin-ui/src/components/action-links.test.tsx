/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * The action a message or a card state offers, as a button on this screen or as a real link to another one, found
 * the way a person finds it: by role and accessible name. A link is drawn as `LinkButton`'s tertiary look and ends in
 * the forward arrow; a button keeps its own glyph and its busy state.
 */
import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { cleanup, fireEvent, screen } from '@testing-library/preact';
import { render } from 'preact';
import { CardState, Icon, MessageStrip, Notice, type CardStateAction, type MessageAction } from '@hryvinskyi/admin-ui';
import { renderWithKit } from '../../test/support/kit.tsx';

afterEach(cleanup);

const LINK_LOOK = 'hui-button hui-button--tertiary hui-button--anchor';

/** The path a glyph draws, to tell which glyph an element holds. */
function glyphPath(name: string): string | null {
    const scratch = document.createElement('div');
    render(<Icon name={name} />, scratch);
    return scratch.querySelector('path')?.getAttribute('d') ?? null;
}

const pathsIn = (element: Element): (string | null)[] =>
    [...element.querySelectorAll('path')].map((path) => path.getAttribute('d'));

describe('A message action that goes to another screen', () => {
    it('is a real link in the strip, in the tertiary look with an arrow, and no button', () => {
        const action: MessageAction = { label: 'Review the rules', href: '/admin/rules/' };
        renderWithKit(<MessageStrip tone="warning" action={action}>Two rules overlap.</MessageStrip>);

        const link = screen.getByRole('link', { name: 'Review the rules' });
        assert.equal(link.getAttribute('href'), '/admin/rules/');
        assert.equal(link.className, LINK_LOOK);
        assert.deepEqual(pathsIn(link), [glyphPath('arrow_forward')]);
        assert.equal(screen.queryByRole('button'), null);
    });

    it('is a real link in a notice, inside the notice\'s action slot', () => {
        renderWithKit(
            <Notice tone="info" action={{ label: 'Override here', href: '/admin/config/edit/section/web/' }}>
                Set for the whole store.
            </Notice>,
        );

        const link = screen.getByRole('link', { name: 'Override here' });
        assert.equal(link.getAttribute('href'), '/admin/config/edit/section/web/');
        assert.equal(link.className, LINK_LOOK);
        assert.ok(link.closest('.hui-notice__action'));
        assert.equal(screen.queryByRole('button'), null);
    });

    it('stays a button when it is done on this screen, pressed once and not while busy', () => {
        let pressed = 0;
        const { rerender } = renderWithKit(
            <Notice tone="warning" action={{ label: 'Switch it off', onClick: () => void pressed++ }}>Warning.</Notice>,
        );
        fireEvent.click(screen.getByRole('button', { name: 'Switch it off' }));
        assert.equal(pressed, 1);
        assert.equal(screen.queryByRole('link'), null);

        rerender(
            <Notice tone="warning" action={{ label: 'Switch it off', onClick: () => void pressed++, busy: true }}>
                Warning.
            </Notice>,
        );
        fireEvent.click(screen.getByRole('button', { name: 'Switch it off' }));
        assert.equal(pressed, 1);
    });
});

describe('A card state action that goes to another screen', () => {
    it('is a real link with the caller\'s words when nothing is there yet', () => {
        renderWithKit(<CardState kind="empty" title="No rules yet" action={{ label: 'Add a rule', href: '/admin/rules/new/' }} />);

        const link = screen.getByRole('link', { name: 'Add a rule' });
        assert.equal(link.getAttribute('href'), '/admin/rules/new/');
        assert.equal(link.className, LINK_LOOK);
        assert.ok(link.closest('.hui-cardstate__action'));
        assert.equal(screen.queryByRole('button'), null);
    });

    it('takes the kit\'s word for the kind and ends in the arrow in place of the kind\'s glyph', () => {
        const retry: CardStateAction = { href: '/admin/records/' };
        const clear: CardStateAction = { href: '/admin/records/?filters=none', label: 'Show every record' };
        renderWithKit(
            <div>
                <CardState kind="failed" title="The records could not be loaded" action={retry} />
                <CardState kind="no-match" title="No record matches" action={clear} />
            </div>,
        );

        const again = screen.getByRole('link', { name: 'kit.state.retry' });
        assert.equal(again.getAttribute('href'), '/admin/records/');
        assert.deepEqual(pathsIn(again), [glyphPath('arrow_forward')]);
        assert.equal(screen.getByRole('link', { name: 'Show every record' }).getAttribute('href'), '/admin/records/?filters=none');
        assert.equal(screen.getByRole('alert').getAttribute('data-tone'), 'error');
        assert.equal(screen.queryByRole('button'), null);
    });

    it('keeps the kind\'s glyph on a button', () => {
        renderWithKit(<CardState kind="failed" title="Failed" action={{ onClick: () => undefined }} />);

        const again = screen.getByRole('button', { name: 'kit.state.retry' });
        assert.deepEqual(pathsIn(again), [glyphPath('refresh')]);
        assert.equal(screen.queryByRole('link'), null);
    });
});
