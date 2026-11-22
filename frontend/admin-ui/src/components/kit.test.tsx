/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
import assert from 'node:assert/strict';
import { afterEach, describe, it, mock } from 'node:test';
import { cleanup, fireEvent, render, screen } from '@testing-library/preact';
import type { JSX } from 'preact';
import { useState } from 'preact/hooks';
import {
    Badge,
    Button,
    Card,
    CardState,
    describedBy,
    DisclosureButton,
    FALLBACK_ICON,
    FieldRow,
    fieldIds,
    Icon,
    ICON_NAMES,
    iconOr,
    isIconName,
    localeTag,
    MessageStrip,
    MissingKitError,
    Notice,
    OriginLine,
    OriginNotice,
    RadioCards,
    SecretInput,
    SelectInput,
    StatusPanel,
    Switch,
    TextInput,
} from '@hryvinskyi/admin-ui';
import { renderWithKit } from '../../test/support/kit.tsx';

afterEach(cleanup);

const classesOf = (element: Element | null): string[] => [...(element?.classList ?? [])].sort();

describe('localeTag from the kit', () => {
    it('turns the admin\'s locale code into the tag the Intl formatters take, and gives nothing for no locale', () => {
        assert.equal(localeTag('uk_UA'), 'uk-UA');
        assert.equal(new Intl.NumberFormat(localeTag('de_DE')).format(1234.5), '1.234,5');
        assert.equal(localeTag('not a locale'), undefined);
    });
});

describe('Switch', () => {
    function Toggle({ disabled = false }: { readonly disabled?: boolean }): JSX.Element {
        const [on, setOn] = useState(false);
        return <Switch checked={on} onChange={setOn} label="row alpha" disabled={disabled} size="small" />;
    }

    it('toggles, reports its state and says it in the kit\'s words', () => {
        renderWithKit(<Toggle />);
        const control = screen.getByRole('switch', { name: 'row alpha' });
        assert.equal(control.getAttribute('aria-checked'), 'false');
        assert.equal(control.textContent, 'kit.switch.no');

        fireEvent.click(control);
        assert.equal(control.getAttribute('aria-checked'), 'true');
        assert.equal(control.textContent, 'kit.switch.yes');
    });

    it('does not change while disabled', () => {
        renderWithKit(<Toggle disabled />);
        const control = screen.getByRole('switch', { name: 'row alpha' });
        fireEvent.click(control);
        assert.equal(control.getAttribute('aria-checked'), 'false');
        assert.equal(control.hasAttribute('disabled'), true);
    });

    it('takes its name from the field label inside a field row', () => {
        function NotifyField(): JSX.Element {
            const [on, setOn] = useState(true);
            return (
                <FieldRow controlId="notify" label="Notify the admin">
                    <Switch id="notify" checked={on} onChange={setOn} />
                </FieldRow>
            );
        }
        renderWithKit(<NotifyField />);
        const control = screen.getByRole('switch', { name: 'Notify the admin' });
        fireEvent.click(control);
        assert.equal(control.getAttribute('aria-checked'), 'false');
    });

    it('fails loudly when drawn outside a kit provider', () => {
        const logged = mock.method(console, 'error', () => undefined);
        try {
            assert.throws(
                () => render(<Switch checked onChange={() => undefined} label="x" />),
                (error: unknown) => error instanceof MissingKitError,
            );
        } finally {
            logged.mock.restore();
        }
    });
});

