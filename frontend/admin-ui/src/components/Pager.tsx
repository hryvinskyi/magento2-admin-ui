/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * The line under a paged list: which rows it shows ("13–24 of 48,210", numbers formatted for the locale) and the
 * buttons to the previous and the next page, named in the kit's words. The range is a polite status, so moving to
 * another page is announced. At either end the button that leads nowhere is marked unavailable and does nothing, but
 * keeps its place in the Tab order, so focus is not lost on the last press.
 */
import type { JSX } from 'preact';
import { pageRange } from '../domain/pager.ts';
import { Icon } from './icons.tsx';
import { useKit } from './kit-context.tsx';

export interface PagerProps {
    /** The page shown, from 1. */
    readonly page: number;
    readonly pageSize: number;
    readonly total: number;
    /** Asked for the page to show next. */
    readonly onPage: (page: number) => void;
}

export function Pager({ page, pageSize, total, onPage }: PagerProps): JSX.Element {
    const { t, n } = useKit().translator;
    const range = pageRange(page, pageSize, total);
    const step = (available: boolean, to: number) => (): void => {
        if (available) {
            onPage(to);
        }
    };
    return (
        <div class="hui-pager">
            <span class="hui-pager__range" role="status">
                {t('kit.pager.range', n(range.first), n(range.last), n(range.total))}
            </span>
            <button
                type="button"
                class="hui-pager__button"
                aria-label={t('kit.pager.previous')}
                aria-disabled={range.hasPrevious ? undefined : true}
                onClick={step(range.hasPrevious, range.page - 1)}
            >
                <Icon name="chevron_left" size={20} />
            </button>
            <button
                type="button"
                class="hui-pager__button"
                aria-label={t('kit.pager.next')}
                aria-disabled={range.hasNext ? undefined : true}
                onClick={step(range.hasNext, range.page + 1)}
            >
                <Icon name="chevron_right" size={20} />
            </button>
        </div>
    );
}
