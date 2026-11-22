<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Test\Integration\Page;

use Hryvinskyi\AdminUi\Api\Page\StoreViewListInterface;
use Magento\Store\Api\Data\StoreInterface;
use Magento\Store\Model\StoreManagerInterface;
use Magento\TestFramework\Fixture\AppArea;
use Magento\TestFramework\Helper\Bootstrap;
use PHPUnit\Framework\TestCase;

/**
 * The store views an island page lists, read through the real store manager of the installed shop: every store view
 * but the admin's, each with its id, name and storefront home page, and the default view's home page on its own
 */
#[AppArea('adminhtml')]
class StoreViewListTest extends TestCase
{
    public function testListsTheShopsStoreViewsWithTheirHomePagesAndTheDefaultOnesHome(): void
    {
        $objectManager = Bootstrap::getObjectManager();
        $list = $objectManager->get(StoreViewListInterface::class);
        self::assertInstanceOf(StoreViewListInterface::class, $list);
        $stores = $objectManager->get(StoreManagerInterface::class);
        self::assertInstanceOf(StoreManagerInterface::class, $stores);
        $default = $stores->getDefaultStoreView();
        self::assertInstanceOf(StoreInterface::class, $default);

        $views = $list->all();
        $byId = array_column($views, null, 'id');

        self::assertArrayNotHasKey(0, $byId, 'the admin\'s own view is left out');
        self::assertArrayHasKey((int) $default->getId(), $byId);
        $first = $byId[(int) $default->getId()];
        self::assertSame((string) $default->getName(), $first['name']);
        self::assertStringStartsWith('http', $first['home']);
        self::assertSame($first['home'], $list->defaultHome());
    }
}
