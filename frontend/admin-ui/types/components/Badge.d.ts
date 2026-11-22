/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
/**
 * Small labels next to values:
 *
 * - `neutral`: a plain fact ("Store view").
 * - `source`: where a value comes from, with a leading glyph.
 * - `fixed`: something that cannot be changed (dashed, with a lock).
 * - `override`: a value set at this level in place of an inherited one.
 * - `on` / `off`: whether something runs (with a dot, and the words say which).
 * - `warn`: something on with a reservation, or that needs attention, in the warning tone: with a dot, or with the
 *   glyph given in its place.
 * - `recommended`: the suggested option.
 * - `code`: an identifier in monospace.
 */
import type { ComponentChildren, JSX } from 'preact';
export type BadgeVariant = 'neutral' | 'source' | 'fixed' | 'override' | 'on' | 'off' | 'warn' | 'recommended' | 'code';
export interface BadgeProps {
    readonly variant?: BadgeVariant | undefined;
    readonly icon?: string | undefined;
    /** A tooltip explaining the badge; also its accessible description. */
    readonly title?: string | undefined;
    readonly children: ComponentChildren;
}
export declare function Badge({ variant, icon, title, children }: BadgeProps): JSX.Element;
