/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * A link to another admin screen as the server writes it — a route path (`route_id/controller/action`) and named
 * parameters — and how it becomes an address.
 *
 * A page's document carries the keyed address of each screen the admin may open, by route path; a link's address is
 * that address with the link's parameters appended as a query (the admin's secret key covers the path only, so a
 * query keeps it valid). A link to a screen the document does not list has no address: the admin may not open it, so
 * nothing is drawn for it.
 */
import { at, filledText, keyed, record, text } from './readers.ts';

export interface ScreenLink {
    /** `route_id/controller/action`. */
    readonly route: string;
    /** In the order the server wrote them. */
    readonly params: ReadonlyMap<string, string>;
}

/** An address with parameters appended as a query, after any query it already has. */
export function addressOf(base: string, params: ReadonlyMap<string, string>): string {
    if (params.size === 0) {
        return base;
    }
    const query = [...params]
        .map(([name, value]) => `${encodeURIComponent(name)}=${encodeURIComponent(value)}`)
        .join('&');
    return `${base}${base.includes('?') ? '&' : '?'}${query}`;
}

/** The address of a link; null when the keyed addresses hold none for its screen. */
export function resolveLink(routes: ReadonlyMap<string, string>, link: ScreenLink): string | null {
    const base = routes.get(link.route);
    return base === undefined ? null : addressOf(base, link.params);
}

/** A link to a screen with no parameters. */
export const linkTo = (route: string): ScreenLink => ({ route, params: new Map() });

/** The link with one parameter set, replacing any of the same name and keeping the others in place. */
export function withParam(link: ScreenLink, name: string, value: string): ScreenLink {
    return { route: link.route, params: new Map([...link.params, [name, value]]) };
}

const anyName = { guard: (raw: string): raw is string => raw !== '', expected: 'a parameter name' } as const;

/** A link as the server writes it: `{"route": "route_id/controller/action", "params": {name: value}}`. */
export function screenLink(value: unknown, path: string): ScreenLink {
    const fields = record(value, path);
    return {
        route: filledText(fields['route'], at(path, 'route')),
        params: keyed(fields['params'], at(path, 'params'), anyName, text),
    };
}
