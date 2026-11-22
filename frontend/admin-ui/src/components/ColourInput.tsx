/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * A colour typed as `#` and six digits, with a swatch beside it. The swatch shows the colour only once the text is
 * one; until then it shows a hatched blank. Anything else marks the input invalid and shows the kit's message under
 * it, linked as its description. The check is feedback while typing; the server that stores the colour checks it
 * again, and what it keeps is the authority.
 */
import type { JSX } from 'preact';
import { parseHexColour } from '../domain/hex-colour.ts';
import { Icon } from './icons.tsx';
import { useKit } from './kit-context.tsx';

export interface ColourInputProps {
    readonly id: string;
    readonly value: string;
    readonly onInput: (value: string) => void;
    readonly onBlur?: (() => void) | undefined;
    readonly disabled?: boolean | undefined;
    readonly describedBy?: string | undefined;
    /** The accessible name when no label element names the input. */
    readonly label?: string | undefined;
}

/** The id of a colour input's message, from the input's id. */
export const colourMessageId = (id: string): string => `${id}-colour`;

export function ColourInput({
    id,
    value,
    onInput,
    onBlur,
    disabled = false,
    describedBy,
    label,
}: ColourInputProps): JSX.Element {
    const { t } = useKit().translator;
    const colour = parseHexColour(value);
    const described = [describedBy, colour === null ? colourMessageId(id) : undefined]
        .filter((part) => part !== undefined);
    return (
        <div class="hui-colour">
            <div class="hui-input-row">
                <span
                    class="hui-colour__swatch"
                    data-empty={colour === null ? 'true' : 'false'}
                    style={colour === null ? undefined : { backgroundColor: colour }}
                    aria-hidden="true"
                />
                <input
                    id={id}
                    type="text"
                    class="hui-input hui-input--mono hui-colour__input"
                    value={value}
                    disabled={disabled}
                    aria-invalid={colour === null}
                    aria-describedby={described.length === 0 ? undefined : described.join(' ')}
                    aria-label={label}
                    spellcheck={false}
                    autocomplete="off"
                    onInput={(event) => onInput(event.currentTarget.value)}
                    onBlur={onBlur}
                />
            </div>
            {colour !== null ? null : (
                <div id={colourMessageId(id)} class="hui-field__error">
                    <Icon name="error" size={16} filled />
                    {t('kit.colour.invalid')}
                </div>
            )}
        </div>
    );
}
