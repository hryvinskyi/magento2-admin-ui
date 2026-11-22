<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Test\Unit\Model\Page;

use Hryvinskyi\AdminUi\Model\Page\IcuPluralCategories;
use Hryvinskyi\AdminUi\Model\Page\PluralPhrases;
use Hryvinskyi\AdminUi\Test\Unit\Fake\DictionaryRenderer;
use Hryvinskyi\AdminUi\Test\Unit\Fake\TranslatorFake;
use Magento\Framework\Phrase;
use Magento\Framework\Phrase\RendererInterface;
use PHPUnit\Framework\TestCase;

/**
 * Count texts in the forms of the admin's language: the English two, and each further category its dictionary
 * translates from the row keyed by the `other` text with the category in brackets
 */
class PluralPhrasesTest extends TestCase
{
    private const UKRAINIAN = [
        '%1 product' => '%1 товар',
        '%1 products' => '%1 товару',
        '%1 products [plural:few]' => '%1 товари',
        '%1 products [plural:many]' => '%1 товарів',
        '%1 of %2 products' => '%1 із %2 товару',
        '%1 of %2 products [plural:few]' => '%1 із %2 товарів',
        '%1 of %2 products [plural:many]' => '%1 із %2 товарів',
    ];

    /**
     * The renderer phrases had before the test
     *
     * @var RendererInterface|null
     */
    private ?RendererInterface $renderer = null;

    /**
     * @inheritDoc
     */
    protected function setUp(): void
    {
        $this->renderer = Phrase::getRenderer();
    }

    /**
     * @inheritDoc
     */
    protected function tearDown(): void
    {
        if ($this->renderer !== null) {
            Phrase::setRenderer($this->renderer);
        }
    }

    /**
     * English has the two forms it is written in, and nothing more
     *
     * @return void
     */
    public function testEnglishHasOneAndOther(): void
    {
        Phrase::setRenderer(new DictionaryRenderer([]));

        self::assertSame(
            ['products.one' => '%1 product', 'products.other' => '%1 products'],
            $this->phrases('en_US')->forms('products', __('%1 product'), __('%1 products'))
        );
    }

    /**
     * Ukrainian gets its few and many forms beside the two English keys, its placeholders left for the browser
     *
     * @return void
     */
    public function testAddsTheFurtherCategoriesOfTheLanguage(): void
    {
        Phrase::setRenderer(new DictionaryRenderer(self::UKRAINIAN));

        self::assertSame(
            [
                'products.one' => '%1 товар',
                'products.other' => '%1 товару',
                'products.few' => '%1 товари',
                'products.many' => '%1 товарів',
            ],
            $this->phrases('uk_UA')->forms('products', __('%1 product'), __('%1 products'))
        );
    }

    /**
     * A category whose row the dictionary lacks is left to the browser's fallback, never sent as its marked key
     *
     * @return void
     */
    public function testLeavesOutACategoryTheDictionaryDoesNotTranslate(): void
    {
        Phrase::setRenderer(new DictionaryRenderer(['%1 pages' => '%1 сторінки']));

        $forms = $this->phrases('uk_UA')->forms('pages', __('%1 page'), __('%1 pages'));

        self::assertSame(['pages.one', 'pages.other'], array_keys($forms));
    }

    /**
     * The server picks the form a count takes and fills the phrase's own arguments
     *
     * @return void
     */
    public function testPicksTheFormOfACount(): void
    {
        Phrase::setRenderer(new DictionaryRenderer(self::UKRAINIAN));
        $phrases = $this->phrases('uk_UA');
        $say = static fn (int $count): string => $phrases->sentence(
            $count,
            __('%1 product', $count),
            __('%1 products', $count)
        );

        self::assertSame(['1 товар', '3 товари', '5 товарів', '21 товар'], [$say(1), $say(3), $say(5), $say(21)]);
    }

    /**
     * The count that chooses the form need not be the first argument
     *
     * @return void
     */
    public function testTheCountNeedNotBeTheFirstArgument(): void
    {
        Phrase::setRenderer(new DictionaryRenderer(self::UKRAINIAN));

        self::assertSame(
            '7 із 22 товарів',
            $this->phrases('uk_UA')->sentence(22, __('%1 of %2 product', 7, 22), __('%1 of %2 products', 7, 22))
        );
    }

    /**
     * A fraction falls into Ukrainian `other`, which is the plain `other` row
     *
     * @return void
     */
    public function testAFractionTakesTheOtherRow(): void
    {
        Phrase::setRenderer(new DictionaryRenderer(self::UKRAINIAN));

        self::assertSame(
            '2.5 товару',
            $this->phrases('uk_UA')->sentence(2.5, __('%1 product', 2.5), __('%1 products', 2.5))
        );
    }

    /**
     * A sentence whose further row is missing says the `other` form rather than the marked key
     *
     * @return void
     */
    public function testAMissingRowSaysTheOtherForm(): void
    {
        Phrase::setRenderer(new DictionaryRenderer(['%1 pages' => '%1 сторінок']));

        self::assertSame('5 сторінок', $this->phrases('uk_UA')->sentence(5, __('%1 page', 5), __('%1 pages', 5)));
    }

    /**
     * One instance answers in the locale active at each call
     *
     * @return void
     */
    public function testFollowsTheLocaleOfEachCall(): void
    {
        Phrase::setRenderer(new DictionaryRenderer(self::UKRAINIAN));
        $locale = new TranslatorFake('en_US');
        $phrases = new PluralPhrases($locale, new IcuPluralCategories());

        $english = $phrases->forms('products', __('%1 product'), __('%1 products'));
        $locale->setLocale('uk_UA');
        $ukrainian = $phrases->forms('products', __('%1 product'), __('%1 products'));

        self::assertArrayNotHasKey('products.few', $english);
        self::assertSame('%1 товари', $ukrainian['products.few'] ?? null);
    }

    /**
     * The phrases in a locale
     *
     * @param string $locale
     * @return PluralPhrases
     */
    private function phrases(string $locale): PluralPhrases
    {
        return new PluralPhrases(new TranslatorFake($locale), new IcuPluralCategories());
    }
}
