<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Test\Unit\Fake;

use Hryvinskyi\AdminUi\Api\Page\StoreViewListInterface;

/**
 * A shop's store views that answers the views and the default home page it was given
 *
 * @phpstan-import-type PageStoreView from StoreViewListInterface
 */
class FixedStoreViews implements StoreViewListInterface
{
    /**
     * @var list<PageStoreView>
     */
    private readonly array $views;

    /**
     * @param list<PageStoreView> $views In the order the shop sorts them
     * @param string $defaultHome The default store view's home page
     */
    public function __construct(array $views, private readonly string $defaultHome)
    {
        $this->views = $views;
    }

    /**
     * @inheritDoc
     */
    public function all(): array
    {
        return $this->views;
    }

    /**
     * @inheritDoc
     */
    public function defaultHome(): string
    {
        return $this->defaultHome;
    }
}
