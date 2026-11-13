import { describe, expect, it } from 'vitest';
import { SHEETS, gradeScore, normalizeSheet, numeric, parseCsv, parsePrice } from '../src/lib/source';

describe('CSV and source integrity', () => {
  it('keeps quoted commas, embedded newlines, escaped quotes, BOM, and empty trailing cells', () => {
    expect(parseCsv('\uFEFFA,B,C\r\n"a,b","line\nnext","say ""hi"""\r\nlast,,')).toEqual([['A', 'B', 'C'], ['a,b', 'line\nnext', 'say "hi"'], ['last', '', '']]);
  });
  it('rejects truncated CSV', () => expect(() => parseCsv('a,"unfinished')).toThrow('belum ditutup'));
  it.each([['Rp 1.000.000', 1_000_000], ['6,900,000 (diskon)', 6_900_000], ['7499000.0', 7_499_000], ['2499000\nlink 2', 2_499_000], ['-', null], ['link 2', null], ['100000-200000', null], ['3.5', null]])('parses source price %s conservatively', (input, output) => expect(parsePrice(input)).toBe(output));
  it('preserves actual zero and rejects missing or invalid scores', () => {
    expect(numeric('0')).toBe(0); expect(numeric('')).toBeNull(); expect(numeric('11')).toBeNull(); expect(numeric('9,2')).toBe(9.2);
    expect(gradeScore(null)).toBeNull(); expect(gradeScore('NO')).toBe(0); expect(gradeScore('A')).toBeGreaterThan(gradeScore('B+')!);
  });
  const spec = SHEETS.find(sheet => sheet.category === 'wired-earphone')!;
  const header = ['Rank', 'Value', 'Headphone', 'Price', 'Shopee', 'Tiktok', 'Fitting', 'Ujung Cable', 'Mic', 'Review', 'Bass', 'Lo Mid', 'Hi Mid', 'Treble', 'Voc', 'Technicality', 'Driver Quality'];
  it('preserves row provenance and does not treat a charging-only USB port as audio', () => {
    const [product] = normalizeSheet(spec, [header, ['A', 'S', 'Test earphone', '700000', '', '', '', 'Type C (charging only)\n3.5', 'A']]);
    expect(product.usbAudio).toBe(false); expect(product.jack35).toBe(true); expect(product.mic).toBe('A'); expect(product.source.row).toBe(2); expect(product.source.url).toContain('range=A2:AD2');
  });
  it('does not certify alternate variants as simultaneous support', () => {
    const [product] = normalizeSheet(spec, [header, ['A', 'S', 'Test earphone', '700000', '', '', '', '3.5 / Type C', 'A']]);
    expect(product.usbAudio).toBe(true); expect(product.bothModesVerified).toBeNull();
  });
  it('rejects shifted critical columns even if product names remain valid', () => {
    const shifted = [...header]; shifted[8] = 'ANC';
    expect(() => normalizeSheet(spec, [shifted])).toThrow('kolom mic');
  });
  it('derives a sound average only from all declared components', () => {
    const row = ['A', 'S', 'Test earphone', '700000', '', '', '3.5', '', 'A', '', '8', '8', '8', '8', '8', '8', ''];
    expect(normalizeSheet(spec, [header, row])[0].sound).toBeNull();
    row[16] = '8'; const product = normalizeSheet(spec, [header, row])[0];
    expect(product.sound).toBe(8); expect(product.soundDerived).toBe(true);
  });
});
