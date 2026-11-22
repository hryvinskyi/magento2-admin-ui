/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * The page's part of a module page's island document, as the server's module page (`Model\Page\ModuleIsland`)
 * prints it:
 *
 * `{"shell": {"module", "page", "nav": [{"code", "label", "url", "current", "count"}], "storefront"},
 *   "stores": [{"id", "name", "home"}], "phrases": {key: text}, "urls": {name: address},
 *   "routes": {route path: address}, "formKey": "…", "permissions": {name: bool}, "data": {…}}`.
 *
 * Every field is read, nothing is cast: a page names the endpoints it calls, the permissions it asks about and the
 * reader of its data, and the first wrong field throws a `ContractError` naming its path, so a half-read document
 * never reaches the screen (the island start shows the page's failure line instead). Addresses come built from the
 * server, secret key included; a page only appends a link's parameters to the address of its screen.
 */
import { at, bool, ContractError, filledText, items, keyed, record, text, wholeNumber } from './readers.ts';
import { resolveLink, type ScreenLink } from './screen-link.ts';
import type { StoreView } from './store-views.ts';

/** One tab of the module navigation. */
export interface ModuleTab {
    readonly code: string;
    /** Translated. */
    readonly label: string;
    readonly url: string;
    readonly current: boolean;
    /**
     * How many things wait on the tab's page; left out when none does. A document without the field (an older server)
     * reads as none.
     */
    readonly count?: number;
}

/** The header and the module navigation every page of the module draws. */
export interface ModuleShell {
    /** The module's name; translated. */
    readonly module: string;
    /** The page's name; translated. */
    readonly page: string;
    /** The tabs the admin may open, in order. */
    readonly nav: readonly ModuleTab[];
    /** The default store view's home page; empty when the shop has none. */
    readonly storefront: string;
}

/** A store view as the pages list it, with the address of its storefront home page. */
export interface PageStoreView extends StoreView {
    readonly home: string;
}

export interface PageDocument<U extends string, P extends string, D> {
    readonly shell: ModuleShell;
    readonly stores: readonly PageStoreView[];
    /** The page's own phrases, translated, by key. */
    readonly phrases: ReadonlyMap<string, string>;
    /** The address of one of the page's endpoints. */
    readonly url: (name: U) => string;
    /** The address of a link to another screen; null when the admin may not open it. */
    readonly link: (link: ScreenLink) => string | null;
    /** The admin form key every write carries. */
    readonly formKey: string;
    /** Whether the signed-in admin has one of the permissions the page asks about. */
    readonly allows: (permission: P) => boolean;
    readonly data: D;
}

export interface PageDocumentSpec<U extends string, P extends string, D> {
    /** The endpoints the page calls; each must be in the document. */
    readonly urls: readonly U[];
    /** The permissions the page asks about; each must be in the document. */
    readonly permissions: readonly P[];
    readonly data: (value: unknown, path: string) => D;
}

const anyKey = { guard: (raw: string): raw is string => raw !== '', expected: 'a non-empty key' } as const;

function moduleTab(value: unknown, path: string): ModuleTab {
    const fields = record(value, path);
    const count = fields['count'] === undefined ? 0 : wholeNumber(fields['count'], at(path, 'count'));
    return {
        code: filledText(fields['code'], at(path, 'code')),
        label: filledText(fields['label'], at(path, 'label')),
        url: filledText(fields['url'], at(path, 'url')),
        current: bool(fields['current'], at(path, 'current')),
        ...(count > 0 ? { count } : {}),
    };
}

function moduleShell(value: unknown, path: string): ModuleShell {
    const fields = record(value, path);
    return {
        module: filledText(fields['module'], at(path, 'module')),
        page: text(fields['page'], at(path, 'page')),
        nav: items(fields['nav'], at(path, 'nav'), moduleTab),
        storefront: text(fields['storefront'], at(path, 'storefront')),
    };
}

function pageStoreView(value: unknown, path: string): PageStoreView {
    const fields = record(value, path);
    return {
        id: wholeNumber(fields['id'], at(path, 'id')),
        name: filledText(fields['name'], at(path, 'name')),
        home: text(fields['home'], at(path, 'home')),
    };
}

/** Each name the page needs, read from the document; the first one missing throws, naming its path. */
function required<N extends string, T>(
    found: ReadonlyMap<string, T>,
    names: readonly N[],
    path: string,
    expected: string,
): ReadonlyMap<N, T> {
    const picked = new Map<N, T>();
    for (const name of names) {
        const value = found.get(name);
        if (value === undefined) {
            throw new ContractError(at(path, name), expected);
        }
        picked.set(name, value);
    }
    return picked;
}

/** Reads the page's part of the document; the first wrong field throws a `ContractError`. */
export function parsePageDocument<U extends string, P extends string, D>(
    value: unknown,
    spec: PageDocumentSpec<U, P, D>,
): PageDocument<U, P, D> {
    const fields = record(value, '$');
    const phrases = keyed(fields['phrases'], at('$', 'phrases'), anyKey, text);
    const urls = required(
        keyed(fields['urls'], at('$', 'urls'), anyKey, filledText),
        spec.urls,
        at('$', 'urls'),
        'an address',
    );
    const routes = keyed(fields['routes'], at('$', 'routes'), anyKey, filledText);
    const permissions = required(
        keyed(fields['permissions'], at('$', 'permissions'), anyKey, bool),
        spec.permissions,
        at('$', 'permissions'),
        'a boolean',
    );

    return Object.freeze({
        shell: moduleShell(fields['shell'], at('$', 'shell')),
        stores: items(fields['stores'], at('$', 'stores'), pageStoreView),
        phrases,
        url: (name: U): string => urls.get(name) ?? '',
        link: (link: ScreenLink): string | null => resolveLink(routes, link),
        formKey: text(fields['formKey'], at('$', 'formKey')),
        allows: (permission: P): boolean => permissions.get(permission) === true,
        data: spec.data(fields['data'], at('$', 'data')),
    });
}
