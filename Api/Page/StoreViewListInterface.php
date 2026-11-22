<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Api\Page;

/**
 * The shop's store views as an island page lists them: `{"id", "name", "home"}`, `home` the address of the view's
 * storefront home page, in the order the store views are sorted
 *
 * @phpstan-type PageStoreView array{id: int, name: string, home: string}
 * @api
 */
interface StoreViewListInterface
{
    /**
     * Get every store view of the shop, the admin's own left out, by sort order and then by id
     *
     * @return list<PageStoreView>
     */
    public function all(): array;

    /**
     * Get the storefront home page of the default store view; empty when the shop has none
     *
     * @return string
     */
    public function defaultHome(): string;
}
