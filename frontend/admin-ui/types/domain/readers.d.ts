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
export declare class ContractError extends Error {
    readonly path: string;
    readonly expected: string;
    constructor(path: string, expected: string);
}
/**
 * Whether a thrown value is a contract error. Matched by name and shape rather than `instanceof`: the kit and each
 * island are separate bundles, so a class from one is not the class another sees.
 */
export declare function isContractError(error: unknown): error is ContractError;
export type Fields = Readonly<Record<string, unknown>>;
export declare const isRecord: (value: unknown) => value is Fields;
/** The path of a key below `path`, quoted so any key reads unambiguously. */
export declare const at: (path: string, key: string) => string;
export declare function record(value: unknown, path: string): Fields;
export declare function list(value: unknown, path: string): readonly unknown[];
export declare function text(value: unknown, path: string): string;
export declare function filledText(value: unknown, path: string): string;
export declare function bool(value: unknown, path: string): boolean;
export declare function finite(value: unknown, path: string): number;
/** A whole number. */
export declare function wholeNumber(value: unknown, path: string): number;
/** The value `read` reads, or null where the server sent null. */
export declare const nullable: <T>(value: unknown, path: string, read: (value: unknown, path: string) => T) => T | null;
/** One word of a closed set, typed as that set. */
export declare function oneOf<W extends string>(words: readonly W[], value: unknown, path: string): W;
/** A string a guard accepts, typed as what the guard proves. */
export declare function branded<T extends string>(guard: (raw: string) => raw is T, value: unknown, path: string, expected: string): T;
/** An optional field: absent and `null` both mean "not given". */
export declare function optional<T>(fields: Fields, key: string, path: string, read: (value: unknown, path: string) => T): T | undefined;
export declare function items<T>(value: unknown, path: string, read: (item: unknown, path: string) => T): readonly T[];
/** An object whose every key a guard accepts, each value read by `read`; in the order the server sent them. */
export declare function keyed<K extends string, T>(value: unknown, path: string, key: {
    readonly guard: (raw: string) => raw is K;
    readonly expected: string;
}, read: (item: unknown, path: string, key: K) => T): ReadonlyMap<K, T>;
/** Any JSON value; a number must be finite. */
export declare function json(value: unknown, path: string): JsonValue;
/** A JSON object, every value inside it plain JSON. */
export declare function jsonObject(value: unknown, path: string): JsonObject;