describe('field row', () => {
    it('labels its control, tags it, and links the help line and the problems to it', () => {
        const ids = fieldIds('contact-host');
        const described = describedBy('contact-host', { help: true, error: true });
        renderWithKit(
            <FieldRow
                controlId="contact-host"
                label="Contact host"
                tag="Store view"
                help="help line"
                problems={['Wrong format', 'Too long']}
            >
                <TextInput id="contact-host" value="x" onInput={() => undefined} invalid describedBy={described} />
            </FieldRow>,
        );
        const input = screen.getByLabelText('Contact host');
        assert.equal(input.id, ids.control);
        assert.ok(screen.getByText('Store view').classList.contains('hui-field__tag'));
        const alert = screen.getByRole('alert');
        assert.equal(alert.id, ids.error);
        assert.deepEqual(
            [...alert.querySelectorAll('.hui-field__error')].map((line) => line.textContent),
            ['Wrong format', 'Too long'],
            'each problem on its own line',
        );
        assert.deepEqual(input.getAttribute('aria-describedby')?.split(' '), [ids.help, ids.error]);
        assert.equal(input.getAttribute('aria-invalid'), 'true');
    });

    it('shows no tag, no help and no problem line when given none', () => {
        renderWithKit(
            <FieldRow controlId="plain" label="Plain" problems={[]}>
                <TextInput id="plain" value="" onInput={() => undefined} />
            </FieldRow>,
        );
        const field = screen.getByLabelText('Plain').closest('.hui-field');
        assert.equal(field?.querySelector('.hui-field__tag'), null);
        assert.equal(field?.querySelector('.hui-field__help'), null);
        assert.equal(screen.queryByRole('alert'), null);
        assert.equal(describedBy('plain', { help: false, error: false }), undefined);
    });

    it('captions a control that names itself instead of labelling it, and shows the origin line under it', () => {
        renderWithKit(
            <FieldRow
                controlId="layout"
                label="Layout"
                labelFor={false}
                origin={<OriginLine text="Inherited from Default" icon="south_east" />}
            >
                <RadioCards
                    name="layout"
                    label="Layout"
                    value="a"
                    options={[{ value: 'a', label: 'A' }]}
                    onChange={() => undefined}
                />
            </FieldRow>,
        );
        const caption = screen.getAllByText('Layout').find((element) => element.classList.contains('hui-field__label'));
        assert.equal(caption?.tagName, 'SPAN');
        const field = caption?.closest('.hui-field');
        assert.equal(field?.lastElementChild?.className, 'hui-origin-line', 'the origin line closes the field');
    });
});

describe('origin line and notice', () => {
    it('words where a value comes from and offers its one action', () => {
        let overridden = 0;
        renderWithKit(
            <OriginLine
                text="Inherited from Default"
                icon="south_east"
                action={{ label: 'Override here', onClick: () => void overridden++ }}
            />,
        );
        assert.ok(screen.getByText('Inherited from Default'));
        const action = screen.getByRole('button', { name: 'Override here' });
        assert.deepEqual(classesOf(action), ['hui-button', 'hui-button--link']);
        fireEvent.click(action);
        assert.equal(overridden, 1);
    });

    it('offers no action when given none, and tints a value set at this level', () => {
        renderWithKit(<OriginLine text="Set for this store view" icon="edit" own />);
        assert.equal(screen.queryByRole('button'), null);
        assert.deepEqual(classesOf(screen.getByText('Set for this store view').parentElement), ['hui-origin', 'hui-origin--own']);
    });

    it('explains a part that cannot be changed in a muted note, with or without an action', () => {
        let followed = 0;
        renderWithKit(
            <div>
                <OriginNotice
                    text="Inherited from Default"
                    icon="south_east"
                    action={{ label: 'Override here', onClick: () => void followed++ }}
                />
                <OriginNotice text="Fixed by the deployment configuration." icon="lock" />
            </div>,
        );
        const notices = [...document.querySelectorAll('.hui-notice')];
        assert.deepEqual(notices.map((notice) => notice.classList.contains('hui-notice--muted')), [true, true]);
        assert.deepEqual(screen.getAllByRole('button').map((button) => button.textContent), ['Override here']);
        fireEvent.click(screen.getByRole('button', { name: 'Override here' }));
        assert.equal(followed, 1);
    });
});

