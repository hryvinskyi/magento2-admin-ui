<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Api\Page;

/**
 * An admin page's Preact island, as the page's module hands it to the host that prints it
 *
 * The host reads every part once, when the page is opened (IslandPageInterface::open()), and refuses a part it cannot
 * print. The island's name is the root element's `data-role`, and the prefix of the two other roles the island's
 * browser code finds: `<name>-loading` (the line shown until the island starts) and `<name>-config` (the island's
 * document as JSON).
 *
 * JSON data is typed six array levels deep; a deeper structure nests a \stdClass, whose members the host checks when
 * the page is opened.
 *
 * @phpstan-type JsonScalar string|int|float|bool|null
 * @phpstan-type JsonLevel1 JsonScalar|\stdClass|array<array-key, JsonScalar|\stdClass>
 * @phpstan-type JsonLevel2 JsonScalar|\stdClass|array<array-key, JsonLevel1>
 * @phpstan-type JsonLevel3 JsonScalar|\stdClass|array<array-key, JsonLevel2>
 * @phpstan-type JsonLevel4 JsonScalar|\stdClass|array<array-key, JsonLevel3>
 * @phpstan-type JsonLevel5 JsonScalar|\stdClass|array<array-key, JsonLevel4>
 * @phpstan-type JsonValue JsonScalar|\stdClass|array<array-key, JsonLevel5>
 * @phpstan-type JsonObject array<string, JsonValue>
 * @api
 */
interface IslandInterface
{
    /**
     * What an island's name is: a lower-case letter, then up to 63 lower-case letters, digits and dashes, so it can
     * stand unquoted inside a selector
     */
    public const NAME_PATTERN = '/^[a-z][a-z0-9-]{0,63}$/D';

    /**
     * What an island's own root class is: empty, or class names of a lower-case letter then lower-case letters, digits,
     * underscores and dashes, separated by single spaces
     */
    public const ROOT_CLASS_PATTERN = '/^(?:[a-z][a-z0-9_-]*(?: [a-z][a-z0-9_-]*)*)?$/D';

    /**
     * What a stylesheet's file id is: `Vendor_Module::path/file.css`, without a `..` segment
     */
    public const STYLE_FILE_ID_PATTERN = '#^[A-Za-z0-9]+_[A-Za-z0-9]+::(?!.*\.\.)[A-Za-z0-9_/.-]+\.css$#D';

    /**
     * Get the island's name (NAME_PATTERN): the root's `data-role` and the prefix of its other two roles
     *
     * @return string
     */
    public function getName(): string;

    /**
     * Get the root's own classes (ROOT_CLASS_PATTERN), printed after the kit's `hui`; empty for none
     *
     * @return string
     */
    public function getRootClass(): string;

    /**
     * Get the file id of the island's entry ES module (ImportMapBuilderInterface::FILE_ID_PATTERN)
     *
     * @return string
     */
    public function getEntry(): string;

    /**
     * Get the island's own modules imported by bare specifier, after the kit's in the page's import map
     *
     * A specifier of the kit's (IslandPageInterface::KIT_IMPORTS) is never one of them: the kit resolves its own.
     *
     * @return array<string, string> File ids (ImportMapBuilderInterface::FILE_ID_PATTERN) keyed by bare specifier
     *     (ImportMapBuilderInterface::SPECIFIER_PATTERN), in the order the map lists them
     */
    public function getImports(): array;

    /**
     * Get the island's own stylesheets, linked after the kit's in the order given
     *
     * @return list<string> File ids (STYLE_FILE_ID_PATTERN)
     */
    public function getStyles(): array;

    /**
     * Get the page's part of the island's document: plain JSON data, printed under its `page` member
     *
     * An empty configuration is printed as an empty JSON object.
     *
     * @return JsonObject
     */
    public function getConfig(): array;

    /**
     * Get the line shown while the island loads, and to a browser that runs no script
     *
     * @return string Translated
     */
    public function getLoadingText(): string;

    /**
     * Get the line the island shows when it cannot start
     *
     * @return string Translated
     */
    public function getFailedText(): string;
}
