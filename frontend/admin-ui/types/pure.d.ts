/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */
/**
 * The kit's pure part: what a framework-free module of an island (its domain) may import from
 * `@hryvinskyi/admin-ui` — the sentence a pure module chooses, a link to another admin screen, and the types they
 * are made of. None of it touches the DOM, the network or the UI library.
 *
 * The kit's entry module exports every one of these as well, and an island imports them from there at run time. This
 * file exists for the type check alone: its declarations (`types/pure.d.ts`) need neither the DOM nor the UI library,
 * so an island's domain project maps the kit's specifier to them and proves its pure modules reach nothing else.
 */
export type { Brand } from './domain/brand.ts';
export type { PhraseParam } from './domain/translator.ts';
export { phrase, type Phrase } from './domain/phrase.ts';
export { addressOf, linkTo, resolveLink, withParam, type ScreenLink } from './domain/screen-link.ts';
