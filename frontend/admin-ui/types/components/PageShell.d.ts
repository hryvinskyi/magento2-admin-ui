/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
/**
 * What every page of a module draws around its content (`hui-page`): the header — the module's glyph tile, its name
 * above the page's name, and the page's own actions at the right — then the module navigation with the current page
 * marked and each tab's count of things waiting beside its label, then whatever the page puts under it (a store-view
 * bar, its main column, `PageMain`). Every word comes from the page's document.
 *
 * The frame is a size container named `hui-page`: it is narrow when its own box is 900 px wide or less, whatever the
 * window, so the admin's side menu does not decide the layout. A page's stylesheet asks
 * `@container hui-page (max-width: 900px)` for its own narrow rules.
 */
import type { ComponentChildren, JSX } from 'preact';
import type { ModuleShell } from '../domain/page-document.ts';
export interface PageShellProps {
    readonly shell: ModuleShell;
    /** The module's glyph, in the header's tile. */
    readonly icon: string;
    /** The page's actions in the header. */
    readonly actions?: ComponentChildren | undefined;
    readonly children: ComponentChildren;
}
export declare function PageShell({ shell, icon, actions, children }: PageShellProps): JSX.Element;
/** The page's main column, under the navigation and any bar. */
export declare function PageMain({ children }: {
    readonly children: ComponentChildren;
}): JSX.Element;
