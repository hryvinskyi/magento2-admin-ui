<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Test\Unit\Fake;

use Magento\Framework\AuthorizationInterface;

/**
 * A role that allows exactly the given ACL resources
 */
class AllowedResources implements AuthorizationInterface
{
    /**
     * @param list<string> $allowed
     */
    public function __construct(private readonly array $allowed)
    {
    }

    /**
     * @inheritDoc
     */
    public function isAllowed($resource, $privilege = null)
    {
        return in_array($resource, $this->allowed, true);
    }
}
