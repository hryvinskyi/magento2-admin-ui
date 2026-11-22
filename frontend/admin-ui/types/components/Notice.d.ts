/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
/**
 * Messages in four tones, each with its own glyph so the tone never rests on colour alone:
 *
 * - a message strip sits under the page's heading and may carry one action ("Go to the next step"), and a link to
 *   the screen where the person goes on ("Open it"), drawn as a tertiary button with an arrow; a strip that reports
 *   what just happened ("The copy is switched off.") may also be dismissed, by a close button at its end that says so
 *   in the kit's words (`kit.strip.dismiss`);
 * - a notice sits among the fields (a warning, an informational note); a muted notice is an informational aside on
 *   a grey ground (why the controls below cannot be changed). A notice may carry one action too ("Override here").
 *
 * An action is a button when it is done on this screen (`onClick`) and a real link when it goes to another one
 * (`href`), in the same tertiary look; a link ends in an arrow.
 *
 * Warnings and errors are announced the moment they appear (`alert`); a success is announced politely (`status`);
 * an informational note is plain text. `role` overrides that.
 */
import type { ComponentChildren, JSX } from 'preact';
export type Tone = 'info' | 'success' | 'warning' | 'error';
export type MessageRole = 'alert' | 'status' | 'none';
/** An action done on this screen: a button. */
export interface MessageButtonAction {
    /** Translated. */
    readonly label: string;
    readonly onClick: () => void;
    /** In progress: the action does nothing when pressed and is marked busy. */
    readonly busy?: boolean | undefined;
    readonly href?: undefined;
}
/** A link a message offers to the screen where the person goes on. */
export interface MessageLink {
    /** Translated. */
    readonly label: string;
    readonly href: string;
}
/** An action that goes to another screen: a real link drawn as a button. */
export interface MessageLinkAction extends MessageLink {
    readonly onClick?: undefined;
    readonly busy?: undefined;
}
/** What a message or a card offers to do: a button on this screen, or a link to another. */
export type MessageAction = MessageButtonAction | MessageLinkAction;
export interface MessageStripProps {
    readonly tone: Tone;
    readonly action?: MessageAction | undefined;
    /** A link at the strip's end, after any action. */
    readonly link?: MessageLink | undefined;
    readonly role?: MessageRole | undefined;
    /** Takes the strip away; given, the strip ends in a close button. */
    readonly onDismiss?: (() => void) | undefined;
    readonly children: ComponentChildren;
}
export declare function MessageStrip({ tone, action, link, role, onDismiss, children }: MessageStripProps): JSX.Element;
export interface NoticeProps {
    readonly tone: Tone;
    readonly role?: MessageRole | undefined;
    /** A glyph other than the tone's own (`visibility_off` for a part that shows nothing yet). */
    readonly icon?: string | undefined;
    /** Drawn on a grey ground, as an aside rather than a message. */
    readonly muted?: boolean | undefined;
    readonly action?: MessageAction | undefined;
    readonly children: ComponentChildren;
}
export declare function Notice({ tone, role, icon, muted, action, children }: NoticeProps): JSX.Element;
