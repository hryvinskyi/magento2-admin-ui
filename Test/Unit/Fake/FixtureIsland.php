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
 * The island of the page contract (`Test/_contract/island-page.html`): `test-island`, one module of its own, one
 * stylesheet, a configuration holding text that would end a script element, and its two lines; each part can be
 * replaced
 *
 * @phpstan-import-type JsonObject from IslandInterface
 */
class FixtureIsland implements IslandInterface
{
    /**
     * @param string $name
     * @param string $rootClass
     * @param string $entry
     * @param array<string, string> $imports
     * @param list<string> $styles
     * @param JsonObject|null $config Null for the contract's configuration
     * @param string $loadingText
     * @param string $failedText
     */
    public function __construct(
        private readonly string $name = 'test-island',
        private readonly string $rootClass = 'test-island',
        private readonly string $entry = 'Test_Module::js/island.js',
        private readonly array $imports = ['@test/island-part' => 'Test_Module::js/island-part.js'],
        private readonly array $styles = ['Test_Module::css/island.css'],
        private readonly ?array $config = null,
        private readonly string $loadingText = 'Loading the test page…',
        private readonly string $failedText = 'The test page could not be loaded. Reload the page to try again.'
    ) {
    }

    /**
     * @inheritDoc
     */
    public function getName(): string
    {
        return $this->name;
    }

    /**
     * @inheritDoc
     */
    public function getRootClass(): string
    {
        return $this->rootClass;
    }

    /**
     * @inheritDoc
     */
    public function getEntry(): string
    {
        return $this->entry;
    }

    /**
     * @inheritDoc
     */
    public function getImports(): array
    {
        return $this->imports;
    }

    /**
     * @inheritDoc
     */
    public function getStyles(): array
    {
        return $this->styles;
    }

    /**
     * @inheritDoc
     */
    public function getConfig(): array
    {
        return $this->config ?? [
            'title' => 'Test island',
            'note' => '<b>Bold</b> & "quoted" — kept as typed',
            'rows' => [['code' => 'one', 'enabled' => true], ['code' => 'two', 'enabled' => false]],
            'limit' => 3,
        ];
    }

    /**
     * @inheritDoc
     */
    public function getLoadingText(): string
    {
        return $this->loadingText;
    }

    /**
     * @inheritDoc
     */
    public function getFailedText(): string
    {
        return $this->failedText;
    }
}
