/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { addressOf, isContractError, linkTo, resolveLink, screenLink, withParam } from '@hryvinskyi/admin-ui';

const KEYED = 'https://shop.test/admin/vendor/reports/index/key/abc123/';

describe('a link to another admin screen', () => {
    it('is the keyed address itself when it has no parameters', () => {
        assert.equal(addressOf(KEYED, new Map()), KEYED);
    });

    it('carries its parameters as a query after the keyed path, encoded', () => {
        const params = new Map([['mode', 'catalog'], ['page', 'product:12'], ['store', '2']]);

        assert.equal(addressOf(KEYED, params), `${KEYED}?mode=catalog&page=product%3A12&store=2`);
    });

    it('adds to a query the address already has', () => {
        assert.equal(addressOf('https://shop.test/a?x=1', new Map([['y', 'a b']])), 'https://shop.test/a?x=1&y=a%20b');
    });

    it('has an address only for a screen the keyed addresses list', () => {
        const routes = new Map([['vendor/reports/index', KEYED]]);

        assert.equal(resolveLink(routes, linkTo('vendor/reports/index')), KEYED);
        assert.equal(resolveLink(routes, linkTo('adminhtml/system_config/edit')), null);
    });

    it('sets one parameter, replacing the one of the same name and keeping the others', () => {
        const link = withParam({ route: 'r/c/a', params: new Map([['store', '1'], ['page', 'home']]) }, 'store', '3');

        assert.deepEqual([...link.params], [['store', '3'], ['page', 'home']]);
    });

    it('is read from the server\'s route and parameters, refusing a link without a route', () => {
        const link = screenLink({ route: 'vendor/reports/index', params: { store: '2' } }, '$.link');

        assert.equal(link.route, 'vendor/reports/index');
        assert.deepEqual([...link.params], [['store', '2']]);
        assert.throws(
            () => screenLink({ route: '', params: {} }, '$.link'),
            (error: unknown) => isContractError(error) && error.path === '$.link["route"]',
        );
    });
});
