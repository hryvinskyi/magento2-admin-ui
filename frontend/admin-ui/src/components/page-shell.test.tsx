/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * A module page's frame and wording, drawn as a page draws them: the header and module navigation from the page's
 * document, a card whose rows run edge to edge, links drawn as buttons, the page's own phrases beside the kit's, and
 * the words a failed request shows.
 */
import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { cleanup, render, screen, within } from '@testing-library/preact';
import type { JSX } from 'preact';
import {
    canRetry,
    CardFrame,
    createPageTranslator,
    createTranslator,
    failureText,
    linkTo,
    LinkButton,
    MissingPageError,
    PageMain,
    PageProvider,
    PageShell,
    parsePageDocument,
    phrase,
    usePage,
    worded,
    type Page,
    type RequestErrorKind,
} from '@hryvinskyi/admin-ui';
import { moduleDocument, REPORTS } from '../../test/support/module-page.ts';
import { renderWithKit } from '../../test/support/kit.tsx';

afterEach(cleanup);

const document = parsePageDocument(moduleDocument({}), { urls: [], permissions: [], data: () => null });

describe('PageShell', () => {
    it('draws the module\'s tile and name, the page\'s name, its actions, the tabs and the main column', () => {
        renderWithKit(
            <PageShell shell={document.shell} icon="data_object" actions={<button type="button">Export</button>}>
                <PageMain><p>The rows</p></PageMain>
            </PageShell>,
        );

        assert.ok(screen.getByRole('heading', { level: 1, name: 'Reports' }));
        assert.ok(screen.getByText('Vendor Module'));
        assert.ok(screen.getByRole('button', { name: 'Export' }));
        const nav = screen.getByRole('navigation', { name: 'Vendor Module' });
        const tabs = within(nav).getAllByRole('link');
        assert.deepEqual(tabs.map((tab) => [tab.firstChild?.textContent, tab.getAttribute('href')]), [
            ['Reports', REPORTS],
            ['Settings', 'https://admin.test/admin/admin/system_config/edit/key/c1/'],
        ]);
        assert.equal(tabs[0]?.getAttribute('aria-current'), 'page');
        assert.deepEqual(tabs.map((tab) => tab.querySelector('.hui-modnav__count')?.textContent ?? null), ['2', null]);
        assert.ok(within(screen.getByRole('main')).getByText('The rows'));
    });

    it('leaves the actions out when the page has none', () => {
        const { container } = renderWithKit(<PageShell shell={document.shell} icon="data_object"><p>x</p></PageShell>);

        assert.equal(container.querySelector('.hui-page__actions'), null);
    });
});

describe('CardFrame', () => {
    it('is a card with a title and a line under it, its rows straight under the head', () => {
        renderWithKit(<CardFrame icon="travel_explore" title="Results" subtitle="What each kind shows."><ul><li>Row</li></ul></CardFrame>);

        const card = screen.getByRole('heading', { level: 3, name: 'Results' }).closest('section');
        assert.ok(card !== null);
        assert.equal(card.classList.contains('hui-card--flush'), true);
        assert.ok(within(card).getByText('What each kind shows.'));
        assert.equal(card.querySelector('.hui-card__body'), null);
        assert.ok(within(card).getByRole('listitem'));
    });
});

describe('CardFrame with an aside', () => {
    it('puts the aside at the right end of the head, and draws none without one', () => {
        const { container } = renderWithKit(
            <div>
                <CardFrame icon="search" title="Templates" subtitle="13 templates." aside={<input aria-label="Search" />}>
                    <p>Cards</p>
                </CardFrame>
                <CardFrame icon="search" title="Plain" subtitle="No aside."><p>Rows</p></CardFrame>
            </div>,
        );
        const asides = container.querySelectorAll('.hui-card__head > .hui-card__aside');

        assert.equal(asides.length, 1);
        assert.ok(within(asides[0] as HTMLElement).getByRole('textbox', { name: 'Search' }));
    });
});

describe('LinkButton', () => {
    it('is a real link in a button\'s look, with an arrow when it moves on and a new tab for the storefront', () => {
        renderWithKit(
            <div>
                <LinkButton href="/a" variant="primary" forward>Open the list</LinkButton>
                <LinkButton href="https://shop.test/" variant="quiet" external>View storefront</LinkButton>
            </div>,
        );
        const onward = screen.getByRole('link', { name: 'Open the list' });
        const storefront = screen.getByRole('link', { name: 'View storefront' });

        assert.equal(onward.getAttribute('href'), '/a');
        assert.equal(onward.getAttribute('target'), null);
        assert.equal(onward.className, 'hui-button hui-button--primary hui-button--anchor');
        assert.equal(onward.querySelectorAll('svg').length, 1);
        assert.equal(storefront.getAttribute('target'), '_blank');
        assert.equal(storefront.getAttribute('rel'), 'noopener noreferrer');
    });

    it('takes the tertiary look, for a link inside a message or a card', () => {
        renderWithKit(<LinkButton href="/b" variant="tertiary" forward>Open Test</LinkButton>);

        assert.equal(screen.getByRole('link', { name: 'Open Test' }).className, 'hui-button hui-button--tertiary hui-button--anchor');
    });
});

describe('the page\'s wording and links', () => {
    function Sentence(): JSX.Element {
        const { translator, link } = usePage();
        return <p>{worded(translator, phrase('rows.count', 3))} {link(linkTo('vendor/reports/index')) ?? 'none'}</p>;
    }

    it('words a sentence a pure module chose and resolves links, through the provider', () => {
        const page: Page = {
            translator: createTranslator({ locale: 'en_US', phrases: new Map([['rows.count', '%1 rows']]), onMissing: () => undefined }),
            link: document.link,
        };
        render(<PageProvider page={page}><Sentence /></PageProvider>);

        assert.ok(screen.getByText(`3 rows ${REPORTS}`));
    });

    it('fails loudly when a page component is drawn outside its provider', () => {
        assert.throws(() => render(<Sentence />), (error: unknown) => error instanceof MissingPageError);
    });

    it('shows a phrase the document lacks as its key and reports it', () => {
        const reported: string[] = [];
        const translator = createPageTranslator('en_US', new Map(), { error: (message: string) => reported.push(message) });

        assert.equal(translator.t('rows.none'), 'rows.none');
        assert.deepEqual(reported, ['The page\'s document holds no phrase "rows.none".']);
    });
});

describe('the words of a failed request', () => {
    const kit = createTranslator({
        locale: 'en_US',
        phrases: new Map([['kit.failure.expired', 'Session ended'], ['kit.failure.forbidden', 'Not allowed']]),
        onMissing: () => undefined,
    });

    it('are the kit\'s own when the session ended or the role forbids it, and trying again does not help then', () => {
        const words = (kind: RequestErrorKind): [string, boolean] => {
            const failure = { kind, reason: null };
            return [failureTextOf(failure), canRetry(failure)];
        };
        const failureTextOf = (failure: { kind: RequestErrorKind; reason: null }): string =>
            failureText(failure, kit, 'The numbers could not be loaded');

        assert.deepEqual(words('expired'), ['Session ended', false]);
        assert.deepEqual(words('forbidden'), ['Not allowed', false]);
        for (const kind of ['network', 'timeout', 'rejected', 'server'] as const) {
            assert.deepEqual(words(kind), ['The numbers could not be loaded', true]);
        }
    });
});
