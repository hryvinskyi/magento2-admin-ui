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
 * Builds the import map browser modules resolve their bare specifiers through
 *
 * The modules import one another by bare specifier rather than by relative file name, so each published file can carry
 * whatever name the static content gives it. A specifier stands for a module's file id (`Vendor_Module::path/file.js`),
 * and its address is the one the platform's asset repository gives that file for the request's area, theme and locale:
 * it carries the static content version, and the minified file's name when the platform minifies scripts.
 *
 * @api
 */
interface ImportMapBuilderInterface
{
    /**
     * What a bare specifier is: an optional `@scope/` then a name, then optional `/`-separated path segments; never a
     * relative or absolute path and never an address
     */
    public const SPECIFIER_PATTERN = '#^(?:@[a-z0-9][a-z0-9._-]*/)?[a-z0-9][a-z0-9._-]*(?:/[A-Za-z0-9._-]+)*$#D';

    /**
     * What a module's file id is: `Vendor_Module::path/file.js` or `.mjs`, without a `..` segment
     */
    public const FILE_ID_PATTERN = '#^[A-Za-z0-9]+_[A-Za-z0-9]+::(?!.*\.\.)[A-Za-z0-9_/.-]+\.m?js$#D';

    /**
     * Resolve modules to their static addresses
     *
     * @param array<string,string> $fileIds The file id of each module (FILE_ID_PATTERN), keyed by the bare specifier
     *     it is imported by (SPECIFIER_PATTERN)
     * @return array<string, string> The addresses keyed by the same specifiers, in the given order
     * @throws InvalidIslandException When an entry is not a bare specifier mapped to a module's file id
     * @throws \Magento\Framework\Exception\LocalizedException When a file cannot be resolved
     */
    public function addresses(array $fileIds): array;

    /**
     * Write addresses as an import map: `{"imports": {specifier: address}}`, an empty object when there are none
     *
     * `<` and `>` are escaped, so the map can be printed inside a script element as it is.
     *
     * @param array<string,string> $addresses Keyed by specifier
     * @return string
     * @throws \InvalidArgumentException When the map cannot be written as JSON
     */
    public function json(array $addresses): string;
}
