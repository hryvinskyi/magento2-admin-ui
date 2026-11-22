/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * The admin UI kit's browser half, published to the page as `@hryvinskyi/admin-ui`.
 *
 * It is the one surface every admin island imports: the components drawn in the kit's `hui-*` classes, the kit's
 * wording, the JSON client with the admin's request rules, the readers every parser of the server's answers is built
 * from, and the island start. The page loads it once, beside one copy of the UI library, and every island imports it
 * through the bare specifier, so the `KitProvider` an island's components read is the one the island start set up. A
 * file that imported any of this by relative path would carry its own copy, and its components would find no
 * provider.
 *
 * Errors are recognised by name and shape (`isRequestError`, `isContractError`, `error.name`), never by
 * `instanceof`: a class reached from another bundle is not the class this file defines.
 */

/* Plain data and the readers of the server's answers. */
export type { Brand } from './domain/brand.ts';
export type { JsonObject, JsonValue } from './domain/json.ts';
export {
    at,
    bool,
    branded,
    ContractError,
    filledText,
    finite,
    isContractError,
    isRecord,
    items,
    json,
    jsonObject,
    keyed,
    list,
    nullable,
    oneOf,
    optional,
    record,
    text,
    wholeNumber,
    type Fields,
} from './domain/readers.ts';

/* Wording. */
export {
    createTranslator,
    localeTag,
    type PhraseParam,
    type Translator,
    type TranslatorOptions,
} from './domain/translator.ts';
export { phrase, type Phrase } from './domain/phrase.ts';

/* Talking to the admin. */
export {
    failureOf,
    isAnsweredRefusal,
    isRequestError,
    RequestError,
    type RequestErrorKind,
    type RequestFailure,
} from './domain/request-error.ts';
export {
    createJsonClient,
    DEFAULT_DEADLINE_MS,
    type Fetch,
    type HttpResponse,
    type JsonClient,
    type JsonClientOptions,
    type JsonRequestOptions,
} from './adapters/json-client.ts';

/* Starting an island. */
export { startIsland, type IslandMount, type IslandOptions, type Logger } from './island/start-island.tsx';
export { KitProvider, MissingKitError, useKit, type Kit, type KitProviderProps } from './components/kit-context.tsx';

/* A module page: its document, its links, its requests, its wording and its frame. */
export {
    parsePageDocument,
    type ModuleShell,
    type ModuleTab,
    type PageDocument,
    type PageDocumentSpec,
    type PageStoreView,
} from './domain/page-document.ts';
export { addressOf, linkTo, resolveLink, screenLink, withParam, type ScreenLink } from './domain/screen-link.ts';
export { canRetry, failureText } from './domain/failure.ts';
export {
    createLatestRequest,
    settle,
    type LatestRequest,
    type Outcome,
    type OutcomeKind,
    type Settlers,
} from './adapters/latest-request.ts';
export { createPageClient, READ_DEADLINE_MS, type PageClientOptions } from './adapters/page-client.ts';
export { createPageTranslator } from './island/page-translator.ts';
export {
    MissingPageError,
    PageProvider,
    usePage,
    worded,
    type Page,
    type PageProviderProps,
} from './components/page-context.tsx';
export { PageMain, PageShell, type PageShellProps } from './components/PageShell.tsx';
export { CardFrame, type CardFrameProps } from './components/CardFrame.tsx';
export { LinkButton, type LinkButtonProps, type LinkVariant } from './components/LinkButton.tsx';

