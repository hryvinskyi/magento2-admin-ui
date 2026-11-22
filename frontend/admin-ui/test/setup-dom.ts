/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * Gives every test process a DOM (document, window, events) for the tests that render components. Pure-module
 * tests never touch it.
 *
 * Once a test file's tests have run, the DOM is closed: its timers (a request's deadline among them) would otherwise
 * keep the test process waiting long after the last test.
 */
import { after } from 'node:test';
import { GlobalRegistrator } from '@happy-dom/global-registrator';

GlobalRegistrator.register({ url: 'https://admin.test/', width: 1280, height: 900 });

after(async () => {
    await GlobalRegistrator.unregister();
});
