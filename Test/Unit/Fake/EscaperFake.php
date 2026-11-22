<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Test\Unit\Fake;

use Magento\Framework\Escaper;

/**
 * Escapes text, attribute values and addresses as the platform's escaper does for plain text, without an object
 * manager
 */
class EscaperFake extends Escaper
{
    /**
     * @inheritDoc
     *
     * @param string|array<mixed>|null $data
     * @param array<mixed>|null $allowedTags
     */
    public function escapeHtml($data, $allowedTags = null)
    {
        return htmlspecialchars(is_string($data) ? $data : '', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }

    /**
     * @inheritDoc
     */
    public function escapeHtmlAttr($string, $escapeSingleQuote = true)
    {
        return htmlspecialchars((string) $string, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }

    /**
     * @inheritDoc
     */
    public function escapeUrl($string)
    {
        return htmlspecialchars((string) $string, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }
}
