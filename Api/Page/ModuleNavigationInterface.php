<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Api\Page;

/**
 * The row of tabs every page of a module draws under its header, as the page's document hands it to the island
 *
 * A tab is listed only for an admin the screen's permission allows, in sort order, and the tab whose code the page
 * names is the current one. A tab may carry a count of things waiting on its page (0 when it has none, or when its
 * counter failed). A tab declared wrongly fails the page, naming the tab.
 *
 * @phpstan-type ModuleTab array{code: string, label: string, url: string, current: bool, count: int}
 * @api
 */
interface ModuleNavigationInterface
{
    /**
     * Get the tabs the signed-in admin may open, in sort order, the one of the given code marked current
     *
     * @param string $current The code of the page shown now
     * @return list<ModuleTab> Labels translated, addresses keyed
     * @throws \InvalidArgumentException When a tab is declared wrongly
     */
    public function getLinks(string $current): array;

    /**
     * Get the name of the page shown now: its tab's label, translated; empty when no tab has the code
     *
     * @param string $current
     * @return string
     * @throws \InvalidArgumentException When a tab is declared wrongly
     */
    public function getPageName(string $current): string;
}
