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
 * Renders the tags that load an admin page's entry ES module whose modules import one another by bare specifier
 *
 * The import map comes first, as an inline `type="importmap"` script; the entry follows as an external
 * `type="module"` script. Both are printed through the platform's secure HTML renderer, so they carry what the
 * content security policy asks of a script; no script tag is written by hand. The entry's address comes from the asset
 * repository, as the map's do.
 *
 * @api
 */
interface ModuleScriptInterface
{
    /**
     * Render the import map of the given modules, then the entry module
     *
     * @param string $entryFileId The entry's file id (ImportMapBuilderInterface::FILE_ID_PATTERN)
     * @param array<string,string> $imports The file ids of the modules imported by bare specifier, keyed by specifier
     * @return string
     * @throws InvalidIslandException When the entry or an import is not a module's file id, or an import is not keyed
     *     by a bare specifier
     * @throws \InvalidArgumentException When the import map cannot be written as JSON
     * @throws \Magento\Framework\Exception\LocalizedException When a module's file cannot be resolved
     */
    public function render(string $entryFileId, array $imports): string;
}
