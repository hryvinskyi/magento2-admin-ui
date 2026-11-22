/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
/** What the kit needs to word its components. */
export interface KitDocument {
    /** The admin user's interface locale (`en_US`). */
    readonly locale: string;
    /** The kit's phrases, translated, by key. */
    readonly phrases: ReadonlyMap<string, string>;
}
export interface IslandDocument {
    readonly kit: KitDocument;
    /** The page's own part, unread. */
    readonly page: unknown;
}
/** Reads a parsed document; the first wrong field throws a `ContractError` naming its path. */
export declare function parseIslandDocument(value: unknown): IslandDocument;
