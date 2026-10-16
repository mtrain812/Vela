import { describe, it, expect } from 'vitest';
import type { InputSchema } from '../src/core/model/inputs';
import { classicSpecs } from '../src/core/native-indicators/classics';
import { volumeDescriptor } from '../src/core/native-indicators/volume';
import { vpvrDescriptor } from '../src/core/native-indicators/vpvr';

/**
 * Tooltip coverage gate: every settings input across the native catalog carries a
 * tooltip so the settings dialog's per-input info button always has content.
 * Pure color pickers are exempt (self-describing style-tab inputs); everything
 * else — including style-tab toggles and widths — must explain itself.
 */

function missing(owner: string, inputs: readonly InputSchema[]): string[] {
    return inputs
        .filter((inp) => inp.type !== 'color')
        .filter((inp) => typeof inp.tooltip !== 'string' || inp.tooltip.trim().length === 0)
        .map((inp) => `${owner} :: ${inp.key} (${inp.title})`);
}

describe('native indicator input tooltips', () => {
    it('every classic settings input has a tooltip (colors exempt)', () => {
        const gaps = classicSpecs.flatMap((spec) => missing(spec.type, spec.inputs));
        expect(gaps, `inputs missing tooltips:\n${gaps.join('\n')}`).toEqual([]);
    });

    it('volume + VPVR native inputs have tooltips (colors exempt)', () => {
        const gaps = [...missing('volume', volumeDescriptor.inputsSchema()), ...missing('vpvr', vpvrDescriptor.inputsSchema())];
        expect(gaps, `inputs missing tooltips:\n${gaps.join('\n')}`).toEqual([]);
    });
});
