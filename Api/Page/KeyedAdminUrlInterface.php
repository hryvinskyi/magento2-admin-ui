<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Api\Page;

/**
 * The address of an admin route with the session's secret key in it, whatever the shared URL builder was left with
 *
 * The backend URL builder is one object for the whole request, and its secret-key switch persists between calls: one
 * piece of the page may switch keys off for an address of its own and leave them off. Every address an island page
 * prints comes from here, so it carries its key whatever ran before it, and the switch is left as it was found for
 * whatever runs after it. Where the admin uses no secret keys at all, the address carries none, as every other admin
 * address of the request.
 *
 * @api
 */
interface KeyedAdminUrlInterface
{
    /**
     * Get the address, with the secret key of its route
     *
     * @param string $route `route_id/controller/action`, written with the route id, never the front name
     * @param array<string,string> $params The route's parameters, as the URL builder takes them (path segments;
     *     `_fragment` and its other reserved names work as they do there)
     * @return string
     */
    public function getUrl(string $route, array $params = []): string;
}
