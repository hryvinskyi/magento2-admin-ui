/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
/**
 * A colour typed as six hexadecimal digits after `#` (`#8c4a2b`), the one form a colour field accepts. The check is
 * feedback while typing; the server that stores the value checks it again and stays the authority on what is kept.
 */
import type { Brand } from './brand.ts';
/** `#` and six lower-case hexadecimal digits. */
export type HexColour = Brand<string, 'HexColour'>;
/** The colour typed, in lower case, without the spaces around it; null for anything but `#` and six digits. */
export declare function parseHexColour(text: string): HexColour | null;
