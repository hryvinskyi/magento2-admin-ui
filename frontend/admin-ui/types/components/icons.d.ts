/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
/**
 * The kit's glyphs as inline SVG, so the admin loads no icon font from a third party.
 *
 * The path data is taken from Material Symbols (Outlined, weight 400, 24 px optical size; the
 * `@material-symbols/svg-400` package, version 0.40.2) by Google, licensed under the Apache License, Version 2.0
 * (https://www.apache.org/licenses/LICENSE-2.0). The paths are copied unchanged, split over lines; `FILLED` holds the
 * filled variant of the glyphs that also appear filled. Each glyph keeps its Material Symbols name, except three that
 * keep the older name admin designs still use for a glyph the package now publishes under another one: `expand_more`
 * is `keyboard_arrow_down`, `expand_less` is `keyboard_arrow_up` and `remove_circle` is `do_not_disturb_on`.
 *
 * The set holds general-purpose glyphs: arrows, states, actions, places, documents, data and code. A glyph is
 * decorative (hidden from assistive technology) unless it is given a label; then it is announced as an image with
 * that label. A name the set does not hold draws the fallback glyph: a page may name a glyph this build lacks, and
 * that is not an error. The progress glyph turns wherever it is drawn.
 */
import type { JSX } from 'preact';
/** Outlined glyphs by name. */
declare const GLYPHS: {
    readonly account_tree: string;
    readonly add: 'M450-450H200v-60h250v-250h60v250h250v60H510v250h-60v-250Z';
    readonly apartment: string;
    readonly arrow_back: 'm274-450 248 248-42 42-320-320 320-320 42 42-248 248h526v60H274Z';
    readonly arrow_forward: 'M686-450H160v-60h526L438-758l42-42 320 320-320 320-42-42 248-248Z';
    readonly article: string;
    readonly assignment_return: string;
    readonly block: string;
    readonly bolt: string;
    readonly category: string;
    readonly check: 'M378-246 154-470l43-43 181 181 384-384 43 43-427 427Z';
    readonly check_circle: string;
    readonly checklist: string;
    readonly chevron_left: 'M561-240 320-481l241-241 43 43-198 198 198 198-43 43Z';
    readonly chevron_right: 'M530-481 332-679l43-43 241 241-241 241-43-43 198-198Z';
    readonly close: 'm249-207-42-42 231-231-231-231 42-42 231 231 231-231 42 42-231 231 231 231-42 42-231-231-231 231Z';
    readonly cloud_done: string;
    readonly code: 'M320-242 80-482l242-242 43 43-199 199 197 197-43 43Zm318 2-43-43 199-199-197-197 43-43 240 240-242 242Z';
    readonly code_blocks: string;
    readonly code_off: string;
    readonly content_copy: string;
    readonly dashboard_customize: string;
    readonly data_object: string;
    readonly database: string;
    readonly delete: string;
    readonly description: string;
    readonly difference: string;
    readonly done_all: string;
    readonly download: string;
    readonly draft: string;
    readonly edit: string;
    readonly edit_note: string;
    readonly error: string;
    readonly expand_less: 'M480-554 283-357l-43-43 240-240 240 240-43 43-197-197Z';
    readonly expand_more: 'M480-344 240-584l43-43 197 197 197-197 43 43-240 240Z';
    readonly fact_check: string;
    readonly filter_alt_off: string;
    readonly flag: string;
    readonly format_list_numbered: string;
    readonly format_quote: string;
    readonly home: string;
    readonly hourglass_empty: string;
    readonly hourglass_top: string;
    readonly info: string;
    readonly inventory: string;
    readonly inventory_2: string;
    readonly label: string;
    readonly language: string;
    readonly lightbulb: string;
    readonly link: string;
    readonly local_shipping: string;
    readonly location_on: string;
    readonly lock: string;
    readonly more_vert: string;
    readonly near_me: 'M527-120 413-413 120-527v-43l720-270-270 720h-43Zm18-114 192-503-502 192 224 86 86 225Zm-86-225Z';
    readonly open_in_new: string;
    readonly pause_circle: string;
    readonly person: string;
    readonly play_arrow: 'M320-203v-560l440 280-440 280Zm60-280Zm0 171 269-171-269-171v342Z';
    readonly priority_high: string;
    readonly progress_activity: string;
    readonly public: string;
    readonly quiz: string;
    readonly redo: string;
    readonly refresh: string;
    readonly remove: 'M200-450v-60h560v60H200Z';
    readonly remove_circle: string;
    readonly repeat: string;
    readonly rocket_launch: string;
    readonly rule: string;
    readonly save: string;
    readonly schedule: string;
    readonly search: string;
    readonly search_off: string;
    readonly south_east: 'M364-200v-60h294L160-758l42-42 498 498v-294h60v396H364Z';
    readonly storefront: string;
    readonly style: string;
    readonly subdirectory_arrow_right: 'm566-120-43-43 162-162H200v-475h60v415h426L524-547l43-43 233 233-234 237Z';
    readonly swap_horiz: string;
    readonly text_fields: 'M290-160v-540H80v-100h520v100H390v540H290Zm360 0v-340H520v-100h360v100H750v340H650Z';
    readonly translate: string;
    readonly travel_explore: string;
    readonly tune: string;
    readonly upload: string;
    readonly view_list: string;
    readonly visibility: string;
    readonly visibility_off: string;
    readonly warning: string;
    readonly web: string;
    readonly widgets: string;
    readonly wifi_off: string;
};
export type IconName = keyof typeof GLYPHS;
/** The glyph drawn for a name the set does not hold. */
export declare const FALLBACK_ICON: IconName;
/** Whether the set holds a glyph of this name. */
export declare function isIconName(name: string): name is IconName;
/** Every glyph name the set holds, in alphabetical order. */
export declare const ICON_NAMES: readonly IconName[];
/** The glyph for a run-time name, or `fallback` when the set does not hold it. */
export declare function iconOr(name: string | undefined, fallback?: IconName): IconName;
/** Rendered sizes in pixels; each has its own class in the admin UI kit's stylesheet. */
export type IconSize = 14 | 16 | 18 | 20 | 22 | 24 | 26 | 28 | 30;
export interface IconProps {
    /** A glyph of the set; any other name draws the fallback glyph. */
    readonly name: string;
    readonly size?: IconSize | undefined;
    /** The filled variant, where the glyph has one. */
    readonly filled?: boolean | undefined;
    /** Announces the glyph as an image with this text; left out, the glyph is decorative. */
    readonly label?: string | undefined;
    readonly class?: string | undefined;
}
export declare function Icon({ name, size, filled, label, class: extra }: IconProps): JSX.Element;
export {};
