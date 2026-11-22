<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Api\Page;

/**
 * The wording the kit's browser components show, translated for the island's document
 *
 * Each read translates into the locale active at that moment, so a shared instance never answers in the locale of the
 * request that built it.
 *
 * @api
 */
interface KitPhrasesInterface
{
    /**
     * Get every phrase the kit's components ask for, translated
     *
     * @return array<string, string> Translated texts keyed by the phrase keys the kit's components ask for (`kit.*`)
     */
    public function getPhrases(): array;
}
