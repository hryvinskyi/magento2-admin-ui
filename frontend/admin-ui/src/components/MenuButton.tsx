/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * A glyph button that opens a short menu of actions for one row (Duplicate, Export, Delete): the button says it opens
 * a menu and whether it is open, the menu is named, and each action is a menu item with its glyph. An action that
 * destroys something is drawn in the error tone.
 *
 * The page holds whether the menu is open, so it can mark the row while it is. Opening moves focus to the first
 * action; the arrow keys move between the actions (wrapping), Home and End to the first and the last. Escape closes
 * the menu and gives focus back to the button; Tab, a press outside the menu and choosing an action close it too.
 * Choosing an action closes the menu and gives focus back to the button before the action runs.
 */
import type { JSX } from 'preact';
import { useEffect, useId, useRef } from 'preact/hooks';
import { tabAfterKey } from '../domain/arrow-choice.ts';
import { Icon } from './icons.tsx';

/** One action of the menu. */
export interface MenuAction {
    /** Unique within the menu. */
    readonly key: string;
    /** Translated. */
    readonly label: string;
    readonly icon?: string | undefined;
    /** `danger` for an action that destroys something. */
    readonly tone?: 'neutral' | 'danger' | undefined;
    readonly onSelect: () => void;
}

export interface MenuButtonProps {
    /** The button's accessible name ("More for Product"); translated. */
    readonly label: string;
    /** The menu's accessible name (the row's name); translated. */
    readonly menuLabel: string;
    readonly actions: readonly MenuAction[];
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
    /** The button's glyph; three dots when left out. */
    readonly icon?: string | undefined;
    readonly id?: string | undefined;
}

type Close = (giveFocusBack: boolean) => void;

/** What the keys other than the arrows do inside the open menu: Escape closes it and gives focus back, Tab moves on. */
const MENU_KEYS: ReadonlyMap<string, (event: KeyboardEvent, close: Close) => void> = new Map([
    ['Escape', (event: KeyboardEvent, close: Close): void => {
        event.preventDefault();
        close(true);
    }],
    ['Tab', (_event: KeyboardEvent, close: Close): void => close(false)],
]);

const itemsOf = (menu: HTMLElement | null): HTMLElement[] =>
    menu === null ? [] : Array.from(menu.querySelectorAll<HTMLElement>('[role="menuitem"]'));

export function MenuButton({
    label,
    menuLabel,
    actions,
    open,
    onOpenChange,
    icon = 'more_vert',
    id,
}: MenuButtonProps): JSX.Element {
    const own = useId();
    const menuId = `${own}-menu`;
    const root = useRef<HTMLSpanElement>(null);
    const button = useRef<HTMLButtonElement>(null);
    const menu = useRef<HTMLDivElement>(null);
    // Read by the listener, so the latest callback counts rather than the one of the drawing that opened the menu.
    const latest = useRef(onOpenChange);
    latest.current = onOpenChange;

    useEffect(() => {
        if (!open) {
            return undefined;
        }
        itemsOf(menu.current)[0]?.focus();
        const document = root.current?.ownerDocument;
        if (document === undefined) {
            return undefined;
        }
        const outside = (event: Event): void => {
            const target = event.target;
            if (!(target instanceof Node) || root.current?.contains(target) !== true) {
                latest.current(false);
            }
        };
        document.addEventListener('pointerdown', outside, true);
        return (): void => document.removeEventListener('pointerdown', outside, true);
    }, [open]);

    const close: Close = (giveFocusBack) => {
        latest.current(false);
        if (giveFocusBack) {
            button.current?.focus();
        }
    };

    const onKeyDown = (event: KeyboardEvent): void => {
        const items = itemsOf(menu.current);
        const keys = items.map((_item, index) => String(index));
        const current = items.findIndex((item) => item === item.ownerDocument.activeElement);
        const next = tabAfterKey(keys, String(Math.max(current, 0)), event.key);
        if (next !== null) {
            event.preventDefault();
            items[Number(next)]?.focus();
            return;
        }
        MENU_KEYS.get(event.key)?.(event, close);
    };

    const choose = (action: MenuAction): void => {
        close(true);
        action.onSelect();
    };

    return (
        <span ref={root} class="hui-menu">
            <button
                ref={button}
                type="button"
                id={id}
                class="hui-menu__button"
                aria-label={label}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-controls={open ? menuId : undefined}
                onClick={() => onOpenChange(!open)}
            >
                <Icon name={icon} size={20} />
            </button>
            {open ? (
                <div ref={menu} id={menuId} role="menu" class="hui-menu__list" aria-label={menuLabel} onKeyDown={onKeyDown}>
                    {actions.map((action) => (
                        <button
                            key={action.key}
                            type="button"
                            role="menuitem"
                            tabIndex={-1}
                            class="hui-menu__item"
                            data-tone={action.tone ?? 'neutral'}
                            onClick={() => choose(action)}
                        >
                            {action.icon === undefined ? null : <Icon name={action.icon} size={18} />}
                            {action.label}
                        </button>
                    ))}
                </div>
            ) : null}
        </span>
    );
}
