/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * One field: the label with an optional tag beside it, the help line, the control, the problems with it, and an
 * optional line under it (where the value comes from, an `OriginLine`). Everything arrives worded; the row decides
 * nothing about the value it labels.
 *
 * The control is the caller's, given the id the label names; `fieldIds` and `describedBy` give the ids of the
 * row's parts, so the control can point `aria-describedby` at the help line and the problems that are shown.
 */
import type { ComponentChildren, JSX } from 'preact';
import { Icon } from './icons.tsx';

/** The ids of a field's parts, from the id of its control. */
export interface FieldIds {
    readonly control: string;
    readonly label: string;
    readonly help: string;
    readonly error: string;
}

export function fieldIds(controlId: string): FieldIds {
    return { control: controlId, label: `${controlId}-label`, help: `${controlId}-help`, error: `${controlId}-error` };
}

/** The `aria-describedby` of a control: its help line and its problems, those that are shown. */
export function describedBy(
    controlId: string,
    parts: { readonly help: boolean; readonly error: boolean },
): string | undefined {
    const ids = fieldIds(controlId);
    const list = [parts.help ? ids.help : null, parts.error ? ids.error : null].filter((id) => id !== null);
    return list.length === 0 ? undefined : list.join(' ');
}

export interface FieldRowProps {
    /** The id of the control the label names. */
    readonly controlId: string;
    /** Translated. */
    readonly label: string;
    /** A short tag next to the label ("Store view", "Required"); translated. */
    readonly tag?: string | undefined;
    /** Translated. */
    readonly help?: string | undefined;
    /** The problems to show, translated, one line each; none shows nothing. */
    readonly problems?: readonly string[] | undefined;
    /**
     * Whether the label is a `<label for>` (inputs, selects, switches). A control that names itself — a radio group
     * with its own label — gets a plain caption instead.
     */
    readonly labelFor?: boolean | undefined;
    /** Shown under the control and its problems: where the value comes from (an `OriginLine`). */
    readonly origin?: ComponentChildren | undefined;
    /** The control. */
    readonly children: ComponentChildren;
}

export function FieldRow({
    controlId,
    label,
    tag,
    help,
    problems = [],
    labelFor = true,
    origin,
    children,
}: FieldRowProps): JSX.Element {
    const ids = fieldIds(controlId);
    return (
        <div class="hui-field">
            <div class="hui-field__head">
                {labelFor
                    ? <label id={ids.label} for={ids.control} class="hui-field__label">{label}</label>
                    : <span id={ids.label} class="hui-field__label">{label}</span>}
                {tag === undefined ? null : <span class="hui-field__tag">{tag}</span>}
            </div>
            {help === undefined ? null : <div id={ids.help} class="hui-field__help">{help}</div>}
            {children}
            {problems.length === 0 ? null : (
                <div id={ids.error} role="alert">
                    {problems.map((problem) => (
                        <div key={problem} class="hui-field__error">
                            <Icon name="error" size={16} filled />
                            {problem}
                        </div>
                    ))}
                </div>
            )}
            {origin}
        </div>
    );
}
