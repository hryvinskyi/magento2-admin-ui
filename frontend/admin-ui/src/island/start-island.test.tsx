/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * Starting an island on the markup the server prints for the fixture island (`Test/_contract/island-page.html`):
 * the root with its failure text, the loading line and the document inside the root.
 */
import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { act } from '@testing-library/preact';
import type { JSX } from 'preact';
import { useState } from 'preact/hooks';
import { startIsland, Switch, useKit, type IslandMount, type Logger } from '@hryvinskyi/admin-ui';
import { ISLAND, placeIslandPage, withMember } from '../../test/support/island-page.ts';

afterEach(() => {
    document.body.replaceChildren();
});

interface Logged {
    readonly message: string;
    readonly detail: unknown;
}

interface RecordingLogger extends Logger {
    readonly errors: Logged[];
}

function recordingLogger(): RecordingLogger {
    const errors: Logged[] = [];
    return { errors, error: (message: string, detail?: unknown): void => void errors.push({ message, detail }) };
}

const messages = (logger: RecordingLogger): readonly string[] => logger.errors.map((entry) => entry.message);

/** What the island draws: the page's title, the locale the kit holds, and a kit switch. */
function Probe({ title }: { readonly title: string }): JSX.Element {
    const kit = useKit();
    const [on, setOn] = useState(true);
    return (
        <section>
            <h2>{title}</h2>
            <p data-testid="locale">{kit.locale}</p>
            <Switch checked={on} onChange={setOn} label="probe" />
        </section>
    );
}

interface Mounted {
    readonly mount: IslandMount;
    readonly calls: { readonly root: HTMLElement; readonly page: unknown }[];
}

function recordingMount(): Mounted {
    const calls: { root: HTMLElement; page: unknown }[] = [];
    return {
        calls,
        mount: (root, page) => {
            calls.push({ root, page });
            return <Probe title="Probe" />;
        },
    };
}

const loadingLine = (root: HTMLElement): Element | null => root.querySelector(`[data-role="${ISLAND}-loading"]`);
const FAILED = 'The test page could not be loaded. Reload the page to try again.';

describe('starting an island', () => {
    it('renders what mount returns in place of the loading line and the document, inside the kit', () => {
        const root = placeIslandPage(document);
        const { mount, calls } = recordingMount();
        const logger = recordingLogger();
        startIsland({ name: ISLAND, mount, logger });

        assert.equal(calls.length, 1);
        assert.equal(calls[0]?.root, root);
        assert.equal(root.querySelector('h2')?.textContent, 'Probe');
        assert.equal(root.querySelector('[data-testid="locale"]')?.textContent, 'en_US');
        assert.equal(root.querySelector('[role="switch"]')?.textContent, 'Yes', 'the kit words its switch from the document');
        assert.equal(loadingLine(root), null, 'the loading line is gone');
        assert.equal(root.querySelector('script'), null, 'so is the document');
        assert.deepEqual(logger.errors, []);
    });

    it('hands mount the page\'s part of the document untouched', () => {
        placeIslandPage(document);
        const { mount, calls } = recordingMount();
        startIsland({ name: ISLAND, mount, logger: recordingLogger() });

        assert.deepEqual(calls[0]?.page, {
            title: 'Test island',
            note: '<b>Bold</b> & "quoted" — kept as typed',
            rows: [{ code: 'one', enabled: true }, { code: 'two', enabled: false }],
            limit: 3,
        });
    });

    it('mounts each root once, however often starting is asked for', () => {
        const first = placeIslandPage(document);
        const { mount, calls } = recordingMount();
        const logger = recordingLogger();
        startIsland({ name: ISLAND, mount, logger });
        startIsland({ name: ISLAND, mount, logger });
        const second = placeIslandPage(document);
        startIsland({ name: ISLAND, mount, logger });

        assert.deepEqual(calls.map((call) => call.root), [first, second], 'a root printed later starts on the next call');
        assert.equal(first.querySelectorAll('section').length, 1);
        assert.deepEqual(logger.errors, []);
    });

    it('waits for the document when it is still loading', () => {
        const root = placeIslandPage(document);
        const { mount, calls } = recordingMount();
        Object.defineProperty(document, 'readyState', { value: 'loading', configurable: true });
        try {
            startIsland({ name: ISLAND, mount, logger: recordingLogger() });
            assert.equal(calls.length, 0, 'nothing before the document has loaded');
            assert.ok(loadingLine(root));
        } finally {
            Reflect.deleteProperty(document, 'readyState');
        }
        document.dispatchEvent(new Event('DOMContentLoaded'));

        assert.equal(calls.length, 1);
        assert.equal(root.querySelector('h2')?.textContent, 'Probe');
    });

    it('leaves the roots of other islands alone', () => {
        const root = placeIslandPage(document);
        const { mount, calls } = recordingMount();
        startIsland({ name: 'other-island', mount, logger: recordingLogger() });

        assert.equal(calls.length, 0);
        assert.ok(loadingLine(root));
    });

    it('refuses a name that is no island name', () => {
        const { mount } = recordingMount();
        assert.throws(() => startIsland({ name: 'Test"]', mount }), /is no island name/);
    });
});

