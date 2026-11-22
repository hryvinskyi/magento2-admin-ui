/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
/**
 * How long a typed text is against the length a field allows. Characters are counted as the server counts them, by
 * code point, so an emoji or an accented letter typed as one counts once. The text is never cut: whether a text
 * past the limit can be saved is the caller's decision.
 */
/** Within the limit, within its last tenth, or past it. */
export type LengthState = 'within' | 'near' | 'over';
/** The number of characters (code points) in `text`. */
export declare function characterCount(text: string): number;
/** Where `count` characters stand against `max`: past it, within its last tenth, or within it. */
export declare function lengthState(count: number, max: number): LengthState;
