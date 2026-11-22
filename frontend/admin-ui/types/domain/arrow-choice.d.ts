/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
/** The value an arrow key selects next; null for any other key, or a current value the group does not hold. */
export declare function choiceAfterKey(values: readonly string[], current: string, key: string): string | null;
/**
 * The value a key selects next in a tab list: the arrow keys as `choiceAfterKey`, Home the first value, End the
 * last. Null for any other key, or a current value the list does not hold.
 */
export declare function tabAfterKey(values: readonly string[], current: string, key: string): string | null;
