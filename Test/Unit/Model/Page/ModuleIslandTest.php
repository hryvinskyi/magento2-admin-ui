<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Test\Unit\Model\Page;

use Hryvinskyi\AdminUi\Model\Page\AdminRoutes;
use Hryvinskyi\AdminUi\Model\Page\ModuleIsland;
use Hryvinskyi\AdminUi\Model\Page\ModuleNavigation;
use Hryvinskyi\AdminUi\Model\Page\PagePermissions;
use Hryvinskyi\AdminUi\Test\Unit\Fake\AllowedResources;
use Hryvinskyi\AdminUi\Test\Unit\Fake\FixedPageContent;
use Hryvinskyi\AdminUi\Test\Unit\Fake\FixedPagePhrases;
use Hryvinskyi\AdminUi\Test\Unit\Fake\FixedStoreViews;
use Hryvinskyi\AdminUi\Test\Unit\Fake\QueryKeyedUrl;
use Magento\Framework\Data\Form\FormKey;
use PHPUnit\Framework\TestCase;
use Psr\Log\NullLogger;

/**
 * A module page's island document, over a role that allows the reports screen and the edit permission: the module's
 * header and tabs, the store views, the page's wording, endpoints, links, form key, permissions and first data, an
 * empty member printed as an empty JSON object, and the page's identity and lines as configured
 */
class ModuleIslandTest extends TestCase
{
    private const RESOURCES = [
        'vendor/reports/index' => 'Vendor_Module::view',
        'vendor/export/index' => 'Vendor_Module::export',
    ];

    public function testTheDocumentCarriesTheShellTheStoreViewsAndThePagePart(): void
    {
        $island = $this->island(
            ['page.title' => 'Reports'],
            ['data' => 'keyed:vendor/reports/data'],
            ['rows' => [1, 2]]
        );

        self::assertSame([
            'shell' => [
                'module' => 'Vendor Module',
                'page' => 'Reports',
                'nav' => [
                    [
                        'code' => 'reports',
                        'label' => 'Reports',
                        'url' => 'keyed:vendor/reports/index',
                        'current' => true,
                        'count' => 0,
                    ],
                ],
                'storefront' => 'https://shop.test/en/',
            ],
            'stores' => [
                ['id' => 1, 'name' => 'English', 'home' => 'https://shop.test/en/'],
                ['id' => 2, 'name' => 'Deutsch', 'home' => 'https://shop.test/de/'],
            ],
            'phrases' => ['page.title' => 'Reports'],
            'urls' => ['data' => 'keyed:vendor/reports/data'],
            'routes' => ['vendor/reports/index' => 'keyed:vendor/reports/index'],
            'formKey' => 'form-key-1',
            'permissions' => ['edit' => true, 'export' => false],
            'data' => ['rows' => [1, 2]],
        ], $island->getConfig());
    }

    public function testEmptyMembersArePrintedAsEmptyJsonObjects(): void
    {
        $config = $this->island([], [], [], [])->getConfig();

        foreach (['phrases', 'urls', 'data', 'permissions'] as $member) {
            self::assertEquals(new \stdClass(), $config[$member], $member);
        }
    }

    public function testTheIslandIsNamedAndLinedAsConfigured(): void
    {
        $island = $this->island([], [], []);

        self::assertSame('vendor-reports', $island->getName());
        self::assertSame('Vendor_Module::js/admin-pages/reports.js', $island->getEntry());
        self::assertSame('vendor-page', $island->getRootClass());
        self::assertSame([], $island->getImports());
        self::assertSame([], $island->getStyles());
        self::assertSame('Loading the reports…', $island->getLoadingText());
        self::assertSame('The reports could not be loaded.', $island->getFailedText());
    }

    public function testThePageLinksTheStylesheetsItIsGivenInTheirOrder(): void
    {
        $island = $this->island([], [], [], null, [
            'builder' => 'Vendor_Builder::css/builder.css',
            'charts' => 'Vendor_Module::css/charts.css',
        ]);

        self::assertSame(['Vendor_Builder::css/builder.css', 'Vendor_Module::css/charts.css'], $island->getStyles());
    }

    /**
     * The reports page of a module, over a role that allows the reports screen and the edit permission
     *
     * @param array<string, string> $phrases
     * @param array<string, string> $urls
     * @param array<string, int|list<int>> $data
     * @param array<string, string>|null $permissions The resource behind each permission; two by default
     * @param array<string, string> $styles The page's own stylesheets
     * @return ModuleIsland
     */
    private function island(
        array $phrases,
        array $urls,
        array $data,
        ?array $permissions = null,
        array $styles = []
    ): ModuleIsland {
        $role = new AllowedResources(['Vendor_Module::view', 'Vendor_Module::edit']);
        $routes = new AdminRoutes($role, new QueryKeyedUrl(), self::RESOURCES);
        $formKey = $this->createMock(FormKey::class);
        $formKey->method('getFormKey')->willReturn('form-key-1');

        return new ModuleIsland(
            new FixedPagePhrases($phrases),
            new FixedPageContent(
                $urls,
                ['vendor/reports/index', 'vendor/export/index'],
                $data,
                'Loading the reports…',
                'The reports could not be loaded.'
            ),
            new ModuleNavigation($routes, new NullLogger(), [
                'reports' => ['label' => 'Reports', 'route' => 'vendor/reports/index', 'sortOrder' => 10],
                'export' => ['label' => 'Export', 'route' => 'vendor/export/index', 'sortOrder' => 20],
            ]),
            $routes,
            new PagePermissions(
                $role,
                $permissions ?? ['edit' => 'Vendor_Module::edit', 'export' => 'Vendor_Module::export']
            ),
            new FixedStoreViews(
                [
                    ['id' => 1, 'name' => 'English', 'home' => 'https://shop.test/en/'],
                    ['id' => 2, 'name' => 'Deutsch', 'home' => 'https://shop.test/de/'],
                ],
                'https://shop.test/en/'
            ),
            $formKey,
            'Vendor Module',
            'vendor-reports',
            'Vendor_Module::js/admin-pages/reports.js',
            'reports',
            'vendor-page',
            $styles
        );
    }
}
