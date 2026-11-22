/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * The document the server prints inside an island's root: `{"kit": {"locale": "<code>", "phrases": {…}}, "page":
 * <any JSON>}`. The kit's part is read here, strictly — the admin user's locale and the kit's translated phrases;
 * the page's part belongs to the page, so it is handed on as it came, for the page's own parser to read.
 */
import { at, ContractError, filledText, record, text } from './readers.ts';

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

function readPhrases(value: unknown, path: string): ReadonlyMap<string, string> {
    return new Map(Object.entries(record(value, path)).map(([key, phrase]): [string, string] =>
        [key, text(phrase, at(path, key))]));
}

/** Reads a parsed document; the first wrong field throws a `ContractError` naming its path. */
export function parseIslandDocument(value: unknown): IslandDocument {
    const fields = record(value, '$');
    const kit = record(fields['kit'], '$.kit');
    if (!Object.hasOwn(fields, 'page')) {
        throw new ContractError('$.page', 'a JSON value');
    }
    return {
        kit: {
            locale: filledText(kit['locale'], '$.kit.locale'),
            phrases: readPhrases(kit['phrases'], '$.kit.phrases'),
        },
        page: fields['page'],
    };
}
