<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Test\Integration\Page;

use Hryvinskyi\AdminUi\Api\Page\IslandPageInterface;
use Magento\Framework\App\Area;
use Magento\Framework\View\Asset\File;
use Magento\Framework\View\Asset\Repository;
use Magento\Framework\View\DesignInterface;
use Magento\TestFramework\Fixture\AppArea;
use Magento\TestFramework\Fixture\AppIsolation;
use Magento\TestFramework\Helper\Bootstrap;
use PHPUnit\Framework\TestCase;

/**
 * The real asset repository finds every module of the kit an island page's import map names, in the backend theme
 */
#[AppArea('adminhtml'), AppIsolation(true)]
class KitFilesTest extends TestCase
{
    /**
     * Each of the kit's four modules resolves to a file on disk
     *
     * @return void
     */
    public function testKitModulesResolveToFiles(): void
    {
        $objectManager = Bootstrap::getObjectManager();
        $design = $objectManager->get(DesignInterface::class);
        self::assertInstanceOf(DesignInterface::class, $design);
        $design->setDesignTheme('Magento/backend', Area::AREA_ADMINHTML);
        $repository = $objectManager->get(Repository::class);
        self::assertInstanceOf(Repository::class, $repository);

        foreach (IslandPageInterface::KIT_IMPORTS as $specifier => $fileId) {
            $asset = $repository->createAsset($fileId);
            self::assertInstanceOf(File::class, $asset);
            $source = $asset->getSourceFile();
            self::assertFileExists($source, sprintf('The kit module "%s" (%s) has no file.', $specifier, $fileId));
        }
    }
}
