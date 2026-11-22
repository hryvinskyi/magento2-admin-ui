<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Test\Unit\Fake;

use Magento\Framework\TranslateInterface;

/**
 * A translator set to a locale by the test; its dictionary is whatever renderer the test gives phrases
 */
class TranslatorFake implements TranslateInterface
{
    /**
     * @param string $locale
     */
    public function __construct(private string $locale = 'en_US')
    {
    }

    /**
     * @inheritDoc
     */
    public function loadData($area = null, $forceReload = false)
    {
        return $this;
    }

    /**
     * @inheritDoc
     *
     * @return array<string, string>
     */
    public function getData()
    {
        return [];
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
    public function setLocale($locale)
    {
        $this->locale = $locale;

        return $this;
    }

    /**
     * @inheritDoc
     */
    public function getTheme()
    {
        return '';
    }
}
