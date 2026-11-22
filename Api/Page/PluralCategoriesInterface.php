<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Api\Page;

/**
 * The plural categories of the Unicode CLDR a language sorts numbers into
 *
 * English has two (`one`, `other`); Ukrainian sorts whole numbers into `one`, `few` and `many`; Latvian has `zero`;
 * Slovenian `two`. A text that depends on a count needs one form per category its language uses.
 *
 * @api
 */
interface PluralCategoriesInterface
{
    public const ZERO = 'zero';
    public const ONE = 'one';
    public const TWO = 'two';
    public const FEW = 'few';
    public const MANY = 'many';
    public const OTHER = 'other';

    /**
     * Get the categories a locale sorts whole numbers into
     *
     * @param string $locale A locale code such as `uk_UA`; an unknown one has the categories of the root locale
     * @return list<string> The categories in CLDR order: zero, one, two, few, many, other
     */
    public function categories(string $locale): array;

    /**
     * Get the category a number falls into in a locale
     *
     * @param string $locale A locale code such as `uk_UA`
     * @param int|float $number
     * @return string One of the category constants
     */
    public function categoryOf(string $locale, int|float $number): string;
}
