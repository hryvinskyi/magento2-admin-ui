/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * The readers every parser of the server's answers is built from. A reader takes an `unknown` and the path it sits
 * at, and returns the typed value or throws a `ContractError` naming that path, so the first wrong field stops the
 * parse and a half-read answer never reaches the screen.
 */
import type { JsonObject, JsonValue } from './json.ts';

/** The server's answer does not have the agreed shape: a bug between the two sides, never a person's mistake. */
export class ContractError extends Error {
    readonly path: string;
    readonly expected: string;

    constructor(path: string, expected: string) {
        super(`${path}: expected ${expected}`);
        this.name = 'ContractError';
        this.path = path;
        this.expected = expected;
    }
}

/**
 * Whether a thrown value is a contract error. Matched by name and shape rather than `instanceof`: the kit and each
 * island are separate bundles, so a class from one is not the class another sees.
 */
export function isContractError(error: unknown): error is ContractError {
    return error instanceof Error
        && error.name === 'ContractError'
        && typeof Reflect.get(error, 'path') === 'string'
        && typeof Reflect.get(error, 'expected') === 'string';
}

export type Fields = Readonly<Record<string, unknown>>;

export const isRecord = (value: unknown): value is Fields =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

/** The path of a key below `path`, quoted so any key reads unambiguously. */
export const at = (path: string, key: string): string => `${path}[${JSON.stringify(key)}]`;

export function record(value: unknown, path: string): Fields {
    if (!isRecord(value)) {
        throw new ContractError(path, 'an object');
    }
    return value;
}

export function list(value: unknown, path: string): readonly unknown[] {
    if (!Array.isArray(value)) {
        throw new ContractError(path, 'an array');
    }
    return value;
}

export function text(value: unknown, path: string): string {
    if (typeof value !== 'string') {
        throw new ContractError(path, 'a string');
    }
    return value;
}

export function filledText(value: unknown, path: string): string {
    const parsed = text(value, path);
    if (parsed.trim() === '') {
        throw new ContractError(path, 'a non-empty string');
    }
    return parsed;
}

export function bool(value: unknown, path: string): boolean {
    if (typeof value !== 'boolean') {
        throw new ContractError(path, 'a boolean');
    }
    return value;
}

export function finite(value: unknown, path: string): number {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new ContractError(path, 'a finite number');
    }
    return value;
}

/** A whole number. */
export function wholeNumber(value: unknown, path: string): number {
    const number = finite(value, path);
    if (!Number.isInteger(number)) {
        throw new ContractError(path, 'a whole number');
    }
    return number;
}

/** The value `read` reads, or null where the server sent null. */
export const nullable = <T>(value: unknown, path: string, read: (value: unknown, path: string) => T): T | null =>
    (value === null ? null : read(value, path));

/** One word of a closed set, typed as that set. */
export function oneOf<W extends string>(words: readonly W[], value: unknown, path: string): W {
    const word = text(value, path);
    const found = words.find((candidate) => candidate === word);
    if (found === undefined) {
        throw new ContractError(path, `one of ${words.join(', ')}`);
    }
    return found;
}

/** A string a guard accepts, typed as what the guard proves. */
export function branded<T extends string>(guard: (raw: string) => raw is T, value: unknown, path: string, expected: string): T {
    if (typeof value !== 'string' || !guard(value)) {
        throw new ContractError(path, expected);
    }
    return value;
}

/** An optional field: absent and `null` both mean "not given". */
export function optional<T>(fields: Fields, key: string, path: string, read: (value: unknown, path: string) => T): T | undefined {
    const value = fields[key];
    return value === undefined || value === null ? undefined : read(value, `${path}.${key}`);
}

export function items<T>(value: unknown, path: string, read: (item: unknown, path: string) => T): readonly T[] {
    return list(value, path).map((item, index) => read(item, `${path}[${index}]`));
}

/** An object whose every key a guard accepts, each value read by `read`; in the order the server sent them. */
export function keyed<K extends string, T>(
    value: unknown,
    path: string,
    key: { readonly guard: (raw: string) => raw is K; readonly expected: string },
    read: (item: unknown, path: string, key: K) => T,
): ReadonlyMap<K, T> {
    const parsed = new Map<K, T>();
    for (const [raw, item] of Object.entries(record(value, path))) {
        const name = branded(key.guard, raw, at(path, raw), key.expected);
        parsed.set(name, read(item, at(path, raw), name));
    }
    return parsed;
}

/** Any JSON value; a number must be finite. */
export function json(value: unknown, path: string): JsonValue {
    if (value === null || typeof value === 'boolean' || typeof value === 'string') {
        return value;
    }
    if (typeof value === 'number') {
        return finite(value, path);
    }
    if (Array.isArray(value)) {
        return items(value, path, json);
    }
    return jsonObject(value, path);
}

/** A JSON object, every value inside it plain JSON. */
export function jsonObject(value: unknown, path: string): JsonObject {
    const parsed: Record<string, JsonValue> = {};
    for (const [key, item] of Object.entries(record(value, path))) {
        parsed[key] = json(item, at(path, key));
    }
    return parsed;
}