describe('secret input', () => {
    /** A secret as a page holds it: whether one is stored, and the replacement being typed. */
    function Secret({ stored }: { readonly stored: boolean }): JSX.Element {
        const [replacement, setReplacement] = useState<string | null>(null);
        return (
            <>
                <label for="secret">API secret</label>
                <SecretInput
                    id="secret"
                    stored={stored}
                    replacement={replacement}
                    onReplace={setReplacement}
                    onKeep={() => setReplacement(null)}
                />
                <output data-testid="edit">{replacement === null ? 'none' : `edit:${replacement}`}</output>
            </>
        );
    }

    it('shows an empty password input where no secret is stored, with nothing to keep', () => {
        renderWithKit(<Secret stored={false} />);
        const input = screen.getByLabelText<HTMLInputElement>('API secret');
        assert.equal(input.getAttribute('type'), 'password');
        assert.equal(input.value, '');
        assert.equal(screen.queryByRole('button', { name: 'kit.secret.replace' }), null);

        fireEvent.input(input, { target: { value: 's3cret' } });
        assert.equal(screen.getByTestId('edit').textContent, 'edit:s3cret');
        assert.equal(screen.queryByRole('button', { name: 'kit.secret.keep' }), null, 'nothing stored to keep');
    });

    it('shows a stored secret masked, and Replace starts typing a new one beside Keep', () => {
        renderWithKit(<Secret stored />);
        const masked = screen.getByLabelText<HTMLInputElement>('API secret');
        assert.equal(masked.getAttribute('type'), 'text');
        assert.equal(masked.hasAttribute('readonly'), true);
        assert.equal(masked.value, 'kit.secret.masked');
        assert.ok(screen.getByText('kit.secret.stored'));
        assert.equal(screen.queryByRole('button', { name: 'kit.secret.keep' }), null, 'nothing is being replaced');

        fireEvent.click(screen.getByRole('button', { name: 'kit.secret.replace' }));
        const password = screen.getByLabelText<HTMLInputElement>('API secret');
        assert.equal(password.getAttribute('type'), 'password');
        assert.equal(password.value, '');
        assert.ok(screen.getByRole('button', { name: 'kit.secret.keep' }));
        fireEvent.input(password, { target: { value: 's3cret' } });
        assert.equal(screen.getByLabelText<HTMLInputElement>('API secret').value, 's3cret');
        assert.equal(screen.getByLabelText('API secret').getAttribute('value') ?? '', '', 'never written into the markup');
    });

    it('takes a replacement back with Keep, leaving no edit behind', () => {
        renderWithKit(<Secret stored />);
        fireEvent.click(screen.getByRole('button', { name: 'kit.secret.replace' }));
        fireEvent.input(screen.getByLabelText('API secret'), { target: { value: 's3cret' } });
        assert.equal(screen.getByTestId('edit').textContent, 'edit:s3cret');

        fireEvent.click(screen.getByRole('button', { name: 'kit.secret.keep' }));
        assert.equal(screen.getByTestId('edit').textContent, 'none');
        assert.equal(screen.getByLabelText('API secret').hasAttribute('readonly'), true, 'masked again');
        assert.ok(screen.getByRole('button', { name: 'kit.secret.replace' }));
    });

    it('prints nothing but the mask and the kit\'s words, whatever is typed', () => {
        const { container } = renderWithKit(<Secret stored />);
        fireEvent.click(screen.getByRole('button', { name: 'kit.secret.replace' }));
        fireEvent.input(screen.getByLabelText('API secret'), { target: { value: 'hunter2' } });
        fireEvent.click(screen.getByRole('button', { name: 'kit.secret.keep' }));
        assert.doesNotMatch(container.innerHTML, /hunter2/);
    });
});

describe('controls', () => {
    it('reports a typed text and a chosen option as strings', () => {
        const typed: string[] = [];
        const chosen: string[] = [];
        renderWithKit(
            <div>
                <TextInput id="name" label="Name" value="" onInput={(value) => void typed.push(value)} suffix="days" />
                <SelectInput
                    id="mode"
                    label="Mode"
                    value="a"
                    options={[{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }]}
                    onChange={(value) => void chosen.push(value)}
                    width="medium"
                    strong
                />
            </div>,
        );
        fireEvent.input(screen.getByLabelText('Name'), { target: { value: 'Shop' } });
        fireEvent.change(screen.getByLabelText('Mode'), { target: { value: 'b' } });
        assert.deepEqual([typed, chosen], [['Shop'], ['b']]);
        assert.ok(screen.getByText('days'));
        assert.deepEqual(
            classesOf(screen.getByLabelText('Mode').parentElement),
            ['hui-select', 'hui-select--medium', 'hui-select--strong'],
        );
    });
});

