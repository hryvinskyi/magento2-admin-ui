/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * A code editor in the kit's dark code colours: a real `textarea` (the input, its caret and its selection) over a
 * highlight layer that draws the same text in colour, beside a gutter of line numbers. The language is the caller's:
 * a `tokenize` function colours the text and an optional `complete` function offers choices at the caret. The editor
 * knows no language and holds no wording; its accessible name, the list's name and every line of its status bar come
 * from the page.
 *
 * - The highlight and the gutter are drawn from elements and text nodes only, so a text that looks like markup shows as
 *   the characters typed. They follow the text area's scrolling. Each line is redrawn only when its own text or colours
 *   change, so a long text costs little per keystroke.
 * - Tab inserts two spaces, or indents every line of a selection over several lines; Shift+Tab outdents. Escape and
 *   then Tab leave the editor, so the keyboard is never trapped in it.
 * - A completer's answer opens a list (`role="listbox"`) under the place the choice will go: ↑ and ↓ move, Enter or Tab
 *   inserts, Escape closes, and a click inserts too. Its place is measured once each time it opens, not per keystroke.
 * - `markedLine` marks one line (its background and its number): the line a problem is on. The status bar says the
 *   problem in words (`status`, read as an alert when its tone is `error`, else as a status), so colour is never the
 *   only signal; the text area is described by it.
 * - Read-only (`readOnly`, or no `onChange`): the text can be read, selected and copied, Tab moves on, and nothing is
 *   offered.
 */
