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
use Hryvinskyi\AdminUi\Test\Unit\Fake\StaticRepository;
use Magento\Framework\Serialize\Serializer\JsonHexTag;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

/**
 * The import map: addresses from the asset repository in the order given, an entry that is not a bare specifier mapped
 * to a module's file id refused by name, and the map written tag-safe, empty as `{}`
 */
class ImportMapBuilderTest extends TestCase
{
    /**
     * Every specifier keeps its place, and each address is the repository's for its file id
     *
     * @return void
     */
    public function testAddressesKeepTheOrderGiven(): void
    {
        $repository = new StaticRepository();
        $builder = new ImportMapBuilder($repository, new JsonHexTag());

        $addresses = $builder->addresses([
            'preact' => 'Vendor_Module::js/vendor/preact.js',
            '@scope/part' => 'Vendor_Module::js/part.mjs',
            'preact/hooks' => 'Vendor_Module::js/vendor/preact-hooks.js',
        ]);

        self::assertSame(
            [
                'preact' => StaticRepository::BASE . 'Vendor_Module/js/vendor/preact.js',
                '@scope/part' => StaticRepository::BASE . 'Vendor_Module/js/part.mjs',
                'preact/hooks' => StaticRepository::BASE . 'Vendor_Module/js/vendor/preact-hooks.js',
            ],
            $addresses
        );
        self::assertSame(
            [
                'Vendor_Module::js/vendor/preact.js',
                'Vendor_Module::js/part.mjs',
                'Vendor_Module::js/vendor/preact-hooks.js',
            ],
            $repository->resolved
        );
    }

    /**
     * An entry whose key is not a bare specifier, or whose value is not a module's file id, fails naming the entry
     *
     * @param string $specifier
     * @param string $fileId
     * @return void
     */
    #[DataProvider('wrongEntries')]
    public function testWrongEntryFailsNamingIt(string $specifier, string $fileId): void
    {
        $repository = new StaticRepository();
        $builder = new ImportMapBuilder($repository, new JsonHexTag());

        try {
            $builder->addresses(['preact' => 'Vendor_Module::js/preact.js', $specifier => $fileId]);
            self::fail('A wrong import map entry was resolved.');
        } catch (InvalidIslandException $fault) {
            self::assertSame(InvalidIslandException::REASON_IMPORT, $fault->getReason());
            self::assertStringContainsString('"' . $specifier . '"', $fault->getMessage());
            self::assertStringContainsString('"' . $fileId . '"', $fault->getMessage());
        }
    }

    /**
     * Keys that are no bare specifier, and values that are no module's file id
     *
     * @return array<string, array{string, string}>
     */
    public static function wrongEntries(): array
    {
        return [
            'relative specifier' => ['./part.js', 'Vendor_Module::js/part.js'],
            'absolute specifier' => ['/js/part.js', 'Vendor_Module::js/part.js'],
            'address as specifier' => ['https://cdn.test/part.js', 'Vendor_Module::js/part.js'],
            'capitalised specifier' => ['Preact', 'Vendor_Module::js/part.js'],
            'address as file id' => ['part', 'https://cdn.test/part.js'],
            'file id without module' => ['part', 'js/part.js'],
            'file id leaving the module' => ['part', 'Vendor_Module::js/../../etc/part.js'],
            'stylesheet as file id' => ['part', 'Vendor_Module::css/part.css'],
        ];
    }

    /**
     * The map is `{"imports": {…}}` with `<` and `>` escaped, and an empty one is an object, not a list
     *
     * @return void
     */
    public function testJsonIsTagSafeAndAnEmptyMapIsAnObject(): void
    {
        $builder = new ImportMapBuilder(new StaticRepository(), new JsonHexTag());

        self::assertSame('{"imports":{}}', $builder->json([]));
        $json = $builder->json(['part' => 'https://static.test/</script>.js']);
        self::assertStringNotContainsString('</script>', $json);
        self::assertSame(
            ['imports' => ['part' => 'https://static.test/</script>.js']],
            json_decode($json, true, 512, JSON_THROW_ON_ERROR)
        );
    }
}
