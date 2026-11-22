<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Test\Unit\ViewModel;

use Hryvinskyi\AdminUi\Api\Exception\InvalidIslandException;
use Hryvinskyi\AdminUi\Api\Page\IslandPageInterface;
use Hryvinskyi\AdminUi\Model\Page\ImportMapBuilder;
use Hryvinskyi\AdminUi\Model\Page\KitPhrases;
use Hryvinskyi\AdminUi\Model\Page\ModuleScript;
use Hryvinskyi\AdminUi\Test\Unit\Fake\CountingIsland;
use Hryvinskyi\AdminUi\Test\Unit\Fake\FixtureIsland;
use Hryvinskyi\AdminUi\Test\Unit\Fake\LocaleFake;
use Hryvinskyi\AdminUi\Test\Unit\Fake\StaticRepository;
use Hryvinskyi\AdminUi\Test\Unit\Fake\TagRenderer;
use Hryvinskyi\AdminUi\ViewModel\IslandPage;
use Magento\Framework\Serialize\Serializer\JsonHexTag;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

/**
 * The island page: opening reads and checks every part of the island, refuses each fault with its reason before
 * anything is rendered, puts the kit's modules first in the map and writes the document with the admin's locale and
 * the kit's phrases; it holds one island, and nothing can be printed before it is opened
 */
class IslandPageTest extends TestCase
{
    /**
     * Prints and records the map and the entry tags
     *
     * @var TagRenderer
     */
    private TagRenderer $renderer;

    /**
     * Resolves the modules and stylesheets
     *
     * @var StaticRepository
     */
    private StaticRepository $repository;

    /**
     * @inheritDoc
     */
    protected function setUp(): void
    {
        $this->renderer = new TagRenderer();
        $this->repository = new StaticRepository();
    }

    /**
     * The opened page keeps the name, the root's classes after the kit's, the stylesheet addresses, the document and
     * the two lines
     *
     * @return void
     */
    public function testOpenedPageKeepsWhatItPrints(): void
    {
        $page = $this->page('uk_UA');
        $page->open(new FixtureIsland());

        self::assertSame('test-island', $page->getName());
        self::assertSame('hui test-island', $page->getRootClass());
        self::assertSame([StaticRepository::BASE . 'Test_Module/css/island.css'], $page->getStylesheets());
        self::assertSame('Loading the test page…', $page->getLoadingText());
        self::assertSame(
            'The test page could not be loaded. Reload the page to try again.',
            $page->getFailedText()
        );
        self::assertSame(
            [
                'kit' => ['locale' => 'uk_UA', 'phrases' => (new KitPhrases())->getPhrases()],
                'page' => (new FixtureIsland())->getConfig(),
            ],
            json_decode($page->getConfigJson(), true, 512, JSON_THROW_ON_ERROR)
        );
        self::assertStringNotContainsString('<b>', $page->getConfigJson());
    }

    /**
     * Opening reads each part of the island once; printing reads none
     *
     * @return void
     */
    public function testEachPartIsReadOnce(): void
    {
        $island = new CountingIsland(new FixtureIsland());
        $page = $this->page();
        $page->open($island);
        $page->getName();
        $page->getConfigJson();
        $page->getScripts();

        self::assertSame(
            [
                'getConfig' => 1,
                'getEntry' => 1,
                'getFailedText' => 1,
                'getImports' => 1,
                'getLoadingText' => 1,
                'getName' => 1,
                'getRootClass' => 1,
                'getStyles' => 1,
            ],
            (static function (array $reads): array {
                ksort($reads);

                return $reads;
            })($island->reads)
        );
    }

    /**
     * The import map lists the kit's four modules first, then the island's own; the entry follows the map
     *
     * @return void
     */
    public function testKitModulesLeadTheMap(): void
    {
        $page = $this->page();
        $page->open(new FixtureIsland(imports: [
            '@test/island-part' => 'Test_Module::js/island-part.js',
            '@test/other' => 'Test_Module::js/other.js',
        ]));

        self::assertCount(2, $this->renderer->asked);
        $map = json_decode((string) $this->renderer->asked[0]['content'], true, 512, JSON_THROW_ON_ERROR);
        self::assertIsArray($map);
        self::assertIsArray($map['imports'] ?? null);
        self::assertSame(
            [...array_keys(IslandPageInterface::KIT_IMPORTS), '@test/island-part', '@test/other'],
            array_keys($map['imports'])
        );
        self::assertSame(
            StaticRepository::BASE . 'Hryvinskyi_AdminUi/js/admin-ui/kit.js',
            $map['imports'][IslandPageInterface::KIT_SPECIFIER]
        );
        self::assertSame(
            ['type' => 'module', 'src' => StaticRepository::BASE . 'Test_Module/js/island.js'],
            $this->renderer->asked[1]['attributes']
        );
        self::assertSame(
            '<script type="importmap">' . $this->renderer->asked[0]['content'] . '</script>'
            . '<script type="module" src="' . StaticRepository::BASE . 'Test_Module/js/island.js"></script>',
            $page->getScripts()
        );
    }

