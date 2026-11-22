<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Model\Page;

use Hryvinskyi\AdminUi\Api\Page\KeyedAdminUrlInterface;
use Magento\Backend\Model\UrlInterface;

/**
 * Builds a keyed admin address on the shared backend URL builder, switching its secret key on for the one address
 * when it is off, and back off afterwards, even when building the address fails
 *
 * Where the admin uses no secret keys at all, switching on changes nothing and the address carries none, as every
 * other admin address of the request.
 */
class KeyedAdminUrl implements KeyedAdminUrlInterface
{
    /**
     * @param UrlInterface $backendUrl
     */
    public function __construct(private readonly UrlInterface $backendUrl)
    {
    }

    /**
     * @inheritDoc
     */
    public function getUrl(string $route, array $params = []): string
    {
        $keyed = $this->backendUrl->useSecretKey();
        if (!$keyed) {
            $this->backendUrl->turnOnSecretKey();
        }
        try {
            return $this->backendUrl->getUrl($route, $params);
        } finally {
            if (!$keyed) {
                $this->backendUrl->turnOffSecretKey();
            }
        }
    }
}
