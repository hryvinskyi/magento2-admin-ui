<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Model\Page;

use Hryvinskyi\AdminUi\Api\Page\AdminRoutesInterface;
use Hryvinskyi\AdminUi\Api\Page\KeyedAdminUrlInterface;
use Magento\Framework\AuthorizationInterface;

/**
 * The screens a module's pages link to, from the `resources` array argument (adminhtml `di.xml`): the ACL resource
 * that opens each screen, keyed by its route path `route_id/controller/action`
 *
 * Each module configures its own virtual type of this class; the instance with no resources knows no screen, so a
 * page wired to it fails on its first link.
 */
class AdminRoutes implements AdminRoutesInterface
{
    /**
     * @param AuthorizationInterface $authorization
     * @param KeyedAdminUrlInterface $urls
     * @param array<string,string> $resources The resource that opens each screen, keyed by route path
     */
    public function __construct(
        private readonly AuthorizationInterface $authorization,
        private readonly KeyedAdminUrlInterface $urls,
        private readonly array $resources = []
    ) {
    }

    /**
     * @inheritDoc
     */
    public function isAllowed(string $route): bool
    {
        $resource = $this->resources[$route] ?? null;
        if (!is_string($resource) || $resource === '') {
            throw new \InvalidArgumentException(sprintf(
                'The admin route "%s" is not one of the screens the module\'s pages link to.',
                $route
            ));
        }

        return $this->authorization->isAllowed($resource);
    }

    /**
     * @inheritDoc
     */
    public function allowedUrls(array $routes): array
    {
        $urls = [];
        foreach ($routes as $route) {
            $url = $this->url($route);
            if ($url !== null) {
                $urls[$route] = $url;
            }
        }

        return $urls;
    }

    /**
     * @inheritDoc
     */
    public function url(string $route, array $params = []): ?string
    {
        return $this->isAllowed($route) ? $this->urls->getUrl($route, $params) : null;
    }
}
