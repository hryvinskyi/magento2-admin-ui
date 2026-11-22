/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
/**
 * A page's one JSON client, built at its composition root over the kit's client: the admin's request rules
 * (`isAjax`, the form key on every write, failures as a `RequestError`), the form key the page's document carries,
 * and addresses resolved against the page's own. `READ_DEADLINE_MS` is a read's deadline, shorter than the kit's
 * default: a page waits that long at most before it says its numbers could not be loaded.
 */
import { type Fetch, type JsonClient } from './json-client.ts';
/** How long a read may take, in milliseconds. */
export declare const READ_DEADLINE_MS = 8000;
export interface PageClientOptions {
    readonly formKey: string;
    /** The page's own address. */
    readonly baseUrl: string;
    readonly fetch: Fetch;
}
export declare function createPageClient(options: PageClientOptions): JsonClient;
