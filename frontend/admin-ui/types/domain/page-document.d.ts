/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
import { type ScreenLink } from './screen-link.ts';
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
/** Reads the page's part of the document; the first wrong field throws a `ContractError`. */
export declare function parsePageDocument<U extends string, P extends string, D>(value: unknown, spec: PageDocumentSpec<U, P, D>): PageDocument<U, P, D>;
