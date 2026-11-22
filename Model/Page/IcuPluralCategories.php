<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Model\Page;

use Hryvinskyi\AdminUi\Api\Page\PluralCategoriesInterface;

/**
 * The plural rules of ICU, the library behind PHP's intl extension, which carries the CLDR rules of every locale
 *
 * A locale's categories are the ones its rules give the whole numbers 0 to 200, a thousand and a million: CLDR's
 * rules for whole numbers look at the last two digits, a range below twenty, or a whole million, so these numbers
 * reach every category a count can take. A category only fractions take (Ukrainian `other`, Czech `many`) is not
 * among them. The answer for a locale is kept for the life of the instance, as the rules never change while it runs.
 */
class IcuPluralCategories implements PluralCategoriesInterface
{
    private const PATTERN = '{0,plural,zero{zero} one{one} two{two} few{few} many{many} other{other}}';
    private const ORDER = [self::ZERO, self::ONE, self::TWO, self::FEW, self::MANY, self::OTHER];
    private const SMALLEST = 0;
    private const LARGEST_SMALL = 200;
    private const LARGE = [1000, 1000000];

    /**
     * The categories found for each locale asked about
     *
     * @var array<string, list<string>>
     */
    private array $found = [];

    /**
     * @inheritDoc
     */
    public function categories(string $locale): array
    {
        if (isset($this->found[$locale])) {
            return $this->found[$locale];
        }
        $taken = [];
        foreach ([...range(self::SMALLEST, self::LARGEST_SMALL), ...self::LARGE] as $number) {
            $taken[$this->categoryOf($locale, $number)] = true;
        }

        return $this->found[$locale] = array_values(
            array_filter(self::ORDER, static fn (string $category): bool => isset($taken[$category]))
        );
    }

    /**
     * @inheritDoc
     */
    public function categoryOf(string $locale, int|float $number): string
    {
        $category = \MessageFormatter::formatMessage($locale, self::PATTERN, [$number]);

        return is_string($category) && in_array($category, self::ORDER, true) ? $category : self::OTHER;
    }
}
