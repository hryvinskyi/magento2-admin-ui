/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * Where a value comes from, in the two forms a page shows it:
 *
 * - the origin line: a chip with a glyph and a line ("Inherited from Default", a lock message), and at most one
 *   action that changes it ("Override here", "Use inherited value"). A field shows it under its control; a card or
 *   a table shows it in its head, beside the title.
 * - the origin notice: the muted note that sits where a disabled part starts and says why it cannot be changed,
 *   with at most one action.
 *
 * Both arrive worded: which origin a value has, and what that means, is the page's to decide.
 */
import type { JSX } from 'preact';
import { Icon } from './icons.tsx';
import { Notice } from './Notice.tsx';

/** The one action an origin offers. */
export interface OriginAction {
    /** Translated. */
    readonly label: string;
    readonly onClick: () => void;
}

export interface OriginLineProps {
    /** The line, translated. */
    readonly text: string;
    /** The glyph before the line. */
    readonly icon: string;
    /** The value is set at this level: the chip is tinted like an override. */
    readonly own?: boolean | undefined;
    readonly action?: OriginAction | undefined;
}

export function OriginLine({ text, icon, own = false, action }: OriginLineProps): JSX.Element {
    return (
        <div class="hui-origin-line">
            <span class={own ? 'hui-origin hui-origin--own' : 'hui-origin'}>
                <Icon name={icon} size={14} />
                <span>{text}</span>
            </span>
            {action === undefined ? null : (
                <button type="button" class="hui-button hui-button--link" onClick={action.onClick}>
                    {action.label}
                </button>
            )}
        </div>
    );
}

export interface OriginNoticeProps {
    /** Why the part below cannot be changed, translated. */
    readonly text: string;
    /** The glyph before the text. */
    readonly icon: string;
    readonly action?: OriginAction | undefined;
}

export function OriginNotice({ text, icon, action }: OriginNoticeProps): JSX.Element {
    return (
        <Notice tone="info" muted icon={icon} action={action}>
            {text}
        </Notice>
    );
}
