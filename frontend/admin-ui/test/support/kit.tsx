/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * The kit as a test provides it: a translator over the kit's phrases that records every key it is asked for and
 * every key it lacks, and a render that wraps the tree in the `KitProvider`.
 *
 * The phrases are the kit's shared list (`Test/_contract/kit-phrases.json`, `{"keys": [...]}`), each its own key as
 * text, so a test that finds something by its words finds it by the key.
 */
import { readFileSync } from 'node:fs';
import { render, type RenderResult } from '@testing-library/preact';
import type { ComponentChildren, JSX } from 'preact';
import { createTranslator, KitProvider, type Kit } from '@hryvinskyi/admin-ui';

const KIT_PHRASES = new URL('../../../../Test/_contract/kit-phrases.json', import.meta.url);

/** The kit's phrase keys, as the shared list holds them. */
export const KIT_PHRASE_KEYS: readonly string[] = readKitKeys();

function readKitKeys(): readonly string[] {
    const value: unknown = JSON.parse(readFileSync(KIT_PHRASES, 'utf8'));
    const keys: unknown = typeof value === 'object' && value !== null ? Reflect.get(value, 'keys') : undefined;
    if (!Array.isArray(keys) || !keys.every((key: unknown): key is string => typeof key === 'string')) {
        throw new Error(`${KIT_PHRASES.pathname}: expected {"keys": [string, ...]}`);
    }
    return Object.freeze([...keys]);
}

/** The phrases a kit was asked for, and the keys it lacked. */
export interface PhraseLog {
    readonly asked: Set<string>;
    readonly missing: Set<string>;
}

export const phraseLog = (): PhraseLog => ({ asked: new Set(), missing: new Set() });

/** Phrases that record each key whose text is read. */
class RecordedPhrases extends Map<string, string> {
    private readonly log: PhraseLog;

    constructor(phrases: Iterable<readonly [string, string]>, log: PhraseLog) {
        super(phrases);
        this.log = log;
    }

    override get(key: string): string | undefined {
        this.log.asked.add(key);
        return super.get(key);
    }
}

/**
 * A kit in English locale whose phrases are the shared list's keys, each its own text unless `texts` gives it one,
 * recorded in `log`.
 */
export function testKit(log: PhraseLog = phraseLog(), texts: Readonly<Record<string, string>> = {}): Kit {
    return {
        locale: 'en_US',
        translator: createTranslator({
            locale: 'en_US',
            phrases: new RecordedPhrases(KIT_PHRASE_KEYS.map((key): [string, string] => [key, texts[key] ?? key]), log),
            onMissing: (key: string): void => void log.missing.add(key),
        }),
    };
}

/** Renders `ui` inside a `KitProvider` holding `kit`. */
export function renderWithKit(ui: JSX.Element, kit: Kit = testKit()): RenderResult {
    const Wrapper = ({ children }: { readonly children?: ComponentChildren }): JSX.Element =>
        <KitProvider kit={kit}>{children}</KitProvider>;
    return render(ui, { wrapper: Wrapper });
}
