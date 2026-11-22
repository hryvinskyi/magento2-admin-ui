# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-11-22

### Added
- A store-view bar: `StoreViewPicker` in the browser kit and `hui-storebar` (`__label`, `__line`) in the stylesheet. A
  labelled select of every store view together (unless the page leaves it out) and each view it is given, and a line
  the page words for the choice; the line goes under the select at 900 px.
- A code editor: `CodeEditor` in the browser kit and `hui-code-editor` in the stylesheet. A text area over a
  highlight layer built from elements and text nodes, a gutter of line numbers, a marked line, a status bar with a
  message and a hint, a pluggable tokenizer and completer, Tab and Shift+Tab indenting, and a read-only mode.
- The pure functions behind them: `storeViewOptions`, `storeViewOption`, `storeViewFromOption`, `storeViewOf`,
  `codeLines`, `sameSegments`, `visibleRows`, `indentSelection`, `outdentSelection`, `replaceRange`, `lineAt`,
  `usableCompletion` and `itemAfterKey`.
- `Badge` takes the `warn` variant (the stylesheet's `hui-badge--warn`), with a dot, or the given glyph in its place.
- `Button` takes the `control` variant (`hui-button--secondary hui-button--control`).
- A row menu: `MenuButton` in the browser kit and `hui-menu` (`__button`, `__list`, `__item`, `data-tone="danger"`) in
  the stylesheet. A glyph button that opens a named menu of actions under it; the page holds whether it is open, the
  arrow keys, Home and End move between the actions, Escape, Tab, a press outside and choosing an action close it.
- `Switch` takes `words`, the page's own words beside the track (On / Off) in place of the kit's yes and no.
- `MessageStrip` takes `onDismiss`: the strip ends in a close button (`hui-strip__dismiss`) named by the kit's new
  phrase `kit.strip.dismiss` ("Dismiss").
- `MessageStrip` takes `link` (`MessageLink`, a label and an address): a real link at the strip's end to the screen
  where the person goes on, drawn as a tertiary button with an arrow.
- `LinkButton` takes the `tertiary` variant, for a link inside a message or a card.
- `ModuleIsland` takes `styles`, the view files of stylesheets the page links beside the module's own (a widget's
  stylesheet another module ships), in the order given.
- `CardFrame` takes `aside`: content at the right end of the card's head (`hui-card__aside`), such as a search field.
- `JsonRequestOptions` takes `answered`: statuses outside the successes whose JSON body is the request's answer, such
  as a 409 that carries the version someone else saved first; other requests still report such a status as `server`.
- The module page: a module's admin pages share one header, one row of tabs, the store views, the screens they link
  to and the admin's permissions, built on the server into each page's island document and read and drawn by the
  browser kit.
  - Server: `Model\Page\ModuleIsland` (an `IslandInterface` a module configures by virtual types), and the ports it
    is built from, each with a default implementation a module configures in its `di.xml`:
    `Api\Page\KeyedAdminUrlInterface` (an admin address that always carries its secret key),
    `Api\Page\AdminRoutesInterface` (the screens the pages link to and the resource that opens each),
    `Api\Page\ModuleNavigationInterface` (the tabs), `Api\Page\PagePermissionsInterface` (named permissions and
    their resources) and `Api\Page\StoreViewListInterface` (the store views with their home pages); the page's own
    part is `Api\Page\PagePhrasesInterface` and `Api\Page\PageContentInterface`. The module now declares
    `Magento_Store`.
  - Browser kit: `parsePageDocument` with `ModuleShell`, `ModuleTab`, `PageStoreView`, `PageDocument` and
    `PageDocumentSpec`; links to other screens (`ScreenLink`, `linkTo`, `withParam`, `addressOf`, `resolveLink`, the
    `screenLink` reader); `createLatestRequest` and `settle`; `createPageClient` and `READ_DEADLINE_MS`;
    `createPageTranslator`; `PageProvider`, `usePage`, `MissingPageError`, `worded`, `phrase` and `Phrase`;
    `failureText` and `canRetry`; the components `PageShell`, `PageMain`, `CardFrame` and `LinkButton`.
  - Stylesheet: the frame `hui-page` (`__header`, `__brand`, `__tile`, `__heading`, `__module`, `__title`,
    `__actions`, `__main`), a size container named `hui-page` that is narrow at 900 px of its own width; and
    `hui-card--flush`, a card whose rows run edge to edge under its head.
  - The readers `wholeNumber`, `nullable` and `oneOf`.
  - `types/pure.d.ts`: the declarations of the kit's pure part, for an island's domain project to type-check against
    without the DOM.
  - The kit's phrases `kit.failure.expired` and `kit.failure.forbidden`, in all 26 locales.
