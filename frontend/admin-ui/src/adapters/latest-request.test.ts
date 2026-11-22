/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createLatestRequest, RequestError, settle, type Outcome } from '@hryvinskyi/admin-ui';

interface Deferred<T> {
    readonly promise: Promise<T>;
    resolve(value: T): void;
    reject(error: unknown): void;
}

function deferred<T>(): Deferred<T> {
    let resolve: (value: T) => void = () => undefined;
    let reject: (error: unknown) => void = () => undefined;
    const promise = new Promise<T>((done, fail) => {
        resolve = done;
        reject = fail;
    });
    return { promise, resolve, reject };
}

describe('the newest request of a kind', () => {
    it('aborts the request before it, and never hands on that request\'s late answer', async () => {
        const reported: unknown[] = [];
        const latest = createLatestRequest((error) => reported.push(error));
        const first = deferred<string>();
        const second = deferred<string>();
        const signals: AbortSignal[] = [];

        const older = latest.run((signal) => {
            signals.push(signal);
            return first.promise;
        });
        const newer = latest.run((signal) => {
            signals.push(signal);
            return second.promise;
        });
        second.resolve('newer');
        first.resolve('older, arriving last');

        assert.deepEqual(await newer, { kind: 'done', value: 'newer' });
        assert.deepEqual(await older, { kind: 'replaced' });
        assert.deepEqual(signals.map((signal) => signal.aborted), [true, false]);
        assert.deepEqual(reported, []);
    });

    it('gives a failure as the kit\'s request failure and reports what was thrown', async () => {
        const reported: unknown[] = [];
        const latest = createLatestRequest((error) => reported.push(error));
        const error = new RequestError('timeout');

        assert.deepEqual(await latest.run(() => Promise.reject(error)), {
            kind: 'failed',
            failure: { kind: 'timeout', reason: null },
        });
        assert.deepEqual(reported, [error]);
    });

    it('gives an answered refusal as a failure to word, and reports only the faults', async () => {
        const reported: unknown[] = [];
        const latest = createLatestRequest((error) => reported.push(error));
        const server = new RequestError('server');
        const network = new RequestError('network');
        const expired = new RequestError('expired');
        const bug = new TypeError('rows is undefined');

        assert.deepEqual(await latest.run(() => Promise.reject(new RequestError('rejected', 'not_an_export'))), {
            kind: 'failed',
            failure: { kind: 'rejected', reason: 'not_an_export' },
        });
        assert.deepEqual(await latest.run(() => Promise.reject(new RequestError('forbidden'))), {
            kind: 'failed',
            failure: { kind: 'forbidden', reason: null },
        });
        assert.deepEqual(reported, [], 'a refusal the server answered is not reported');

        for (const fault of [server, network, expired, bug]) {
            await latest.run(() => Promise.reject(fault));
        }
        assert.deepEqual(reported, [server, network, expired, bug]);
    });

    it('counts a cancelled request as replaced, not failed', async () => {
        const reported: unknown[] = [];
        const latest = createLatestRequest((error) => reported.push(error));
        const pending = latest.run((signal) => new Promise<string>((_resolve, reject) => {
            signal.addEventListener('abort', () => reject(signal.reason), { once: true });
        }));
        latest.cancel();

        assert.deepEqual(await pending, { kind: 'replaced' });
        assert.deepEqual(reported, []);
    });

    it('hands each outcome to its settler and does nothing with a replaced one', () => {
        const seen: string[] = [];
        const settlers = { done: (value: string) => seen.push(`done ${value}`), failed: () => seen.push('failed') };
        const outcomes: Outcome<string>[] = [
            { kind: 'done', value: 'a' },
            { kind: 'failed', failure: { kind: 'server', reason: null } },
            { kind: 'replaced' },
        ];
        outcomes.forEach((outcome) => settle(outcome, settlers));

        assert.deepEqual(seen, ['done a', 'failed']);
    });
});
