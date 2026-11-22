<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Test\Unit\Fake;

use Magento\Framework\Locale\ResolverInterface;

/**
 * Answers the locale it is given
 */
class LocaleFake implements ResolverInterface
{
    /**
     * @param string $locale
     */
    public function __construct(
        private string $locale
    ) {
    }

    /**
     * @inheritDoc
     */
    public function getDefaultLocalePath()
    {
        return 'general/locale/code';
    }

    /**
     * @inheritDoc
     */
    public function setDefaultLocale($locale)
    {
        return $this;
    }

    /**
     * @inheritDoc
     */
    public function getDefaultLocale()
    {
        return $this->locale;
    }

    /**
     * @inheritDoc
     */
    public function setLocale($locale = null)
    {
        $this->locale = is_string($locale) ? $locale : $this->locale;

        return $this;
    }

    /**
     * @inheritDoc
     */
    public function getLocale()
    {
        return $this->locale;
    }

    /**
     * @inheritDoc
     */
    public function emulate($scopeId)
    {
        return null;
    }

    /**
     * @inheritDoc
     */
    public function revert()
    {
        return null;
    }
}
