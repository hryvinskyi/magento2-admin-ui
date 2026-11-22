<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Test\Unit\Fake;

use Magento\Framework\View\Asset\Repository;

/**
 * Gives every file id the address the static content of the backend theme in English would carry, and records each
 * file id it resolves
 */
class StaticRepository extends Repository
{
    /**
     * Where the backend theme's static content in English is published
     */
    public const BASE = 'https://static.test/adminhtml/Magento/backend/en_US/';

    /**
     * Each file id resolved, in order
     *
     * @var list<string>
     */
    public array $resolved = [];

    /**
     * The parent's collaborators are not needed: every address is built here
     */
    public function __construct()
    {
    }

    /**
     * @inheritDoc
     */
    public function getUrl($fileId)
    {
        $fileId = (string) $fileId;
        $this->resolved[] = $fileId;

        return self::BASE . str_replace('::', '/', $fileId);
    }
}
