<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Api\Page;

/**
 * The admin screens a module's island pages may link to, each with the permission that opens it
 *
 * A page links only to screens the signed-in admin may open: a screen the role does not allow has no address, so the
 * page draws no link to it. A route the list does not hold is a wiring fault and fails loudly rather than being left
 * out silently. Each module lists its own screens (a virtual type of the implementation with its own resources).
 *
 * @api
 */
interface AdminRoutesInterface
{
    /**
     * Whether the signed-in admin may open the screen
     *
     * @param string $route `route_id/controller/action`, written with the route id
     * @return bool
     * @throws \InvalidArgumentException When the route is not one of the listed screens
     */
    public function isAllowed(string $route): bool;

    /**
     * Get the keyed addresses of the screens the signed-in admin may open, by route; the others are left out
     *
     * @param list<string> $routes
     * @return array<string, string>
     * @throws \InvalidArgumentException When a route is not one of the listed screens
     */
    public function allowedUrls(array $routes): array;

    /**
     * Get the keyed address of a screen with its parameters; null when the signed-in admin may not open it
     *
     * @param string $route
     * @param array<string,string> $params
     * @return string|null
     * @throws \InvalidArgumentException When the route is not one of the listed screens
     */
    public function url(string $route, array $params = []): ?string;
}
