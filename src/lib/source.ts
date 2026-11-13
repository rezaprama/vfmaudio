import type { Catalog, Category, Product } from './types';

export const SOURCE_ID = '1KXDCrMErS1ZjjJhxjTYqNax1bjWWl4peXv0eaLMlxVc';
export const SOURCE_URL = `https://docs.google.com/spreadsheets/d/${SOURCE_ID}/edit`;
export const CATEGORY_LABELS: Record<Category, string> = {
  iem: 'IEM', tws: 'TWS', 'half-in-ear': 'TWS tanpa karet', ows: 'Open-ear / OWS',
  'wireless-headphone': 'Headphone wireless', headphone: 'Headphone kabel',
  'wired-earphone': 'Earphone kabel', gaming: 'Headset gaming', 'dongle-dac': 'Dongle DAC',
  cable: 'Kabel', eartips: 'Eartips', 'desktop-dac': 'Desktop DAC', microphone: 'Mikrofon',
  'headphone-amp': 'Headphone amp', speaker: 'Speaker stereo', 'bluetooth-speaker': 'Speaker Bluetooth',
  soundbar: 'Soundbar', dap: 'DAP', soundcard: 'Soundcard', 'wireless-mic': 'Mic wireless',
};

interface SheetSpec {
  sheet: string; gid: string; category: Category; header: number; name: number; price: number[];
  expected: string; value?: number; quality?: number; sound?: number; mic?: number;
  connection?: number[]; tuning?: number; driver?: number; battery?: number; codec?: number;
  anc?: number; multipoint?: number; scores?: Record<string, number>; group?: number;
}

const tonal = (start: number) => ({ Bass: start, 'Low mid': start + 1, 'High mid': start + 2, Treble: start + 3, Vokal: start + 4 });

