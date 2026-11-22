<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Test\Unit\ViewModel;

use Hryvinskyi\AdminUi\Model\Page\ImportMapBuilder;
use Hryvinskyi\AdminUi\Model\Page\KitPhrases;
use Hryvinskyi\AdminUi\Model\Page\ModuleScript;
use Hryvinskyi\AdminUi\Test\Unit\Fake\EscaperFake;
use Hryvinskyi\AdminUi\Test\Unit\Fake\FixtureIsland;
use Hryvinskyi\AdminUi\Test\Unit\Fake\LocaleFake;
use Hryvinskyi\AdminUi\Test\Unit\Fake\StaticRepository;
use Hryvinskyi\AdminUi\Test\Unit\Fake\TagRenderer;
use Hryvinskyi\AdminUi\ViewModel\IslandPage;
use Magento\Backend\Block\Template;
use Magento\Framework\Escaper;
use Magento\Framework\Serialize\Serializer\JsonHexTag;
use PHPUnit\Framework\TestCase;

/**
 * The island template rendered with the view model over a renderer that prints each tag as asked and a static
 * repository: for the contract's island it prints the page contract the browser's island start is tested against,
 * byte for byte; it escapes the island's lines, and refuses a block without the view model or a page not opened
 */
class IslandTemplateTest extends TestCase
{
    private const TEMPLATE = __DIR__ . '/../../../view/adminhtml/templates/island.phtml';
    private const CONTRACT = __DIR__ . '/../../_contract/island-page.html';
    private const HOSTILE = '"><script>alert(1)</script> & \'single\'';

    /**
     * The contract's island prints `Test/_contract/island-page.html` exactly: the island's stylesheet, the root with
     * the kit's class and the failure text, the loading line, the tag-safe document, then the map and the entry
     *
     * @return void
     */
    public function testContractIslandPrintsThePageContract(): void
    {
        $page = $this->page();
        $page->open(new FixtureIsland());

        $expected = file_get_contents(self::CONTRACT);
        self::assertIsString($expected);
        self::assertSame($expected, $this->render($page));
    }

    /**
     * The island's lines are printed as text: nothing in them can open an element or leave an attribute
     *
     * @return void
     */
    public function testLinesAreEscaped(): void
    {
        $page = $this->page();
        $page->open(new FixtureIsland(loadingText: self::HOSTILE, failedText: self::HOSTILE));

        $html = $this->render($page);

        self::assertStringNotContainsString('<script>alert', $html);
        $document = new \DOMDocument();
        $errors = libxml_use_internal_errors(true);
        $document->loadHTML(
            '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>' . $html . '</body></html>'
        );
        libxml_clear_errors();
        libxml_use_internal_errors($errors);
        $xpath = new \DOMXPath($document);
        $root = $xpath->query('//div[@data-role="test-island"]');
        self::assertInstanceOf(\DOMNodeList::class, $root);
        $root = $root->item(0);
        self::assertInstanceOf(\DOMElement::class, $root);
        self::assertSame(self::HOSTILE, $root->getAttribute('data-failed-text'));
        $loading = $xpath->query('//p[@data-role="test-island-loading"]');
        self::assertInstanceOf(\DOMNodeList::class, $loading);
        $loading = $loading->item(0);
        self::assertInstanceOf(\DOMElement::class, $loading);
        self::assertSame(self::HOSTILE, $loading->textContent);
    }

    /**
     * A page printed before its controller opened it is a fault, not an empty page
     *
     * @return void
     */
    public function testUnopenedPageFails(): void
    {
        $this->expectException(\LogicException::class);
        $this->expectExceptionMessage('before its controller opened it');

        $this->render($this->page());
    }

    /**
     * The template refuses a block without the view model rather than print a page without its island
     *
     * @return void
     */
    public function testTemplateNeedsTheViewModel(): void
    {
        $block = $this->createMock(Template::class);
        $block->method('getData')->willReturn(null);

        $this->expectException(\LogicException::class);
        $this->expectExceptionMessage('needs the island page view model');

        $this->include($block, new EscaperFake());
    }

    /**
     * The view model over the real map, module script and kit phrases, a renderer that prints each tag as asked and
     * a static repository, for an admin working in English
     *
     * @return IslandPage
     */
    private function page(): IslandPage
    {
        $repository = new StaticRepository();

        return new IslandPage(
            new ModuleScript(new ImportMapBuilder($repository, new JsonHexTag()), $repository, new TagRenderer()),
            new KitPhrases(),
            new LocaleFake('en_US'),
            $repository,
            new JsonHexTag()
        );
    }

    /**
     * Render the template for a block carrying the view model
     *
     * @param IslandPage $page
     * @return string
     */
    private function render(IslandPage $page): string
    {
        $block = $this->createMock(Template::class);
        $block->method('getData')->willReturnCallback(
            static fn (string $key = ''): ?IslandPage => $key === 'view_model' ? $page : null
        );

        return $this->include($block, new EscaperFake());
    }

    /**
     * Run the template with the variables the platform's template engine gives it
     *
     * @param Template $block
     * @param Escaper $escaper
     * @return string
     */
    private function include(Template $block, Escaper $escaper): string
    {
        $level = ob_get_level();
        ob_start();
        try {
            (static function (Template $block, Escaper $escaper): void {
                include self::TEMPLATE;
            })($block, $escaper);
        } finally {
            $html = '';
            while (ob_get_level() > $level) {
                $html = (string) ob_get_clean() . $html;
            }
        }

        return $html;
    }
}
