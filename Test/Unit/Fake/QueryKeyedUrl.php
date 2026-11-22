<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Test\Unit\Fake;

use Hryvinskyi\AdminUi\Api\Page\KeyedAdminUrlInterface;

/**
 * Keyed addresses a test can read: `keyed:<route>`, then the parameters as a query
 */
class QueryKeyedUrl implements KeyedAdminUrlInterface
{
    /**
     * @inheritDoc
     */
    public function getUrl(string $route, array $params = []): string
    {
        return 'keyed:' . $route . ($params === [] ? '' : '?' . http_build_query($params));
    }
}
