/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * What a card shows in place of its content when there is none to show, drawn where the content would be: a round
 * glyph tile, a title, a line, and an optional action. Three kinds:
 *
 * - `empty`: nothing yet ("No records yet"); the line says when there will be. An action needs its own label
 *   ("Add a rule").
 * - `failed`: the content could not be loaded. It is announced at once (`alert`) and drawn in the error tone; the
 *   line says what still works, and the action is "Try again" in the kit's words unless given another label.
 * - `no-match`: the filters leave nothing; the action is "Clear filters" in the kit's words unless given another.
 *
 * An action is a button when it is done on this screen (`onClick`) and a real link when it goes to another one
 * (`href`), in the same tertiary look: a button carries the kind's glyph (Try again's refresh), a link ends in an
 * arrow instead.
 *
 * Everything outside the card that does not depend on the failed content stays on the page.
 */
import type { JSX } from 'preact';
import { ActionControl } from './ActionControl.tsx';
import { Icon, type IconName } from './icons.tsx';
import { useKit } from './kit-context.tsx';
import type { MessageAction } from './Notice.tsx';

export type CardStateKind = 'empty' | 'failed' | 'no-match';

/** A button whose label may be left to the kit's words for the kind. */
export interface CardStateButtonAction {
    /** Translated; the kit's word for the kind when left out. */
    readonly label?: string | undefined;
    readonly onClick: () => void;
    readonly busy?: boolean | undefined;
    readonly href?: undefined;
}

/** A link to another screen whose label may be left to the kit's words for the kind. */
export interface CardStateLinkAction {
    /** Translated; the kit's word for the kind when left out. */
    readonly label?: string | undefined;
    readonly href: string;
    readonly onClick?: undefined;
    readonly busy?: undefined;
}

/** An action whose label may be left to the kit's words for the kind: a button, or a link to another screen. */
export type CardStateAction = CardStateButtonAction | CardStateLinkAction;

interface CardStateBase {
    /** Translated. */
    readonly title: string;
    /** What it means or what still works; translated. */
    readonly text?: string | undefined;
    /** A glyph in place of the kind's own. */
    readonly icon?: string | undefined;
}

export type CardStateProps = CardStateBase & (
    | { readonly kind: 'empty'; readonly action?: MessageAction | undefined }
    | { readonly kind: 'failed' | 'no-match'; readonly action?: CardStateAction | undefined }
);

interface KindLook {
    readonly icon: IconName;
    /** The tile's colours and whether the glyph is filled. */
    readonly tone: 'neutral' | 'error';
    readonly role: 'alert' | undefined;
    /** The kit's phrase for the action's label; null when the action brings its own. */
    readonly phrase: string | null;
    readonly actionIcon: IconName | undefined;
}

const KINDS = {
    empty: { icon: 'hourglass_empty', tone: 'neutral', role: undefined, phrase: null, actionIcon: undefined },
    failed: { icon: 'error', tone: 'error', role: 'alert', phrase: 'kit.state.retry', actionIcon: 'refresh' },
    'no-match': { icon: 'search', tone: 'neutral', role: undefined, phrase: 'kit.state.clear', actionIcon: undefined },
} as const satisfies Record<CardStateKind, KindLook>;

export function CardState({ kind, title, text, icon, action }: CardStateProps): JSX.Element {
    const { t } = useKit().translator;
    const look: KindLook = KINDS[kind];
    const label = action?.label ?? (look.phrase === null ? undefined : t(look.phrase));
    return (
        <div class="hui-cardstate" data-tone={look.tone} role={look.role}>
            <span class="hui-cardstate__tile">
                <Icon name={icon ?? look.icon} size={26} filled={look.tone === 'error'} />
            </span>
            <span class="hui-cardstate__title">{title}</span>
            {text === undefined ? null : <span class="hui-cardstate__text">{text}</span>}
            {action === undefined || label === undefined ? null : (
                <div class="hui-cardstate__action">
                    <ActionControl target={action} label={label} icon={look.actionIcon} />
                </div>
            )}
        </div>
    );
}
