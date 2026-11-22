/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
/**
 * The kit's boxes: a card groups the fields of one topic under a glyph tile and a title; a panel is the plainer
 * box of the side column (a status, a summary); columns put the fields beside such panels, and below them when the
 * page is narrow.
 */
import type { ComponentChildren, JSX } from 'preact';
export interface CardProps {
    readonly icon: string;
    /** Translated. */
    readonly title: string;
    /** Content at the right end of the title row (a counter, a chip). */
    readonly aside?: ComponentChildren | undefined;
    readonly children: ComponentChildren;
}
export declare function Card({ icon, title, aside, children }: CardProps): JSX.Element;
export interface PanelProps {
    /** Translated. */
    readonly title: string;
    /** A glyph before the title. */
    readonly icon?: string | undefined;
    /** Announce changes of the body to assistive technology (a status that follows the fields). */
    readonly live?: boolean | undefined;
    readonly children: ComponentChildren;
}
export declare function Panel({ title, icon, live, children }: PanelProps): JSX.Element;
export interface ColumnsProps {
    /** The side column (340 px wide; below the main column when the page is narrow). */
    readonly aside?: ComponentChildren | undefined;
    readonly children: ComponentChildren;
}
export declare function Columns({ aside, children }: ColumnsProps): JSX.Element;
