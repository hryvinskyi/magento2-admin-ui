# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-11-06

### Added
- The admin UI kit: one stylesheet, `Hryvinskyi_AdminUi::css/admin-ui.css`, linked by the layout handle
  `hryvinskyi_admin_ui` on the pages that ask for it.
- Two roots: `hui` (tokens and base rules: typeface, `box-sizing`, the admin-theme button resets, the focus ring,
  headings, `[hidden]`) and `hui-tokens` (tokens only, for markup the module does not own).
- Components; a base component class is a single `hui-` class, while tones and states can weigh more, up to four
  (a consumer restyles a tone or a state through its tokens): buttons and links (primary, secondary, tertiary, quiet, link,
  anchor, and `control` for a button in a row of fields), card and panel, columns, stack and grid, notice and strip, field and origin, input, select, switch, radios
  and radio cards, badges (a state as a dot and a word: on, off and warn), status panel, code block with an actions
  slot, list of rows, disclosure (a native `<details>` or a link button), icon sizes and `hui-sr-only`.
- A card head's title with a muted line under it (`hui-card__heading`, `hui-card__subtitle`), a wrapping row of
  actions (`hui-actions`) and a grid of label and value pairs (`hui-facts`: `__item`, `__label`, `__value`).
- Every colour, radius, shadow and font stack as a `--hui-*` custom property on the outermost kit root, at no weight
  of its own, so a module restyles the kit by overriding properties.
- Source Sans 3 (latin subset, weights 400, 600 and 700, from `@fontsource/source-sans-3` 5.3.0, SIL Open Font
  License 1.1), served from the module's own static files.
