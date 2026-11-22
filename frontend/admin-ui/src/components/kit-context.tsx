/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * What the kit's components read from the page: the admin user's locale and the translator of the kit's own
 * phrases (`kit.*`). The island start provides it around every island; a test provides its own.
 *
 * A component that needs it reads it through `useKit()`, which fails loudly outside a provider: a component drawn
 * without its wording is a wiring fault, not something to paper over with keys. The context is the one the kit's
 * bundle defines, so it reaches an island only when the page holds one copy of the kit — every island imports the
 * kit through its bare specifier.
 */
import { createContext, type ComponentChildren, type JSX } from 'preact';
import { useContext } from 'preact/hooks';
import type { Translator } from '../domain/translator.ts';

export interface Kit {
    /** The admin user's interface locale (`en_US`). */
    readonly locale: string;
    /** Words the kit's own phrases. */
    readonly translator: Translator;
}

const KitContext = createContext<Kit | null>(null);

export interface KitProviderProps {
    readonly kit: Kit;
    readonly children?: ComponentChildren;
}

export function KitProvider({ kit, children }: KitProviderProps): JSX.Element {
    return <KitContext.Provider value={kit}>{children}</KitContext.Provider>;
}

/** A kit component was drawn outside a `KitProvider`. */
export class MissingKitError extends Error {
    constructor() {
        super('A kit component was drawn outside a KitProvider; start the island with startIsland()');
        this.name = 'MissingKitError';
    }
}

/** The kit the nearest `KitProvider` holds; throws `MissingKitError` outside one. */
export function useKit(): Kit {
    const kit = useContext(KitContext);
    if (kit === null) {
        throw new MissingKitError();
    }
    return kit;
}
