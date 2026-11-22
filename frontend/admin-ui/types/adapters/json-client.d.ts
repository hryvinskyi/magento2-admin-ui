/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
/** The part of a fetch response the client reads. */
export interface HttpResponse {
    readonly status: number;
    readonly redirected: boolean;
    text(): Promise<string>;
}
export type Fetch = (url: string, init: RequestInit) => Promise<HttpResponse>;
export interface JsonClientOptions {
    /** The admin form key valid now; read for every request, so a renewed session applies to the next one. */
    readonly formKey: () => string;
    /** What relative URLs resolve against (the page's base URL). */
    readonly baseUrl: string;
    readonly fetch: Fetch;
}
/** How long a request may take when the caller names no deadline. */
export declare const DEFAULT_DEADLINE_MS = 10000;
export interface JsonRequestOptions {
    readonly signal: AbortSignal;
    /** The deadline; DEFAULT_DEADLINE_MS when left out. */
    readonly timeoutMs?: number;
    /** Query parameters added to the URL. */
    readonly query?: Readonly<Record<string, string>>;
    /** Statuses outside the successes whose JSON body is the answer (a 409 carrying the version that won). */
    readonly answered?: readonly number[];
}
export interface JsonClient {
    get(url: string, options: JsonRequestOptions): Promise<unknown>;
    post(url: string, body: unknown, options: JsonRequestOptions): Promise<unknown>;
}
export declare function createJsonClient(options: JsonClientOptions): JsonClient;
