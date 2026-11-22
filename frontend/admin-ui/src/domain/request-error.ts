/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * Why a request to the admin failed as a whole, as a small set of kinds the page turns into wording:
 *
 * - `network`: nothing came back (offline, DNS, connection reset).
 * - `timeout`: the deadline passed before an answer arrived. The server may still have done the work.
 * - `rejected`: the server refused the request (a 400); it carries the reason the server gave, a code such as
 *   `invalid_value` that the page words.
 * - `forbidden`: the admin user lacks the page's permission.
 * - `expired`: the admin session or the form key is no longer valid, or the answer was a page instead of data.
 *   Once the person is signed in again they can repeat the action.
 * - `server`: the server failed (5xx), or answered something that is not the agreed data.
 *
 * A request the caller aborted is none of these: it is not an error to show.
 *
 * `rejected` and `forbidden` are answered refusals: the server understood the request and said no on purpose, with a
 * status it chose, and the page words the answer for the person (a file that is not an export, a permission the admin
 * lacks). They are outcomes, not faults, so nothing logs them. Every other kind is a fault worth a log line: nothing
 * came back, the server failed, or what came back was not the agreed data (which `expired` also stands for).
 */
export type RequestErrorKind = 'network' | 'timeout' | 'rejected' | 'forbidden' | 'expired' | 'server';

const KINDS: ReadonlySet<string> = new Set<RequestErrorKind>([
    'network',
    'timeout',
    'rejected',
    'forbidden',
    'expired',
    'server',
]);

export const isRequestErrorKind = (raw: string): raw is RequestErrorKind => KINDS.has(raw);

/** What the page shows about a failed request: the kind, and the server's own reason when it gave one. */
export interface RequestFailure {
    readonly kind: RequestErrorKind;
    readonly reason: string | null;
}

export const REQUEST_ERROR = 'RequestError';

export class RequestError extends Error {
    readonly kind: RequestErrorKind;
    /** The server's reason; only a `rejected` request carries one. */
    readonly reason: string | null;

    constructor(kind: RequestErrorKind, reason: string | null = null, options?: ErrorOptions) {
        super(`Request failed: ${kind}${reason === null ? '' : ` (${reason})`}`, options);
        this.name = REQUEST_ERROR;
        this.kind = kind;
        this.reason = reason;
    }
}

/**
 * Whether a thrown value is a request failure. Matched by name and shape rather than `instanceof`: the kit and each
 * island are separate bundles, so a class from one is not the class another sees.
 */
export function isRequestError(error: unknown): error is RequestError {
    if (!(error instanceof Error) || error.name !== REQUEST_ERROR) {
        return false;
    }
    const kind: unknown = Reflect.get(error, 'kind');
    const reason: unknown = Reflect.get(error, 'reason');
    return typeof kind === 'string' && isRequestErrorKind(kind) && (reason === null || typeof reason === 'string');
}

const REFUSALS: ReadonlySet<RequestErrorKind> = new Set<RequestErrorKind>(['rejected', 'forbidden']);

/** Whether a thrown value is an answered refusal, which the page words and nothing logs. */
export function isAnsweredRefusal(error: unknown): boolean {
    return isRequestError(error) && REFUSALS.has(error.kind);
}

/**
 * The failure to show for anything a request threw. A thrown value that is not a request failure (an answer of
 * the wrong shape, a bug) is reported as `server`: the outcome is unknown, so nothing may be treated as saved.
 */
export function failureOf(error: unknown): RequestFailure {
    return isRequestError(error)
        ? { kind: error.kind, reason: error.reason }
        : { kind: 'server', reason: null };
}
