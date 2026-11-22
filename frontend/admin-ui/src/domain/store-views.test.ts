/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
    ALL_STORE_VIEWS,
    storeViewFromOption,
    storeViewOf,
    storeViewOption,
    storeViewOptions,
    type StoreView,
} from '@hryvinskyi/admin-ui';

const STORES: readonly StoreView[] = [
    { id: 1, name: 'English', website: 'Main', locale: 'en_US' },
    { id: 2, name: 'Deutsch', locale: 'de_DE' },
    { id: 12, name: 'Trade' },
];

describe('store-view choice', () => {
    it('gives every store view together the option value all, and a view its id as digits', () => {
        assert.equal(storeViewOption(null), ALL_STORE_VIEWS);
        assert.equal(storeViewOption(12), '12');
    });

    it('reads an option value back into the choice, and nothing for a value that names neither', () => {
        assert.equal(storeViewFromOption('all', STORES), null);
        assert.equal(storeViewFromOption('2', STORES), 2);
        assert.equal(storeViewFromOption('7', STORES), undefined);
        assert.equal(storeViewFromOption('02', STORES), undefined);
        assert.equal(storeViewFromOption('', STORES), undefined);
    });

    it('finds the view a choice names; every view and an unlisted id name none', () => {
        assert.deepEqual(storeViewOf(STORES, 2), STORES[1]);
        assert.equal(storeViewOf(STORES, null), null);
        assert.equal(storeViewOf(STORES, 99), null);
    });

    it('offers every view together first when it has a label, then each view by name in the given order', () => {
        assert.deepEqual(storeViewOptions(STORES, 'All store views'), [
            { value: 'all', label: 'All store views' },
            { value: '1', label: 'English' },
            { value: '2', label: 'Deutsch' },
            { value: '12', label: 'Trade' },
        ]);
        assert.deepEqual(storeViewOptions(STORES, null).map((option) => option.value), ['1', '2', '12']);
        assert.deepEqual(storeViewOptions([], null), []);
    });
});
