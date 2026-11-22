<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Model\Page;

use Hryvinskyi\AdminUi\Api\Page\AdminRoutesInterface;
use Hryvinskyi\AdminUi\Api\Page\IslandInterface;
use Hryvinskyi\AdminUi\Api\Page\ModuleNavigationInterface;
use Hryvinskyi\AdminUi\Api\Page\PageContentInterface;
use Hryvinskyi\AdminUi\Api\Page\PagePermissionsInterface;
use Hryvinskyi\AdminUi\Api\Page\PagePhrasesInterface;
use Hryvinskyi\AdminUi\Api\Page\StoreViewListInterface;
use Magento\Framework\Data\Form\FormKey;

/**
 * One page of a module's admin, as an island that draws the whole page: the module's header, its navigation and the
 * page under them (the browser kit's `PageShell` and `parsePageDocument`)
 *
 * A module configures one virtual type of this class with what every page of it shares — its name (`module`, source
 * English, translated when read), its tabs (`navigation`), the screens its pages link to (`routes`), its permissions
 * (`permissions`) and its root class — and one virtual type of that per page, naming the page's island
 * (`name`), its entry module (`entry`), the code of its tab (`page`) and its wording and content (`phrases`,
 * `content`). The document's page part is:
 *
 * - `shell`: `{"module", "page": the page's tab label, "nav": [{"code", "label", "url", "current", "count"}],
 *   "storefront": the default store view's home page}`, the tabs only those the admin may open, each with the number
 *   of things waiting on its page (0 for none);
 * - `stores`: `[{"id", "name", "home"}]`, every store view of the shop;
 * - `phrases`: `{key: text}`, the page's wording, translated;
 * - `urls`: `{name: address}`, the page's endpoints;
 * - `routes`: `{route path: address}`, the keyed address of each screen the page links to that the admin may open;
 *   a link to a screen left out is not drawn;
 * - `formKey`: the admin form key every write carries;
 * - `permissions`: `{name: bool}`, what the admin may do;
 * - `data`: the page's first data.
 *
 * An empty member is printed as an empty JSON object. The pages' shared stylesheet is linked by their layout handle;
 * `styles` names the stylesheets one page needs on top of it (a component's own, linked after the kit's), as file ids
 * the page host checks.
 *
 * @phpstan-import-type JsonObject from IslandInterface
 */
class ModuleIsland implements IslandInterface
{
    /**
     * @param PagePhrasesInterface $phrases The page's wording
     * @param PageContentInterface $content The page's endpoints, links, first data and lines
     * @param ModuleNavigationInterface $navigation The module's tabs
     * @param AdminRoutesInterface $routes The screens the module's pages link to
     * @param PagePermissionsInterface $permissions What the admin may do on the module's pages
     * @param StoreViewListInterface $storeViews
     * @param FormKey $formKey
     * @param string $module The module's name, source English
     * @param string $name The island's name (IslandInterface::NAME_PATTERN)
     * @param string $entry The file id of the page's entry module
     * @param string $page The code of the page's tab in the module navigation
     * @param string $rootClass The root's own classes (IslandInterface::ROOT_CLASS_PATTERN)
     * @param string[] $styles The page's own stylesheets, as file ids
     *     (IslandInterface::STYLE_FILE_ID_PATTERN), in the order they are linked
     */
    public function __construct(
        private readonly PagePhrasesInterface $phrases,
        private readonly PageContentInterface $content,
        private readonly ModuleNavigationInterface $navigation,
        private readonly AdminRoutesInterface $routes,
        private readonly PagePermissionsInterface $permissions,
        private readonly StoreViewListInterface $storeViews,
        private readonly FormKey $formKey,
        private readonly string $module = '',
        private readonly string $name = '',
        private readonly string $entry = '',
        private readonly string $page = '',
        private readonly string $rootClass = '',
        private readonly array $styles = []
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
        return [];
    }

    /**
     * @inheritDoc
     */
    public function getStyles(): array
    {
        return array_values($this->styles);
    }

    /**
     * @inheritDoc
     *
     * @throws \Magento\Framework\Exception\LocalizedException When no form key can be made
     * @throws \InvalidArgumentException When a tab, a linked screen or a permission is declared wrongly
     */
    public function getConfig(): array
    {
        $phrases = $this->phrases->getPhrases();
        $urls = $this->content->getUrls();
        $routes = $this->routes->allowedUrls($this->content->getRoutes());
        $permissions = $this->permissions->granted();
        $data = $this->content->getData();

        return [
            'shell' => [
                'module' => (string) __($this->module),
                'page' => $this->navigation->getPageName($this->page),
                'nav' => $this->navigation->getLinks($this->page),
                'storefront' => $this->storeViews->defaultHome(),
            ],
            'stores' => $this->storeViews->all(),
            'phrases' => $phrases === [] ? (object) [] : $phrases,
            'urls' => $urls === [] ? (object) [] : $urls,
            'routes' => $routes === [] ? (object) [] : $routes,
            'formKey' => $this->formKey->getFormKey(),
            'permissions' => $permissions === [] ? (object) [] : $permissions,
            'data' => $data === [] ? (object) [] : $data,
        ];
    }

    /**
     * @inheritDoc
     */
    public function getLoadingText(): string
    {
        return $this->content->getLoadingText();
    }

    /**
     * @inheritDoc
     */
    public function getFailedText(): string
    {
        return $this->content->getFailedText();
    }
}
