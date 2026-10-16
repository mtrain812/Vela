// @vitest-environment jsdom
// `onIndicatorInfo`: a host rider adding an "about this indicator" affordance to the
// shell. NATIVE picker rows grow an info button calling the handler with the native
// type id (scripts are host content — no button); the settings dialog's header grows
// the same button; legend actions see the row's `nativeType`. No handler ⇒ nothing
// renders anywhere (upstream-safe).
import { describe, it, expect, vi, beforeAll } from 'vitest';

(globalThis as { CSS?: unknown }).CSS ??= { escape: (v: string) => v };
(globalThis as { ResizeObserver?: unknown }).ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
};

import { IndicatorPicker, type IndicatorRow } from '../src/widget/indicator-picker';
import { legendActionsProviderFor, registerLegendAction } from '../src/widget/contributions';
import { VelaWorkspace } from '../src/workspace/VelaWorkspace';
import { IndicatorInputsDialog } from '../src/renderers/shared/IndicatorInputsDialog';
import { DARK_THEME } from '../src/core/theme';
import type { Vela } from '../src/Vela';

beforeAll(() => {
    Element.prototype.animate ??= (() => ({ cancel() {}, finish() {}, addEventListener() {} })) as unknown as Element['animate'];
});

const settled = () => new Promise<void>((r) => setTimeout(r, 50));

const LIBRARY: IndicatorRow[] = [
    { name: 'RSI', category: 'Built-in', native: true, nativeType: 'rsi' },
    { name: 'My Script', language: 'pine', category: 'General' },
];

function mountPicker(opts: { onInfo?: (type: string) => void; onChart?: IndicatorRow[] } = {}): { picker: IndicatorPicker; onAdd: ReturnType<typeof vi.fn> } {
    const onAdd = vi.fn();
    const picker = new IndicatorPicker({
        library: () => LIBRARY,
        onChart: () => opts.onChart ?? [],
        onAdd,
        onRemove: vi.fn(),
        ...(opts.onInfo ? { onInfo: opts.onInfo } : {}),
    });
    picker.open();
    return { picker, onAdd };
}

const rows = () => [...document.querySelectorAll<HTMLElement>('.vela-ip-row')];
const rowNamed = (name: string) => rows().find((r) => r.querySelector('.vela-ip-name')?.textContent === name)!;

describe('indicator picker — host info button', () => {
    it('renders the button on native rows only, and a click fires the handler without adding', async () => {
        const onInfo = vi.fn();
        const { picker, onAdd } = mountPicker({ onInfo });
        await settled();
        const native = rowNamed('RSI');
        const script = rowNamed('My Script');
        expect(native.querySelector('.vela-ip-info')).not.toBeNull();
        expect(script.querySelector('.vela-ip-info')).toBeNull();
        native.querySelector<HTMLElement>('.vela-ip-info')!.click();
        expect(onInfo).toHaveBeenCalledExactlyOnceWith('rsi');
        expect(onAdd).not.toHaveBeenCalled();
        picker.destroy();
    });

    it('clicking the row itself still ADDS (the info button is not the row)', async () => {
        const { picker, onAdd } = mountPicker({ onInfo: vi.fn() });
        await settled();
        rowNamed('RSI').click();
        expect(onAdd).toHaveBeenCalledExactlyOnceWith(0);
        picker.destroy();
    });

    it('no handler ⇒ no info button anywhere', async () => {
        const { picker } = mountPicker();
        await settled();
        expect(document.querySelector('.vela-ip-info')).toBeNull();
        picker.destroy();
    });

    it('on-chart native instances get the button too (before the trash)', async () => {
        const onInfo = vi.fn();
        const { picker } = mountPicker({ onInfo, onChart: [{ name: 'RSI', native: true, nativeType: 'rsi' }] });
        await settled();
        const onChartRow = rows().find((r) => r.dataset.instance !== undefined)!;
        const info = onChartRow.querySelector<HTMLElement>('.vela-ip-info')!;
        expect(info).not.toBeNull();
        expect(info.nextElementSibling?.classList.contains('vela-ip-trash')).toBe(true);
        info.click();
        expect(onInfo).toHaveBeenCalledExactlyOnceWith('rsi');
        picker.destroy();
    });
});

