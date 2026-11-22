/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * A module page's document as the server's module page prints it, for tests: a module with a reports screen (two
 * things waiting on it) and a settings screen (none), two store views, one endpoint and two permissions, one of them refused. Each call returns a fresh
 * copy.
 */

/** The keyed address of the reports screen. */
export const REPORTS = 'https://admin.test/admin/vendor/reports/index/key/r1/';

export function moduleDocument(phrases: Readonly<Record<string, string>>): Record<string, unknown> {
    return {
        shell: {
            module: 'Vendor Module',
            page: 'Reports',
            nav: [
                { code: 'reports', label: 'Reports', url: REPORTS, current: true, count: 2 },
                { code: 'settings', label: 'Settings', url: 'https://admin.test/admin/admin/system_config/edit/key/c1/', current: false, count: 0 },
            ],
            storefront: 'https://shop.test/en/',
        },
        stores: [
            { id: 1, name: 'English', home: 'https://shop.test/en/' },
            { id: 2, name: 'Deutsch', home: 'https://shop.test/de/' },
        ],
        phrases,
        urls: { data: 'https://admin.test/admin/vendor/reports/data/key/d1/' },
        routes: { 'vendor/reports/index': REPORTS },
        formKey: 'form-key-1',
        permissions: { edit: true, export: false },
        data: { rows: [] },
    };
}
