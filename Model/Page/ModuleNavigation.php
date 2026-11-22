<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Model\Page;

use Hryvinskyi\AdminUi\Api\Page\AdminRoutesInterface;
use Hryvinskyi\AdminUi\Api\Page\ModuleNavigationInterface;
use Hryvinskyi\AdminUi\Api\Page\ModuleTabCountInterface;
use Psr\Log\LoggerInterface;

/**
 * A module's tabs from the `items` array argument (adminhtml `di.xml`) of the module's virtual type of this class
 *
 * The items are keyed by a code (a lower-case letter, then up to 63 lower-case letters, digits and underscores), each
 * an array of `label` (source English, translated when read), `route` (an admin route path `route/controller/action`,
 * written with the route id, one of the screens the module's `routes` list), `params` (named strings, optional),
 * `sortOrder` (optional, 0 when left out) and `count` (optional: a {@see ModuleTabCountInterface} whose number is drawn
 * beside the label). Tabs of one sort order are listed by code.
 *
 * A tab's count is read only when the admin may open the tab. A count below 0 is 0. A counter that fails is logged and
 * its tab listed with 0, so one broken counter never takes the navigation, and with it the page, down.
 *
 * @phpstan-import-type ModuleTab from ModuleNavigationInterface
 * @phpstan-type TabDeclaration array{
 *     code: string,
 *     label: string,
 *     route: string,
 *     params: array<string, string>,
 *     sortOrder: int,
 *     count: ModuleTabCountInterface|null
 * }
 */
class ModuleNavigation implements ModuleNavigationInterface
{
    private const CODE = '/\A[a-z][a-z0-9_]{0,63}\z/';
    private const ROUTE = '/\A[A-Za-z0-9_]+\/[A-Za-z0-9_]+\/[A-Za-z0-9_]+\z/';

    /**
     * The checked declarations, sorted; read once
     *
     * @var list<TabDeclaration>|null
     */
    private ?array $declarations = null;

    /**
     * @param AdminRoutesInterface $routes Says which screens the admin may open and builds their keyed addresses
     * @param LoggerInterface $logger Told about a tab's counter that failed
     * @param array<mixed> $items The tabs, keyed by code
     */
    public function __construct(
        private readonly AdminRoutesInterface $routes,
        private readonly LoggerInterface $logger,
        private readonly array $items = []
    ) {
    }

    /**
     * @inheritDoc
     */
    public function getLinks(string $current): array
    {
        $links = [];
        foreach ($this->declarations() as $item) {
            $url = $this->routes->url($item['route'], $item['params']);
            if ($url === null) {
                continue;
            }
            $links[] = [
                'code' => $item['code'],
                'label' => (string) __($item['label']),
                'url' => $url,
                'current' => $item['code'] === $current,
                'count' => $this->count($item),
            ];
        }

        return $links;
    }

    /**
     * @inheritDoc
     */
    public function getPageName(string $current): string
    {
        foreach ($this->declarations() as $item) {
            if ($item['code'] === $current) {
                return (string) __($item['label']);
            }
        }

        return '';
    }

    /**
     * A tab's count; 0 when it has none, or its counter failed
     *
     * @param TabDeclaration $item
     * @return int
     */
    private function count(array $item): int
    {
        if ($item['count'] === null) {
            return 0;
        }
        try {
            return max(0, $item['count']->count());
        } catch (\Throwable $failure) {
            $this->logger->error('The count of an admin tab failed and is left out.', [
                'tab' => $item['code'],
                'counter' => $item['count']::class,
                'exception' => $failure,
            ]);

            return 0;
        }
    }

    /**
     * The declarations, checked and sorted by sort order, then by code
     *
     * @return list<TabDeclaration>
     * @throws \InvalidArgumentException
     */
    private function declarations(): array
    {
        if ($this->declarations !== null) {
            return $this->declarations;
        }
        $declarations = [];
        foreach ($this->items as $code => $item) {
            $declarations[] = $this->declaration((string) $code, $item);
        }
        usort(
            $declarations,
            static fn (array $left, array $right): int => [$left['sortOrder'], $left['code']]
                <=> [$right['sortOrder'], $right['code']]
        );

        return $this->declarations = $declarations;
    }

    /**
     * One tab's declaration, checked
     *
     * @param string $code
     * @param mixed $item
     * @return TabDeclaration
     * @throws \InvalidArgumentException
     */
    private function declaration(string $code, mixed $item): array
    {
        if (preg_match(self::CODE, $code) !== 1 || !is_array($item)) {
            $this->fail($code, 'is keyed by a lower-case code and declared as an array');
        }
        $label = $item['label'] ?? null;
        $route = $item['route'] ?? null;
        $sortOrder = $item['sortOrder'] ?? 0;
        $count = $item['count'] ?? null;
        if (!is_string($label) || trim($label) === '') {
            $this->fail($code, 'has a label');
        }
        if (!is_string($route) || preg_match(self::ROUTE, $route) !== 1) {
            $this->fail($code, 'has a route path, route/controller/action');
        }
        if (!is_numeric($sortOrder)) {
            $this->fail($code, 'has a numeric sort order');
        }
        if ($count !== null && !$count instanceof ModuleTabCountInterface) {
            $this->fail($code, 'has, as its count, a counter of ' . ModuleTabCountInterface::class);
        }

        return [
            'code' => $code,
            'label' => $label,
            'route' => $route,
            'params' => $this->params($code, $item['params'] ?? []),
            'sortOrder' => (int) $sortOrder,
            'count' => $count,
        ];
    }

    /**
     * A tab's route parameters, checked
     *
     * @param string $code
     * @param mixed $params
     * @return array<string, string>
     * @throws \InvalidArgumentException
     */
    private function params(string $code, mixed $params): array
    {
        if (!is_array($params)) {
            $this->fail($code, 'lists its route parameters as an array');
        }
        $checked = [];
        foreach ($params as $name => $value) {
            if (!is_string($name) || $name === '' || !is_string($value)) {
                $this->fail($code, 'has route parameters that are named strings');
            }
            $checked[$name] = $value;
        }

        return $checked;
    }

    /**
     * Refuse a tab declared wrongly
     *
     * @param string $code
     * @param string $rule What a tab must be, completing "A tab …"
     * @return never
     * @throws \InvalidArgumentException Always
     */
    private function fail(string $code, string $rule): never
    {
        throw new \InvalidArgumentException(sprintf(
            'The admin tab "%s" is declared wrongly: a tab %s.',
            $code,
            $rule
        ));
    }
}
