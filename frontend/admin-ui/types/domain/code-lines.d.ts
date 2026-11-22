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
export declare const plainTokens: Tokenizer;
/** The text cut into lines, each into the segments the tokens colour. */
export declare function codeLines(text: string, tokens: readonly CodeToken[]): readonly CodeLine[];
/** Whether two lines are drawn alike: the same segments, of the same kinds, in the same order. */
export declare function sameSegments(a: readonly CodeSegment[], b: readonly CodeSegment[]): boolean;
/**
 * How many rows an editor shows for `lineCount` lines: as many as the lines, never fewer than `min`, and never more
 * than `max` when one is given (the rest scrolls).
 */
export declare function visibleRows(lineCount: number, min: number, max?: number): number;
