<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Model\Page;

use Hryvinskyi\AdminUi\Api\Exception\InvalidIslandException;
use Hryvinskyi\AdminUi\Api\Page\ImportMapBuilderInterface;
use Hryvinskyi\AdminUi\Api\Page\ModuleScriptInterface;
use Magento\Framework\View\Asset\Repository;
use Magento\Framework\View\Helper\SecureHtmlRenderer;

/**
 * Prints the import map as an inline script, then the entry as an external ES module, both through the platform's
 * secure renderer
 *
 * The secure renderer gives the inline map what the content security policy asks of an inline script. The map's
 * addresses and the entry's come from the asset repository, so they name the minified files when the platform minifies
 * scripts. An ES module is deferred by the browser, so the entry runs after the markup it starts on is parsed.
 */
class ModuleScript implements ModuleScriptInterface
{
    /**
     * @param ImportMapBuilderInterface $importMapBuilder
     * @param Repository $assetRepository Resolves the entry's file id for the request's area, theme and locale
     * @param SecureHtmlRenderer $secureRenderer
     */
    public function __construct(
        private readonly ImportMapBuilderInterface $importMapBuilder,
        private readonly Repository $assetRepository,
        private readonly SecureHtmlRenderer $secureRenderer
    ) {
    }

    /**
     * @inheritDoc
     */
    public function render(string $entryFileId, array $imports): string
    {
        if (preg_match(ImportMapBuilderInterface::FILE_ID_PATTERN, $entryFileId) !== 1) {
            throw new InvalidIslandException(
                InvalidIslandException::REASON_IMPORT,
                sprintf(
                    'The entry module "%s" must be the file id of a module (Vendor_Module::path/file.js).',
                    $entryFileId
                )
            );
        }
        $map = $this->importMapBuilder->json($this->importMapBuilder->addresses($imports));

        return $this->secureRenderer->renderTag('script', ['type' => 'importmap'], $map, false)
            . $this->secureRenderer->renderTag(
                'script',
                ['type' => 'module', 'src' => $this->assetRepository->getUrl($entryFileId)],
                null,
                false
            );
    }
}
