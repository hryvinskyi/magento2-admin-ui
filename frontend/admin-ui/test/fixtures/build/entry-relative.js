/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/** An entry that reaches into the shared sources by a relative path instead of their specifier. */
import { greet } from './shared/greeting.js';

export const hello = (name) => greet(name);
