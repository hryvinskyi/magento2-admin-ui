/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
    createJsonClient,
    isRequestError,
    type Fetch,
    type HttpResponse,
    type JsonClient,
    type RequestErrorKind,
} from '@hryvinskyi/admin-ui';

interface Sent {
    readonly url: URL;
    readonly init: RequestInit;
}

const respond = (status: number, body: string, redirected = false): HttpResponse => ({
    status,
    redirected,
    text: () => Promise.resolve(body),
});

function clientAnswering(answer: (sent: Sent) => Promise<HttpResponse>): { client: JsonClient; sent: Sent[] } {
    const sent: Sent[] = [];
    const fetch: Fetch = (url, init) => {
        const request = { url: new URL(url), init };
        sent.push(request);
        return answer(request);
    };
    return { client: createJsonClient({ formKey: () => 'fk-123', baseUrl: 'https://admin.test/admin/', fetch }), sent };
}

const answering = (response: HttpResponse): ReturnType<typeof clientAnswering> => clientAnswering(() => Promise.resolve(response));

/** A fetch that never answers on its own: it rejects with the signal's reason once the signal aborts. */
const hanging = ({ init }: Sent): Promise<HttpResponse> => new Promise((_resolve, reject) => {
    const signal = init.signal;
    signal?.addEventListener('abort', () => reject(signal.reason), { once: true });
});

const signal = (): AbortSignal => new AbortController().signal;

async function failsWith(request: Promise<unknown>, kind: RequestErrorKind, reason: string | null = null): Promise<void> {
    await assert.rejects(request, (error: unknown) => {
        assert.ok(isRequestError(error), `expected a RequestError, got ${String(error)}`);
        assert.deepEqual([error.kind, error.reason], [kind, reason]);
        return true;
    });
}

