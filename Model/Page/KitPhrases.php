<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Model\Page;

use Hryvinskyi\AdminUi\Api\Page\KitPhrasesInterface;

/**
 * The kit's phrases in the admin's source language, translated through the module's dictionaries on each read
 *
 * The keys are the ones the kit's browser components ask their translator for; a key missing here shows in the
 * browser as the key itself.
 */
class KitPhrases implements KitPhrasesInterface
{
    /**
     * @inheritDoc
     */
    public function getPhrases(): array
    {
        return [
            'kit.chart.share' => __('%1%')->render(),
            'kit.chart.values' => __('Values of the chart: %1')->render(),
            'kit.colour.invalid' => __('Use a six-digit colour such as #8c4a2b.')->render(),
            'kit.drawer.close' => __('Close')->render(),
            'kit.failure.expired' => __('Your admin session has ended. Reload the page and sign in again.')->render(),
            'kit.failure.forbidden' => __('Your role does not allow this.')->render(),
            'kit.pager.next' => __('Next page')->render(),
            'kit.pager.previous' => __('Previous page')->render(),
            'kit.pager.range' => __('%1–%2 of %3')->render(),
            'kit.secret.keep' => __('Keep the stored secret')->render(),
            'kit.secret.masked' => __('••••••••')->render(),
            'kit.secret.replace' => __('Replace')->render(),
            'kit.secret.stored' => __('Stored encrypted')->render(),
            'kit.select.all' => __('Select all')->render(),
            'kit.select.row' => __('Select %1')->render(),
            'kit.state.clear' => __('Clear filters')->render(),
            'kit.state.retry' => __('Try again')->render(),
            'kit.strip.dismiss' => __('Dismiss')->render(),
            'kit.switch.no' => __('No')->render(),
            'kit.switch.yes' => __('Yes')->render(),
            'kit.table.loading' => __('Loading')->render(),
            'kit.text.count' => __('%1 of %2 characters')->render(),
        ];
    }
}