import { Component, type ComponentChild, type ComponentChildren, type JSX } from 'preact';
import { useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import { indentSelection, lineAt, outdentSelection, replaceRange, type TextEdit } from '../domain/code-edit.ts';
import {
    codeLines,
    plainTokens,
    sameSegments,
    visibleRows,
    type CodeLine,
    type Tokenizer,
} from '../domain/code-lines.ts';
import { itemAfterKey, usableCompletion, type Completer, type Completion } from '../domain/completion.ts';
import { Icon, type IconName } from './icons.tsx';

/** How the status bar reads: the text is valid, being written, or wrong. */
export type EditorTone = 'ok' | 'pending' | 'error';

/** The status bar's message: its tone and its words (translated). */
export interface EditorStatus {
    readonly tone: EditorTone;
    readonly message: ComponentChildren;
}

export interface CodeEditorProps {
    /** The text area's id; the status line's and the list's ids are derived from it. */
    readonly id: string;
    readonly value: string;
    /** Every change of the text; left out, the editor is read-only. */
    readonly onChange?: ((value: string) => void) | undefined;
    /** The editor's accessible name; translated. */
    readonly label: string;
    /** Colours the text; left out, the text is plain. */
    readonly tokenize?: Tokenizer | undefined;
    /** Offers choices at the caret after each change of the text. */
    readonly complete?: Completer | undefined;
    /** The list's accessible name; translated. Left out, the editor's label. */
    readonly completionLabel?: string | undefined;
    /** A line under the list ("↑ ↓ to move, Enter to insert"); translated. */
    readonly completionFooter?: ComponentChildren | undefined;
    /** The line to mark, counted from 1. */
    readonly markedLine?: number | null | undefined;
    /** The status bar's message, on its left. */
    readonly status?: EditorStatus | undefined;
    /** A hint on the status bar's right ("Type {{ to pick a field"); translated. */
    readonly hint?: ComponentChildren | undefined;
    /** The fewest rows shown; 4 when left out. */
    readonly rows?: number | undefined;
    /** The most rows shown before the text scrolls; left out, the editor grows with the text. */
    readonly maxRows?: number | undefined;
    readonly readOnly?: boolean | undefined;
    /** Further descriptions of the text area (a field's help). */
    readonly describedBy?: string | undefined;
}

/** What each tone is read as, and its glyph. */
const TONES = {
    ok: { role: 'status', icon: 'check_circle' },
    pending: { role: 'status', icon: 'edit' },
    error: { role: 'alert', icon: 'error' },
} as const satisfies Record<EditorTone, { readonly role: 'status' | 'alert'; readonly icon: IconName }>;

/** Keys that are only held down with another one; they keep Escape's "Tab leaves" in force. */
const MODIFIERS: ReadonlySet<string> = new Set(['Shift', 'Control', 'Alt', 'Meta']);

/** An open list: the completer's answer and the item the keyboard is on. */
interface OpenList extends Completion {
    readonly active: number;
}

interface LineProps {
    readonly line: CodeLine;
    readonly marked: boolean;
}

/** One line of the highlight; redrawn only when its segments or its mark change. */
class HighlightLine extends Component<LineProps> {
    override shouldComponentUpdate(next: LineProps): boolean {
        return next.marked !== this.props.marked || !sameSegments(next.line.segments, this.props.line.segments);
    }

    override render(): ComponentChild {
        const { line, marked } = this.props;
        return (
            <div class="hui-code-editor__line" data-marked={marked ? 'true' : undefined}>
                {line.segments.map((segment, index) => (
                    <span key={index} class="hui-code-editor__token" data-kind={segment.kind}>{segment.text}</span>
                ))}
            </div>
        );
    }
}

interface GutterProps {
    readonly count: number;
    readonly marked: number | null;
}

/** The line numbers; redrawn only when the number of lines or the marked line changes. */
class GutterNumbers extends Component<GutterProps> {
    override shouldComponentUpdate(next: GutterProps): boolean {
        return next.count !== this.props.count || next.marked !== this.props.marked;
    }

    override render(): ComponentChild {
        const { count, marked } = this.props;
        const numbers: JSX.Element[] = [];
        for (let number = 1; number <= count; number += 1) {
            numbers.push(
                <div key={number} class="hui-code-editor__number" data-marked={number === marked ? 'true' : undefined}>
                    {number}
                </div>,
            );
        }
        return numbers;
    }
}

export function CodeEditor({
    id,
    value,
    onChange,
    label,
    tokenize = plainTokens,
    complete,
    completionLabel,
    completionFooter,
    markedLine = null,
    status,
    hint,
    rows = 4,
    maxRows,
    readOnly = false,
    describedBy,
}: CodeEditorProps): JSX.Element {
    const editable = !readOnly && onChange !== undefined;
    const lines = useMemo(() => codeLines(value, tokenize(value)), [value, tokenize]);
    const [list, setList] = useState<OpenList | null>(null);
    const input = useRef<HTMLTextAreaElement>(null);
    const frame = useRef<HTMLDivElement>(null);
    const layer = useRef<HTMLDivElement>(null);
    const numbers = useRef<HTMLDivElement>(null);
    const popover = useRef<HTMLDivElement>(null);
    const mirrorLine = useRef<HTMLDivElement>(null);
    const marker = useRef<HTMLSpanElement>(null);
    // Where the list goes, in the text's own coordinates (before scrolling), measured when it opens.
    const anchor = useRef<{ readonly top: number; readonly left: number } | null>(null);
    const scroll = useRef({ top: 0, left: 0 });
    // The selection to restore once the text an edit produced is back from the page.
    const pending = useRef<TextEdit | null>(null);
    const tabLeaves = useRef(false);

    const statusId = `${id}-status`;
    const listId = `${id}-completions`;
    const optionId = (index: number): string => `${id}-completion-${String(index)}`;
    // A list stays open only while the text still holds its range.
    const openList = editable && list !== null && list.to <= value.length ? list : null;
    const openAt = openList === null ? null : openList.from;
    const active = openList === null ? null : openList.active;

    /** Puts the list at its anchor, less the scrolling, kept inside the editor's width. */
    const placePopover = (): void => {
        const box = popover.current;
        const at = anchor.current;
        const area = frame.current;
        if (box === null || at === null || area === null) {
            return;
        }
        const left = Math.max(0, Math.min(at.left - scroll.current.left, area.clientWidth - box.offsetWidth));
        box.style.top = `${String(at.top - scroll.current.top)}px`;
        box.style.left = `${String(left)}px`;
    };

    useLayoutEffect(() => {
        const line = mirrorLine.current;
        const mark = marker.current;
        if (openAt === null || line === null || mark === null) {
            anchor.current = null;
            return;
        }
        const { index } = lineAt(value, openAt);
        anchor.current = { top: line.offsetTop + (index + 1) * line.offsetHeight, left: mark.offsetLeft };
        placePopover();
    }, [openAt]);

    useLayoutEffect(() => {
        if (active !== null) {
            popover.current?.querySelectorAll('[role="option"]')[active]?.scrollIntoView({ block: 'nearest' });
        }
    }, [active]);

    useLayoutEffect(() => {
        const edit = pending.current;
        const element = input.current;
        if (edit !== null && element !== null && element.value === edit.text) {
            element.setSelectionRange(edit.selectionStart, edit.selectionEnd);
            pending.current = null;
        }
    });

    const apply = (edit: TextEdit): void => {
        pending.current = edit;
        onChange?.(edit.text);
    };

    const offer = (text: string, caret: number): void => {
        const found = complete === undefined ? null : usableCompletion(complete(text, caret), text.length);
        setList(found === null ? null : { ...found, active: 0 });
    };

    const insert = (open: OpenList, index: number): void => {
        const item = open.items[index];
        const element = input.current;
        if (item === undefined || element === null) {
            return;
        }
        apply(replaceRange(element.value, open.from, open.to, item.value));
        setList(null);
    };

    const follow = (element: HTMLTextAreaElement): void => {
        const top = element.scrollTop;
        const left = element.scrollLeft;
        scroll.current = { top, left };
        if (layer.current !== null) {
            layer.current.style.transform = `translate(${String(-left)}px, ${String(-top)}px)`;
        }
        if (numbers.current !== null) {
            numbers.current.style.transform = `translateY(${String(-top)}px)`;
        }
        placePopover();
    };

    const close = (): void => setList(null);
    const move = (event: KeyboardEvent, open: OpenList): void => {
        const next = itemAfterKey(open.active, open.items.length, event.key);
        if (next !== null) {
            event.preventDefault();
            setList({ ...open, active: next });
        }
    };
    const choose = (event: KeyboardEvent, open: OpenList): void => {
        event.preventDefault();
        insert(open, open.active);
    };
    const dismiss = (event: KeyboardEvent): void => {
        event.preventDefault();
        event.stopPropagation();
        close();
    };

    /** What each key does while the list is open; a key that moves the caret away closes it. */
    const listKeys: ReadonlyMap<string, (event: KeyboardEvent, open: OpenList) => void> = new Map([
        ['ArrowDown', move],
        ['ArrowUp', move],
        ['Enter', choose],
        ['Tab', choose],
        ['Escape', dismiss],
        ['ArrowLeft', close],
        ['ArrowRight', close],
        ['Home', close],
        ['End', close],
        ['PageUp', close],
        ['PageDown', close],
    ]);

    const indent = (event: KeyboardEvent, element: HTMLTextAreaElement): void => {
        if (tabLeaves.current) {
            tabLeaves.current = false;
            return;
        }
        event.preventDefault();
        const edit = event.shiftKey ? outdentSelection : indentSelection;
        apply(edit(element.value, element.selectionStart, element.selectionEnd));
    };

    /** What each key does while no list is open. */
    const editKeys: ReadonlyMap<string, (event: KeyboardEvent, element: HTMLTextAreaElement) => void> = new Map([
        ['Tab', indent],
        ['Escape', (): void => void (tabLeaves.current = true)],
    ]);

    const onKeyDown = (event: KeyboardEvent): void => {
        const element = input.current;
        if (!editable || element === null) {
            return;
        }
        if (!MODIFIERS.has(event.key) && event.key !== 'Tab' && event.key !== 'Escape') {
            tabLeaves.current = false;
        }
        if (openList !== null) {
            listKeys.get(event.key)?.(event, openList);
            return;
        }
        editKeys.get(event.key)?.(event, element);
    };

    const described = [describedBy, status === undefined ? undefined : statusId].filter((part) => part !== undefined);
    const prefix = openList === null ? '' : value.slice(lineAt(value, openList.from).start, openList.from);

    return (
        <div class="hui-code-editor">
            <div class="hui-code-editor__body">
                <div class="hui-code-editor__gutter" aria-hidden="true">
                    <div ref={numbers} class="hui-code-editor__numbers">
                        <GutterNumbers count={lines.length} marked={markedLine} />
                    </div>
                </div>
                <div ref={frame} class="hui-code-editor__frame">
                    <div class="hui-code-editor__clip" aria-hidden="true">
                        <div ref={layer} class="hui-code-editor__highlight">
                            {lines.map((line, index) => (
                                <HighlightLine key={line.key} line={line} marked={markedLine === index + 1} />
                            ))}
                        </div>
                        {openList === null ? null : (
                            <div class="hui-code-editor__mirror">
                                <div ref={mirrorLine} class="hui-code-editor__mirror-line">
                                    {prefix}
                                    <span ref={marker} />
                                </div>
                            </div>
                        )}
                    </div>
                    <textarea
                        ref={input}
                        id={id}
                        class="hui-code-editor__input"
                        value={value}
                        rows={visibleRows(lines.length, rows, maxRows)}
                        readOnly={!editable}
                        aria-label={label}
                        aria-multiline={true}
                        aria-describedby={described.length === 0 ? undefined : described.join(' ')}
                        aria-invalid={status?.tone === 'error' ? true : undefined}
                        aria-autocomplete={editable && complete !== undefined ? 'list' : undefined}
                        aria-controls={openList === null ? undefined : listId}
                        aria-activedescendant={openList === null ? undefined : optionId(openList.active)}
                        spellcheck={false}
                        autocomplete="off"
                        autocapitalize="off"
                        wrap="off"
                        onInput={(event) => {
                            const element = event.currentTarget;
                            if (editable) {
                                onChange?.(element.value);
                                offer(element.value, element.selectionEnd);
                            }
                        }}
                        onKeyDown={onKeyDown}
                        onScroll={(event) => follow(event.currentTarget)}
                        onClick={close}
                        onBlur={() => {
                            tabLeaves.current = false;
                            close();
                        }}
                    />
                    {openList === null ? null : (
                        <div ref={popover} class="hui-code-editor__popover">
                            <div
                                id={listId}
                                role="listbox"
                                aria-label={completionLabel ?? label}
                                class="hui-code-editor__list"
                            >
                                {openList.items.map((item, index) => (
                                    <div
                                        key={`${String(index)}:${item.value}`}
                                        id={optionId(index)}
                                        role="option"
                                        aria-selected={index === openList.active}
                                        class="hui-code-editor__option"
                                        onMouseDown={(event) => event.preventDefault()}
                                        onClick={() => insert(openList, index)}
                                    >
                                        <span class="hui-code-editor__option-label">{item.label}</span>
                                        {item.detail === undefined ? null : (
                                            <span class="hui-code-editor__option-detail">{item.detail}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {completionFooter === undefined ? null : (
                                <div class="hui-code-editor__popover-foot">{completionFooter}</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            {status === undefined && hint === undefined ? null : (
                <div class="hui-code-editor__status" data-tone={status?.tone}>
                    {status === undefined ? null : (
                        <div id={statusId} role={TONES[status.tone].role} class="hui-code-editor__message">
                            <Icon name={TONES[status.tone].icon} size={18} filled class="hui-code-editor__status-icon" />
                            <span>{status.message}</span>
                        </div>
                    )}
                    {hint === undefined ? null : <div class="hui-code-editor__hint">{hint}</div>}
                </div>
            )}
        </div>
    );
}
