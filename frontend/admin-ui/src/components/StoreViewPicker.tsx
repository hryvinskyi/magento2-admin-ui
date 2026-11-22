/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * A bar that chooses the store view a page shows: a labelled select of every store view together (unless the page
 * leaves that out) and each listed view, and a line after it that says what the choice means on this page. Every
 * word — the label, the "every store view" option, the line — is the page's; the bar knows only the views it is
 * given. The line describes the select (`aria-describedby`), so it is read with the choice.
 *
 * `value` is `null` for every store view, or the id of one of `stores`.
 */
import type { JSX } from 'preact';
import {
    storeViewFromOption,
    storeViewOf,
    storeViewOption,
    storeViewOptions,
    type StoreView,
} from '../domain/store-views.ts';
import { Icon } from './icons.tsx';
import { SelectInput } from './SelectInput.tsx';

interface StoreViewPickerBase {
    /** The select's id; the line's id is derived from it. */
    readonly id: string;
    readonly stores: readonly StoreView[];
    readonly value: number | null;
    readonly onChange: (value: number | null) => void;
    /** The label beside the select; translated. */
    readonly label: string;
    /** The line after the select for the chosen view (`null`: every view); translated. Left out, no line. */
    readonly line?: ((view: StoreView | null) => string) | undefined;
    readonly disabled?: boolean | undefined;
}

/** Every store view together is a choice unless `allowAll` is false; its option's text is `allLabel`. */
type AllChoice =
    | { readonly allowAll?: true | undefined; readonly allLabel: string }
    | { readonly allowAll: false; readonly allLabel?: undefined };

export type StoreViewPickerProps = StoreViewPickerBase & AllChoice;

/** The id of the bar's line, from the select's id. */
export const storeLineId = (id: string): string => `${id}-line`;

export function StoreViewPicker(props: StoreViewPickerProps): JSX.Element {
    const { id, stores, value, onChange, label, line, disabled = false } = props;
    const options = storeViewOptions(stores, props.allowAll === false ? null : props.allLabel);
    const choose = (option: string): void => {
        const next = storeViewFromOption(option, stores);
        if (next !== undefined) {
            onChange(next);
        }
    };
    return (
        <div class="hui-storebar">
            <label class="hui-storebar__label" for={id}>
                <Icon name="language" size={18} />
                {label}
            </label>
            <SelectInput
                id={id}
                value={storeViewOption(value)}
                options={options}
                onChange={choose}
                width="auto"
                strong
                disabled={disabled}
                describedBy={line === undefined ? undefined : storeLineId(id)}
            />
            {line === undefined ? null : (
                <span id={storeLineId(id)} class="hui-storebar__line">{line(storeViewOf(stores, value))}</span>
            )}
        </div>
    );
}
