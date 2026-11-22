<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Test\Integration\Page;

use Hryvinskyi\AdminUi\Api\Page\PluralPhrasesInterface;
use Magento\Framework\TranslateInterface;
use Magento\TestFramework\Fixture\AppArea;
use Magento\TestFramework\Fixture\AppIsolation;
use Magento\TestFramework\Helper\Bootstrap;
use PHPUnit\Framework\TestCase;

/**
 * Count texts through the real container, PHP's ICU and the real translator: the forms follow the translator's
 * locale at the moment of the call, and a further category no dictionary translates is never shown as
 * its marked key
 */
#[AppArea('adminhtml'), AppIsolation(true)]
class PluralPhrasesTest extends TestCase
{
    /**
     * @var string The locale before the test
     */
    private string $locale = '';

    /**
     * @inheritDoc
     */
    protected function setUp(): void
    {
        $this->locale = $this->translator()->getLocale();
    }

    /**
     * @inheritDoc
     */
    protected function tearDown(): void
    {
        $this->translator()->setLocale($this->locale);
    }

    /**
     * In English the two forms are all there is
     *
     * @return void
     */
    public function testEnglishGetsTwoForms(): void
    {
        $this->translator()->setLocale('en_US');

        self::assertSame(
            ['things.one' => 'Nothing translates %1 thing here', 'things.other' => 'Nothing translates %1 things here'],
            $this->phrases()->forms(
                'things',
                __('Nothing translates %1 thing here'),
                __('Nothing translates %1 things here')
            )
        );
        self::assertSame('1 thing', $this->say(1, '%1 thing', '%1 things'));
        self::assertSame('2 things', $this->say(2, '%1 thing', '%1 things'));
    }

    /**
     * In Ukrainian a few and a many form are looked up, and with no row for them the browser falls back to `other`
     * and the server says the `other` form
     *
     * @return void
     */
    public function testAnUntranslatedCategoryFallsBackToOther(): void
    {
        $this->translator()->setLocale('uk_UA');

        $forms = $this->phrases()->forms(
            'things',
            __('Nothing translates %1 thing here'),
            __('Nothing translates %1 things here')
        );

        self::assertSame(['things.one', 'things.other'], array_keys($forms));
        self::assertSame(
            'Nothing translates 5 things here',
            $this->phrases()->sentence(
                5,
                __('Nothing translates %1 thing here', 5),
                __('Nothing translates %1 things here', 5)
            )
        );
    }

    /**
     * A sentence in the locale set now
     *
     * @param int $count
     * @param string $one
     * @param string $other
     * @return string
     */
    private function say(int $count, string $one, string $other): string
    {
        return $this->phrases()->sentence($count, __($one, $count), __($other, $count));
    }

    /**
     * @return PluralPhrasesInterface
     */
    private function phrases(): PluralPhrasesInterface
    {
        $phrases = Bootstrap::getObjectManager()->get(PluralPhrasesInterface::class);
        self::assertInstanceOf(PluralPhrasesInterface::class, $phrases);

        return $phrases;
    }

    /**
     * @return TranslateInterface
     */
    private function translator(): TranslateInterface
    {
        $translator = Bootstrap::getObjectManager()->get(TranslateInterface::class);
        self::assertInstanceOf(TranslateInterface::class, $translator);

        return $translator;
    }
}
