/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
export interface ScreenLink {
    /** `route_id/controller/action`. */
    readonly route: string;
    /** In the order the server wrote them. */
    readonly params: ReadonlyMap<string, string>;
}
/** An address with parameters appended as a query, after any query it already has. */
export declare function addressOf(base: string, params: ReadonlyMap<string, string>): string;
/** The address of a link; null when the keyed addresses hold none for its screen. */
export declare function resolveLink(routes: ReadonlyMap<string, string>, link: ScreenLink): string | null;
/** A link to a screen with no parameters. */
export declare const linkTo: (route: string) => ScreenLink;
/** The link with one parameter set, replacing any of the same name and keeping the others in place. */
export declare function withParam(link: ScreenLink, name: string, value: string): ScreenLink;
/** A link as the server writes it: `{"route": "route_id/controller/action", "params": {name: value}}`. */
export declare function screenLink(value: unknown, path: string): ScreenLink;
