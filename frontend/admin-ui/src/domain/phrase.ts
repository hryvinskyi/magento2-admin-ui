/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * A sentence chosen by a pure module and worded by the page: the key of one of the page's phrases and the values
 * that fill its placeholders (`%1` … `%n`). Pure modules hold no words; they pick which sentence applies.
 */
import type { PhraseParam } from './translator.ts';

export interface Phrase {
    readonly key: string;
    readonly params: readonly PhraseParam[];
}

export const phrase = (key: string, ...params: readonly PhraseParam[]): Phrase => ({ key, params });
