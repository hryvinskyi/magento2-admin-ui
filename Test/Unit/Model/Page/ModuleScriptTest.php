<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Test\Unit\Model\Page;

use Hryvinskyi\AdminUi\Api\Exception\InvalidIslandException;
use Hryvinskyi\AdminUi\Model\Page\ImportMapBuilder;
use Hryvinskyi\AdminUi\Model\Page\ModuleScript;
use Hryvinskyi\AdminUi\Test\Unit\Fake\StaticRepository;
use Hryvinskyi\AdminUi\Test\Unit\Fake\TagRenderer;
use Magento\Framework\Serialize\Serializer\JsonHexTag;
use PHPUnit\Framework\TestCase;

/**
 * The module tags: the import map as an inline script, then the entry as an external ES module, both through the
 * secure renderer, the entry's address from the asset repository
 */
class ModuleScriptTest extends TestCase
{
    /**
     * The map comes first with every import, the entry second, and nothing else is printed
     *
     * @return void
     */
    public function testMapThenEntry(): void
    {
        $renderer = new TagRenderer();
        $repository = new StaticRepository();
        $script = new ModuleScript(new ImportMapBuilder($repository, new JsonHexTag()), $repository, $renderer);

        $html = $script->render('Vendor_Module::js/entry.js', ['part' => 'Vendor_Module::js/part.js']);

        self::assertSame(
            '<script type="importmap">{"imports":{"part":"https:\/\/static.test\/adminhtml\/Magento\/backend\/en_US'
            . '\/Vendor_Module\/js\/part.js"}}</script>'
            . '<script type="module" src="' . StaticRepository::BASE . 'Vendor_Module/js/entry.js"></script>',
            $html
        );
        self::assertSame(
            [
                ['script', ['type' => 'importmap'], false],
                ['script', ['type' => 'module', 'src' => StaticRepository::BASE . 'Vendor_Module/js/entry.js'], false],
            ],
            array_map(
                static fn (array $tag): array => [$tag['tag'], $tag['attributes'], $tag['text']],
                $renderer->asked
            )
        );
        self::assertNull($renderer->asked[1]['content']);
    }

    /**
     * An entry that is not a module's file id fails naming it, before any tag is rendered
     *
     * @return void
     */
    public function testEntryThatIsNoFileIdFails(): void
    {
        $renderer = new TagRenderer();
        $repository = new StaticRepository();
        $script = new ModuleScript(new ImportMapBuilder($repository, new JsonHexTag()), $repository, $renderer);

        try {
            $script->render('js/entry.js', []);
            self::fail('An entry that is no file id was rendered.');
        } catch (InvalidIslandException $fault) {
            self::assertSame(InvalidIslandException::REASON_IMPORT, $fault->getReason());
            self::assertStringContainsString('"js/entry.js"', $fault->getMessage());
        }
        self::assertSame([], $renderer->asked);
        self::assertSame([], $repository->resolved);
    }

    /**
     * A wrong import fails before any tag is rendered
     *
     * @return void
     */
    public function testWrongImportFailsBeforeRendering(): void
    {
        $renderer = new TagRenderer();
        $repository = new StaticRepository();
        $script = new ModuleScript(new ImportMapBuilder($repository, new JsonHexTag()), $repository, $renderer);

        $this->expectException(InvalidIslandException::class);

        try {
            $script->render('Vendor_Module::js/entry.js', ['./part.js' => 'Vendor_Module::js/part.js']);
        } finally {
            self::assertSame([], $renderer->asked);
        }
    }
}
