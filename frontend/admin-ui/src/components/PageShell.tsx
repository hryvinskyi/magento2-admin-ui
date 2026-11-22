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
import { Icon } from './icons.tsx';
import { ModuleNav } from './ModuleNav.tsx';

export interface PageShellProps {
    readonly shell: ModuleShell;
    /** The module's glyph, in the header's tile. */
    readonly icon: string;
    /** The page's actions in the header. */
    readonly actions?: ComponentChildren | undefined;
    readonly children: ComponentChildren;
}

export function PageShell({ shell, icon, actions, children }: PageShellProps): JSX.Element {
    return (
        <div class="hui-page">
            <header class="hui-page__header">
                <div class="hui-page__brand">
                    <span class="hui-page__tile"><Icon name={icon} size={26} /></span>
                    <div class="hui-page__heading">
                        <p class="hui-page__module">{shell.module}</p>
                        <h1 class="hui-page__title">{shell.page}</h1>
                    </div>
                </div>
                {actions === undefined ? null : <div class="hui-actions hui-page__actions">{actions}</div>}
            </header>
            <ModuleNav
                label={shell.module}
                items={shell.nav.map((item) => ({ href: item.url, label: item.label, current: item.current, count: item.count }))}
            />
            {children}
        </div>
    );
}

/** The page's main column, under the navigation and any bar. */
export function PageMain({ children }: { readonly children: ComponentChildren }): JSX.Element {
    return <main class="hui-page__main">{children}</main>;
}