export const SHEETS: SheetSpec[] = [
  { sheet: 'IEM', gid: '0', category: 'iem', header: 0, name: 2, expected: 'iem', price: [3], value: 0, quality: 1, sound: 12, connection: [6], driver: 10, scores: { ...tonal(13), Soundstage: 19, Imaging: 20, Separasi: 21, Timbre: 22, Punch: 23, Detail: 24 } },
  { sheet: 'TWS', gid: '1388033389', category: 'tws', header: 0, name: 2, expected: 'tws', price: [3], value: 1, quality: 0, sound: 13, mic: 6, codec: 8, battery: 9, anc: 10, tuning: 26, multipoint: 28, scores: { ...tonal(14), Soundstage: 19, Separasi: 20, Imaging: 21, Timbre: 22, Punch: 23, Detail: 24 } },
  { sheet: 'TWS NO KARET', gid: '217110824', category: 'half-in-ear', header: 0, name: 2, expected: 'tws', price: [3], value: 0, quality: 1, sound: 19, mic: 20, codec: 7, battery: 8, anc: 9, multipoint: 23, scores: { ...tonal(12), Teknis: 17, Driver: 18 } },
  { sheet: 'OWS', gid: '1716824495', category: 'ows', header: 0, name: 1, expected: 'tws', price: [2], value: 0, sound: 7, battery: 17, scores: { ...tonal(8), Soundstage: 13, Timbre: 14, Driver: 15 } },
  { sheet: 'W. Headphone', gid: '841974920', category: 'wireless-headphone', header: 0, name: 2, expected: 'headphone', price: [3, 4], value: 0, quality: 1, sound: 7, mic: 15, connection: [29], tuning: 18, codec: 19, battery: 20, anc: 16, multipoint: 26, driver: 27, scores: { ...tonal(8), Teknis: 13, Driver: 14 } },
  { sheet: 'Headset Normies', gid: '2029980589', category: 'wired-earphone', header: 0, name: 2, expected: 'headphone', price: [3], value: 1, quality: 0, mic: 8, connection: [7], scores: { ...tonal(10), Teknis: 15, Driver: 16 } },
  { sheet: 'Headphone', gid: '1785257921', category: 'headphone', header: 1, name: 1, expected: 'headphone', price: [2], quality: 0, group: 7, tuning: 17, driver: 18, scores: { ...tonal(8), Teknis: 13, Driver: 14 } },
  { sheet: 'Gaming', gid: '627172913', category: 'gaming', header: 0, name: 1, expected: 'headphone', price: [3], quality: 0, mic: 16, connection: [17], tuning: 15, scores: { ...tonal(7), Teknis: 12, Driver: 13 } },
  { sheet: 'Dongle DAC', gid: '1954358084', category: 'dongle-dac', header: 1, name: 2, expected: 'dac', price: [3], value: 1, quality: 0, sound: 12, mic: 22, connection: [6, 7], driver: 9, scores: { Dinamika: 13, Punch: 14, Detail: 15, Soundstage: 16, Separasi: 17 } },
  { sheet: 'Kabel', gid: '323699644', category: 'cable', header: 0, name: 1, expected: 'kabel', price: [2], quality: 0, mic: 5, connection: [7] },
  { sheet: 'Eartips', gid: '1788892420', category: 'eartips', header: 1, name: 1, expected: 'eartips', price: [2], quality: 0 },
  { sheet: 'Desktop DAC', gid: '942479355', category: 'desktop-dac', header: 0, name: 1, expected: 'dac', price: [2], value: 0, sound: 9, connection: [4, 5], driver: 7, scores: { Dinamika: 10, Punch: 11, Detail: 12, Soundstage: 13, Separasi: 14 } },
  { sheet: 'Mic', gid: '683184001', category: 'microphone', header: 0, name: 1, expected: 'microphone', price: [2], quality: 0, connection: [5], driver: 4 },
  { sheet: 'Headphone Amp', gid: '1714045938', category: 'headphone-amp', header: 1, name: 1, expected: 'headphone amp', price: [2], quality: 0, connection: [4, 5] },
  { sheet: 'Speaker 2 unit', gid: '587532115', category: 'speaker', header: 0, name: 1, expected: 'speaker', price: [2], value: 0, connection: [8] },
  { sheet: 'Blutut Speaker', gid: '471843513', category: 'bluetooth-speaker', header: 1, name: 2, expected: 'speaker', price: [3], value: 0, quality: 1, connection: [9], battery: 12, codec: 10 },
  { sheet: 'Soundbar', gid: '601572817', category: 'soundbar', header: 1, name: 1, expected: 'speaker', price: [2], quality: 0, connection: [6, 7] },
  { sheet: 'DAP', gid: '2013799945', category: 'dap', header: 0, name: 0, expected: 'dap', price: [1], connection: [3], driver: 4, battery: 5 },
  { sheet: 'Soundcard', gid: '1010205628', category: 'soundcard', header: 0, name: 1, expected: 'soundcard', price: [2], quality: 0, connection: [3] },
  { sheet: 'Clip On Wireless', gid: '233981403', category: 'wireless-mic', header: 0, name: 1, expected: 'microphone', price: [2], quality: 0, connection: [4] },
];

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cell = '', quoted = false;
  text = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { cell += '"'; i++; }
      else if (quoted || cell.length === 0) quoted = !quoted;
      else cell += char;
    } else if (char === ',' && !quoted) { row.push(cell); cell = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += char;
  }
  if (quoted) throw new Error('CSV tidak lengkap: tanda kutip belum ditutup.');
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

export const clean = (value: string | undefined): string | null => {
  const text = value?.trim();
  return !text || /^[-?]+$/.test(text) || /^(n\/a|null)$/i.test(text) ? null : text;
};

export function parsePrice(value: string | undefined): number | null {
  if (!value) return null;
  const first = value.trim().split('\n')[0].replace(/^rp\.?\s*/i, '').trim();
  if (/\d\s*[-–]\s*\d/.test(first)) return null;
  const match = first.match(/\d[\d.,]*/);
  if (!match) return null;
  const raw = match[0];
  const number = /^\d+\.\d{1,2}$/.test(raw) ? Number(raw) : Number(raw.replace(/[.,]/g, ''));
  return Number.isFinite(number) && number >= 1000 && number <= 1_000_000_000 ? Math.round(number) : null;
}

export function numeric(value: string | undefined): number | null {
  if (!value?.trim() || !/^\d+(?:[.,]\d+)?$/.test(value.trim())) return null;
  const score = Number(value.replace(',', '.'));
  return Number.isFinite(score) && score >= 0 && score <= 10 ? score : null;
}

export function gradeScore(value: string | null): number | null {
  if (!value) return null;
  const number = numeric(value);
  if (number !== null) return number;
  const grade = value.split('\n')[0].trim().toUpperCase();
  if (/^(NO|TIDAK|GAK ADA|NONE)$/.test(grade)) return 0;
  const match = grade.match(/^(S{1,5}|[A-E])([+-]*)$/);
  if (!match) return null;
  const base = match[1].startsWith('S') ? 9.2 + Math.min(match[1].length - 1, 3) * 0.2 : ({ A: 8, B: 6.5, C: 5, D: 3.5, E: 2 }[match[1]] ?? 0);
  return Math.min(10, base + [...match[2]].reduce((sum, char) => sum + (char === '+' ? 0.2 : -0.2), 0));
}

