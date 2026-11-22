<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Test\Unit\Fake;

use Magento\Framework\Phrase\RendererInterface;

/**
 * Translates the texts its dictionary holds, fills `%1` to `%n` placeholders, and leaves every other text as it is
 */
class DictionaryRenderer implements RendererInterface
{
    /**
     * @param array<string, string> $dictionary Translations keyed by source text
     */
    public function __construct(
        private readonly array $dictionary
    ) {
    }

    /**
     * @inheritDoc
     *
     * @param array<mixed> $source
     * @param array<mixed> $arguments
     */
    public function render(array $source, array $arguments)
    {
        $text = end($source);
        $text = is_string($text) ? ($this->dictionary[$text] ?? $text) : '';
        foreach (array_values($arguments) as $index => $argument) {
            $text = str_replace('%' . ($index + 1), is_scalar($argument) ? (string) $argument : '', $text);
        }

        return $text;
    }
}
