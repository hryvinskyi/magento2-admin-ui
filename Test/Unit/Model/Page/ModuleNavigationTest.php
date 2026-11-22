<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Test\Unit\Model\Page;

use Hryvinskyi\AdminUi\Model\Page\AdminRoutes;
use Hryvinskyi\AdminUi\Model\Page\ModuleNavigation;
use Hryvinskyi\AdminUi\Test\Unit\Fake\AllowedResources;
use Hryvinskyi\AdminUi\Test\Unit\Fake\FailingTabCount;
use Hryvinskyi\AdminUi\Test\Unit\Fake\FixedTabCount;
use Hryvinskyi\AdminUi\Test\Unit\Fake\QueryKeyedUrl;
use Hryvinskyi\AdminUi\Test\Unit\Fake\RecordingLogger;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Psr\Log\LogLevel;
use Psr\Log\NullLogger;

/**
 * A module's navigation and the screens it links to, over a role that allows some resources: the tabs in sort order,
 * only those the role may open, the current one marked, each with its keyed address and the count of things waiting
 * on its page; a screen or a tab declared wrongly fails loudly
 */
class ModuleNavigationTest extends TestCase
{
    private const RESOURCES = [
        'vendor/reports/index' => 'Vendor_Module::view',
        'vendor/export/index' => 'Vendor_Module::export',
        'adminhtml/system_config/edit' => 'Vendor_Module::config',
    ];

    public function testTheTabsTheRoleMayOpenAreListedInSortOrderWithTheCurrentOneMarked(): void
    {
        $navigation = $this->navigation(['Vendor_Module::view', 'Vendor_Module::config'], [
            'settings' => ['label' => 'Settings', 'route' => 'adminhtml/system_config/edit', 'sortOrder' => 50,
                'params' => ['section' => 'vendor']],
            'export' => ['label' => 'Export', 'route' => 'vendor/export/index', 'sortOrder' => 40],
            'reports' => ['label' => 'Reports', 'route' => 'vendor/reports/index', 'sortOrder' => 10],
        ]);

        self::assertSame([
            ['code' => 'reports', 'label' => 'Reports', 'url' => 'keyed:vendor/reports/index', 'current' => true,
                'count' => 0],
            ['code' => 'settings', 'label' => 'Settings', 'url' => 'keyed:adminhtml/system_config/edit?section=vendor',
                'current' => false, 'count' => 0],
        ], $navigation->getLinks('reports'));
        self::assertSame('Export', $navigation->getPageName('export'));
        self::assertSame('', $navigation->getPageName('library'));
    }

    public function testTabsOfOneSortOrderAreListedByCodeAndALeftOutSortOrderCountsAsNone(): void
    {
        $navigation = $this->navigation(['Vendor_Module::view', 'Vendor_Module::export'], [
            'reports' => ['label' => 'Reports', 'route' => 'vendor/reports/index', 'sortOrder' => 0],
            'export' => ['label' => 'Export', 'route' => 'vendor/export/index'],
        ]);

        self::assertSame(['export', 'reports'], array_column($navigation->getLinks('none'), 'code'));
    }

    public function testATabCarriesTheNumberItsCounterGivesAndANegativeNumberCountsAsNone(): void
    {
        $navigation = $this->navigation(['Vendor_Module::view', 'Vendor_Module::export'], [
            'reports' => ['label' => 'Reports', 'route' => 'vendor/reports/index', 'count' => new FixedTabCount(3)],
            'export' => ['label' => 'Export', 'route' => 'vendor/export/index', 'count' => new FixedTabCount(-2)],
        ]);

        self::assertSame(
            ['export' => 0, 'reports' => 3],
            array_column($navigation->getLinks('reports'), 'count', 'code')
        );
    }

