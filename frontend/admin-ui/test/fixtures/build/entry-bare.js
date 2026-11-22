/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/** An entry that reaches the shared sources through their bare specifier. */
import { greet } from '@fixture/shared';
import { twice } from './common.js';

export const hello = (name) => twice(greet(name));
