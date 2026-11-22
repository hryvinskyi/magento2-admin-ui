<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Test\Unit\Fake;

use Hryvinskyi\AdminUi\Api\Page\IslandInterface;
use Hryvinskyi\AdminUi\Api\Page\PageContentInterface;

/**
 * A page's content that answers the endpoints, routes, first data and lines it was given
 *
 * @phpstan-import-type JsonLevel5 from IslandInterface
 */
class FixedPageContent implements PageContentInterface
{
    /**
     * @var array<string, string>
     */
    private readonly array $urls;

    /**
     * @var list<string>
     */
    private readonly array $routes;

    /**
     * @var array<string, JsonLevel5>
     */
    private readonly array $data;

    /**
     * @param array<string, string> $urls The endpoints' addresses by the name the island knows each by
     * @param list<string> $routes The route paths of the screens the page links to
     * @param array<string, JsonLevel5> $data The page's first data
     * @param string $loadingText
     * @param string $failedText
     */
    public function __construct(
        array $urls,
        array $routes,
        array $data,
        private readonly string $loadingText,
        private readonly string $failedText
    ) {
        $this->urls = $urls;
        $this->routes = $routes;
        $this->data = $data;
    }

    /**
     * @inheritDoc
     */
    public function getUrls(): array
    {
        return $this->urls;
    }

    /**
     * @inheritDoc
     */
    public function getRoutes(): array
    {
        return $this->routes;
    }

    /**
     * @inheritDoc
     */
    public function getData(): array
    {
        return $this->data;
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
