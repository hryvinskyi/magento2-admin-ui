<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Test\Integration\Page;

use Hryvinskyi\AdminUi\Api\Page\IslandPageInterface;
use Hryvinskyi\AdminUi\Test\Unit\Fake\DictionaryRenderer;
use Hryvinskyi\AdminUi\Test\Unit\Fake\FixtureIsland;
use Magento\Backend\Model\Auth;
use Magento\Framework\App\Area;
use Magento\Framework\App\Response\Http as HttpResponse;
use Magento\Framework\Locale\ResolverInterface;
use Magento\Framework\Phrase;
use Magento\Framework\Phrase\RendererInterface;
use Magento\Framework\View\DesignInterface;
use Magento\Framework\View\Result\Page;
use Magento\Framework\View\Result\PageFactory;
use Magento\TestFramework\Bootstrap as TestBootstrap;
use Magento\TestFramework\Fixture\AppArea;
use Magento\TestFramework\Fixture\AppIsolation;
use Magento\TestFramework\Fixture\DbIsolation;
use Magento\TestFramework\Helper\Bootstrap;
use PHPUnit\Framework\TestCase;

/**
 * A fixture island opened on the shared island page and rendered through a real admin page with the island handle:
 * the kit's stylesheet is linked before the island's, the root carries `hui`, the document holds the admin's locale
 * and the kit's phrases translated, and the import map lists the kit's four modules first, then the entry module
 */
#[AppArea('adminhtml'), AppIsolation(true), DbIsolation(true)]
class IslandLayoutTest extends TestCase
{
    /**
     * The renderer phrases had before the test
     *
     * @var RendererInterface|null
     */
    private ?RendererInterface $renderer = null;

    /**
     * Remember the renderer and sign in as the administrator who opens the page
     *
     * @return void
     */
    protected function setUp(): void
    {
        $this->renderer = Phrase::getRenderer();
        $this->auth()->login(TestBootstrap::ADMIN_NAME, TestBootstrap::ADMIN_PASSWORD);
    }

    /**
     * Sign out and restore the renderer
     *
     * @return void
     */
    protected function tearDown(): void
    {
        $this->auth()->logout();
        if ($this->renderer !== null) {
            Phrase::setRenderer($this->renderer);
        }
    }