- `StatePill` takes `filled`: an `ok` pill in the positive tint and a `muted` one in grey, with the filled variant of
  the glyph (`hui-pill--filled` in the stylesheet).
- A count on a module tab: a tab of `ModuleNavigation` takes `count`, an `Api\Page\ModuleTabCountInterface` whose
  number of things waiting on the tab's page each tab of the page document carries (`count`, 0 for none);
  `ModuleTab` reads it (left out when 0, and when an older document lacks it) and `PageShell` draws it beside the
  label. A counter that fails is logged and its tab counted as 0. `ModuleNavigation` now takes a logger.
- `SegmentedControl` options take `icon`: a kit glyph drawn before the label. `hui-segmented__option` lays a glyph
  and its label out in a row.
- `isAnsweredRefusal`: whether a request failed because the server refused it on purpose (`rejected`, `forbidden`).
- Count texts in every plural form of the admin's language: `Api\Page\PluralPhrasesInterface` (`forms()` for an
  island's document, `sentence()` for a sentence the server builds) and `Api\Page\PluralCategoriesInterface`, with
  `Model\Page\PluralPhrases` and `Model\Page\IcuPluralCategories` (CLDR rules from PHP's intl extension). A further
  category (`zero`, `two`, `few`, `many`) is the dictionary row keyed by the `other` text and ` [plural:<category>]`.
  The module now requires `ext-intl`.
- Glyphs: `add`, `apartment`, `article`, `assignment_return`, `category`, `code`, `code_blocks`, `code_off`,
  `content_copy`, `dashboard_customize`, `data_object`, `database`, `delete`, `download`, `draft`, `filter_alt_off`,
  `flag`, `format_list_numbered`, `format_quote`, `home`, `hourglass_top`, `inventory`, `inventory_2`, `lightbulb`,
  `local_shipping`, `location_on`, `more_vert`, `near_me`, `play_arrow`, `quiz`, `remove`, `remove_circle` (with its
  filled variant), `repeat`, `rule`, `search_off`, `style`, `swap_horiz`, `text_fields`, `travel_explore`, `upload`,
  `web` and `widgets`.
- An action of `Notice`, `MessageStrip` and `CardState` may be a real link to another screen (`href`) as well as a
  button on this screen (`onClick`), drawn as `LinkButton`'s tertiary look with an arrow after its words; a card
  state's link takes the kit's word for its kind as a button does. `MessageAction` is `MessageButtonAction` or
  `MessageLinkAction`, and `CardStateAction` is `CardStateButtonAction` or `CardStateLinkAction`; an action is one or
  the other, never both.
- `localeTag`: the admin's locale code as the BCP 47 tag an `Intl` formatter takes (`de_CH` → `de-CH`).
- The module declares `psr/log` (`^2 || ^3`, as the framework does), which `ModuleNavigation`'s logger comes from.
- Tokens: the code editor's colours (`--hui-code-key`, `--hui-code-string`, `--hui-code-field`,
  `--hui-code-directive`, `--hui-code-number`, `--hui-code-punctuation`, each at least 7:1 on `--hui-code-bg`), its
  line numbers, marked line, caret and selection (`--hui-code-gutter`, `--hui-code-mark`, `--hui-code-mark-ink`,
  `--hui-code-caret`, `--hui-code-selection`), and the shadow of its list (`--hui-shadow-popover`).
- `hui-icon--spin` in the stylesheet: the glyph turns once a second (`@keyframes hui-icon-spin`) and stands still
  for a person who asks for reduced motion (`prefers-reduced-motion: reduce`).

### Changed
- The progress glyph turns wherever it is drawn. `Icon` draws `progress_activity` with `hui-icon--spin`, so the
  glyph in a status tile, a busy button, a card state or a row turns without the caller asking; no other glyph
  carries the class.
- On a kit page that removes the platform's page title (an island that draws its own heading), the admin header's
  search, notifications and user menu stay at the right edge, where they sit beside a title; they no longer slide to
  the left. The header keeps the admin's own padding and height. Pages that print the title are unchanged.
