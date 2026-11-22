<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Test\Unit\Model\Page;

use Hryvinskyi\AdminUi\Model\Page\KitPhrases;
use Hryvinskyi\AdminUi\Test\Unit\Fake\DictionaryRenderer;
use Magento\Framework\Phrase;
use Magento\Framework\Phrase\RendererInterface;
use PHPUnit\Framework\TestCase;

/**
 * The kit's phrases: exactly the keys the kit's components ask for — the shared list both languages are held to,
 * `Test/_contract/kit-phrases.json` — each with a text, translated on every read
 */
class KitPhrasesTest extends TestCase
{
    private const CONTRACT = __DIR__ . '/../../../_contract/kit-phrases.json';

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
     * The phrases hold the contract's keys, no other, each with a text
     *
     * @return void
     */
    public function testHoldsExactlyTheKitKeys(): void
    {
        $contract = json_decode((string) file_get_contents(self::CONTRACT), true, 512, JSON_THROW_ON_ERROR);
        self::assertIsArray($contract);
        $keys = $contract['keys'] ?? null;
        self::assertIsArray($keys);

        $phrases = (new KitPhrases())->getPhrases();

        $expected = array_values($keys);
        sort($expected);
        $actual = array_keys($phrases);
        sort($actual);
        self::assertSame($expected, $actual);
        foreach ($phrases as $key => $text) {
            self::assertNotSame('', trim($text), sprintf('The kit phrase %s has no text.', $key));
        }
        self::assertSame('Keep the stored secret', $phrases['kit.secret.keep']);
        self::assertSame('Yes', $phrases['kit.switch.yes']);
        self::assertSame('Close', $phrases['kit.drawer.close']);
        self::assertSame('Try again', $phrases['kit.state.retry']);
    }

    /**
     * A phrase the browser fills keeps its placeholders, so the kit's translator can put the numbers and names in
     *
     * @return void
     */
    public function testKeepsThePlaceholdersTheBrowserFills(): void
    {
        $phrases = (new KitPhrases())->getPhrases();

        self::assertSame('%1–%2 of %3', $phrases['kit.pager.range']);
        self::assertSame('%1 of %2 characters', $phrases['kit.text.count']);
        self::assertSame('Select %1', $phrases['kit.select.row']);
        self::assertSame('%1%', $phrases['kit.chart.share']);
        self::assertSame('Values of the chart: %1', $phrases['kit.chart.values']);
    }

    /**
     * A placeholder phrase is translated as a whole, its placeholders left for the browser
     *
     * @return void
     */
    public function testTranslatesPlaceholderPhrases(): void
    {
        Phrase::setRenderer(new DictionaryRenderer(['%1–%2 of %3' => '%1–%2 з %3']));

        self::assertSame('%1–%2 з %3', (new KitPhrases())->getPhrases()['kit.pager.range']);
    }

    /**
     * One instance answers in the locale active at each read, not the one it first read in
     *
     * @return void
     */
    public function testTranslatesOnEveryRead(): void
    {
        $phrases = new KitPhrases();
        Phrase::setRenderer(new DictionaryRenderer(['Yes' => 'Так', 'No' => 'Ні']));
        $first = $phrases->getPhrases();
        Phrase::setRenderer(new DictionaryRenderer(['Yes' => 'Ja', 'No' => 'Nein']));
        $second = $phrases->getPhrases();

        self::assertSame(['Так', 'Ні'], [$first['kit.switch.yes'], $first['kit.switch.no']]);
        self::assertSame(['Ja', 'Nein'], [$second['kit.switch.yes'], $second['kit.switch.no']]);
        self::assertSame('Replace', $second['kit.secret.replace']);
    }
}