    /**
     * The page prints the island as the handle and the opened page say
     *
     * @return void
     */
    public function testIslandPrintedThroughTheHandle(): void
    {
        $objectManager = Bootstrap::getObjectManager();
        $design = $objectManager->get(DesignInterface::class);
        self::assertInstanceOf(DesignInterface::class, $design);
        $design->setDesignTheme('Magento/backend', Area::AREA_ADMINHTML);
        Phrase::setRenderer(new DictionaryRenderer(['Yes' => 'Так', 'Keep the stored secret' => 'Залишити секрет']));
        $islandPage = $objectManager->get(IslandPageInterface::class);
        self::assertInstanceOf(IslandPageInterface::class, $islandPage);
        $islandPage->open(new FixtureIsland(
            entry: 'Hryvinskyi_AdminUi::js/test/island.js',
            imports: ['@test/island-part' => 'Hryvinskyi_AdminUi::js/test/island-part.js'],
            styles: ['Hryvinskyi_AdminUi::css/test/island.css']
        ));

        $xpath = $this->render();

        $hrefs = array_map(
            static fn (\DOMElement $link): string => $link->getAttribute('href'),
            $this->elements($xpath, '//link[@rel="stylesheet"]')
        );
        $kit = $this->position($hrefs, '/Hryvinskyi_AdminUi/css/admin-ui.css');
        $island = $this->position($hrefs, '/Hryvinskyi_AdminUi/css/test/island.css');
        self::assertLessThan($island, $kit, 'the kit\'s stylesheet is linked before the island\'s');

        $roots = $this->elements($xpath, '//div[@data-role="test-island"]');
        self::assertCount(1, $roots);
        self::assertSame(['hui', 'test-island'], preg_split('/\s+/', trim($roots[0]->getAttribute('class'))));
        self::assertSame(
            'The test page could not be loaded. Reload the page to try again.',
            $roots[0]->getAttribute('data-failed-text')
        );
        $loading = $this->elements($xpath, '//div[@data-role="test-island"]/p[@data-role="test-island-loading"]');
        self::assertCount(1, $loading);
        self::assertSame('Loading the test page…', $loading[0]->textContent);

        $documents = $this->elements(
            $xpath,
            '//div[@data-role="test-island"]/script[@type="application/json"][@data-role="test-island-config"]'
        );
        self::assertCount(1, $documents);
        $document = json_decode($documents[0]->textContent, true, 512, JSON_THROW_ON_ERROR);
        self::assertIsArray($document);
        $locale = $objectManager->get(ResolverInterface::class);
        self::assertInstanceOf(ResolverInterface::class, $locale);
        self::assertIsArray($document['kit'] ?? null);
        self::assertSame($locale->getLocale(), $document['kit']['locale'] ?? null);
        self::assertIsArray($document['kit']['phrases'] ?? null);
        self::assertSame('Так', $document['kit']['phrases']['kit.switch.yes'] ?? null);
        self::assertSame('Залишити секрет', $document['kit']['phrases']['kit.secret.keep'] ?? null);
        self::assertSame((new FixtureIsland())->getConfig(), $document['page'] ?? null);

        $maps = $this->elements($xpath, '//script[@type="importmap"]');
        self::assertCount(1, $maps);
        $map = json_decode($maps[0]->textContent, true, 512, JSON_THROW_ON_ERROR);
        self::assertIsArray($map);
        self::assertIsArray($map['imports'] ?? null);
        self::assertSame(
            [...array_keys(IslandPageInterface::KIT_IMPORTS), '@test/island-part'],
            array_keys($map['imports'])
        );
        foreach (IslandPageInterface::KIT_IMPORTS as $specifier => $fileId) {
            $address = $map['imports'][$specifier] ?? null;
            self::assertIsString($address);
            self::assertStringContainsString('/' . str_replace('::', '/', $fileId), $address);
        }
        $entries = $this->elements($xpath, '//script[@type="module"]');
        self::assertCount(1, $entries);
        self::assertStringContainsString('/Hryvinskyi_AdminUi/js/test/island.js', $entries[0]->getAttribute('src'));
    }

    /**
     * Render an admin page with the island handle into a response, as a page controller's result would be
     *
     * @return \DOMXPath
     */
    private function render(): \DOMXPath
    {
        $objectManager = Bootstrap::getObjectManager();
        $factory = $objectManager->get(PageFactory::class);
        self::assertInstanceOf(PageFactory::class, $factory);
        $page = $factory->create();
        self::assertInstanceOf(Page::class, $page);
        $page->addHandle('hryvinskyi_admin_ui_island');
        $response = $objectManager->create(HttpResponse::class);
        self::assertInstanceOf(HttpResponse::class, $response);
        $page->renderResult($response);
        $html = (string) $response->getBody();

        $document = new \DOMDocument();
        $errors = libxml_use_internal_errors(true);
        $document->loadHTML($html);
        libxml_clear_errors();
        libxml_use_internal_errors($errors);

        return new \DOMXPath($document);
    }

    /**
     * Find the elements an XPath expression selects
     *
     * @param \DOMXPath $xpath
     * @param string $expression
     * @return list<\DOMElement>
     */
    private function elements(\DOMXPath $xpath, string $expression): array
    {
        $found = [];
        $nodes = $xpath->query($expression);
        foreach ($nodes === false ? [] : $nodes as $node) {
            if ($node instanceof \DOMElement) {
                $found[] = $node;
            }
        }

        return $found;
    }

    /**
     * The position of the first address ending in the given path
     *
     * @param list<string> $addresses
     * @param string $path
     * @return int
     */
    private function position(array $addresses, string $path): int
    {
        foreach ($addresses as $position => $address) {
            if (str_ends_with((string) strtok($address, '?'), $path)) {
                return $position;
            }
        }
        self::fail(sprintf('No stylesheet ending in %s is linked: %s', $path, implode(', ', $addresses)));
    }

    /**
     * The admin session's authentication
     *
     * @return Auth
     */
    private function auth(): Auth
    {
        $auth = Bootstrap::getObjectManager()->get(Auth::class);
        self::assertInstanceOf(Auth::class, $auth);

        return $auth;
    }
}
