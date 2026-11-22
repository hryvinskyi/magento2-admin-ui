<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Api\Page;

/**
 * How many things wait on one page of a module, drawn beside its tab in the module navigation
 *
 * A module gives a tab a count by naming a class of this interface as the `count` of that tab's item in the `items`
 * argument of its virtual type of `Model\Page\ModuleNavigation` (adminhtml `di.xml`). The count is read on every page
 * of the module the admin opens, and only for a tab the admin may open, so it is one cheap read. Nothing is drawn
 * beside the label while it is 0.
 *
 * @api
 */
interface ModuleTabCountInterface
{
    /**
     * Get the number of things waiting on the tab's page; 0 for none
     *
     * @return int
     */
    public function count(): int;
}