function slug(value: string): string {
  return value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function normalizeSheet(spec: SheetSpec, rows: string[][]): Product[] {
  const header = rows[spec.header]?.[spec.name]?.toLowerCase().replace(/\s+/g, ' ').trim() ?? '';
  if (!header.includes(spec.expected)) throw new Error(`Struktur ${spec.sheet} berubah: kolom nama tidak cocok (${header}).`);
  const columnChecks: [number | undefined, RegExp, string][] = [
    [spec.price[0], /price|harga|link/i, 'harga'],
    [spec.value, /value/i, 'value'],
    [spec.quality, /tier|sound|rank/i, 'tier kualitas'],
    [spec.mic, /mic/i, 'mic'],
    [spec.sound, /sound|overall/i, 'nilai suara'],
    [spec.tuning, /tuning|tonal/i, 'tuning'],
    [spec.driver, /driver|chip|capsule/i, 'driver'],
    [spec.battery, /battery|baterai/i, 'baterai'],
    [spec.codec, /codec|bluet|blut/i, 'codec'],
    [spec.anc, /anc/i, 'ANC'],
    [spec.multipoint, /multipoint/i, 'multipoint'],
    ...(spec.connection ?? []).map(col => [col, /cable|kabel|connect|konektor|output|input|colokan|ujung|wireless/i, 'koneksi'] as [number, RegExp, string]),
  ];
  for (const [column, expected, label] of columnChecks) {
    if (column !== undefined && !expected.test(rows[spec.header]?.[column] ?? '')) throw new Error(`Struktur ${spec.sheet} berubah: kolom ${label} tidak cocok.`);
  }
  const scoreHeaders: Record<string, RegExp> = { Bass: /bass/i, 'Low mid': /lo(?:w)?\s*mid/i, 'High mid': /hi(?:gh)?\s*mid/i, Treble: /treble/i, Vokal: /voc/i, Soundstage: /soundstage|stereo\s*image/i, Imaging: /imaging/i, Separasi: /separation|instruments/i, Timbre: /timbre/i, Punch: /punch/i, Detail: /detail|resolution|clarity/i, Teknis: /technicality/i, Driver: /driver/i, Dinamika: /dynamics/i };
  for (const [label, column] of Object.entries(spec.scores ?? {})) {
    const combinedHeader = `${rows[spec.header]?.[column] ?? ''} ${rows[spec.header + 1]?.[column] ?? ''}`;
    if (!scoreHeaders[label]?.test(combinedHeader)) throw new Error(`Struktur ${spec.sheet} berubah: komponen ${label} tidak cocok.`);
  }
  const products: Product[] = [];
  const seen = new Set<string>();
  for (let index = spec.header + 1; index < rows.length; index++) {
    const row = rows[index];
    const rawName = clean(row[spec.name]);
    if (!rawName) continue;
    const name = rawName.split('\n')[0].trim();
    if (name.length < 3 || name.length > 150 || name.toLowerCase() === spec.expected || !/[a-z]/i.test(name)) continue;
    const id = `${spec.category}-${slug(name)}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const get = (col: number | undefined) => col === undefined ? null : clean(row[col]);
    const scores: Record<string, number> = {};
    for (const [label, col] of Object.entries(spec.scores ?? {})) {
      const value = numeric(row[col]);
      if (value !== null) scores[label] = value;
    }
    const explicitSound = spec.sound === undefined ? null : numeric(row[spec.sound]);
    const values = Object.values(scores);
    const derived = explicitSound === null && values.length >= 5 && values.length === Object.keys(spec.scores ?? {}).length;
    const sound = explicitSound ?? (derived ? values.reduce((sum, score) => sum + score, 0) / values.length : null);
    const connection = clean(spec.connection?.map(col => row[col]).filter(Boolean).join('\n'));
    const mic = get(spec.mic);
    const conn = connection?.toLowerCase() ?? '';
    // A connector in the dedicated cable/audio column is evidence; a charging port is not.
    const usbLine = conn.split('\n').find(line => /type[ -]?c|usb[ -]?c/.test(line));
    const usbAudio = usbLine ? /(?:no|tidak|tanpa)\s*(?:type[ -]?c|usb[ -]?c)|(?:hanya|only).*(?:charg|cas)|(?:charg|cas).*(?:only|aja|saja)/.test(usbLine) ? false : /charg|ngecas|cas saja/.test(usbLine) ? null : true : null;
    const jack35 = /(?:no|tidak|tanpa)\s*(?:jack\s*)?3[.,]5/.test(conn) ? false : /3[.,]5/.test(conn) ? true : null;
    const isWireless = ['tws', 'half-in-ear', 'ows', 'wireless-headphone', 'bluetooth-speaker', 'wireless-mic'].includes(spec.category);
    const subtype = get(spec.group)?.toLowerCase().replace(/\s+/g, '') ?? '';
    const group = spec.category === 'headphone' ? `${spec.category}:${subtype.includes('open') ? 'open' : subtype.includes('closed') ? 'closed' : 'unknown'}` : spec.category;
    products.push({
      id, name, category: spec.category,
      price: spec.price.map(col => parsePrice(row[col])).find(value => value !== null) ?? null,
      valueRank: get(spec.value), qualityRank: get(spec.quality), sound, soundDerived: derived,
      mic, micScore: gradeScore(mic), connection, usbAudio, jack35,
      bluetooth: isWireless || /bluetooth|blutut/i.test(conn) ? true : null,
      wiredMic: ['wired-earphone', 'cable'].includes(spec.category) && gradeScore(mic) !== null ? (gradeScore(mic) ?? 0) > 0 : null,
      bothModesVerified: usbAudio && jack35 && ['wireless-headphone', 'dongle-dac', 'desktop-dac', 'soundcard', 'dap'].includes(spec.category) ? true : null,
      tuning: get(spec.tuning), driver: get(spec.driver), battery: get(spec.battery), codec: get(spec.codec),
      anc: get(spec.anc), multipoint: get(spec.multipoint), group,
      source: { sheet: spec.sheet, gid: spec.gid, row: index + 1, url: `${SOURCE_URL}?gid=${spec.gid}#gid=${spec.gid}&range=A${index + 1}:AD${index + 1}` },
      scores,
    });
  }
  if (!products.length) throw new Error(`Tab ${spec.sheet} tidak menghasilkan produk. Snapshot lama dipertahankan.`);
  return products;
}