- One shape for every button. `hui-button` has a 1px transparent border, the box radius (`--hui-radius-box`, 6px)
  in place of the pill radius, and a `8px 14px` padding; a variant sets only the colour of the border, the
  background and the text, never the border width or the radius.
  - `hui-button--primary`: `8px 14px 8px 20px` padding (was 9px top and bottom) and a 1px border (was 2px).
  - `hui-button--secondary`: the base padding and a 1px border (was 2px).
  - `hui-button--tertiary`: `7px 14px` padding (was `6px 14px`) and a 1px border (was 2px); it stays the compact
    size at 13px.
  - `hui-button--quiet`: unchanged in size; it takes the radius from the base.
  - `hui-button--control` keeps the fields' height and the control radius; the base already gives it the 1px border.
  - `hui-button--link` still has no border, no radius and no padding.

  Primary, secondary and quiet are now one height, so buttons of different weight line up in one row. The class
  names, the hover and colour rules, and the script's `Button` are unchanged.
- A notice's glyph sits on the first line of its text: a notice whose text wraps no longer centres the glyph beside
  the middle of the paragraph. Its text and its action share a baseline, and beside a tertiary action the first line
  and the glyph sit on the button's centre line, so a one-line notice keeps its height and its centred look. The
  notice's line height is `--hui-notice-leading` (1.5), which places the glyph. A browser without `:has()` keeps the
  earlier centred layout.
- `MessageAction` is now a union of a button and a link: code that only builds one is unchanged, code that reads
  `onClick` from one narrows it first (`action.href === undefined`). `Drawer`'s destructive action is a
  `MessageButtonAction`, the shape it always had.
- `createLatestRequest` no longer reports an answered refusal (`rejected`, `forbidden`) to its reporter: the page
  words it, and it is no fault. Network failures, timeouts, server failures, an ended session and anything else
  thrown are still reported.

Every export, selector and token of 1.2 is unchanged; apart from the button shape, the notice's glyph, the refusals
no longer reported and `MessageAction` becoming a union above, the kit and the stylesheet only grow.

## [1.2.0] - 2026-11-22 (never tagged on its own; released as part of 1.3.0)

### Added
- The kit's phrases in 25 more locales besides `en_US`, machine-translated.
- The browser kit: the kit's parts as Preact components, the kit's own wording (`kit.*` phrases translated by the
  server), a JSON client with the admin's request rules, the readers every parser of the server's answers is built
  from, and the island start (`startIsland`), built from `frontend/admin-ui/` into one ES module published to the page
  as `@hryvinskyi/admin-ui`, beside one copy of Preact. Its type declarations are published in
  `frontend/admin-ui/types/` for islands of other packages to type-check against.
- The island page host: the layout handle `hryvinskyi_admin_ui_island`, `Api\Page\IslandInterface` (what a page's
  island is), `Api\Page\IslandPageInterface` (the page a controller opens with its island), the import map and module
  script renderer, and the kit's phrases (`Api\Page\KitPhrasesInterface`). The page prints the island's root, its
  document and its scripts through the platform's secure renderer.
- The parts of list and report pages, each as a component of the browser kit and as plain `hui-*` classes for
  server-rendered markup: text area with a character count (`hui-input--area`, `hui-area`), segmented control
  (`hui-segmented`), filter chips (`hui-chips`, `hui-chip`), tabs with counts (`hui-tabs`, `hui-tabpanel`), module
  navigation (`hui-modnav`), data table with open, flagged, ticked, group and placeholder rows (`hui-table`), pager
  (`hui-pager`), drawer (`hui-drawer`), card states for nothing yet, could not load and nothing matches
  (`hui-cardstate`), state pill (`hui-pill`), progress bar (`hui-progress`), colour input (`hui-colour`), and a stacked
  bar and per-day bars with a table for screen readers (`hui-chart`, `hui-stackbar`, `hui-daybars`).
- The pure functions behind them, exported by the kit: `pageRange`, `parseHexColour`, `selectionState`,
  `afterSelectAll`, `afterToggle`, `sharesOf`, `heightsOf`, `fractionOf`, `characterCount`, `lengthState` and
  `tabAfterKey`.
- Tokens: the chart series (`--hui-series-1` … `--hui-series-4`), the drawer (`--hui-drawer-width`,
  `--hui-drawer-width-narrow`, `--hui-drawer-layer`, `--hui-scrim`, `--hui-shadow-drawer`, `--hui-shadow-foot`), the
  raised segment (`--hui-shadow-segment`) and the colour swatch's ring (`--hui-swatch-ring`).
- Glyphs `chevron_left` and `chevron_right`.

Every selector, token and value of 1.1 is unchanged; the stylesheet only grows.

## [1.1.0] - 2026-11-07

### Changed
- A brighter blue palette: the accent is `#3b63fb` (with its hover, ink, background and tile, the
  "own" row tokens, the switch's on track, the focus ring and links), and the positive colour is `#008f5d` with
  `#007a4d` for text.
- A notice (`hui-notice`) centres its icon, text and action on one line, so a one-line notice reads level with its
  button.

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
