/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * The page the server prints for the fixture island (`Test/_contract/island-page.html`, a shared fixture of both
 * sides), placed into a test's document: the island's root as printed — its failure text, its loading line and its
 * document embedded tag-safe — without the page's stylesheet link and scripts, which a test does not load.
 */
import { readFileSync } from 'node:fs';

const PAGE = new URL('../../../../Test/_contract/island-page.html', import.meta.url);

/** The fixture island's name. */
export const ISLAND = 'test-island';

const ROOT = `[data-role="${ISLAND}"]`;
const DOCUMENT = `script[type="application/json"][data-role="${ISLAND}-config"]`;

/** The printed root, parsed into an inert template so the page's stylesheet link is never fetched. */
function printedRoot(): Element {
    const printed = document.createElement('template');
    printed.innerHTML = readFileSync(PAGE, 'utf8');
    const root = printed.content.querySelector(ROOT);
    if (root === null || root.querySelector(DOCUMENT) === null) {
        throw new Error(`${PAGE.pathname} holds no island root with its document`);
    }
    return root;
}

/** The document the printed page embeds, parsed. */
export function printedDocument(): unknown {
    const value: unknown = JSON.parse(printedRoot().querySelector(DOCUMENT)?.textContent ?? '');
    return value;
}

/**
 * Appends the printed island root to `document.body` and returns it. `edit` replaces the embedded document: a value
 * is written as JSON, a string as it is.
 */
export function placeIslandPage(document: Document, edit?: (printed: unknown) => unknown): HTMLElement {
    const placed = document.importNode(printedRoot(), true);
    const script = placed.querySelector(DOCUMENT);
    if (edit !== undefined && script !== null) {
        const replaced = edit(printedDocument());
        script.textContent = typeof replaced === 'string' ? replaced : JSON.stringify(replaced);
    }
    if (!(placed instanceof HTMLElement)) {
        throw new Error('The printed island root is no HTML element');
    }
    document.body.append(placed);
    return placed;
}

/** `value` with the member at `path` set to `next` (left out when `next` is undefined); `value` is not changed. */
export function withMember(value: unknown, path: readonly string[], next: unknown): unknown {
    const [head, ...rest] = path;
    if (head === undefined) {
        return next;
    }
    const fields: Record<string, unknown> = typeof value === 'object' && value !== null && !Array.isArray(value)
        ? { ...value }
        : {};
    const member = withMember(fields[head], rest, next);
    if (member === undefined) {
        Reflect.deleteProperty(fields, head);
    } else {
        fields[head] = member;
    }
    return fields;
}
