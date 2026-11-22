<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Test\Unit\Model\Page;

use Hryvinskyi\AdminUi\Model\Page\PagePermissions;
use Hryvinskyi\AdminUi\Test\Unit\Fake\AllowedResources;
use PHPUnit\Framework\TestCase;

/**
 * A module's permissions as the island reads them: each named permission, in the module's order, and whether the
 * role allows the resource behind it; a permission declared wrongly fails loudly, naming it
 */
class PagePermissionsTest extends TestCase
{
    public function testEachPermissionSaysWhetherTheRoleAllowsItsResource(): void
    {
        $permissions = new PagePermissions(new AllowedResources(['Vendor_Module::edit']), [
            'edit' => 'Vendor_Module::edit',
            'export' => 'Vendor_Module::export',
        ]);

        self::assertSame(['edit' => true, 'export' => false], $permissions->granted());
    }

    public function testAModuleWithoutPermissionsGrantsNone(): void
    {
        self::assertSame([], (new PagePermissions(new AllowedResources([])))->granted());
    }

    public function testAPermissionWithoutAResourceFailsNamingIt(): void
    {
        $permissions = new PagePermissions(new AllowedResources([]), ['edit' => '']);

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('"edit"');

        $permissions->granted();
    }

    public function testAPermissionNotKeyedByALowerCaseNameFailsNamingIt(): void
    {
        $permissions = new PagePermissions(new AllowedResources([]), ['Edit Rules' => 'Vendor_Module::edit']);

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('"Edit Rules"');

        $permissions->granted();
    }
}