describe('JSON client requests', () => {
    it('marks every GET as AJAX, adds the query, and sends no form key', async () => {
        const { client, sent } = answering(respond(200, '[]'));
        await client.get('https://admin.test/admin/test/session/id/test/key/abc/', { signal: signal(), query: { store: 'store:1', q: 'shirt' } });
        const [request] = sent;

        assert.equal(request?.url.pathname, '/admin/test/session/id/test/key/abc/', 'the secret key in the path is kept');
        assert.deepEqual(Object.fromEntries(request?.url.searchParams ?? []), { store: 'store:1', q: 'shirt', isAjax: 'true' });
        assert.equal(request?.init.method, 'GET');
        assert.equal(request?.init.body, undefined);
        assert.equal(request?.init.credentials, 'same-origin');
        assert.deepEqual(request?.init.headers, { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' });
    });

    it('puts the form key and the AJAX marker of a POST in the URL, and the body as JSON', async () => {
        const { client, sent } = answering(respond(200, '{"ok":true}'));
        await client.post('test/save/', { changes: [] }, { signal: signal() });
        const [request] = sent;

        assert.equal(request?.url.href, 'https://admin.test/admin/test/save/?isAjax=true&form_key=fk-123');
        assert.equal(request?.init.method, 'POST');
        assert.equal(request?.init.body, '{"changes":[]}');
        assert.deepEqual(request?.init.headers, {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
        });
    });

    it('reads the form key for every request, so a renewed session applies to the next one', async () => {
        const sent: Sent[] = [];
        let formKey = 'old-key';
        const client = createJsonClient({
            formKey: () => formKey,
            baseUrl: 'https://admin.test/admin/',
            fetch: (url, init) => {
                sent.push({ url: new URL(url), init });
                return Promise.resolve(respond(200, '{}'));
            },
        });
        await client.post('test/save/', {}, { signal: signal() });
        formKey = 'new-key';
        await client.post('test/save/', {}, { signal: signal() });

        assert.deepEqual(sent.map((request) => request.url.searchParams.get('form_key')), ['old-key', 'new-key']);
    });

    it('answers the parsed body, unparsed into any type', async () => {
        const { client } = answering(respond(200, '{"results":[],"state":{"items":{}}}'));

        assert.deepEqual(await client.post('save/', {}, { signal: signal() }), { results: [], state: { items: {} } });
    });

    it('lets a body that only looks like an error through when `error` is not `true`', async () => {
        const { client } = answering(respond(200, '{"valid":false,"messages":[],"error":"Connection refused"}'));

        assert.deepEqual(await client.post('test/', {}, { signal: signal() }), { valid: false, messages: [], error: 'Connection refused' });
    });
});

describe('JSON client failures', () => {
    it('times out at the deadline', async () => {
        const { client } = clientAnswering(hanging);

        await failsWith(client.get('slow/', { signal: signal(), timeoutMs: 5 }), 'timeout');
    });

    it('rejects with the caller\'s own reason when the caller aborts: not a failure to show', async () => {
        const { client } = clientAnswering(hanging);
        const controller = new AbortController();
        const request = client.post('save/', {}, { signal: controller.signal });
        controller.abort();

        await assert.rejects(request, (error: unknown) => {
            assert.equal(isRequestError(error), false);
            assert.equal(error, controller.signal.reason);
            return true;
        });
    });

    it('reports a connection that failed as network', async () => {
        const { client } = clientAnswering(() => Promise.reject(new TypeError('Failed to fetch')));

        await failsWith(client.get('x/', { signal: signal() }), 'network');
    });

    it('sends a request once, whatever it fails with', async () => {
        const failing: readonly ((sent: Sent) => Promise<HttpResponse>)[] = [
            () => Promise.reject(new TypeError('Failed to fetch')),
            () => Promise.resolve(respond(503, '')),
            () => Promise.resolve(respond(200, '{"ajaxExpired":1}')),
        ];
        for (const answer of failing) {
            const { client, sent } = clientAnswering(answer);
            await assert.rejects(client.post('save/', {}, { signal: signal() }));
            assert.equal(sent.length, 1);
        }
        const { client, sent } = clientAnswering(hanging);
        await assert.rejects(client.post('save/', {}, { signal: signal(), timeoutMs: 5 }));
        assert.equal(sent.length, 1, 'a timed-out request is not sent again');
    });

    it('reports a 400 as rejected, with the server\'s reason when it gave one', async () => {
        await failsWith(answering(respond(400, '{"error":"invalid_value"}')).client.post('x/', {}, { signal: signal() }), 'rejected', 'invalid_value');
        await failsWith(answering(respond(400, '{"message":"Bad request."}')).client.post('x/', {}, { signal: signal() }), 'rejected', 'Bad request.');
        await failsWith(answering(respond(400, '<html>')).client.post('x/', {}, { signal: signal() }), 'rejected');
    });

    it('reports a 403 as forbidden, and other unsuccessful statuses as server', async () => {
        await failsWith(answering(respond(403, '{}')).client.get('x/', { signal: signal() }), 'forbidden');
        await failsWith(answering(respond(500, '{"error":"error"}')).client.get('x/', { signal: signal() }), 'server');
        await failsWith(answering(respond(503, '<html>')).client.get('x/', { signal: signal() }), 'server');
        await failsWith(answering(respond(404, '')).client.get('x/', { signal: signal() }), 'server');
    });

    it('reports an expired session, a refused form key, a redirect and a page instead of data as expired', async () => {
        const cases: HttpResponse[] = [
            respond(200, '{"ajaxExpired":1,"ajaxRedirect":"https://admin.test/admin/login/"}'),
            respond(200, '{"error":true,"message":"Invalid security or form key. Please refresh the page."}'),
            respond(200, '{"results":[]}', true),
            respond(200, '<!doctype html><title>Sign in</title>'),
            respond(200, ''),
        ];
        for (const response of cases) {
            await failsWith(answering(response).client.post('save/', {}, { signal: signal() }), 'expired');
        }
    });
});

describe('JSON client answers outside the successes', () => {
    it('answers the body of a status the request names as answered, which other requests report as server', async () => {
        const conflict = respond(409, '{"conflict":{"updatedBy":"anna"}}');
        assert.deepEqual(
            await answering(conflict).client.post('save/', {}, { signal: signal(), answered: [409] }),
            { conflict: { updatedBy: 'anna' } },
        );
        await failsWith(answering(conflict).client.post('save/', {}, { signal: signal() }), 'server');
        await failsWith(answering(respond(500, '{}')).client.post('save/', {}, { signal: signal(), answered: [409] }), 'server');
    });

    it('answers the body of a 404 the request names, so a page can tell what is missing from a broken address', async () => {
        const missing = respond(404, '{"missing":"snippet"}');
        assert.deepEqual(
            await answering(missing).client.get('snippet/', { signal: signal(), query: { id: '7' }, answered: [404] }),
            { missing: 'snippet' },
        );
        await failsWith(answering(missing).client.get('snippet/', { signal: signal() }), 'server');
        await failsWith(answering(respond(404, '<html>')).client.get('snippet/', { signal: signal(), answered: [404] }), 'server');
    });

    it('reports a named status redirected as expired, and one without data as the status would be reported', async () => {
        const named = { signal: signal(), answered: [409] };
        await failsWith(answering(respond(409, '{"conflict":{}}', true)).client.post('save/', {}, named), 'expired');
        await failsWith(answering(respond(409, '<html>')).client.post('save/', {}, named), 'server');
        await failsWith(answering(respond(409, '{"ajaxExpired":1}')).client.post('save/', {}, named), 'server');
    });
});