    /**
     * An island without its own root class, modules or stylesheets, whose configuration is empty, still prints the
     * kit's root class, the kit's map and the page's part as an empty object
     *
     * @return void
     */
    public function testBareIsland(): void
    {
        $page = $this->page();
        $page->open(new FixtureIsland(rootClass: '', imports: [], styles: [], config: []));

        self::assertSame('hui', $page->getRootClass());
        self::assertSame([], $page->getStylesheets());
        self::assertStringEndsWith(',"page":{}}', $page->getConfigJson());
        $map = json_decode((string) $this->renderer->asked[0]['content'], true, 512, JSON_THROW_ON_ERROR);
        self::assertIsArray($map);
        self::assertIsArray($map['imports'] ?? null);
        self::assertSame(array_keys(IslandPageInterface::KIT_IMPORTS), array_keys($map['imports']));
    }

    /**
     * Each fault of the island fails opening with its reason, naming the value, and nothing is rendered or kept
     *
     * @param FixtureIsland $island
     * @param string $reason
     * @param string $named What the message names
     * @return void
     */
    #[DataProvider('faults')]
    public function testFaultFailsOpening(FixtureIsland $island, string $reason, string $named): void
    {
        $page = $this->page();

        try {
            $page->open($island);
            self::fail('An island with a fault was opened.');
        } catch (InvalidIslandException $fault) {
            self::assertSame($reason, $fault->getReason());
            self::assertStringContainsString($named, $fault->getMessage());
        }
        self::assertSame([], $this->renderer->asked);
        $this->expectException(\LogicException::class);
        $page->getName();
    }

    /**
     * Islands with one fault each
     *
     * @return array<string, array{FixtureIsland, string, string}>
     */
    public static function faults(): array
    {
        $holder = new \stdClass();
        $holder->when = new \DateTimeImmutable('2026-01-01');

        return [
            'capitalised name' => [
                new FixtureIsland(name: 'Test-island'),
                InvalidIslandException::REASON_NAME,
                '"Test-island"',
            ],
            'name starting with a digit' => [
                new FixtureIsland(name: '1island'),
                InvalidIslandException::REASON_NAME,
                '"1island"',
            ],
            'empty name' => [new FixtureIsland(name: ''), InvalidIslandException::REASON_NAME, '""'],
            'name with a space' => [
                new FixtureIsland(name: 'test island'),
                InvalidIslandException::REASON_NAME,
                '"test island"',
            ],
            'name with an underscore' => [
                new FixtureIsland(name: 'test_island'),
                InvalidIslandException::REASON_NAME,
                '"test_island"',
            ],
            'name of 65 characters' => [
                new FixtureIsland(name: 'a' . str_repeat('b', 64)),
                InvalidIslandException::REASON_NAME,
                'a' . str_repeat('b', 64),
            ],
            'capitalised root class' => [
                new FixtureIsland(rootClass: 'Test'),
                InvalidIslandException::REASON_ROOT_CLASS,
                '"Test"',
            ],
            'root classes split by two spaces' => [
                new FixtureIsland(rootClass: 'one  two'),
                InvalidIslandException::REASON_ROOT_CLASS,
                '"one  two"',
            ],
            'root class with a leading space' => [
                new FixtureIsland(rootClass: ' one'),
                InvalidIslandException::REASON_ROOT_CLASS,
                '" one"',
            ],
            'root class with a quote' => [
                new FixtureIsland(rootClass: 'one"two'),
                InvalidIslandException::REASON_ROOT_CLASS,
                'one"two',
            ],
            'entry without a module' => [
                new FixtureIsland(entry: 'js/island.js'),
                InvalidIslandException::REASON_IMPORT,
                '"js/island.js"',
            ],
            'stylesheet as entry' => [
                new FixtureIsland(entry: 'Test_Module::css/island.css'),
                InvalidIslandException::REASON_IMPORT,
                '"Test_Module::css/island.css"',
            ],
            'relative import' => [
                new FixtureIsland(imports: ['./part.js' => 'Test_Module::js/part.js']),
                InvalidIslandException::REASON_IMPORT,
                '"./part.js"',
            ],
            'import of an address' => [
                new FixtureIsland(imports: ['part' => 'https://cdn.test/part.js']),
                InvalidIslandException::REASON_IMPORT,
                '"https://cdn.test/part.js"',
            ],
            'the UI library redefined' => [
                new FixtureIsland(imports: ['preact' => 'Test_Module::js/preact.js']),
                InvalidIslandException::REASON_IMPORT,
                '"preact"',
            ],
            'the kit redefined' => [
                new FixtureIsland(imports: ['@hryvinskyi/admin-ui' => 'Test_Module::js/kit.js']),
                InvalidIslandException::REASON_IMPORT,
                '"@hryvinskyi/admin-ui"',
            ],
            'script as stylesheet' => [
                new FixtureIsland(styles: ['Test_Module::js/island.js']),
                InvalidIslandException::REASON_STYLE,
                '"Test_Module::js/island.js"',
            ],
            'stylesheet without a module' => [
                new FixtureIsland(styles: ['css/island.css']),
                InvalidIslandException::REASON_STYLE,
                '"css/island.css"',
            ],
            'stylesheet leaving the module' => [
                new FixtureIsland(styles: ['Test_Module::../etc/island.css']),
                InvalidIslandException::REASON_STYLE,
                '"Test_Module::../etc/island.css"',
            ],
            'object in the configuration' => [
                new FixtureIsland(config: ['meta' => $holder]),
                InvalidIslandException::REASON_CONFIG,
                'page.meta.when',
            ],
            'number JSON cannot hold' => [
                new FixtureIsland(config: ['ratio' => NAN]),
                InvalidIslandException::REASON_CONFIG,
                '"test-island"',
            ],
        ];
    }

