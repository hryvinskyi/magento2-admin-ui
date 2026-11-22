/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * A code text cut into lines of coloured segments, from the tokens a language's tokenizer finds in it.
 *
 * A token names a kind and a range of the whole text (`from` inclusive, `to` exclusive, in UTF-16 code units, as
 * string offsets are). Tokens may arrive in any order; a token that overlaps an earlier one keeps only its part after
 * it, a token with an empty or impossible range is ignored, and whatever no token covers is plain. A token that spans
 * several lines colours its part of each. The segments of a line always join back into exactly the line's text, so the
 * highlight drawn from them cannot drift from the text typed.
 */

/** The colours a tokenizer can give: the five of the code palette, plus plain text. */
export type CodeTokenKind = 'key' | 'string' | 'field' | 'directive' | 'number' | 'punctuation' | 'plain';

/** A run of the text of one kind. */
export interface CodeToken {
    readonly kind: CodeTokenKind;
    readonly from: number;
    readonly to: number;
}

/** Finds the tokens of a text. */
export type Tokenizer = (text: string) => readonly CodeToken[];

/** A piece of one line, of one kind. */
export interface CodeSegment {
    readonly kind: CodeTokenKind;
    readonly text: string;
}

/** One line of the text, with a key that stays the same while the line's text does. */
export interface CodeLine {
    /** The line's text, told apart from identical lines above it by their count. */
    readonly key: string;
    readonly text: string;
    readonly segments: readonly CodeSegment[];
}

/** A tokenizer that finds nothing: the whole text is plain. */
export const plainTokens: Tokenizer = () => [];

/** Whether a token's range is a real range of a text `length` long. */
const usable = (token: CodeToken, length: number): boolean =>
    Number.isInteger(token.from) && Number.isInteger(token.to) && token.from < token.to && token.to > 0
    && token.from < length;

/** The text cut into lines, each into the segments the tokens colour. */
export function codeLines(text: string, tokens: readonly CodeToken[]): readonly CodeLine[] {
    const sorted = tokens.filter((token) => usable(token, text.length)).sort((a, b) => a.from - b.from);
    const seen = new Map<string, number>();
    const lines: CodeLine[] = [];
    let first = 0;
    let lineStart = 0;
    for (const lineText of text.split('\n')) {
        const lineEnd = lineStart + lineText.length;
        while (first < sorted.length && (sorted[first]?.to ?? 0) <= lineStart) {
            first += 1;
        }
        const segments: CodeSegment[] = [];
        let position = lineStart;
        for (let index = first; index < sorted.length; index += 1) {
            const token = sorted[index];
            if (token === undefined || token.from >= lineEnd) {
                break;
            }
            const from = Math.max(token.from, position);
            const to = Math.min(token.to, lineEnd);
            if (to > from) {
                if (from > position) {
                    segments.push({ kind: 'plain', text: text.slice(position, from) });
                }
                segments.push({ kind: token.kind, text: text.slice(from, to) });
                position = to;
            }
        }
        if (position < lineEnd) {
            segments.push({ kind: 'plain', text: text.slice(position, lineEnd) });
        }
        const count = seen.get(lineText) ?? 0;
        seen.set(lineText, count + 1);
        lines.push({ key: count === 0 ? lineText : `${lineText}\u0000${String(count)}`, text: lineText, segments });
        lineStart = lineEnd + 1;
    }
    return lines;
}

/** Whether two lines are drawn alike: the same segments, of the same kinds, in the same order. */
export function sameSegments(a: readonly CodeSegment[], b: readonly CodeSegment[]): boolean {
    return a.length === b.length
        && a.every((segment, index) => segment.kind === b[index]?.kind && segment.text === b[index]?.text);
}

/**
 * How many rows an editor shows for `lineCount` lines: as many as the lines, never fewer than `min`, and never more
 * than `max` when one is given (the rest scrolls).
 */
export function visibleRows(lineCount: number, min: number, max?: number): number {
    const wanted = max === undefined ? lineCount : Math.min(lineCount, max);
    return Math.max(min, wanted);
}
