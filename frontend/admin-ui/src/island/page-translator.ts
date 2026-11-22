/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * A page's phrase lookup: the page's own phrases, which arrive translated in its document, read with the kit's
 * translator rules (positional placeholders, one key per plural form, the locale's numbers and lists). A key the
 * document lacks shows as the key itself, so the gap is visible, and is reported once.
 */
import { createTranslator, type Translator } from '../domain/translator.ts';
import type { Logger } from './start-island.tsx';

export function createPageTranslator(locale: string, phrases: ReadonlyMap<string, string>, logger: Logger): Translator {
    return createTranslator({
        locale,
        phrases,
        onMissing: (key: string): void => logger.error(`The page's document holds no phrase "${key}".`),
    });
}
