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
export declare function MenuButton({ label, menuLabel, actions, open, onOpenChange, icon, id, }: MenuButtonProps): JSX.Element;