    public function testTheCountOfATabTheRoleMayNotOpenIsNeverRead(): void
    {
        $hidden = new FixedTabCount(5);
        $navigation = $this->navigation(['Vendor_Module::view'], [
            'reports' => ['label' => 'Reports', 'route' => 'vendor/reports/index'],
            'export' => ['label' => 'Export', 'route' => 'vendor/export/index', 'count' => $hidden],
        ]);

        self::assertSame(['reports'], array_column($navigation->getLinks('reports'), 'code'));
        self::assertSame(0, $hidden->reads);
    }

    public function testACounterThatFailsIsLoggedAndItsTabListedWithNone(): void
    {
        $logger = new RecordingLogger();
        $navigation = $this->navigation(['Vendor_Module::view'], [
            'reports' => ['label' => 'Reports', 'route' => 'vendor/reports/index', 'count' => new FailingTabCount()],
        ], $logger);

        $links = $navigation->getLinks('reports');

        self::assertSame(0, $links[0]['count']);
        self::assertCount(1, $logger->records);
        self::assertSame(LogLevel::ERROR, $logger->records[0]['level']);
        self::assertSame('reports', $logger->records[0]['context']['tab']);
        self::assertInstanceOf(\RuntimeException::class, $logger->records[0]['context']['exception']);
    }

    public function testATabWhoseCountIsNoCounterFailsNamingTheTab(): void
    {
        $navigation = $this->navigation([], [
            'odd' => ['label' => 'Odd', 'route' => 'vendor/reports/index', 'count' => 4],
        ]);

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('"odd"');

        $navigation->getPageName('odd');
    }

    public function testATabWithoutARoutePathFailsNamingTheTab(): void
    {
        $navigation = $this->navigation([], ['broken' => ['label' => 'Broken', 'route' => 'rs']]);

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('"broken"');

        $navigation->getLinks('reports');
    }

    public function testATabWithParametersThatAreNotNamedStringsFailsNamingTheTab(): void
    {
        $navigation = $this->navigation([], [
            'odd' => ['label' => 'Odd', 'route' => 'vendor/reports/index', 'params' => ['page' => 2]],
        ]);

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('"odd"');

        $navigation->getPageName('odd');
    }

    public function testTheScreensTheRoleMayOpenHaveAddressesAndTheOthersNone(): void
    {
        $routes = $this->routes(['Vendor_Module::view']);

        self::assertSame(
            ['vendor/reports/index' => 'keyed:vendor/reports/index'],
            $routes->allowedUrls(['vendor/reports/index', 'vendor/export/index'])
        );
        self::assertNull($routes->url('vendor/export/index', ['page' => 'home']));
        self::assertTrue($routes->isAllowed('vendor/reports/index'));
    }

    public function testAScreenTheModuleDoesNotListFailsLoudly(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('"vendor/unknown/index"');

        $this->routes([])->url('vendor/unknown/index');
    }

    public function testRoutesWithNoResourcesKnowNoScreen(): void
    {
        $this->expectException(\InvalidArgumentException::class);

        (new AdminRoutes(new AllowedResources(['Vendor_Module::view']), new QueryKeyedUrl()))
            ->isAllowed('vendor/reports/index');
    }

    /**
     * The navigation of the given tabs over a role that allows exactly the given resources
     *
     * @param list<string> $allowed
     * @param array<mixed> $items
     * @param LoggerInterface|null $logger Told about a counter that fails; none by default
     * @return ModuleNavigation
     */
    private function navigation(array $allowed, array $items, ?LoggerInterface $logger = null): ModuleNavigation
    {
        return new ModuleNavigation($this->routes($allowed), $logger ?? new NullLogger(), $items);
    }

    /**
     * The listed screens over a role that allows exactly the given resources
     *
     * @param list<string> $allowed
     * @return AdminRoutes
     */
    private function routes(array $allowed): AdminRoutes
    {
        return new AdminRoutes(new AllowedResources($allowed), new QueryKeyedUrl(), self::RESOURCES);
    }
}
