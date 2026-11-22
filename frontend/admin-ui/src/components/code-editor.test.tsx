/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * The code editor, used the way a person uses it: typing into its text area, pressing keys, choosing from its list.
 * The highlight is read from the page as drawn, so a test sees what a person sees under the text.
 */
import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { cleanup, fireEvent, screen } from '@testing-library/preact';
import type { JSX } from 'preact';
import { useState } from 'preact/hooks';
import {
    CodeEditor,
    type CodeEditorProps,
    type Completer,
    type EditorStatus,
    type Tokenizer,
} from '@hryvinskyi/admin-ui';
import { renderWithKit } from '../../test/support/kit.tsx';

afterEach(cleanup);

/** Colours every `{{…}}` as a field and every other double-quoted run as a string; enough to see colours drawn. */
const tokenize: Tokenizer = (text) => [...text.matchAll(/\{\{[^}]*\}\}|"[^"\n]*"/g)].map((match) => ({
    kind: match[0].startsWith('{{') ? 'field' : 'string',
    from: match.index,
    to: match.index + match[0].length,
}));

/** Offers two fields whenever the text before the caret ends with `{{` and a partial name. */
const complete: Completer = (text, caret) => {
    const match = /\{\{([a-z.]*)$/.exec(text.slice(0, caret));
    if (match === null) {
        return null;
    }
    return {
        from: caret - (match[1] ?? '').length,
        to: caret,
        items: [
            { value: 'product.sku}}', label: 'product.sku', detail: 'SKU' },
            { value: 'product.name}}', label: 'product.name', detail: 'Name' },
        ],
    };
};

type EditorOptions = Omit<CodeEditorProps, 'id' | 'value' | 'onChange' | 'label'>;

/** An editor whose text lives in the test's state, as a page would hold it. */
function Editor({ start, ...rest }: EditorOptions & { readonly start: string }): JSX.Element {
    const [text, setText] = useState(start);
    return <CodeEditor id="tpl" label="Template" value={text} onChange={setText} {...rest} />;
}

const area = (): HTMLTextAreaElement => {
    const element = screen.getByRole('textbox', { name: 'Template' });
    assert.ok(element instanceof HTMLTextAreaElement);
    return element;
};
const highlightLines = (): Element[] => [...document.querySelectorAll('.hui-code-editor__line')];
const gutterNumbers = (): string[] =>
    [...document.querySelectorAll('.hui-code-editor__number')].map((number) => number.textContent ?? '');

/** Types `text` as the new whole value, with the caret at its end, as the browser reports an input. */
const type = (text: string): void => {
    fireEvent.input(area(), { target: { value: text } });
};

describe('CodeEditor', () => {
    it('is a named, multi-line text area, its text drawn line by line beside numbers', () => {
        renderWithKit(<Editor start={'{\n  "a": 1\n}'} />);
        const textarea = area();
        assert.equal(textarea.value, '{\n  "a": 1\n}');
        assert.equal(textarea.getAttribute('aria-multiline'), 'true');
        assert.equal(textarea.readOnly, false);
        assert.deepEqual(highlightLines().map((line) => line.textContent), ['{', '  "a": 1', '}']);
        assert.deepEqual(gutterNumbers(), ['1', '2', '3']);
        assert.equal(document.querySelector('.hui-code-editor__highlight')?.closest('[aria-hidden="true"]') !== null, true);
    });

    it('keeps the highlight and the numbers in step with the text typed', () => {
        renderWithKit(<Editor start="a" />);
        type('a\nb\nc\nd');
        assert.equal(area().value, 'a\nb\nc\nd');
        assert.deepEqual(highlightLines().map((line) => line.textContent), ['a', 'b', 'c', 'd']);
        assert.deepEqual(gutterNumbers(), ['1', '2', '3', '4']);
        type('a');
        assert.deepEqual(gutterNumbers(), ['1']);
    });

    it('colours the text by the tokenizer\'s kinds', () => {
        renderWithKit(<Editor start={'"sku": {{product.sku}},'} tokenize={tokenize} />);
        const coloured = [...document.querySelectorAll('.hui-code-editor__token')]
            .map((token) => `${token.getAttribute('data-kind') ?? ''}:${token.textContent ?? ''}`);
        assert.deepEqual(coloured, ['string:"sku"', 'plain:: ', 'field:{{product.sku}}', 'plain:,']);
    });

    it('draws a text that looks like markup as the characters typed, never as markup', () => {
        const hostile = '"</span><img src=x onerror=alert(1)>" <b>bold</b>';
        renderWithKit(<Editor start={hostile} tokenize={tokenize} />);
        const editor = document.querySelector('.hui-code-editor');
        assert.equal(editor?.querySelector('img'), null);
        assert.equal(editor?.querySelector('b'), null);
        assert.equal(highlightLines()[0]?.textContent, hostile);
    });

    it('redraws only the lines that changed, keeping the others as they are on the page', () => {
        renderWithKit(<Editor start={'one\ntwo\nthree'} />);
        const [one, two] = highlightLines();
        type('zero\none\ntwo\nthree!');
        const lines = highlightLines();
        assert.deepEqual(lines.map((line) => line.textContent), ['zero', 'one', 'two', 'three!']);
        assert.equal(lines[1], one, 'a line that moved down is the same element');
        assert.equal(lines[2], two);
    });

    it('marks one line, its background and its number, and says the problem as an alert describing the text', () => {
        const status: EditorStatus = { tone: 'error', message: 'Line 2: a comma is missing.' };
        renderWithKit(<Editor start={'{\n"a": 1\n"b": 2\n}'} markedLine={2} status={status} hint="Type {{ to pick a field" />);
        assert.deepEqual(highlightLines().map((line) => line.getAttribute('data-marked')), [null, 'true', null, null]);
        const marked = [...document.querySelectorAll('.hui-code-editor__number[data-marked="true"]')];
        assert.deepEqual(marked.map((number) => number.textContent), ['2']);
        const alert = screen.getByRole('alert');
        assert.equal(alert.textContent, 'Line 2: a comma is missing.');
        assert.equal(area().getAttribute('aria-describedby'), alert.id);
        assert.equal(area().getAttribute('aria-invalid'), 'true');
        assert.ok(screen.getByText('Type {{ to pick a field'));
    });

    it('reads a valid or unfinished text as a status, and draws no status bar when given nothing for it', () => {
        const { rerender } = renderWithKit(<CodeEditor id="s" label="L" value="x" status={{ tone: 'ok', message: 'Valid.' }} />);
        assert.equal(screen.getByRole('status').textContent, 'Valid.');
        assert.equal(screen.getByRole('textbox', { name: 'L' }).getAttribute('aria-invalid'), null);
        rerender(<CodeEditor id="s" label="L" value="x" />);
        assert.equal(document.querySelector('.hui-code-editor__status'), null);
        assert.equal(screen.getByRole('textbox', { name: 'L' }).getAttribute('aria-describedby'), null);
    });

    it('inserts two spaces at the caret on Tab, and outdents the line on Shift+Tab', () => {
        renderWithKit(<Editor start={'ab\ncd'} />);
        area().setSelectionRange(1, 1);
        assert.equal(fireEvent.keyDown(area(), { key: 'Tab' }), false, 'Tab stays in the editor');
        assert.equal(area().value, 'a  b\ncd');
        assert.deepEqual([area().selectionStart, area().selectionEnd], [3, 3]);

        area().setSelectionRange(5, 5);
        fireEvent.keyDown(area(), { key: 'Tab' });
        assert.equal(area().value, 'a  b\n  cd');
        fireEvent.keyDown(area(), { key: 'Tab', shiftKey: true });
        assert.equal(area().value, 'a  b\ncd');
        assert.deepEqual([area().selectionStart, area().selectionEnd], [5, 5]);
    });

    it('indents every line of a selection over several lines', () => {
        renderWithKit(<Editor start={'a\nb\nc'} />);
        area().setSelectionRange(0, 3);
        fireEvent.keyDown(area(), { key: 'Tab' });
        assert.equal(area().value, '  a\n  b\nc');
        assert.deepEqual([area().selectionStart, area().selectionEnd], [2, 7]);
    });

    it('lets Tab leave the editor after Escape, so the keyboard is never trapped', () => {
        renderWithKit(<Editor start="ab" />);
        fireEvent.keyDown(area(), { key: 'Escape' });
        fireEvent.keyDown(area(), { key: 'Shift' });
        assert.equal(fireEvent.keyDown(area(), { key: 'Tab', shiftKey: true }), true, 'the browser moves focus');
        assert.equal(area().value, 'ab');
        assert.equal(fireEvent.keyDown(area(), { key: 'Tab' }), false, 'the next Tab indents again');
    });

    it('opens the completer\'s list under the text, the first item active, the text area pointing at it', () => {
        renderWithKit(<Editor start={'"'} complete={complete} completionLabel="Fields" completionFooter="↑ ↓ to move" />);
        assert.equal(screen.queryByRole('listbox'), null);
        type('"{{');
        const list = screen.getByRole('listbox', { name: 'Fields' });
        const options = screen.getAllByRole('option');
        assert.deepEqual(options.map((option) => option.textContent), ['product.skuSKU', 'product.nameName']);
        assert.deepEqual(options.map((option) => option.getAttribute('aria-selected')), ['true', 'false']);
        assert.equal(area().getAttribute('aria-controls'), list.id);
        assert.equal(area().getAttribute('aria-activedescendant'), options[0]?.id);
        assert.equal(area().getAttribute('aria-autocomplete'), 'list');
        assert.ok(screen.getByText('↑ ↓ to move'));
    });

    it('moves through the list with the arrow keys, wrapping, and inserts the active item on Enter', () => {
        renderWithKit(<Editor start="" complete={complete} />);
        type('"{{pro');
        fireEvent.keyDown(area(), { key: 'ArrowDown' });
        assert.equal(area().getAttribute('aria-activedescendant'), screen.getAllByRole('option')[1]?.id);
        fireEvent.keyDown(area(), { key: 'ArrowDown' });
        assert.equal(screen.getAllByRole('option')[0]?.getAttribute('aria-selected'), 'true');
        fireEvent.keyDown(area(), { key: 'ArrowUp' });
        assert.equal(screen.getAllByRole('option')[1]?.getAttribute('aria-selected'), 'true');

        assert.equal(fireEvent.keyDown(area(), { key: 'Enter' }), false, 'Enter inserts instead of a new line');
        assert.equal(area().value, '"{{product.name}}');
        assert.equal(area().selectionStart, '"{{product.name}}'.length);
        assert.equal(screen.queryByRole('listbox'), null);
        assert.equal(area().getAttribute('aria-activedescendant'), null);
    });

    it('inserts on Tab and on a click as well', () => {
        renderWithKit(<Editor start="" complete={complete} />);
        type('{{');
        fireEvent.keyDown(area(), { key: 'Tab' });
        assert.equal(area().value, '{{product.sku}}');

        type('{{product.sku}} {{');
        fireEvent.click(screen.getAllByRole('option')[1] ?? document.body);
        assert.equal(area().value, '{{product.sku}} {{product.name}}');
        assert.equal(screen.queryByRole('listbox'), null);
    });

    it('closes the list on Escape without letting the key reach the page around it', () => {
        let escapes = 0;
        renderWithKit(
            <div onKeyDown={(event) => void (event.key === 'Escape' ? (escapes += 1) : 0)}>
                <Editor start="" complete={complete} />
            </div>,
        );
        type('{{');
        fireEvent.keyDown(area(), { key: 'Escape' });
        assert.equal(screen.queryByRole('listbox'), null);
        assert.equal(escapes, 0);
        assert.equal(area().value, '{{');
    });

    it('opens nothing when the completer has nothing, or answers with no items or a range outside the text', () => {
        const empty: Completer = (_text, caret) => ({ from: caret, to: caret, items: [] });
        const outside: Completer = (text) => ({ from: 0, to: text.length + 3, items: [{ value: 'x', label: 'x' }] });
        renderWithKit(
            <div>
                <Editor start="" complete={complete} />
                <CodeEditor id="e" label="Empty" value="" onChange={() => undefined} complete={empty} />
                <CodeEditor id="o" label="Outside" value="" onChange={() => undefined} complete={outside} />
            </div>,
        );
        type('plain text');
        fireEvent.input(screen.getByRole('textbox', { name: 'Empty' }), { target: { value: '{{' } });
        fireEvent.input(screen.getByRole('textbox', { name: 'Outside' }), { target: { value: '{{' } });
        assert.equal(screen.queryByRole('listbox'), null);
    });

    it('follows the text area\'s scrolling with the highlight and the numbers', () => {
        renderWithKit(<Editor start={'a\nb\nc'} />);
        const textarea = area();
        textarea.scrollTop = 40;
        textarea.scrollLeft = 12;
        fireEvent.scroll(textarea);
        const highlight = document.querySelector<HTMLElement>('.hui-code-editor__highlight');
        const numbers = document.querySelector<HTMLElement>('.hui-code-editor__numbers');
        assert.equal(highlight?.style.transform, 'translate(-12px, -40px)');
        assert.equal(numbers?.style.transform, 'translateY(-40px)');
    });

    it('is read-only without a change handler: Tab moves on, typing reports nothing, nothing is offered', () => {
        let changes = 0;
        renderWithKit(
            <div>
                <CodeEditor id="r" label="Stored template" value={'{\n}'} complete={complete} />
                <CodeEditor id="q" label="Locked" value="x" readOnly complete={complete} onChange={() => void (changes += 1)} />
            </div>,
        );
        const readOnly = screen.getByRole('textbox', { name: 'Stored template' });
        assert.ok(readOnly instanceof HTMLTextAreaElement);
        assert.equal(readOnly.readOnly, true);
        assert.equal(readOnly.getAttribute('aria-autocomplete'), null);
        assert.equal(fireEvent.keyDown(readOnly, { key: 'Tab' }), true);
        assert.equal(readOnly.value, '{\n}');

        const locked = screen.getByRole('textbox', { name: 'Locked' });
        fireEvent.input(locked, { target: { value: '{{' } });
        assert.equal(changes, 0);
        assert.equal(screen.queryByRole('listbox'), null);
        assert.deepEqual(gutterNumbers(), ['1', '2', '1']);
    });

    it('shows at least its rows, grows with the text, and stops at its most rows', () => {
        renderWithKit(
            <div>
                <CodeEditor id="a" label="Short" value="x" rows={6} />
                <CodeEditor id="b" label="Long" value={'1\n2\n3\n4\n5\n6\n7\n8'} rows={3} />
                <CodeEditor id="c" label="Capped" value={'1\n2\n3\n4\n5\n6\n7\n8'} rows={3} maxRows={5} />
            </div>,
        );
        const rowsOf = (name: string): string | null => screen.getByRole('textbox', { name }).getAttribute('rows');
        assert.equal(rowsOf('Short'), '6');
        assert.equal(rowsOf('Long'), '8');
        assert.equal(rowsOf('Capped'), '5');
    });
});
