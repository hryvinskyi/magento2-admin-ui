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
export declare function CardFrame({ icon, title, subtitle, aside, children }: CardFrameProps): JSX.Element;
