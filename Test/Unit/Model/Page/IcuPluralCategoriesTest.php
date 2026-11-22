<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Test\Unit\Model\Page;

use Hryvinskyi\AdminUi\Model\Page\IcuPluralCategories;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

/**
 * The categories each locale sorts whole numbers into, and the category of one number, from ICU's CLDR rules
 */
class IcuPluralCategoriesTest extends TestCase
{
    /**
     * @param string $locale
     * @param list<string> $categories
     * @return void
     */
    #[DataProvider('locales')]
    public function testListsTheCategoriesWholeNumbersTake(string $locale, array $categories): void
    {
        self::assertSame($categories, (new IcuPluralCategories())->categories($locale));
    }

    /**
     * The locales the kit's dictionaries ship, by the shape of their rules
     *
     * @return array<string, array{string, list<string>}>
     */
    public static function locales(): array
    {
        return [
            'English: one and other' => ['en_US', ['one', 'other']],
            'German: one and other' => ['de_DE', ['one', 'other']],
            'Ukrainian: no other among whole numbers' => ['uk_UA', ['one', 'few', 'many']],
            'Polish: no other among whole numbers' => ['pl_PL', ['one', 'few', 'many']],
            'Czech: many only for fractions' => ['cs_CZ', ['one', 'few', 'other']],
            'Romanian: few up to 19, other from 20' => ['ro_RO', ['one', 'few', 'other']],
            'Latvian: zero' => ['lv_LV', ['zero', 'one', 'other']],
            'Slovenian: two' => ['sl_SI', ['one', 'two', 'few', 'other']],
            'Irish: five' => ['ga_IE', ['one', 'two', 'few', 'many', 'other']],
            'French: many for a whole million' => ['fr_FR', ['one', 'many', 'other']],
        ];
    }

    /**
     * @param string $locale
     * @param int|float $number
     * @param string $category
     * @return void
     */
    #[DataProvider('numbers')]
    public function testSortsANumber(string $locale, int|float $number, string $category): void
    {
        self::assertSame($category, (new IcuPluralCategories())->categoryOf($locale, $number));
    }

    /**
     * @return array<string, array{string, int|float, string}>
     */
    public static function numbers(): array
    {
        return [
            'English 1' => ['en_US', 1, 'one'],
            'English 0' => ['en_US', 0, 'other'],
            'Ukrainian 1' => ['uk_UA', 1, 'one'],
            'Ukrainian 3' => ['uk_UA', 3, 'few'],
            'Ukrainian 5' => ['uk_UA', 5, 'many'],
            'Ukrainian 21' => ['uk_UA', 21, 'one'],
            'Ukrainian 2.5' => ['uk_UA', 2.5, 'other'],
            'Romanian 19' => ['ro_RO', 19, 'few'],
            'Romanian 20' => ['ro_RO', 20, 'other'],
            'Latvian 10' => ['lv_LV', 10, 'zero'],
            'French 0' => ['fr_FR', 0, 'one'],
            'French a million' => ['fr_FR', 1000000, 'many'],
        ];
    }

    /**
     * A locale ICU does not know gets the root locale's single category rather than an error
     *
     * @return void
     */
    public function testAnUnknownLocaleHasOtherOnly(): void
    {
        self::assertSame(['other'], (new IcuPluralCategories())->categories('xx_XX'));
    }
}
