/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isContractError, linkTo, parsePageDocument, withParam } from '@hryvinskyi/admin-ui';
import { moduleDocument, REPORTS } from '../../test/support/module-page.ts';

const spec = {
    urls: ['data'] as const,
    permissions: ['edit', 'export'] as const,
    data: (value: unknown): unknown => value,
};

const refusedAt = (printed: unknown, path: string): void => {
    assert.throws(() => parsePageDocument(printed, spec), (error: unknown) => isContractError(error) && error.path === path);
};

describe('the page part of a module page\'s island document', () => {
    it('reads the shell, the store views, the phrases, the endpoints, the form key and the permissions', () => {
        const document = parsePageDocument(moduleDocument({ 'page.title': 'Reports' }), spec);

        assert.equal(document.shell.module, 'Vendor Module');
        assert.equal(document.shell.page, 'Reports');
        assert.deepEqual(document.shell.nav.map((tab) => [tab.code, tab.current]), [['reports', true], ['settings', false]]);
        assert.deepEqual(document.shell.nav.map((tab) => tab.count), [2, undefined], 'a count of 0 is left out');
        assert.equal(document.shell.storefront, 'https://shop.test/en/');
        assert.deepEqual(document.stores.map((store) => [store.id, store.name, store.home]), [
            [1, 'English', 'https://shop.test/en/'],
            [2, 'Deutsch', 'https://shop.test/de/'],
        ]);
        assert.equal(document.phrases.get('page.title'), 'Reports');
        assert.equal(document.url('data'), 'https://admin.test/admin/vendor/reports/data/key/d1/');
        assert.equal(document.formKey, 'form-key-1');
        assert.equal(document.allows('edit'), true);
        assert.equal(document.allows('export'), false);
        assert.deepEqual(document.data, { rows: [] });
    });

    it('turns a link into the keyed address of its screen with its parameters as a query', () => {
        const document = parsePageDocument(moduleDocument({}), spec);

        assert.equal(document.link(withParam(linkTo('vendor/reports/index'), 'page', 'home')), `${REPORTS}?page=home`);
        assert.equal(document.link(linkTo('adminhtml/system_config/edit')), null, 'a screen the admin may not open');
    });

    it('refuses a document without an endpoint the page calls, naming it', () => {
        refusedAt({ ...moduleDocument({}), urls: {} }, '$["urls"]["data"]');
    });

    it('refuses a document without a permission the page asks about, naming it', () => {
        refusedAt({ ...moduleDocument({}), permissions: { edit: true } }, '$["permissions"]["export"]');
        refusedAt({ ...moduleDocument({}), permissions: { edit: true, export: 'no' } }, '$["permissions"]["export"]');
    });

    it('reads a tab without a count, as an older server prints it, as one with nothing waiting', () => {
        const printed = moduleDocument({});
        const document = parsePageDocument({
            ...printed,
            shell: { module: 'Vendor Module', page: 'Reports', nav: [{ code: 'reports', label: 'Reports', url: REPORTS, current: true }], storefront: '' },
        }, spec);

        assert.equal(document.shell.nav[0]?.count, undefined);
        assert.equal(Object.hasOwn(document.shell.nav[0] ?? {}, 'count'), false);
    });

    it('refuses a tab whose count is not a whole number, naming it', () => {
        refusedAt({
            ...moduleDocument({}),
            shell: { module: 'Vendor Module', page: 'Reports', nav: [{ code: 'reports', label: 'Reports', url: REPORTS, current: true, count: '2' }], storefront: '' },
        }, '$["shell"]["nav"][0]["count"]');
    });

    it('refuses a store view without a whole-number id', () => {
        refusedAt({ ...moduleDocument({}), stores: [{ id: 1.5, name: 'English', home: '' }] }, '$["stores"][0]["id"]');
    });

    it('hands the page\'s data to the page\'s own reader, at its path', () => {
        const paths: string[] = [];
        parsePageDocument(moduleDocument({}), { ...spec, data: (_value: unknown, path: string) => paths.push(path) });

        assert.deepEqual(paths, ['$["data"]']);
    });
});
