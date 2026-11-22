<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Test\Unit\Fake;

use Hryvinskyi\AdminUi\Api\Page\PagePhrasesInterface;

/**
 * A page's wording that answers the phrases it was given, already translated
 */
class FixedPagePhrases implements PagePhrasesInterface
{
    /**
     * @var array<string, string>
     */
    private readonly array $phrases;

    /**
     * @param array<string, string> $phrases Translated texts keyed by phrase key
     */
    public function __construct(array $phrases)
    {
        $this->phrases = $phrases;
    }

    /**
     * @inheritDoc
     */
    public function getPhrases(): array
    {
        return $this->phrases;
    }
}