describe('choices and messages', () => {
    it('picks one radio card in a named group', () => {
        const picked: string[] = [];
        renderWithKit(
            <RadioCards
                name="layout"
                label="layout.label"
                value="compact"
                options={[
                    {
                        value: 'compact',
                        label: 'layout.compact',
                        icon: 'view_list',
                        badge: 'Recommended',
                        description: 'layout.compact.description',
                    },
                    { value: 'wide', label: 'layout.wide', icon: 'public' },
                ]}
                onChange={(value) => void picked.push(value)}
            />,
        );
        const group = screen.getByRole('radiogroup', { name: 'layout.label' });
        assert.equal(screen.getByRole<HTMLInputElement>('radio', { name: /layout\.compact/ }).checked, true);
        fireEvent.click(screen.getByRole('radio', { name: /layout\.wide/ }));
        assert.deepEqual(picked, ['wide']);
        assert.ok(group.contains(screen.getByText('Recommended')));
    });

    it('keeps one option out of reach while the others can still be picked', () => {
        const picked: string[] = [];
        renderWithKit(
            <RadioCards
                name="layout"
                label="layout.label"
                value="compact"
                options={[
                    { value: 'compact', label: 'layout.compact' },
                    { value: 'wide', label: 'layout.wide', disabled: true },
                    { value: 'grid', label: 'layout.grid' },
                ]}
                onChange={(value) => void picked.push(value)}
            />,
        );
        const wide = screen.getByRole<HTMLInputElement>('radio', { name: /layout\.wide/ });
        assert.equal(wide.disabled, true);
        assert.equal(wide.closest('label')?.getAttribute('data-disabled'), 'true');
        assert.equal(screen.getByRole<HTMLInputElement>('radio', { name: /layout\.grid/ }).disabled, false);
        assert.equal(screen.getByRole('radiogroup', { name: 'layout.label' }).hasAttribute('aria-disabled'), false);
        fireEvent.click(screen.getByRole('radio', { name: /layout\.grid/ }));
        assert.deepEqual(picked, ['grid']);
    });

    it('marks a busy button busy without taking it out of the focus order, and ignores presses', () => {
        let pressed = 0;
        renderWithKit(<Button busy onClick={() => void pressed++}>Saving</Button>);
        const button = screen.getByRole('button', { name: 'Saving' });
        button.focus();
        fireEvent.click(button);

        assert.equal(pressed, 0);
        assert.equal(button.hasAttribute('disabled'), false);
        assert.equal(button.getAttribute('aria-disabled'), 'true');
        assert.equal(button.getAttribute('aria-busy'), 'true');
        assert.equal(document.activeElement, button);
    });

    it('carries the tone in a glyph and a role, and offers its action', () => {
        let followed = 0;
        renderWithKit(
            <div>
                <MessageStrip tone="success" action={{ label: 'strip.action', onClick: () => void followed++ }}>
                    strip.text
                </MessageStrip>
                <Notice tone="warning">warning.text</Notice>
                <Notice tone="info">info line</Notice>
            </div>,
        );
        assert.equal(screen.getByRole('status').textContent, 'strip.textstrip.action');
        assert.equal(screen.getByRole('alert').textContent, 'warning.text');
        assert.equal(screen.getByText('info line').closest('[role]'), null, 'an informational note is plain text');
        fireEvent.click(screen.getByRole('button', { name: 'strip.action' }));
        assert.equal(followed, 1);
    });

    it('draws a muted notice on the grey ground and an ordinary one without it', () => {
        renderWithKit(
            <div>
                <Notice tone="info" muted>aside line</Notice>
                <Notice tone="info">info line</Notice>
            </div>,
        );
        const aside = screen.getByText('aside line').closest('.hui-notice');
        const plain = screen.getByText('info line').closest('.hui-notice');
        assert.equal(aside?.classList.contains('hui-notice--muted'), true);
        assert.equal(aside?.getAttribute('data-tone'), 'info');
        assert.equal(plain?.classList.contains('hui-notice--muted'), false);
    });

    it('shows a status in words and lines, announcing only the state word as it changes', () => {
        renderWithKit(
            <StatusPanel
                title="status.title"
                state="failed"
                word="status.failed"
                note="status.failed.note"
                lines={[{ label: 'Address', text: 'https://shop.example.com/endpoint?id=REF-AB12' }]}
            />,
        );
        const announced = screen.getAllByRole('status');
        assert.deepEqual(announced.map((region) => region.textContent), ['status.failed']);
        assert.ok(screen.getByText('status.failed.note'), 'the note is shown, not announced');
        assert.ok(screen.getByText('https://shop.example.com/endpoint?id=REF-AB12'), 'so are the lines');
    });

    it('draws each panel state with its own glyph, colouring good and failed the kit\'s way', () => {
        const states = ['idle', 'working', 'good', 'attention', 'failed'] as const;
        renderWithKit(
            <div>
                {states.map((state) => (
                    <StatusPanel key={state} title={`title.${state}`} state={state} word={state} note="note" />
                ))}
            </div>,
        );
        const panels = states.map((state) => screen.getByText(state).closest('.hui-status'));
        assert.deepEqual(
            panels.map((panel) => panel?.getAttribute('data-state')),
            ['idle', 'working', 'ok', 'attention', 'invalid'],
        );
        const glyphs = panels.map((panel) => panel?.querySelector('.hui-status__tile path')?.getAttribute('d'));
        assert.equal(new Set(glyphs).size, states.length, 'no two states share a glyph');
    });
});

