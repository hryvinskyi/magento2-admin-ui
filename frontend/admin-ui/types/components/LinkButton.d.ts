/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
/**
 * A link drawn as one of the kit's buttons: a real link, so it opens in a new tab like any link, with an arrow after
 * its words when it moves the person on to another screen. A link to another site or to the storefront opens in a
 * new tab without handing it this page, with the glyph that says so.
 */
import type { ComponentChildren, JSX } from 'preact';
export type LinkVariant = 'primary' | 'secondary' | 'tertiary' | 'quiet' | 'link';
export interface LinkButtonProps {
    readonly href: string;
    readonly variant: LinkVariant;
    /** An arrow after the words. */
    readonly forward?: boolean | undefined;
    /** Another site, or the storefront: opened in a new tab. */
    readonly external?: boolean | undefined;
    readonly children: ComponentChildren;
}
export declare function LinkButton({ href, variant, forward, external, children }: LinkButtonProps): JSX.Element;
