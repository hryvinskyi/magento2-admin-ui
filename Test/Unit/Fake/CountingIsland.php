<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Test\Unit\Fake;

use Hryvinskyi\AdminUi\Api\Page\IslandInterface;

/**
 * Answers as the island it wraps and counts how often each part is read
 */
class CountingIsland implements IslandInterface
{
    /**
     * How often each part was read, keyed by getter
     *
     * @var array<string, int>
     */
    public array $reads = [];

    /**
     * @param IslandInterface $island
     */
    public function __construct(
        private readonly IslandInterface $island
    ) {
    }

    /**
     * @inheritDoc
     */
    public function getName(): string
    {
        $this->count(__FUNCTION__);

        return $this->island->getName();
    }

    /**
     * @inheritDoc
     */
    public function getRootClass(): string
    {
        $this->count(__FUNCTION__);

        return $this->island->getRootClass();
    }

    /**
     * @inheritDoc
     */
    public function getEntry(): string
    {
        $this->count(__FUNCTION__);

        return $this->island->getEntry();
    }

    /**
     * @inheritDoc
     */
    public function getImports(): array
    {
        $this->count(__FUNCTION__);

        return $this->island->getImports();
    }

    /**
     * @inheritDoc
     */
    public function getStyles(): array
    {
        $this->count(__FUNCTION__);

        return $this->island->getStyles();
    }

    /**
     * @inheritDoc
     */
    public function getConfig(): array
    {
        $this->count(__FUNCTION__);

        return $this->island->getConfig();
    }

    /**
     * @inheritDoc
     */
    public function getLoadingText(): string
    {
        $this->count(__FUNCTION__);

        return $this->island->getLoadingText();
    }

    /**
     * @inheritDoc
     */
    public function getFailedText(): string
    {
        $this->count(__FUNCTION__);

        return $this->island->getFailedText();
    }

    /**
     * Count one read of a part
     *
     * @param string $getter
     * @return void
     */
    private function count(string $getter): void
    {
        $this->reads[$getter] = ($this->reads[$getter] ?? 0) + 1;
    }
}
