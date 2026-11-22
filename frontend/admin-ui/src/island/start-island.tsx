/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * Starting an island on an admin page: the composition root every island's entry module calls.
 *
 * The server prints, for an island named `NAME`, a root `[data-role="NAME"]` holding a loading line
 * (`[data-role="NAME-loading"]`) and the island's document as JSON
 * (`<script type="application/json" data-role="NAME-config">`), and puts the translated failure text on the root
 * (`data-failed-text`). The document is `{"kit": {"locale": …, "phrases": {…}}, "page": <any JSON>}`.
 *
 * - Every root of the name mounts once, however often starting is asked for.
 * - Starting works whether the document is still loading or long finished.
 * - The kit's part is read strictly and becomes the kit's translator; the page's part reaches `mount` as it came,
 *   for the page's own parser.
 * - What `mount(root, page)` returns is rendered into the root inside the `KitProvider`, in place of the loading
 *   line and the document.
 * - A document that cannot be read, or a `mount` (or a first render) that throws, shows the root's failure text in
 *   place of the loading line; the details, with the first wrong path, go to the logger. Nothing half-read reaches
 *   the screen.
 * - A kit phrase the document lacks shows as its key and is logged once.
 */
import { render, type ComponentChildren } from 'preact';
import { KitProvider, type Kit } from '../components/kit-context.tsx';
import { parseIslandDocument, type IslandDocument } from '../domain/island-document.ts';
import { isContractError } from '../domain/readers.ts';
import { createTranslator } from '../domain/translator.ts';

/** Where an island reports what went wrong. */
export interface Logger {
    error(message: string, detail?: unknown): void;
}

/** Builds the island's content for one root from the page's part of the document, still unread. */
export type IslandMount = (root: HTMLElement, page: unknown) => ComponentChildren;

export interface IslandOptions {
    /** The island's name: the root's `data-role` and the prefix of the other two roles. */
    readonly name: string;
    readonly mount: IslandMount;
    /** The console when left out. */
    readonly logger?: Logger | undefined;
}

/** The form of an island's name the server accepts, so it can stand unquoted inside a selector. */
const NAME = /^[a-z][a-z0-9-]{0,63}$/;

/** The root's attribute holding the translated text shown when the island cannot start. */
const FAILED_TEXT_ATTRIBUTE = 'data-failed-text';

interface Roles {
    readonly root: string;
    readonly document: string;
    readonly loading: string;
}

const rolesOf = (name: string): Roles => ({
    root: `[data-role="${name}"]`,
    document: `script[type="application/json"][data-role="${name}-config"]`,
    loading: `[data-role="${name}-loading"]`,
});

const CONSOLE: Logger = {
    error: (message: string, detail?: unknown): void => console.error(message, detail),
};

/** The roots already started, whatever island they belong to. */
const started = new WeakSet<Element>();

function readDocument(root: HTMLElement, roles: Roles): IslandDocument {
    const element = root.querySelector(roles.document);
    if (element === null) {
        throw new Error(`No island document (${roles.document}) inside the root`);
    }
    const value: unknown = JSON.parse(element.textContent ?? '');
    return parseIslandDocument(value);
}

function showFailure(root: HTMLElement, roles: Roles): void {
    const text = root.getAttribute(FAILED_TEXT_ATTRIBUTE);
    if (text !== null && text.trim() !== '') {
        (root.querySelector(roles.loading) ?? root).textContent = text;
    }
}

function kitOf(island: IslandDocument, name: string, logger: Logger): Kit {
    return {
        locale: island.kit.locale,
        translator: createTranslator({
            locale: island.kit.locale,
            phrases: island.kit.phrases,
            onMissing: (key: string): void => logger.error(`The ${name} island document lacks the kit phrase ${key}`),
        }),
    };
}

function startRoot(root: HTMLElement, options: IslandOptions, roles: Roles, logger: Logger): void {
    let island: IslandDocument;
    try {
        island = readDocument(root, roles);
    } catch (error) {
        const where = isContractError(error) ? ` at ${error.path}` : '';
        logger.error(`The ${options.name} island document could not be read${where}`, error);
        showFailure(root, roles);
        return;
    }
    try {
        const content = options.mount(root, island.page);
        // Rendering adds to what the root holds; the loading line and the document, already read, must go.
        root.replaceChildren();
        render(<KitProvider kit={kitOf(island, options.name, logger)}>{content}</KitProvider>, root);
    } catch (error) {
        logger.error(`The ${options.name} island could not start`, error);
        showFailure(root, roles);
    }
}

/** Starts every root of the named island on the page, now or once the document has loaded. */
export function startIsland(options: IslandOptions): void {
    if (!NAME.test(options.name)) {
        throw new Error(`"${options.name}" is no island name: lower-case letters, digits and dashes, a letter first`);
    }
    const roles = rolesOf(options.name);
    const logger = options.logger ?? CONSOLE;
    const startAll = (): void => {
        document.querySelectorAll<HTMLElement>(roles.root).forEach((root) => {
            if (started.has(root)) {
                return;
            }
            started.add(root);
            startRoot(root, options, roles, logger);
        });
    };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startAll, { once: true });
    } else {
        startAll();
    }
}