describe('legend actions — nativeType exposure', () => {
    it('legendActionsProviderFor hands the native type to when/run', () => {
        const chart = {
            indicators: () => [{ id: 'i1', title: 'RSI', nativeType: 'rsi' }],
        } as unknown as Vela;
        const provider = legendActionsProviderFor(chart, () => ({}) as never);
        const seen: Array<string | undefined> = [];
        const un = registerLegendAction({
            id: 'test-info',
            icon: 'info',
            tooltip: 'About',
            when: (ind) => {
                seen.push(ind.nativeType);
                return ind.nativeType !== undefined;
            },
            run: (_ctx, ind) => seen.push(ind.nativeType),
        });
        const views = provider('i1');
        expect(views).toHaveLength(1);
        views[0]!.run();
        expect(seen).toEqual(['rsi', 'rsi']);
        un();
    });
});

describe('settings dialog — header info button', () => {
    function openDialog(opts: { handler?: (type: string) => void; nativeType?: string }): IndicatorInputsDialog {
        const host = document.createElement('div');
        document.body.appendChild(host);
        const dialog = new IndicatorInputsDialog({
            container: host,
            theme: () => DARK_THEME,
            mobile: () => false,
            dialogHost: () => host,
            symbolPicker: () => null,
            indicatorInfo: () => opts.handler ?? null,
            onChange: () => {},
            onBackdropClose: () => {},
        });
        dialog.open({
            id: 'ind',
            title: 'RSI',
            ...(opts.nativeType ? { nativeType: opts.nativeType } : {}),
            inputs: [{ key: 'len', title: 'Length', type: 'int', defval: 14 }],
            values: { len: 14 },
            props: [],
            propValues: {},
        });
        return dialog;
    }

    it('a native row + host handler grows the header button; click fires with the type id', () => {
        const handler = vi.fn();
        const dialog = openDialog({ handler, nativeType: 'rsi' });
        const btn = document.querySelector<HTMLElement>('.vela-ind-dialog-info')!;
        expect(btn).not.toBeNull();
        btn.click();
        expect(handler).toHaveBeenCalledExactlyOnceWith('rsi');
        dialog.close();
    });

    it('no handler ⇒ no button; script row (no nativeType) ⇒ no button', () => {
        const d1 = openDialog({ nativeType: 'rsi' });
        expect(document.querySelector('.vela-ind-dialog-info')).toBeNull();
        d1.close();
        const d2 = openDialog({ handler: vi.fn() });
        expect(document.querySelector('.vela-ind-dialog-info')).toBeNull();
        d2.close();
    });
});

describe('workspace threading — onIndicatorInfo reaches the picker', () => {
    it('native library rows in the built-in picker carry the info button', async () => {
        const onInfo = vi.fn();
        const host = document.createElement('div');
        document.body.append(host);
        const ws = new VelaWorkspace(host, { layout: '1', onIndicatorInfo: onInfo } as never);
        const picker = (ws as unknown as { indicatorPicker: IndicatorPicker | null }).indicatorPicker;
        expect(picker).not.toBeNull();
        await settled(); // native catalog resolves async
        picker!.open();
        await settled();
        const root = host.querySelector<HTMLElement>('.vela-workspace')!;
        const infos = [...root.querySelectorAll<HTMLElement>('.vela-ip-row .vela-ip-info')];
        expect(infos.length).toBeGreaterThan(0);
        infos[0]!.click();
        expect(onInfo).toHaveBeenCalledOnce();
        expect(typeof onInfo.mock.calls[0]![0]).toBe('string');
        ws.destroy();
    });
});
