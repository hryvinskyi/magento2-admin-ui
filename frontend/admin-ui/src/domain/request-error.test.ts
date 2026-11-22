/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { failureOf, isAnsweredRefusal, isRequestError, RequestError, type RequestErrorKind } from '@hryvinskyi/admin-ui';

const KINDS: readonly RequestErrorKind[] = ['network', 'timeout', 'rejected', 'forbidden', 'expired', 'server'];

describe('request errors', () => {
    it('carry their kind and, for a refusal, the server\'s reason', () => {
        const refused = new RequestError('rejected', 'invalid_value');
        assert.deepEqual([refused.name, refused.kind, refused.reason], ['RequestError', 'rejected', 'invalid_value']);
        assert.equal(refused.message, 'Request failed: rejected (invalid_value)');
        assert.equal(new RequestError('timeout').reason, null);

        const cause = new TypeError('Failed to fetch');
        assert.equal(new RequestError('network', null, { cause }).cause, cause);
    });

    it('are recognised by name and shape, so one from another bundle is recognised too', () => {
        for (const kind of KINDS) {
            assert.equal(isRequestError(new RequestError(kind)), true, kind);
        }
        const fromAnotherBundle = Object.assign(new Error('Request failed: expired'), {
            name: 'RequestError',
            kind: 'expired',
            reason: null,
        });
        assert.equal(isRequestError(fromAnotherBundle), true);
    });

    it('are not mistaken for anything of another shape', () => {
        assert.equal(isRequestError(new Error('Request failed')), false);
        assert.equal(isRequestError(Object.assign(new Error('x'), { name: 'RequestError', kind: 'teapot', reason: null })), false);
        assert.equal(isRequestError(Object.assign(new Error('x'), { name: 'RequestError', kind: 'server', reason: 5 })), false);
        assert.equal(isRequestError({ name: 'RequestError', kind: 'server', reason: null }), false, 'not an error');
        assert.equal(isRequestError(new DOMException('aborted', 'AbortError')), false);
    });

    it('count as answered refusals only when the server said no on purpose: rejected or forbidden', () => {
        assert.deepEqual(
            KINDS.filter((kind) => isAnsweredRefusal(new RequestError(kind))),
            ['rejected', 'forbidden'],
        );
        const fromAnotherBundle = Object.assign(new Error('Request failed: rejected'), {
            name: 'RequestError',
            kind: 'rejected',
            reason: 'not_an_export',
        });
        assert.equal(isAnsweredRefusal(fromAnotherBundle), true);
        assert.equal(isAnsweredRefusal(new TypeError('x is undefined')), false, 'a bug is a fault');
        assert.equal(isAnsweredRefusal(new DOMException('aborted', 'AbortError')), false);
    });

    it('become the failure to show, anything else counting as a server failure', () => {
        assert.deepEqual(failureOf(new RequestError('rejected', 'invalid_value')), { kind: 'rejected', reason: 'invalid_value' });
        assert.deepEqual(failureOf(new RequestError('forbidden')), { kind: 'forbidden', reason: null });
        assert.deepEqual(failureOf(new TypeError('x is undefined')), { kind: 'server', reason: null });
        assert.deepEqual(failureOf('a string'), { kind: 'server', reason: null });
    });
});