describe('the kit\'s classes', () => {
    /* The classes below are what a page's stylesheet selects, so they are the published contract of these components. */
    it('draws buttons, cards and badges with the kit\'s classes', () => {
        renderWithKit(
            <Card icon="tune" title="card.title" aside={<Badge variant="on">badge.on</Badge>}>
                <Button variant="primary" onClick={() => undefined}>button.save</Button>
            </Card>,
        );
        assert.deepEqual(
            classesOf(screen.getByRole('button', { name: 'button.save' })),
            ['hui-button', 'hui-button--primary'],
        );
        assert.deepEqual(classesOf(screen.getByText('card.title').closest('.hui-card')), ['hui-card']);
        assert.deepEqual(classesOf(screen.getByText('badge.on')), ['hui-badge', 'hui-badge--on']);
    });

    it('draws a control button as a secondary one at the fields\' height', () => {
        renderWithKit(<Button variant="control" icon="search" onClick={() => undefined}>button.test</Button>);
        assert.deepEqual(
            classesOf(screen.getByRole('button', { name: 'button.test' })),
            ['hui-button', 'hui-button--control', 'hui-button--secondary'],
        );
    });

    it('draws a warning badge in the warning tone, with a dot unless a glyph takes its place', () => {
        renderWithKit(
            <div>
                <Badge variant="warn">badge.unsaved</Badge>
                <Badge variant="warn" icon="warning">badge.warnings</Badge>
            </div>,
        );
        const dotted = screen.getByText('badge.unsaved');
        assert.deepEqual(classesOf(dotted), ['hui-badge', 'hui-badge--warn']);
        assert.ok(dotted.querySelector('.hui-badge__dot'));
        assert.equal(dotted.querySelector('svg'), null);
        const glyphed = screen.getByText('badge.warnings');
        assert.equal(glyphed.querySelector('.hui-badge__dot'), null);
        assert.ok(glyphed.querySelector('svg'));
    });

    it('draws a disclosure as a kit link button, saying whether it is open', () => {
        renderWithKit(
            <DisclosureButton expanded={false} onToggle={() => undefined} controls="more">
                more.options
            </DisclosureButton>,
        );
        const button = screen.getByRole('button', { name: 'more.options' });
        assert.deepEqual(classesOf(button), ['hui-button', 'hui-button--link', 'hui-disclosure']);
        assert.equal(button.getAttribute('aria-expanded'), 'false');
        assert.equal(button.getAttribute('aria-controls'), 'more');
    });
});

