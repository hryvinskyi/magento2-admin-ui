/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * The one action a message or a card state offers, in the kit's tertiary look. An action done on this screen is a
 * button (`onClick`, which may be busy); an action that takes the person to another screen is a real link (`href`),
 * drawn by `LinkButton` with an arrow after its words, so it opens in a new tab like any link. An action is one or
 * the other: the type allows `href` beside `onClick` on neither.
 */
import type { JSX } from 'preact';
import { Button } from './Button.tsx';
import type { IconName } from './icons.tsx';
import { LinkButton } from './LinkButton.tsx';

/** An action done on this screen. */
export interface PressedAction {
    readonly onClick: () => void;
    /** In progress: the action does nothing when pressed and is marked busy. */
    readonly busy?: boolean | undefined;
    readonly href?: undefined;
}

/** An action that goes to another screen. */
export interface FollowedAction {
    readonly href: string;
    readonly onClick?: undefined;
    readonly busy?: undefined;
}

export type ActionTarget = PressedAction | FollowedAction;

export interface ActionControlProps {
    readonly target: ActionTarget;
    /** Translated. */
    readonly label: string;
    /** A glyph before the words of a button; a link ends in its arrow instead. */
    readonly icon?: IconName | undefined;
}

export function ActionControl({ target, label, icon }: ActionControlProps): JSX.Element {
    if (target.href !== undefined) {
        return <LinkButton href={target.href} variant="tertiary" forward>{label}</LinkButton>;
    }
    return <Button variant="tertiary" icon={icon} onClick={target.onClick} busy={target.busy}>{label}</Button>;
}
