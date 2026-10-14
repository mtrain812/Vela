// @vitest-environment jsdom
// `onSymbolSearchOpen`: a host rider that owns the symbol-search SURFACE — return
// `true` and the built-in picker never opens, for hosts presenting their own symbol
// UI. Covers every entry point: the topbar symbol button, bare typing on the root,
// and the widget context's `openSymbolSearch`. Anything but `true` falls through.
import { describe, it, expect, vi, beforeAll } from 'vitest';

// This jsdom build ships no `CSS` global; the style injector only needs `escape`.
(globalThis as { CSS?: unknown }).CSS ??= { escape: (v: string) => v };
// jsdom has no ResizeObserver and no Web Animations — the chrome uses both decoratively.
(globalThis as { ResizeObserver?: unknown }).ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
};

import { VelaWorkspace } from '../src/workspace/VelaWorkspace';

beforeAll(() => {
    Element.prototype.animate ??= (() => ({ cancel() {}, finish() {}, addEventListener() {} })) as unknown as Element['animate'];
});

function mountWorkspace(opts: Record<string, unknown> = {}): { ws: VelaWorkspace; root: HTMLElement } {
    const host = document.createElement('div');
    document.body.append(host);
    const ws = new VelaWorkspace(host, { layout: '1', ...opts } as never);
    return { ws, root: host.querySelector<HTMLElement>('.vela-workspace')! };
}

/** The built-in picker's open state, probed through the workspace internals. */
function builtinOpen(ws: VelaWorkspace): boolean {
    return (ws as unknown as { symbolPicker: { isOpen: boolean } }).symbolPicker.isOpen;
}

/** The dialog machine opens and closes on its own tick; wait for it. */
const settled = () => new Promise<void>((r) => setTimeout(r, 50));

describe('onSymbolSearchOpen — host owns the symbol search surface', () => {
    it('topbar symbol click: rider true suppresses the built-in picker', () => {
        const rider = vi.fn(() => true);
        const { ws, root } = mountWorkspace({ onSymbolSearchOpen: rider });
        root.querySelector<HTMLElement>('.vela-widget-symbol')!.click();
        expect(rider).toHaveBeenCalledExactlyOnceWith('');
        expect(builtinOpen(ws)).toBe(false);
        ws.destroy();
    });

    it('rider returning anything but true falls through to the built-in picker', async () => {
        const rider = vi.fn(() => false);
        const { ws, root } = mountWorkspace({ onSymbolSearchOpen: rider });
        root.querySelector<HTMLElement>('.vela-widget-symbol')!.click();
        await settled();
        expect(rider).toHaveBeenCalledOnce();
        expect(builtinOpen(ws)).toBe(true);
        ws.destroy();
    });

    it('no rider: the built-in picker opens as before', async () => {
        const { ws, root } = mountWorkspace();
        root.querySelector<HTMLElement>('.vela-widget-symbol')!.click();
        await settled();
        expect(builtinOpen(ws)).toBe(true);
        ws.destroy();
    });

    it('bare typing on the root seeds the rider with the keystroke', () => {
        const rider = vi.fn(() => true);
        const { ws, root } = mountWorkspace({ onSymbolSearchOpen: rider });
        root.dispatchEvent(new KeyboardEvent('keydown', { key: 'n', bubbles: true }));
        expect(rider).toHaveBeenCalledExactlyOnceWith('N');
        expect(builtinOpen(ws)).toBe(false);
        ws.destroy();
    });

    it('typing into an ALREADY-open built-in picker extends it without re-consulting the rider', async () => {
        const rider = vi.fn(() => false); // falls through — built-in opens
        const { ws, root } = mountWorkspace({ onSymbolSearchOpen: rider });
        root.dispatchEvent(new KeyboardEvent('keydown', { key: 'n', bubbles: true }));
        await settled();
        expect(builtinOpen(ws)).toBe(true);
        root.dispatchEvent(new KeyboardEvent('keydown', { key: 'q', bubbles: true }));
        expect(rider).toHaveBeenCalledOnce(); // the extend is not an "open"
        ws.destroy();
    });

    it("the widget context's openSymbolSearch routes through the rider, seed intact", () => {
        const rider = vi.fn(() => true);
        const { ws } = mountWorkspace({ onSymbolSearchOpen: rider });
        ws.context().openSymbolSearch('ABC');
        expect(rider).toHaveBeenCalledExactlyOnceWith('ABC');
        expect(builtinOpen(ws)).toBe(false);
        ws.destroy();
    });
});