async function fetchBounded(url: string, maxBytes = 2_500_000): Promise<string> {
  const response = await fetch(url, { signal: AbortSignal.timeout(25_000), headers: { Accept: 'text/csv,text/html' } });
  if (!response.ok) throw new Error(`Sumber mengembalikan HTTP ${response.status}.`);
  if (!response.body) throw new Error('Sumber mengembalikan isi kosong.');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let size = 0, text = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) { await reader.cancel(); throw new Error('Ukuran sumber melewati batas aman.'); }
      text += decoder.decode(value, { stream: true });
    }
  } finally { reader.releaseLock(); }
  return text + decoder.decode();
}

export async function fetchCatalog(): Promise<Catalog> {
  const products: Product[] = [], sheetCounts: Record<string, number> = {};
  for (let offset = 0; offset < SHEETS.length; offset += 3) {
    const batch = await Promise.all(SHEETS.slice(offset, offset + 3).map(async spec => {
      const csv = await fetchBounded(`https://docs.google.com/spreadsheets/d/${SOURCE_ID}/export?format=csv&gid=${spec.gid}`);
      if (/^\s*</.test(csv)) throw new Error(`Tab ${spec.sheet} tidak mengembalikan CSV publik.`);
      return { spec, entries: normalizeSheet(spec, parseCsv(csv)) };
    }));
    for (const { spec, entries } of batch) { products.push(...entries); sheetCounts[spec.sheet] = entries.length; }
  }
  let sourceTitle: string | null = null;
  try {
    const html = await fetchBounded(`https://docs.google.com/spreadsheets/d/${SOURCE_ID}/htmlview`, 4_000_000);
    sourceTitle = html.match(/<title>([^<]+)<\/title>/i)?.[1].replace(/\s*-\s*Google (?:Sheets|Drive)$/, '').replace(/&amp;/g, '&') ?? null;
  } catch { /* Title is optional; all catalog tabs must still succeed. */ }
  return { version: 1, products, fetchedAt: new Date().toISOString(), sourceTitle, sourceUrl: SOURCE_URL, attribution: 'Kitab Audio oleh Fernanda Gunsan. Penilaian bersifat subjektif.', sheetCounts };
}