    /**
     * A page holds one island: opening it again is refused, whichever island is offered
     *
     * @return void
     */
    public function testSecondOpenIsRefused(): void
    {
        $page = $this->page();
        $page->open(new FixtureIsland());

        try {
            $page->open(new FixtureIsland(name: 'other-island'));
            self::fail('A second island was opened on one page.');
        } catch (InvalidIslandException $fault) {
            self::fail('A second island was refused as a declaration fault: ' . $fault->getMessage());
        } catch (\LogicException $refused) {
            self::assertStringContainsString('"test-island"', $refused->getMessage());
        }
        self::assertSame('test-island', $page->getName());
    }

    /**
     * An island that failed to open leaves the page free for one that opens
     *
     * @return void
     */
    public function testFailedOpeningLeavesThePageFree(): void
    {
        $page = $this->page();
        try {
            $page->open(new FixtureIsland(name: 'Wrong'));
        } catch (InvalidIslandException) {
            // The page stays unopened; the next island opens it.
        }

        $page->open(new FixtureIsland());

        self::assertSame('test-island', $page->getName());
    }

    /**
     * Every getter the template reads refuses to answer before the page is opened
     *
     * @param string $getter
     * @return void
     */
    #[DataProvider('getters')]
    public function testGetterBeforeOpeningFails(string $getter): void
    {
        $page = $this->page();
        $read = [
            'getName' => static fn (): string => $page->getName(),
            'getRootClass' => static fn (): string => $page->getRootClass(),
            'getStylesheets' => static fn (): array => $page->getStylesheets(),
            'getConfigJson' => static fn (): string => $page->getConfigJson(),
            'getScripts' => static fn (): string => $page->getScripts(),
            'getLoadingText' => static fn (): string => $page->getLoadingText(),
            'getFailedText' => static fn (): string => $page->getFailedText(),
        ];

        $this->expectException(\LogicException::class);
        $this->expectExceptionMessage('before its controller opened it');

        $read[$getter]();
    }

    /**
     * The getters the template reads
     *
     * @return array<string, array{string}>
     */
    public static function getters(): array
    {
        $getters = [
            'getName',
            'getRootClass',
            'getStylesheets',
            'getConfigJson',
            'getScripts',
            'getLoadingText',
            'getFailedText',
        ];

        return array_combine($getters, array_map(static fn (string $getter): array => [$getter], $getters));
    }

    /**
     * The page over the real map, module script and kit phrases, a recording renderer and a static repository
     *
     * @param string $locale The admin user's locale
     * @return IslandPage
     */
    private function page(string $locale = 'en_US'): IslandPage
    {
        return new IslandPage(
            new ModuleScript(
                new ImportMapBuilder($this->repository, new JsonHexTag()),
                $this->repository,
                $this->renderer
            ),
            new KitPhrases(),
            new LocaleFake($locale),
            $this->repository,
            new JsonHexTag()
        );
    }
}
