/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
    at,
    bool,
    branded,
    ContractError,
    filledText,
    finite,
    isContractError,
    items,
    json,
    jsonObject,
    keyed,
    nullable,
    oneOf,
    optional,
    record,
    text,
    wholeNumber,
} from '@hryvinskyi/admin-ui';

function refusedAt(parse: () => unknown, path: string, expected?: string): void {
    assert.throws(parse, (error: unknown) => {
        assert.ok(error instanceof ContractError, `expected a ContractError, got ${String(error)}`);
        assert.equal(error.path, path);
        if (expected !== undefined) {
            assert.equal(error.expected, expected);
        }
        return true;
    });
}

type Code = 'a' | 'b';
const isCode = (raw: string): raw is Code => raw === 'a' || raw === 'b';

describe('readers', () => {
    it('return the value of the agreed type and refuse any other, naming the path', () => {
        assert.deepEqual(record({ x: 1 }, '$'), { x: 1 });
        assert.equal(text('', '$.t'), '');
        assert.equal(filledText('x', '$.t'), 'x');
        assert.equal(bool(false, '$.b'), false);
        assert.equal(finite(1.5, '$.n'), 1.5);

        refusedAt(() => record([], '$'), '$', 'an object');
        refusedAt(() => record(null, '$'), '$', 'an object');
        refusedAt(() => text(1, '$.t'), '$.t', 'a string');
        refusedAt(() => filledText('  ', '$.t'), '$.t', 'a non-empty string');
        refusedAt(() => bool('true', '$.b'), '$.b', 'a boolean');
        refusedAt(() => finite(Number.NaN, '$.n'), '$.n', 'a finite number');
        refusedAt(() => finite('1', '$.n'), '$.n', 'a finite number');
    });

    it('read a whole number, a value or null, and one word of a closed set', () => {
        assert.equal(wholeNumber(3, '$'), 3);
        refusedAt(() => wholeNumber(1.5, '$.id'), '$.id', 'a whole number');
        assert.equal(nullable(null, '$', text), null);
        assert.equal(nullable('a', '$', text), 'a');
        refusedAt(() => nullable(1, '$.name', text), '$.name');
        const word: Code = oneOf(['a', 'b'], 'b', '$');
        assert.equal(word, 'b');
        refusedAt(() => oneOf(['a', 'b'], 'c', '$.code'), '$.code', 'one of a, b');
    });

    it('read lists item by item, naming the index of the first wrong one', () => {
        assert.deepEqual(items(['a', 'b'], '$.l', text), ['a', 'b']);
        refusedAt(() => items(['a', 2], '$.l', text), '$.l[1]');
        refusedAt(() => items({}, '$.l', text), '$.l', 'an array');
    });

    it('treat an optional field sent as null like one left out', () => {
        assert.equal(optional({ x: null }, 'x', '$', text), undefined);
        assert.equal(optional({}, 'x', '$', text), undefined);
        assert.equal(optional({ x: 'y' }, 'x', '$', text), 'y');
        refusedAt(() => optional({ x: 1 }, 'x', '$', text), '$.x');
    });

    it('read a keyed object in the server\'s order, refusing a key the guard does not accept', () => {
        const read = keyed({ b: 2, a: 1 }, '$.k', { guard: isCode, expected: 'a code' }, finite);
        assert.deepEqual([...read], [['b', 2], ['a', 1]]);
        refusedAt(() => keyed({ c: 1 }, '$.k', { guard: isCode, expected: 'a code' }, finite), '$.k["c"]', 'a code');
        assert.equal(branded(isCode, 'a', '$', 'a code'), 'a');
        assert.equal(at('$', 'with "quotes"'), '$["with \\"quotes\\""]');
    });

    it('name the path of a value inside plain JSON that is not JSON', () => {
        refusedAt(() => jsonObject({ list: [1, { deep: Number.POSITIVE_INFINITY }] }, '$'), '$["list"][1]["deep"]');
        assert.deepEqual(jsonObject({ a: [1, 'b', null, { c: true }] }, '$'), { a: [1, 'b', null, { c: true }] });
        assert.equal(json(null, '$'), null);
    });

    it('recognise a contract error by its name and shape', () => {
        assert.equal(isContractError(new ContractError('$', 'an object')), true);
        assert.equal(isContractError(new Error('$: expected an object')), false);

        const fromAnotherBundle = Object.assign(new Error('$: expected an object'), {
            name: 'ContractError',
            path: '$',
            expected: 'an object',
        });
        assert.equal(isContractError(fromAnotherBundle), true, 'a class of another bundle is matched by its shape');
        assert.equal(isContractError({ name: 'ContractError', path: '$', expected: 'x' }), false, 'not an error');
    });
});
