/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

/**
 * An island's entry module, written the way another package writes one: it imports the kit only through its bare
 * specifier, type-checks against the published declarations, and is loaded by the page as its module script, so it
 * starts the island when it is imported.
 *
 * Its view reads the kit the island start provides — the locale and a kit phrase through `useKit()` — and draws a
 * kit card, a kit switch and a kit pager, which read the same provider.
 */
import type { JSX } from 'preact';
import { useState } from 'preact/hooks';
import { Card, Pager, record, startIsland, Switch, text, useKit } from '@hryvinskyi/admin-ui';

interface IslandPage {
    readonly title: string;
}

function parsePage(value: unknown): IslandPage {
    const fields = record(value, '$.page');
    return { title: text(fields['title'], '$.page.title') };
}

function IslandView({ title }: IslandPage): JSX.Element {
    const { locale, translator } = useKit();
    const [on, setOn] = useState(true);
    const [page, setPage] = useState(1);
    return (
        <Card icon="tune" title={title}>
            <p data-testid="kit">{`${locale} · ${translator.t('kit.switch.yes')}`}</p>
            <Switch checked={on} onChange={setOn} label="row" size="small" />
            <Pager page={page} pageSize={1} total={1200} onPage={setPage} />
        </Card>
    );
}

startIsland({ name: 'test-island', mount: (_root, page) => <IslandView {...parsePage(page)} /> });
