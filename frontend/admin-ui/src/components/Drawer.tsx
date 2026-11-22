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
import { useEffect, useId, useRef } from 'preact/hooks';
import { Icon } from './icons.tsx';
import { useKit } from './kit-context.tsx';
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

/** What can take focus inside the panel, in document order. */
const FOCUSABLE = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'summary',
    '[tabindex]:not([tabindex="-1"])',
].join(', ');

/** Keeps Tab and Shift+Tab within the panel, wrapping at either end. */
function keepFocusInside(event: KeyboardEvent, panel: HTMLElement): void {
    const items = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)];
    const first = items[0];
    const last = items[items.length - 1];
    const active = panel.ownerDocument.activeElement;
    if (first === undefined || last === undefined) {
        event.preventDefault();
        panel.focus();
        return;
    }
    const wrapTo = event.shiftKey
        ? (active === first || active === panel ? last : null)
        : (active === last ? first : null);
    if (wrapTo !== null) {
        event.preventDefault();
        wrapTo.focus();
    }
}

/** What each key does inside the open drawer. */
const KEYS: ReadonlyMap<string, (event: KeyboardEvent, panel: HTMLElement, close: () => void) => void> = new Map([
    ['Escape', (event: KeyboardEvent, _panel: HTMLElement, close: () => void): void => {
        event.preventDefault();
        close();
    }],
    ['Tab', (event: KeyboardEvent, panel: HTMLElement): void => keepFocusInside(event, panel)],
]);

/** The element focus returns to: the one with the id when it is on the page, else the opener if it still is. */
function returnTarget(document: Document, id: string | undefined, opener: HTMLElement | null): HTMLElement | null {
    const named = id === undefined ? null : document.getElementById(id);
    if (named !== null) {
        return named;
    }
    return opener !== null && opener.isConnected ? opener : null;
}

export function Drawer({
    title,
    eyebrow,
    titleStyle = 'text',
    aside,
    onClose,
    actions,
    destructive,
    returnFocusId,
    children,
}: DrawerProps): JSX.Element {
    const { t } = useKit().translator;
    const titleId = useId();
    const panel = useRef<HTMLDivElement>(null);
    // Read when the drawer closes, so the latest ones count rather than those of the first drawing.
    const latest = useRef({ onClose, returnFocusId });
    latest.current = { onClose, returnFocusId };
    const close = (): void => latest.current.onClose();

    useEffect(() => {
        const element = panel.current;
        if (element === null) {
            return undefined;
        }
        const document = element.ownerDocument;
        const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const overflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        element.focus();
        return (): void => {
            document.body.style.overflow = overflow;
            // After the drawing that closed the drawer is complete: a row drawn anew in it is on the page by then.
            queueMicrotask(() => returnTarget(document, latest.current.returnFocusId, opener)?.focus());
        };
    }, []);

    const onKeyDown = (event: KeyboardEvent): void => {
        const element = panel.current;
        const handle = KEYS.get(event.key);
        if (element !== null && handle !== undefined) {
            handle(event, element, close);
        }
    };

    const footer = actions === undefined && destructive === undefined ? null : (
        <div class="hui-drawer__foot">
            {actions}
            {destructive === undefined ? null : (
                <button
                    type="button"
                    class="hui-button hui-button--link hui-drawer__destructive"
                    aria-busy={destructive.busy === true ? true : undefined}
                    onClick={destructive.busy === true ? undefined : () => destructive.onClick()}
                >
                    {destructive.label}
                </button>
            )}
        </div>
    );

    return (
        <div class="hui-drawer">
            <div class="hui-drawer__scrim" aria-hidden="true" onClick={close} />
            <div
                ref={panel}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                class="hui-drawer__panel"
                tabIndex={-1}
                onKeyDown={onKeyDown}
            >
                <div class="hui-drawer__head">
                    <div class="hui-drawer__heading">
                        {eyebrow === undefined ? null : <span class="hui-drawer__eyebrow">{eyebrow}</span>}
                        <h2 id={titleId} class={`hui-drawer__title hui-drawer__title--${titleStyle}`}>{title}</h2>
                        {aside}
                    </div>
                    <button type="button" class="hui-drawer__close" aria-label={t('kit.drawer.close')} onClick={close}>
                        <Icon name="close" size={22} />
                    </button>
                </div>
                <div class="hui-drawer__body">{children}</div>
                {footer}
            </div>
        </div>
    );
}
