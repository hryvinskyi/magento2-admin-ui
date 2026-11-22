<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Api\Page;

use Magento\Framework\Phrase;

/**
 * A text that depends on a count, in every form the admin's language has, translated in the admin's locale
 *
 * The admin's language is the translator's locale: the language whose dictionaries the rows are read from.
 *
 * A dictionary row is keyed by the English text, and English has two forms: the `one` text and the `other` text.
 * Every further CLDR category a language uses (`zero`, `two`, `few`, `many`) is a dictionary row of its own, keyed by
 * the `other` text with the category in brackets after it (CATEGORY_KEY): `%1 products [plural:few]`. A dictionary
 * translates that row into the language's form for the category; `en_US.csv` maps it to the `other` text, so a
 * dictionary written from it starts from the English wording. A category whose row the admin's dictionary lacks is
 * never shown as its key: the `other` form stands for it.
 *
 * The marked keys are made at run time, so `bin/magento i18n:collect-phrases` does not list them; the rows are kept
 * beside the `other` row in each dictionary by hand.
 *
 * Every read translates into the locale active at that moment, so a shared instance never answers in the locale of
 * the request that built it.
 *
 * @api
 */
interface PluralPhrasesInterface
{
    /**
     * The source text of a further category's row: the `other` text, then ` [plural:<category>]`
     */
    public const CATEGORY_KEY = '%s [plural:%s]';

    /**
     * Get every form of a count text the admin's language has, for an island's document
     *
     * The browser kit's translator picks `<key>.<category>` for a count with the locale's plural rules and falls back
     * to `<key>.other`, so the island asks for the text with `tn('<key>', count)`.
     *
     * @param string $key The phrase key the island asks for, without a category
     * @param Phrase $one The English `one` form, such as `__('%1 product')`
     * @param Phrase $other The English `other` form, such as `__('%1 products')`
     * @return array<string, string> `<key>.one`, `<key>.other`, and `<key>.<category>` for each further category the
     *     admin's language sorts whole numbers into and its dictionary translates
     */
    public function forms(string $key, Phrase $one, Phrase $other): array;

    /**
     * Get the form of a count text a number takes in the admin's language, translated and filled with its arguments
     *
     * @param int|float $count The number that chooses the form
     * @param Phrase $one The English `one` form with its arguments, such as `__('%1 page', $count)`
     * @param Phrase $other The English `other` form with its arguments, such as `__('%1 pages', $count)`; a further
     *     category's row is filled with these arguments
     * @return string
     */
    public function sentence(int|float $count, Phrase $one, Phrase $other): string;
}
