<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Api\Exception;

/**
 * An island handed to an admin page, or a module it loads, is declared in a way the page cannot print
 *
 * Thrown when the page is opened, before anything is rendered, so a declaration fault fails the request rather than
 * leaving a page without its island. The reason is machine-readable (one of the REASON_* constants); the message names
 * the offending value and is never translated: it is meant for the developer who wrote the declaration.
 *
 * It is an \InvalidArgumentException, so a caller that guards a page's declarations against \LogicException catches it
 * without naming this module.
 *
 * @api
 */
class InvalidIslandException extends \InvalidArgumentException
{
    /**
     * An import map entry is not a bare specifier mapped to a module's file id, an entry module is not a module's file
     * id, or an island's import names one of the kit's own specifiers
     */
    public const REASON_IMPORT = 'import';

    /**
     * A stylesheet is not a module's `.css` file id
     */
    public const REASON_STYLE = 'style';

    /**
     * The island's name is not a lower-case letter followed by up to 63 lower-case letters, digits and dashes
     */
    public const REASON_NAME = 'name';

    /**
     * The island's root class is not a space-separated list of lower-case class names
     */
    public const REASON_ROOT_CLASS = 'root_class';

    /**
     * The island's page configuration holds something other than JSON data, or cannot be written as JSON
     */
    public const REASON_CONFIG = 'config';

    /**
     * @param string $reason One of the REASON_* constants
     * @param string $message What is wrong, naming the offending value, in plain English
     * @param \Throwable|null $previous
     */
    public function __construct(
        private readonly string $reason,
        string $message,
        ?\Throwable $previous = null
    ) {
        parent::__construct($message, 0, $previous);
    }

    /**
     * Get the machine-readable reason: one of the REASON_* constants
     *
     * @return string
     */
    public function getReason(): string
    {
        return $this->reason;
    }
}
