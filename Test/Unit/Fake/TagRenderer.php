<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Test\Unit\Fake;

use Magento\Framework\View\Helper\SecureHtmlRenderer;

/**
 * Prints each tag it is asked for as written, its attributes in the given order and unescaped, and records each one
 *
 * It stands in for the platform's secure renderer, which adds what the content security policy asks of a tag; here the
 * printed markup shows exactly what was asked for.
 */
class TagRenderer extends SecureHtmlRenderer
{
    /**
     * Each tag asked for: its name, attributes, content and whether the content is text to escape
     *
     * @var list<array{tag: string, attributes: array<string, string>, content: string|null, text: bool}>
     */
    public array $asked = [];

    /**
     * The parent's collaborators are not needed: every tag is printed here
     */
    public function __construct()
    {
    }

    /**
     * @inheritDoc
     *
     * @param array<string, string> $attributes
     */
    public function renderTag(
        string $tagName,
        array $attributes,
        ?string $content = null,
        bool $textContent = true
    ): string {
        $this->asked[] = [
            'tag' => $tagName,
            'attributes' => $attributes,
            'content' => $content,
            'text' => $textContent,
        ];
        $printed = '';
        foreach ($attributes as $name => $value) {
            $printed .= sprintf(' %s="%s"', $name, $value);
        }

        return sprintf('<%1$s%2$s>%3$s</%1$s>', $tagName, $printed, (string) $content);
    }
}
