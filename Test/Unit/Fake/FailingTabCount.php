<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Test\Unit\Fake;

use Hryvinskyi\AdminUi\Api\Page\ModuleTabCountInterface;

/**
 * A tab counter whose every read fails
 */
class FailingTabCount implements ModuleTabCountInterface
{
    /**
     * @inheritDoc
     */
    public function count(): int
    {
        throw new \RuntimeException('The count cannot be read.');
    }
}
