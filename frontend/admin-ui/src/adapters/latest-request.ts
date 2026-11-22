/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * One kind of request of a page where only the newest counts: a new one aborts the one before it, and the answer of
 * a request that was replaced or cancelled is never handed on, so a stale answer can never overwrite a newer one.
 *
 * Each request gets its own signal, which the runner aborts when a newer request starts or the page goes away; the
 * endpoint adds its deadline. A failure becomes the kit's `RequestFailure`, which the page words. A fault is reported
 * with its details, which never reach the screen; an answered refusal (`isAnsweredRefusal`) is an outcome the page
 * words, and is not reported.
 */
import { failureOf, isAnsweredRefusal, type RequestFailure } from '../domain/request-error.ts';

interface Outcomes<T> {
    done: { readonly value: T };
    failed: { readonly failure: RequestFailure };
    /** A newer request replaced it, or the page went away: nothing to show. */
    replaced: Record<never, never>;
}

export type OutcomeKind = keyof Outcomes<unknown>;

export type Outcome<T, K extends OutcomeKind = OutcomeKind> = { [P in K]: { readonly kind: P } & Outcomes<T>[P] }[K];

export interface LatestRequest {
    /** Starts `work`, aborting the request before it. */
    run<T>(work: (signal: AbortSignal) => Promise<T>): Promise<Outcome<T>>;
    /** Aborts the request in flight, if any. */
    cancel(): void;
}

/** @param report Told every fault, with the thrown value; an abort is no failure and an answered refusal no fault. */
export function createLatestRequest(report: (error: unknown) => void): LatestRequest {
    let current: AbortController | null = null;

    return Object.freeze({
        async run<T>(work: (signal: AbortSignal) => Promise<T>): Promise<Outcome<T>> {
            current?.abort();
            const controller = new AbortController();
            current = controller;
            try {
                const value = await work(controller.signal);
                return controller.signal.aborted ? { kind: 'replaced' } : { kind: 'done', value };
            } catch (error) {
                if (controller.signal.aborted) {
                    return { kind: 'replaced' };
                }
                if (!isAnsweredRefusal(error)) {
                    report(error);
                }
                return { kind: 'failed', failure: failureOf(error) };
            } finally {
                if (current === controller) {
                    current = null;
                }
            }
        },
        cancel(): void {
            current?.abort();
            current = null;
        },
    });
}

/** What to do with each outcome; a replaced request has nothing to show, so nothing is done with it. */
export interface Settlers<T> {
    done(value: T): void;
    failed(failure: RequestFailure): void;
}

/** Hands an outcome to the settler of its kind. */
export function settle<T, K extends OutcomeKind>(outcome: Outcome<T, K>, settlers: Settlers<T>): void {
    const handlers: { [P in OutcomeKind]: (result: Outcome<T, P>) => void } = {
        done: (result) => settlers.done(result.value),
        failed: (result) => settlers.failed(result.failure),
        replaced: () => undefined,
    };
    handlers[outcome.kind](outcome);
}
