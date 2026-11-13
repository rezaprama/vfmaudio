import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_CONSTRAINTS, evaluate, parseNeeds, readSharedConstraints, recommend, valueOrder } from '../src/lib/recommend';
import type { Product } from '../src/lib/types';

const product: Product = {
  id: 'test', name: 'Test', category: 'wireless-headphone', price: 700_000, valueRank: 'A', qualityRank: 'S',
  sound: 8, soundDerived: false, mic: 'A', micScore: 8, connection: '3.5 / Type C', usbAudio: true, jack35: true,
  bluetooth: true, wiredMic: null, bothModesVerified: true, tuning: 'Neutral warm', driver: null,
  battery: null, codec: null, anc: null, multipoint: null, group: 'wireless-headphone',
  source: { sheet: 'W. Headphone', gid: '1', row: 2, url: 'https://docs.google.com/' }, scores: {},
};

describe('needs and recommendations', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('rejects inherited category keys and non-finite budgets from shared URLs', () => {
    vi.stubGlobal('location', { search: '?filters=' + encodeURIComponent('{"categories":["constructor","__proto__","iem"],"budget":1e999}') });
    expect(readSharedConstraints().categories).toEqual(['iem']); expect(readSharedConstraints().budget).toBe(DEFAULT_CONSTRAINTS.budget);
  });
  it('parses the user example including both device types and both connectors', () => {
    const { constraints: c } = parseNeeds('Uang 1 jt, IEM atau wireless phone, type c dan 3.5 dengan mic oke untuk Zoom, musik audiophile');
    expect(c.budget).toBe(1_000_000); expect(c.categories).toEqual(['iem', 'wireless-headphone']);
    expect([c.usb, c.jack, c.mic, c.music]).toEqual([true, true, true, true]);
  });
  it.each([['budget 750rb', 750_000], ['Rp1.000.000 untuk musik', 1_000_000], ['uang 1,5 juta', 1_500_000]])('understands Indonesian budget %s', (text, budget) => expect(parseNeeds(text).constraints.budget).toBe(budget));
  it('does not impose explicitly negated mic or ANC requirements', () => {
    const { constraints: c } = parseNeeds('IEM, budget 500 ribu, tidak butuh mic, tanpa ANC');
    expect(c.mic).toBe(false); expect(c.anc).toBe(false);
  });
  it('flags unsupported needs instead of silently claiming them', () => expect(parseNeeds('TWS, tahan air, baterai 10 jam, iPhone').notices.join(' ')).toContain('belum menjadi filter'));
  it('does not infer wired mic support from a good wireless microphone score', () => {
    const result = evaluate(product, { ...DEFAULT_CONSTRAINTS, mic: true, jack: true });
    expect(result.state).toBe('unknown'); expect(result.evidence.find(item => item.label === 'Mic saat berkabel')?.state).toBe('unknown');
  });
  it('requires at least A for letter mic grades, while numerical 7.5 passes', () => {
    expect(evaluate({ ...product, mic: 'A-', micScore: 7.8 }, { ...DEFAULT_CONSTRAINTS, mic: true }).state).toBe('fail');
    expect(evaluate({ ...product, mic: '7.5', micScore: 7.5 }, { ...DEFAULT_CONSTRAINTS, mic: true }).state).toBe('pass');
  });
  it('includes accessory reserve in the hard budget constraint', () => {
    const result = evaluate(product, { ...DEFAULT_CONSTRAINTS, budget: 800_000, accessoryReserve: 150_000 });
    expect(result.totalPrice).toBe(850_000); expect(result.state).toBe('fail');
  });
  it('keeps unknown price out of verified results', () => {
    const result = recommend([{ ...product, price: null }], { ...DEFAULT_CONSTRAINTS, strict: true });
    expect(result.groups).toHaveLength(0); expect(result.unknown).toBe(1);
  });
  it('does not convert a compatibility reserve into proof', () => expect(evaluate({ ...product, usbAudio: null }, { ...DEFAULT_CONSTRAINTS, usb: true, accessoryReserve: 100_000 }).state).toBe('unknown'));
  it('requires proof that both connector variants work on the same unit', () => expect(evaluate({ ...product, bothModesVerified: null }, { ...DEFAULT_CONSTRAINTS, usb: true, jack: true }).state).toBe('unknown'));
  it('never ranks sound scores across categories or open/closed headphone groups', () => {
    const result = recommend([product, { ...product, id: 'iem', category: 'iem', group: 'iem', sound: 10 }, { ...product, id: 'open', category: 'headphone', group: 'headphone:open' }, { ...product, id: 'closed', category: 'headphone', group: 'headphone:closed' }], { ...DEFAULT_CONSTRAINTS, categories: [] }, 'sound');
    expect(result.groups).toHaveLength(4); expect(result.groups.every(group => group.items.length === 1)).toBe(true);
  });
  it('does not truncate extended source value grades', () => { expect(valueOrder('SSS+')).toBeGreaterThan(valueOrder('SSS')); expect(valueOrder('S')).toBeGreaterThan(valueOrder('A+++')); });
  it('puts proven fits before incomplete data, even when incomplete product has higher value rank', () => {
    const result = recommend([product, { ...product, id: 'unknown', price: null, valueRank: 'SSS' }], DEFAULT_CONSTRAINTS);
    expect(result.groups[0].items.map(item => item.product.id)).toEqual(['test', 'unknown']);
  });
  it('puts confirmed affordable prices ahead of unknown prices even when both have incomplete connector facts', () => {
    const result = recommend([{ ...product, id: 'priced', usbAudio: null }, { ...product, id: 'unknown-price', price: null, valueRank: 'SSS', usbAudio: null }], { ...DEFAULT_CONSTRAINTS, usb: true });
    expect(result.groups[0].items[0].product.id).toBe('priced');
  });
  it('does not derive bass quantity from the numerical bass quality', () => expect(evaluate({ ...product, tuning: null, scores: { Bass: 10 } }, { ...DEFAULT_CONSTRAINTS, tuning: 'bass' }).state).toBe('unknown'));
});
