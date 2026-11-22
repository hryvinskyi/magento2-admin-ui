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
 * A tab counter that always answers the number it was given, and says how often it was asked
 */
class FixedTabCount implements ModuleTabCountInterface
{
    /**
     * How often the count was read
     *
     * @var int
     */
    public int $reads = 0;

    /**
     * @param int $count
     */
    public function __construct(private readonly int $count)
    {
    }

    /**
     * @inheritDoc
     */
    public function count(): int
    {
        $this->reads++;

        return $this->count;
    }
}
