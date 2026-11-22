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
import { type ComponentChildren } from 'preact';
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
/** Starts every root of the named island on the page, now or once the document has loaded. */
export declare function startIsland(options: IslandOptions): void;
