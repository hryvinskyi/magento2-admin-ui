<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Api\Page;

/**
 * The wording one module page's island shows, translated for its document
 *
 * Each page translates exactly the keys its island asks for. Every read translates into the locale active at that
 * moment, so a shared instance never answers in the locale of the request that built it. The kit's own components
 * word themselves through the kit's phrases (KitPhrasesInterface), never through these.
 *
 * @api
 */
interface PagePhrasesInterface
{
    /**
     * Get every phrase the page's island asks for, translated
     *
     * @return array<string, string> Translated texts keyed by phrase key
     */
    public function getPhrases(): array;
}
