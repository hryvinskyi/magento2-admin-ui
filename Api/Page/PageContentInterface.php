<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Api\Page;

/**
 * What one module page hands its island, besides its wording and the frame every page of the module shares: the
 * addresses of its endpoints, the screens it links to, its first data and its two lines
 *
 * Addresses are built on the server with the admin URL builder, secret key included (KeyedAdminUrlInterface); the
 * island never assembles the path of one. The screens a page links to are listed by route path; the page document
 * carries the keyed address of each one the signed-in admin may open, and the island appends a link's parameters to
 * it as a query.
 *
 * @phpstan-import-type JsonLevel5 from IslandInterface
 * @api
 */
interface PageContentInterface
{
    /**
     * Get the addresses of the page's endpoints, by the name the island knows each by
     *
     * @return array<string, string>
     */
    public function getUrls(): array;

    /**
     * Get the route paths (`route_id/controller/action`) of the screens the page links to
     *
     * @return list<string>
     */
    public function getRoutes(): array;

    /**
     * Get the page's first data, so the island draws without a round trip
     *
     * Plain JSON data, five array levels below its own keys, as it sits one level inside the island's document.
     *
     * @return array<string, JsonLevel5>
     */
    public function getData(): array;

    /**
     * Get the line shown while the island loads
     *
     * @return string Translated
     */
    public function getLoadingText(): string;

    /**
     * Get the line the island shows when it cannot start
     *
     * @return string Translated
     */
    public function getFailedText(): string;
}