describe('an island that cannot start', () => {
    it('shows the failure text and logs the first wrong path when the document has the wrong shape', () => {
        const root = placeIslandPage(document, (printed) => withMember(printed, ['kit', 'locale'], 42));
        const { mount, calls } = recordingMount();
        const logger = recordingLogger();
        startIsland({ name: ISLAND, mount, logger });

        assert.equal(loadingLine(root)?.textContent, FAILED);
        assert.equal(calls.length, 0, 'nothing half-read reaches the page');
        assert.equal(root.querySelector('section'), null);
        assert.deepEqual(messages(logger), ['The test-island island document could not be read at $.kit.locale']);
    });

    it('shows the failure text when the document is not JSON', () => {
        const root = placeIslandPage(document, () => '{not json');
        const logger = recordingLogger();
        startIsland({ name: ISLAND, mount: recordingMount().mount, logger });

        assert.equal(loadingLine(root)?.textContent, FAILED);
        assert.deepEqual(messages(logger), ['The test-island island document could not be read']);
        assert.ok(logger.errors[0]?.detail instanceof SyntaxError);
    });

    it('shows the failure text when the root holds no document', () => {
        const root = placeIslandPage(document);
        root.querySelector('script')?.remove();
        const logger = recordingLogger();
        startIsland({ name: ISLAND, mount: recordingMount().mount, logger });

        assert.equal(loadingLine(root)?.textContent, FAILED);
        assert.deepEqual(messages(logger), ['The test-island island document could not be read']);
    });

    it('shows the failure text and logs why when mount throws', () => {
        const root = placeIslandPage(document);
        const logger = recordingLogger();
        const fault = new Error('the page\'s part has the wrong shape');
        startIsland({
            name: ISLAND,
            mount: () => {
                throw fault;
            },
            logger,
        });

        assert.equal(loadingLine(root)?.textContent, FAILED);
        assert.deepEqual(logger.errors, [{ message: 'The test-island island could not start', detail: fault }]);
    });

    it('shows the failure text alone when the first render throws', () => {
        const root = placeIslandPage(document);
        const logger = recordingLogger();
        const Broken = (): JSX.Element => {
            throw new Error('render bug');
        };
        startIsland({ name: ISLAND, mount: () => <div><p>drawn</p><Broken /></div>, logger });

        assert.equal(root.textContent, FAILED, 'nothing drawn before the fault stays');
        assert.deepEqual(messages(logger), ['The test-island island could not start']);
    });
});

describe('the kit\'s wording on an island', () => {
    it('shows a kit phrase the document lacks as its key, and reports it once', async () => {
        const root = placeIslandPage(document, (printed) => withMember(printed, ['kit', 'phrases', 'kit.switch.no'], undefined));
        const logger = recordingLogger();
        startIsland({ name: ISLAND, mount: recordingMount().mount, logger });
        const control = root.querySelector('[role="switch"]');
        assert.ok(control instanceof HTMLElement);

        await act(() => control.click());
        assert.equal(control.textContent, 'kit.switch.no');
        await act(() => control.click());
        await act(() => control.click());

        assert.equal(control.textContent, 'kit.switch.no');
        assert.deepEqual(messages(logger), ['The test-island island document lacks the kit phrase kit.switch.no']);
    });
});
