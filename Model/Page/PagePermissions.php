<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Model\Page;

use Hryvinskyi\AdminUi\Api\Page\PagePermissionsInterface;
use Magento\Framework\AuthorizationInterface;

/**
 * A module's permissions from the `resources` array argument (adminhtml `di.xml`) of the module's virtual type of this
 * class: the ACL resource behind each permission, keyed by the name the island reads it by
 *
 * A name is a lower-case letter, then lower-case letters, digits and underscores; a resource is never empty. An entry
 * that breaks either rule fails the page, naming it, rather than reaching the island as a permission no one has.
 */
class PagePermissions implements PagePermissionsInterface
{
    private const NAME = '/\A[a-z][a-z0-9_]{0,63}\z/';

    /**
     * @param AuthorizationInterface $authorization
     * @param array<mixed> $resources The ACL resource behind each permission, keyed by its name
     */
    public function __construct(
        private readonly AuthorizationInterface $authorization,
        private readonly array $resources = []
    ) {
    }

    /**
     * @inheritDoc
     *
     * @throws \InvalidArgumentException When a permission is declared wrongly
     */
    public function granted(): array
    {
        $granted = [];
        foreach ($this->resources as $name => $resource) {
            $name = (string) $name;
            if (preg_match(self::NAME, $name) !== 1 || !is_string($resource) || $resource === '') {
                throw new \InvalidArgumentException(sprintf(
                    'The page permission "%s" is declared wrongly: a permission is keyed by a lower-case name and '
                    . 'names an ACL resource.',
                    $name
                ));
            }
            $granted[$name] = $this->authorization->isAllowed($resource);
        }

        return $granted;
    }
}
