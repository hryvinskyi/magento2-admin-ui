/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
/**
 * A panel that slides over the right edge of the page to show or edit one row: a modal dialog named by its title,
 * full height over a scrim, 460 px wide (420 px on a narrow screen, the whole width on a small one; a page sets
 * another width through `--hui-drawer-width`). Its header (title, a slot under it, Close) and its footer stay in
 * place while the body scrolls. The footer holds the actions, the primary one first, and at its far end a
 * destructive action drawn as a link.
 *
 * The drawer is open while it is drawn. Escape, a click on the scrim and Close all call the one `onClose`, which
 * leaves without saving. On opening, focus moves into the panel and the page behind stops scrolling; while it is
 * open, Tab and Shift+Tab cycle within it. On closing, focus returns to the element that opened it: the element
 * with `returnFocusId` when it is on the page then (the row's button, found again even when the row was drawn
 * anew), else the element that had focus when the drawer opened, if it is still on the page.
 */
import type { ComponentChildren, JSX } from 'preact';
import type { MessageButtonAction } from './Notice.tsx';
export interface DrawerProps {
    /** Names the dialog; translated. */
    readonly title: string;
    /** A small line above the title ("Order"); translated. */
    readonly eyebrow?: string | undefined;
    /** `code` sets the title in monospace, for an identifier. */
    readonly titleStyle?: 'text' | 'code' | undefined;
    /** Under the title: a line about the row, a copy button. */
    readonly aside?: ComponentChildren | undefined;
    /** Escape, the scrim and Close: leave without saving. */
    readonly onClose: () => void;
    /** The footer's actions, the primary one first. */
    readonly actions?: ComponentChildren | undefined;
    /** A destructive action, drawn as a link at the footer's far end. */
    readonly destructive?: MessageButtonAction | undefined;
    /** The id of the element focus returns to on closing. */
    readonly returnFocusId?: string | undefined;
    readonly children: ComponentChildren;
}
export declare function Drawer({ title, eyebrow, titleStyle, aside, onClose, actions, destructive, returnFocusId, children, }: DrawerProps): JSX.Element;
