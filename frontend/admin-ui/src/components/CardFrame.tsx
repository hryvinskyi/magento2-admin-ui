/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * A card whose rows run edge to edge: the kit's card head with a line under its title that says what the card holds,
 * then the card's rows straight under the head, with no padded body and no rule of the head's own
 * (`hui-card--flush`). Content at the right end of the head (a search field, a counter) goes in its aside. For a card of
 * fields, the kit's `Card` is the part to use.
 */
import type { ComponentChildren, JSX } from 'preact';
import { Icon } from './icons.tsx';

export interface CardFrameProps {
    readonly icon: string;
    /** Translated. */
    readonly title: string;
    /** Translated. */
    readonly subtitle: string;
    /** Content at the right end of the head (a search field, a counter). */
    readonly aside?: ComponentChildren | undefined;
    readonly children: ComponentChildren;
}

export function CardFrame({ icon, title, subtitle, aside, children }: CardFrameProps): JSX.Element {
    return (
        <section class="hui-card hui-card--flush">
            <div class="hui-card__head">
                <span class="hui-card__tile"><Icon name={icon} size={20} /></span>
                <div class="hui-card__heading">
                    <h3 class="hui-card__title">{title}</h3>
                    <p class="hui-card__subtitle">{subtitle}</p>
                </div>
                {aside === undefined ? null : <div class="hui-card__aside">{aside}</div>}
            </div>
            {children}
        </section>
    );
}
