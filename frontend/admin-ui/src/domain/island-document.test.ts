/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isContractError } from './readers.ts';
import { parseIslandDocument } from './island-document.ts';

function refusedAt(value: unknown, path: string): void {
    assert.throws(() => parseIslandDocument(value), (error: unknown) => {
        assert.ok(isContractError(error), `expected a ContractError, got ${String(error)}`);
        assert.equal(error.path, path);
        return true;
    });
}

const KIT = { locale: 'uk_UA', phrases: { 'kit.switch.yes': 'Так', 'kit.switch.no': 'Ні' } };

describe('the island document', () => {
    it('reads the kit\'s locale and phrases, and hands the page\'s part on as it came', () => {
        const page = { rows: [{ code: 'one' }], anything: [1, 'two', null] };
        const document = parseIslandDocument({ kit: KIT, page });

        assert.equal(document.kit.locale, 'uk_UA');
        assert.deepEqual([...document.kit.phrases], [['kit.switch.yes', 'Так'], ['kit.switch.no', 'Ні']]);
        assert.equal(document.page, page, 'the very value, unread');
    });

    it('accepts any JSON as the page\'s part, an empty kit phrase list included', () => {
        assert.equal(parseIslandDocument({ kit: { locale: 'en_US', phrases: {} }, page: null }).page, null);
        assert.equal(parseIslandDocument({ kit: KIT, page: 'text' }).page, 'text');
    });

    const broken: readonly [string, unknown, string][] = [
        ['a document that is no object', [], '$'],
        ['no kit', { page: {} }, '$.kit'],
        ['a kit that is no object', { kit: 'en_US', page: {} }, '$.kit'],
        ['no locale', { kit: { phrases: {} }, page: {} }, '$.kit.locale'],
        ['an empty locale', { kit: { locale: ' ', phrases: {} }, page: {} }, '$.kit.locale'],
        ['phrases that are a list', { kit: { locale: 'en_US', phrases: [] }, page: {} }, '$.kit.phrases'],
        ['a phrase that is no text', { kit: { locale: 'en_US', phrases: { 'kit.switch.yes': 1 } }, page: {} }, '$.kit.phrases["kit.switch.yes"]'],
        ['no page', { kit: KIT }, '$.page'],
    ];
    for (const [name, value, path] of broken) {
        it(`refuses ${name}, naming ${path}`, () => {
            refusedAt(value, path);
        });
    }
});
