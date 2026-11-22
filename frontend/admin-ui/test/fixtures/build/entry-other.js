/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/** A second entry that bundles the same module as the first. */
import { twice } from './common.js';

export const echo = (text) => twice(text);
