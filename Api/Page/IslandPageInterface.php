<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Api\Page;

use Hryvinskyi\AdminUi\Api\Exception\InvalidIslandException;

/**
 * The admin page that hosts one Preact island
 *
 * A page puts an island on itself in two steps: its layout takes the `hryvinskyi_admin_ui_island` handle, which links
 * the kit's stylesheet and places the island's block in the content, and its controller opens this page with the island
 * before it returns the page result. The page then prints the island's stylesheets after the kit's, the root
 * `<div data-role="<name>" class="hui <root class>">` holding the loading line and the island's document
 * `{"kit": {"locale": <the admin user's locale>, "phrases": {<the kit's phrases>}}, "page": <the island's config>}`,
 * and after the root the import map (the kit's modules first, then the island's) and the entry module.
 *
 * Everything that can be wrong with the island fails when the page is opened, so the request fails rather than a block
 * the layout would leave out of the page. One page holds one island.
 *
 * @api
 */
interface IslandPageInterface
{
    /**
     * The bare specifier the kit's components, wording and island start are imported by
     */
    public const KIT_SPECIFIER = '@hryvinskyi/admin-ui';

    /**
     * The kit's modules, first in every island page's import map: the UI library's three entry points, then the kit
     */
    public const KIT_IMPORTS = [
        'preact' => 'Hryvinskyi_AdminUi::js/admin-ui/vendor/preact.js',
        'preact/hooks' => 'Hryvinskyi_AdminUi::js/admin-ui/vendor/preact-hooks.js',
        'preact/jsx-runtime' => 'Hryvinskyi_AdminUi::js/admin-ui/vendor/preact-jsx-runtime.js',
        self::KIT_SPECIFIER => 'Hryvinskyi_AdminUi::js/admin-ui/kit.js',
    ];

    /**
     * Read the island once and keep everything the page prints for it
     *
     * @param IslandInterface $island
     * @return void
     * @throws InvalidIslandException When a part of the island cannot be printed: its name, root class, entry, an
     *     import (a kit specifier among them), a stylesheet or its configuration
     * @throws \LogicException When the page already holds an island
     * @throws \Magento\Framework\Exception\LocalizedException When a module's or stylesheet's file cannot be resolved
     */
    public function open(IslandInterface $island): void;
}