/* The components. */
export {
    FALLBACK_ICON,
    Icon,
    ICON_NAMES,
    iconOr,
    isIconName,
    type IconName,
    type IconProps,
    type IconSize,
} from './components/icons.tsx';
export {
    Button,
    DisclosureButton,
    ExternalLink,
    type ButtonProps,
    type ButtonVariant,
    type DisclosureButtonProps,
    type ExternalLinkProps,
} from './components/Button.tsx';
export { Card, Columns, Panel, type CardProps, type ColumnsProps, type PanelProps } from './components/Card.tsx';
export {
    MessageStrip,
    Notice,
    type MessageAction,
    type MessageButtonAction,
    type MessageLink,
    type MessageLinkAction,
    type MessageRole,
    type MessageStripProps,
    type NoticeProps,
    type Tone,
} from './components/Notice.tsx';
export { Badge, type BadgeProps, type BadgeVariant } from './components/Badge.tsx';
export { RadioCards, type RadioCardsProps, type RadioOption } from './components/RadioCards.tsx';
export { Switch, type SwitchProps, type SwitchWords } from './components/Switch.tsx';
export { MenuButton, type MenuAction, type MenuButtonProps } from './components/MenuButton.tsx';
export { SelectInput, type SelectInputProps, type SelectOption } from './components/SelectInput.tsx';
export {
    SecretInput,
    TextInput,
    type ControlWidth,
    type SecretInputProps,
    type TextInputProps,
} from './components/TextInput.tsx';
export { describedBy, FieldRow, fieldIds, type FieldIds, type FieldRowProps } from './components/FieldRow.tsx';
export {
    OriginLine,
    OriginNotice,
    type OriginAction,
    type OriginLineProps,
    type OriginNoticeProps,
} from './components/OriginLine.tsx';
export {
    StatusPanel,
    type PanelState,
    type StatusLine,
    type StatusPanelProps,
} from './components/StatusPanel.tsx';
export { TextArea, countId, type TextAreaProps } from './components/TextArea.tsx';
export { SegmentedControl, type SegmentedControlProps, type SegmentOption } from './components/SegmentedControl.tsx';
export {
    FilterChip,
    FilterChips,
    type ChipTone,
    type FilterChipProps,
    type FilterChipsProps,
} from './components/FilterChip.tsx';
export { TabPanel, tabIds, Tabs, type TabIds, type TabItem, type TabPanelProps, type TabsProps } from './components/Tabs.tsx';
export { ModuleNav, type ModuleNavProps, type NavItem } from './components/ModuleNav.tsx';
export {
    DataTable,
    rowOpenerId,
    type DataTableProps,
    type RowFlag,
    type TableColumn,
    type TableGroup,
    type TableItem,
    type TableItemData,
    type TableSelection,
} from './components/DataTable.tsx';
export { Pager, type PagerProps } from './components/Pager.tsx';
export { Drawer, type DrawerProps } from './components/Drawer.tsx';
export {
    CardState,
    type CardStateAction,
    type CardStateButtonAction,
    type CardStateKind,
    type CardStateLinkAction,
    type CardStateProps,
} from './components/CardState.tsx';
export { StatePill, type PillTone, type StatePillProps } from './components/StatePill.tsx';
export { ProgressBar, type ProgressBarProps, type ProgressTone } from './components/ProgressBar.tsx';
export { ColourInput, colourMessageId, type ColourInputProps } from './components/ColourInput.tsx';
export {
    DayBars,
    StackedBar,
    type ChartDay,
    type DayBarsProps,
    type StackedBarPart,
    type StackedBarProps,
} from './components/Charts.tsx';
export {
    StoreViewPicker,
    storeLineId,
    type StoreViewPickerProps,
} from './components/StoreViewPicker.tsx';
export {
    CodeEditor,
    type CodeEditorProps,
    type EditorStatus,
    type EditorTone,
} from './components/CodeEditor.tsx';

/* What the components compute, as pure functions. */
export { choiceAfterKey, tabAfterKey } from './domain/arrow-choice.ts';
export { pageRange, type PageRange } from './domain/pager.ts';
export { parseHexColour, type HexColour } from './domain/hex-colour.ts';
export { afterSelectAll, afterToggle, selectionState, type SelectionState } from './domain/selection.ts';
export { fractionOf, heightsOf, sharesOf } from './domain/proportions.ts';
export { characterCount, lengthState, type LengthState } from './domain/text-length.ts';
export {
    ALL_STORE_VIEWS,
    storeViewFromOption,
    storeViewOf,
    storeViewOption,
    storeViewOptions,
    type StoreView,
    type StoreViewOption,
} from './domain/store-views.ts';
export {
    codeLines,
    plainTokens,
    sameSegments,
    visibleRows,
    type CodeLine,
    type CodeSegment,
    type CodeToken,
    type CodeTokenKind,
    type Tokenizer,
} from './domain/code-lines.ts';
export {
    INDENT,
    indentSelection,
    lineAt,
    outdentSelection,
    replaceRange,
    type TextEdit,
} from './domain/code-edit.ts';
export {
    itemAfterKey,
    usableCompletion,
    type Completer,
    type Completion,
    type CompletionItem,
} from './domain/completion.ts';
