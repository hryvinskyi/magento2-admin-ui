<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Test\Integration;

use Hryvinskyi\AdminUi\Api\Page\AdminRoutesInterface;
use Hryvinskyi\AdminUi\Api\Page\ImportMapBuilderInterface;
use Hryvinskyi\AdminUi\Api\Page\IslandPageInterface;
use Hryvinskyi\AdminUi\Api\Page\KeyedAdminUrlInterface;
use Hryvinskyi\AdminUi\Api\Page\KitPhrasesInterface;
use Hryvinskyi\AdminUi\Api\Page\ModuleNavigationInterface;
use Hryvinskyi\AdminUi\Api\Page\ModuleScriptInterface;
use Hryvinskyi\AdminUi\Api\Page\PagePermissionsInterface;
use Hryvinskyi\AdminUi\Api\Page\PluralCategoriesInterface;
use Hryvinskyi\AdminUi\Api\Page\PluralPhrasesInterface;
use Hryvinskyi\AdminUi\Api\Page\StoreViewListInterface;
use Hryvinskyi\AdminUi\Model\Page\AdminRoutes;
use Hryvinskyi\AdminUi\Model\Page\IcuPluralCategories;
use Hryvinskyi\AdminUi\Model\Page\ImportMapBuilder;
use Hryvinskyi\AdminUi\Model\Page\KeyedAdminUrl;
use Hryvinskyi\AdminUi\Model\Page\KitPhrases;
use Hryvinskyi\AdminUi\Model\Page\ModuleNavigation;
use Hryvinskyi\AdminUi\Model\Page\ModuleScript;
use Hryvinskyi\AdminUi\Model\Page\PagePermissions;
use Hryvinskyi\AdminUi\Model\Page\PluralPhrases;
use Hryvinskyi\AdminUi\Model\Page\StoreViewList;
use Hryvinskyi\AdminUi\ViewModel\IslandPage;
use Magento\TestFramework\Fixture\AppArea;
use Magento\TestFramework\Fixture\AppIsolation;
use Magento\TestFramework\Helper\Bootstrap;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

/**
 * Every published contract of the page host resolves through the real container to its implementation, and the
 * island page a controller receives is the very instance the island handle's layout hands the template
 */
#[AppArea('adminhtml'), AppIsolation(true)]
class PortsResolveTest extends TestCase
{
    /**
     * The contract resolves to the module's implementation
     *
     * @param class-string $contract
     * @param class-string $implementation
     * @return void
     */
    #[DataProvider('contracts')]
    public function testContractResolves(string $contract, string $implementation): void
    {
        $resolved = Bootstrap::getObjectManager()->get($contract);

        self::assertInstanceOf($contract, $resolved);
        self::assertInstanceOf($implementation, $resolved);
    }

    /**
     * The published contracts and their implementations
     *
     * @return array<string, array{class-string, class-string}>
     */
    public static function contracts(): array
    {
        return [
            'import map' => [ImportMapBuilderInterface::class, ImportMapBuilder::class],
            'module script' => [ModuleScriptInterface::class, ModuleScript::class],
            'island page' => [IslandPageInterface::class, IslandPage::class],
            'kit phrases' => [KitPhrasesInterface::class, KitPhrases::class],
            'keyed admin url' => [KeyedAdminUrlInterface::class, KeyedAdminUrl::class],
            'admin routes' => [AdminRoutesInterface::class, AdminRoutes::class],
            'module navigation' => [ModuleNavigationInterface::class, ModuleNavigation::class],
            'page permissions' => [PagePermissionsInterface::class, PagePermissions::class],
            'store view list' => [StoreViewListInterface::class, StoreViewList::class],
            'plural categories' => [PluralCategoriesInterface::class, IcuPluralCategories::class],
            'plural phrases' => [PluralPhrasesInterface::class, PluralPhrases::class],
        ];
    }

    /**
     * A controller's island page and the layout's view model are one shared instance
     *
     * @return void
     */
    public function testControllerAndLayoutShareThePage(): void
    {
        $objectManager = Bootstrap::getObjectManager();

        self::assertSame($objectManager->get(IslandPageInterface::class), $objectManager->get(IslandPage::class));
    }
}
