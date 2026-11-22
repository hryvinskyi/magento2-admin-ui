/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
/**
 * What a page's components read: the page's wording and the address of a link to another screen. The page's
 * composition root provides it once; a test provides its own. Read through `usePage()`, which fails loudly outside a
 * provider: a component drawn without its wording is a wiring fault.
 *
 * It sits beside the kit's own context: the kit words the kit's parts, the page words the page's.
 */
import { type ComponentChildren, type JSX } from 'preact';
import type { Phrase } from '../domain/phrase.ts';
import type { ScreenLink } from '../domain/screen-link.ts';
import type { Translator } from '../domain/translator.ts';
export interface Page {
    /** Words the page's own phrases. */
    readonly translator: Translator;
    /** The address of a link; null when the admin may not open its screen, so nothing is drawn for it. */
    readonly link: (link: ScreenLink) => string | null;
}
export interface PageProviderProps {
    readonly page: Page;
    readonly children?: ComponentChildren;
}
export declare function PageProvider({ page, children }: PageProviderProps): JSX.Element;
/** A page component was drawn outside a `PageProvider`. */
export declare class MissingPageError extends Error {
    constructor();
}
/** The page the nearest `PageProvider` holds; throws `MissingPageError` outside one. */
export declare function usePage(): Page;
/** A sentence a pure module chose, in the page's words. */
export declare const worded: (translator: Translator, sentence: Phrase) => string;
