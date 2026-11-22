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
import { type StoreView } from '../domain/store-views.ts';
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
type AllChoice = {
    readonly allowAll?: true | undefined;
    readonly allLabel: string;
} | {
    readonly allowAll: false;
    readonly allLabel?: undefined;
};
export type StoreViewPickerProps = StoreViewPickerBase & AllChoice;
/** The id of the bar's line, from the select's id. */
export declare const storeLineId: (id: string) => string;
export declare function StoreViewPicker(props: StoreViewPickerProps): JSX.Element;
export {};