describe('icons', () => {
    const pathOf = (container: Element): string | null | undefined =>
        container.querySelector('svg path')?.getAttribute('d');

    it('knows its general-purpose glyphs and falls back for names that arrive at run time', () => {
        assert.equal(isIconName('storefront'), true);
        assert.equal(isIconName('toString'), false, 'no inherited property passes for a glyph');
        assert.equal(iconOr('bolt', 'tune'), 'bolt');
        assert.equal(iconOr('no_such_glyph', 'lock'), 'lock');
        assert.equal(iconOr(undefined), FALLBACK_ICON);
        assert.ok(ICON_NAMES.includes(FALLBACK_ICON));
    });

    it('draws the fallback glyph for a name the set does not hold, without failing', () => {
        const unknown = render(<Icon name="no_such_glyph" />).container;
        const fallback = render(<Icon name={FALLBACK_ICON} />).container;
        const other = render(<Icon name="lock" />).container;

        assert.equal(pathOf(unknown), pathOf(fallback));
        assert.notEqual(pathOf(unknown), pathOf(other));
    });

    it('draws its own glyph for every name the data and code screens ask for, each one distinct', () => {
        const names = [
            'add', 'apartment', 'article', 'assignment_return', 'category', 'code', 'code_blocks', 'code_off',
            'content_copy', 'dashboard_customize', 'data_object', 'database', 'delete', 'download', 'draft',
            'filter_alt_off', 'flag', 'format_list_numbered', 'format_quote', 'home', 'hourglass_top', 'inventory',
            'inventory_2', 'lightbulb', 'local_shipping', 'location_on', 'more_vert', 'near_me', 'play_arrow', 'quiz',
            'remove', 'remove_circle', 'repeat', 'rule', 'search_off', 'style', 'swap_horiz', 'text_fields',
            'travel_explore', 'upload', 'web', 'widgets',
        ];
        const fallback = pathOf(render(<Icon name={FALLBACK_ICON} />).container);
        const paths = names.map((name) => {
            assert.equal(isIconName(name), true, `the set holds ${name}`);
            const path = pathOf(render(<Icon name={name} />).container);
            assert.notEqual(path, fallback, `${name} draws its own glyph`);
            return path;
        });

        assert.equal(new Set(paths).size, names.length);
    });

    it('draws a filled circle for a filled remove_circle, the outlined ring otherwise', () => {
        const outlined = pathOf(render(<Icon name="remove_circle" />).container);
        const filled = pathOf(render(<Icon name="remove_circle" filled />).container);

        assert.notEqual(filled, outlined);
        assert.ok(filled !== null && filled !== undefined && filled.length < (outlined ?? '').length);
    });

    it('marks the progress glyph to turn, at any size and beside a caller\'s class, and no other glyph', () => {
        const classesOf = (container: Element): readonly string[] =>
            [...(container.querySelector('svg')?.classList ?? [])];

        assert.deepEqual(classesOf(render(<Icon name="progress_activity" />).container), [
            'hui-icon', 'hui-icon--18', 'hui-icon--spin',
        ]);
        assert.deepEqual(classesOf(render(<Icon name="progress_activity" size={24} class="hui-x" />).container), [
            'hui-icon', 'hui-icon--24', 'hui-icon--spin', 'hui-x',
        ]);
        for (const name of ICON_NAMES.filter((glyph) => glyph !== 'progress_activity')) {
            const classes = classesOf(render(<Icon name={name} />).container);
            assert.equal(classes.includes('hui-icon--spin'), false, `${name} stands still`);
        }
        assert.equal(classesOf(render(<Icon name="no_such_glyph" />).container).includes('hui-icon--spin'), false);
    });

    it('turns the progress glyph a busy button or a card state draws, as the caller names it', () => {
        const { container } = renderWithKit(
            <div>
                <Button icon="progress_activity" busy>Checking…</Button>
                <CardState kind="empty" title="Checking the catalog" icon="progress_activity" />
            </div>,
        );

        const spinning = [...container.querySelectorAll('svg.hui-icon--spin')];
        assert.equal(spinning.length, 2);
        assert.ok(spinning[0]?.closest('button[aria-busy="true"]'), 'the busy button\'s glyph turns');
        assert.ok(spinning[1]?.closest('.hui-cardstate__tile'), 'the card state\'s glyph turns');
    });

    it('hides a decorative glyph from assistive technology and announces a labelled one as an image', () => {
        const { container } = render(<Icon name="lock" />);
        assert.equal(container.querySelector('svg')?.getAttribute('aria-hidden'), 'true');

        render(<Icon name="lock" label="Locked" />);
        assert.ok(screen.getByRole('img', { name: 'Locked' }));
    });
});
