<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Model\Page;

use Hryvinskyi\AdminUi\Api\Page\PluralCategoriesInterface;
use Hryvinskyi\AdminUi\Api\Page\PluralPhrasesInterface;
use Magento\Framework\Phrase;
use Magento\Framework\TranslateInterface;

/**
 * Count texts in the forms of the admin's language, read from the dictionaries of the locale active at each call
 *
 * The categories are those of the translator's locale, the language whose dictionaries the rows are read from (in
 * the admin, the admin user's interface locale), so a form is never looked up in a language it does not belong to.
 *
 * A further category is translated from its marked row (`%1 products [plural:few]`); a row the dictionary does not
 * translate renders as its own key, and is then left out of an island's forms and replaced by the `other` form in a
 * sentence.
 */
class PluralPhrases implements PluralPhrasesInterface
{
    private const CATEGORY_SEPARATOR = '.';

    /**
     * @param TranslateInterface $translator The translator whose dictionaries the phrases are rendered from
     * @param PluralCategoriesInterface $categories
     */
    public function __construct(
        private readonly TranslateInterface $translator,
        private readonly PluralCategoriesInterface $categories
    ) {
    }

    /**
     * @inheritDoc
     */
    public function forms(string $key, Phrase $one, Phrase $other): array
    {
        $forms = [
            $key . self::CATEGORY_SEPARATOR . PluralCategoriesInterface::ONE => $one->render(),
            $key . self::CATEGORY_SEPARATOR . PluralCategoriesInterface::OTHER => $other->render(),
        ];
        $further = array_diff(
            $this->categories->categories($this->translator->getLocale()),
            [PluralCategoriesInterface::ONE, PluralCategoriesInterface::OTHER]
        );
        foreach ($further as $category) {
            $text = $this->translated($other, $category);
            if ($text !== null) {
                $forms[$key . self::CATEGORY_SEPARATOR . $category] = $text;
            }
        }

        return $forms;
    }

    /**
     * @inheritDoc
     */
    public function sentence(int|float $count, Phrase $one, Phrase $other): string
    {
        $category = $this->categories->categoryOf($this->translator->getLocale(), $count);
        if ($category === PluralCategoriesInterface::ONE) {
            return $one->render();
        }
        $text = $category === PluralCategoriesInterface::OTHER ? null : $this->translated($other, $category);

        return $text ?? $other->render();
    }

    /**
     * The translation of a further category's row, filled with the `other` form's arguments
     *
     * Null when the dictionary does not translate the row.
     *
     * @param Phrase $other
     * @param string $category
     * @return string|null
     */
    private function translated(Phrase $other, string $category): ?string
    {
        $source = sprintf(self::CATEGORY_KEY, $other->getText(), $category);
        if (__($source)->render() === $source) {
            return null;
        }

        return __($source, $other->getArguments())->render();
    }
}
