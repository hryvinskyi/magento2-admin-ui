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
use Magento\Framework\Serialize\SerializerInterface;
use Magento\Framework\View\Asset\Repository;

/**
 * Resolves modules through the platform's asset repository and writes them as an import map
 *
 * An entry that is not a bare specifier mapped to a module's file id fails loudly, naming the entry, so a typo is
 * found on the first page that prints the map rather than as a module failing to load in the browser.
 */
class ImportMapBuilder implements ImportMapBuilderInterface
{
    /**
     * @param Repository $assetRepository Resolves a file id for the request's area, theme and locale
     * @param SerializerInterface $serializer Writes JSON with `<` and `>` escaped
     */
    public function __construct(
        private readonly Repository $assetRepository,
        private readonly SerializerInterface $serializer
    ) {
    }

    /**
     * @inheritDoc
     */
    public function addresses(array $fileIds): array
    {
        $addresses = [];
        foreach ($fileIds as $specifier => $fileId) {
            $specifier = (string) $specifier;
            if (preg_match(self::SPECIFIER_PATTERN, $specifier) !== 1
                || preg_match(self::FILE_ID_PATTERN, $fileId) !== 1
            ) {
                throw new InvalidIslandException(
                    InvalidIslandException::REASON_IMPORT,
                    sprintf(
                        'The import "%s" => "%s" must map a bare module specifier to the file id of a module '
                        . '(Vendor_Module::path/file.js).',
                        $specifier,
                        $fileId
                    )
                );
            }
            $addresses[$specifier] = $this->assetRepository->getUrl($fileId);
        }

        return $addresses;
    }

    /**
     * @inheritDoc
     */
    public function json(array $addresses): string
    {
        $json = $this->serializer->serialize(['imports' => $addresses === [] ? (object) [] : $addresses]);
        if (!is_string($json)) {
            throw new \InvalidArgumentException('The import map could not be written as JSON.');
        }

        return $json;
    }
}
