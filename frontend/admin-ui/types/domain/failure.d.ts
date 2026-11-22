/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
/**
 * What a page says when a request failed. Two kinds need the person to do something other than try again — the
 * session ended, or their role does not allow the request — and have the kit's own words (`kit.failure.*`); any
 * other kind keeps the words of the place that failed ("The numbers could not be loaded").
 */
import type { RequestFailure } from './request-error.ts';
import type { Translator } from './translator.ts';
/** Whether trying again can help: not when the session ended or the role forbids it. */
export declare const canRetry: (failure: RequestFailure) => boolean;
/**
 * The words for a failure: the kind's own, from the kit's translator, or the place's when the kind has none.
 *
 * @param kit The kit's translator (`useKit().translator`).
 * @param placeText The words of the place that failed; translated.
 */
export declare function failureText(failure: RequestFailure, kit: Translator, placeText: string): string;
