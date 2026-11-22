<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Model\Page;

use Hryvinskyi\AdminUi\Api\Page\StoreViewListInterface;
use Magento\Framework\UrlInterface;
use Magento\Store\Api\Data\StoreInterface;
use Magento\Store\Model\Store;
use Magento\Store\Model\StoreManagerInterface;

/**
 * The store views the store manager knows, each with its storefront home page as a link-type base address
 *
 * The store manager leaves the admin's own view out of its list. A store view the manager hands back as something
 * other than the platform's store model has no home page to give, and sorts with order 0.
 */
class StoreViewList implements StoreViewListInterface
{
    /**
     * @param StoreManagerInterface $storeManager
     */
    public function __construct(private readonly StoreManagerInterface $storeManager)
    {
    }

    /**
     * @inheritDoc
     */
    public function all(): array
    {
        $stores = array_values($this->storeManager->getStores());
        usort(
            $stores,
            static fn (StoreInterface $left, StoreInterface $right): int => [
                $left instanceof Store ? (int) $left->getSortOrder() : 0,
                (int) $left->getId(),
            ] <=> [
                $right instanceof Store ? (int) $right->getSortOrder() : 0,
                (int) $right->getId(),
            ]
        );

        return array_map(
            fn (StoreInterface $store): array => [
                'id' => (int) $store->getId(),
                'name' => (string) $store->getName(),
                'home' => $this->home($store),
            ],
            $stores
        );
    }

    /**
     * @inheritDoc
     */
    public function defaultHome(): string
    {
        $store = $this->storeManager->getDefaultStoreView();

        return $store === null ? '' : $this->home($store);
    }

    /**
     * The address of a store view's storefront home page
     *
     * @param StoreInterface $store
     * @return string
     */
    private function home(StoreInterface $store): string
    {
        return $store instanceof Store ? (string) $store->getBaseUrl(UrlInterface::URL_TYPE_LINK) : '';
    }
}
