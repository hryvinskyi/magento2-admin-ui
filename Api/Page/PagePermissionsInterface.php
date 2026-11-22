<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Api\Page;

/**
 * What the signed-in admin may do on a module's island pages, as a page's document hands it to the island:
 * `{name: whether the admin has it}`, one entry per permission the module names
 *
 * The island leaves out what the role does not allow; every endpoint checks the same permission again, so this only
 * spares the admin a control that would be refused.
 *
 * @api
 */
interface PagePermissionsInterface
{
    /**
     * Get each permission the module names, and whether the signed-in admin has it
     *
     * @return array<string, bool> In the order the module names them
     */
    public function granted(): array;
}
