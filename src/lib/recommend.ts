import { CATEGORY_LABELS, gradeScore, numeric } from './source';
import type { Category, Constraints, Evidence, Product, Recommendation } from './types';

export const LISTENING_CATEGORIES: Category[] = ['iem', 'tws', 'wireless-headphone', 'headphone', 'wired-earphone', 'half-in-ear', 'ows', 'gaming'];
export const DEFAULT_CONSTRAINTS: Constraints = {
  budget: 1_000_000, categories: ['iem', 'wireless-headphone'], usb: false, jack: false,
  mic: false, music: false, minSound: 7.5, anc: false, multipoint: false,
  strict: false, accessoryReserve: 0, tuning: 'any', search: '',
};

export const rupiah = (value: number | null) => value === null ? 'Harga belum tercatat' : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

export function parseNeeds(text: string, current: Constraints = DEFAULT_CONSTRAINTS): { constraints: Constraints; notices: string[] } {
  const query = text.toLowerCase().replace(/3,5/g, '3.5');
  const next: Constraints = { ...DEFAULT_CONSTRAINTS, budget: current.budget, minSound: current.minSound, strict: current.strict, accessoryReserve: current.accessoryReserve, categories: [] };
  const notices: string[] = [];
  const shortBudget = query.match(/(?:rp\.?\s*)?(\d+(?:[.,]\d+)?)\s*(jt|juta|juta-an|rb|ribu|k)\b/);
  const longBudget = query.match(/(?:rp\.?\s*|budget\s*|bujet\s*|anggaran\s*|uang\s*)(\d[\d., ]{3,})/);
  if (shortBudget) next.budget = Math.round(Number(shortBudget[1].replace(',', '.')) * (/jt|juta/.test(shortBudget[2]) ? 1_000_000 : 1000));
  else if (longBudget) next.budget = Number(longBudget[1].replace(/[., ]/g, ''));
  if (!Number.isFinite(next.budget) || next.budget < 10_000 || next.budget > 1_000_000_000) {
    next.budget = current.budget;
    notices.push('Anggaran tidak terbaca dalam rentang Rp10.000 sampai Rp1 miliar. Atur nominal di filter.');
  }

  const patterns: [Category, RegExp][] = [
    ['iem', /\biem\b|in[ -]?ear monitor/], ['tws', /\btws\b/],
    ['wireless-headphone', /(?:wireless|nirkabel|bluetooth)\s*(?:headphone|phone|headset|hedpon)|(?:headphone|headset|hedpon)\s*(?:wireless|nirkabel|bluetooth)/],
    ['headphone', /(?:headphone|hedpon)\s*(?:kabel|wired)|\bopenback\b|\bclosedback\b/],
    ['wired-earphone', /earphone\s*kabel|earbuds?\s*kabel/], ['ows', /\bows\b|open[ -]?ear/],
    ['half-in-ear', /tanpa karet|half[ -]?in[ -]?ear/], ['gaming', /headset\s*gaming/],
    ['dongle-dac', /\bdongle\b|\bdac\b/], ['microphone', /mikrofon\s*(?:usb|standalone)|standalone\s*mic/],
    ['speaker', /speaker\s*(?:stereo|2 unit)/], ['bluetooth-speaker', /speaker\s*bluetooth/],
  ];
  for (const [category, pattern] of patterns) if (pattern.test(query)) next.categories.push(category);
  if (!next.categories.length) next.categories = /headphone|hedpon|headset/.test(query) ? ['wireless-headphone', 'headphone', 'gaming'] : LISTENING_CATEGORIES;
  if (next.categories.includes('half-in-ear')) next.categories = next.categories.filter(category => category !== 'tws');

  const normalized = query.replace(/(?:nggak|ngga|gak|ga|tidak|tak)\s+(?:butuh|usah)/g, 'tidak perlu');
  const wants = (pattern: RegExp, negative: RegExp) => pattern.test(normalized) && !negative.test(normalized);
  next.usb = wants(/usb[ -]?c|type[ -]?c|tipe[ -]?c/, /(?:tanpa|tidak perlu|gak perlu|ga perlu|tak perlu)\s*(?:usb[ -]?c|type[ -]?c|tipe[ -]?c)/);
  next.jack = wants(/3[.,]5|jack\s*(?:audio|analog)/, /(?:tanpa|tidak perlu|gak perlu|ga perlu)\s*(?:jack|3[.,]5)/);
  next.mic = wants(/\bmic\b|mikrofon|\bzoom\b|meeting|rapat|teams|gmeet/, /(?:tanpa|tidak perlu|gak perlu|ga perlu)\s*(?:mic|mikrofon|zoom)/);
  next.music = /musik|music|audiophile|audiophil/.test(query);
  next.anc = wants(/\banc\b|noise cancel/, /(?:tanpa|tidak perlu|gak perlu|ga perlu)\s*anc/);
  next.multipoint = wants(/multipoint/, /(?:tanpa|tidak perlu|gak perlu|ga perlu)\s*multipoint/);
  if (/netral|neutral/.test(query)) next.tuning = 'neutral';
  else if (/warm|hangat/.test(query)) next.tuning = 'warm';
  else if (/basshead|ngebass|bassy|bass besar/.test(query)) next.tuning = 'bass';
  else if (/bright|terang/.test(query)) next.tuning = 'bright';

  if (/baterai|battery|latensi|latency|ip\d|waterproof|tahan air|nyaman|android|iphone|ios|mac|windows|garansi|detachable/.test(query)) {
    notices.push('Ada kebutuhan lanjutan (misalnya baterai, perangkat, fit, atau garansi) yang belum menjadi filter. Cek rincian dan sumber sebelum memilih.');
  }
  notices.push('Penerjemah kebutuhan berbasis aturan. Periksa filter hasil terjemahan; detail yang tidak terbaca belum diterapkan.');
  return { constraints: next, notices };
}

function positiveFeature(value: string | null): boolean | null {
  if (!value) return null;
  if (/^(no|tidak|none|enggak|nggak)\b/i.test(value)) return false;
  if (/^(yes|ya|ada|adjustable|rank|[sabcde][+-]*\b|\d)/i.test(value)) return true;
  return null;
}

export function evaluate(product: Product, constraints: Constraints): Recommendation {
  const evidence: Evidence[] = [];
  const reserve = constraints.accessoryReserve;
  const totalPrice = product.price === null ? null : product.price + reserve;
  evidence.push({ label: 'Anggaran', state: totalPrice === null ? 'unknown' : totalPrice <= constraints.budget ? 'pass' : 'fail', detail: totalPrice === null ? 'Harga belum tercatat di sumber.' : `${rupiah(totalPrice)}${reserve ? ` termasuk cadangan aksesori ${rupiah(reserve)}` : ''} dari ${rupiah(constraints.budget)}.` });
  for (const [required, fact, label] of [[constraints.usb, product.usbAudio, 'USB-C audio'], [constraints.jack, product.jack35, 'Jack 3.5 mm']] as const) {
    if (required) evidence.push({ label, state: fact === true ? 'pass' : fact === false ? 'fail' : 'unknown', detail: fact === true ? `Tercatat di kolom koneksi: ${product.connection?.replace(/\n/g, ', ')}.` : fact === false ? 'Kolom koneksi secara eksplisit tidak mendukung syarat ini.' : 'Belum ada bukti di kolom koneksi. Port charging tidak dihitung sebagai audio.' });
  }
  if (constraints.usb && constraints.jack && product.usbAudio && product.jack35 && product.bothModesVerified !== true) evidence.push({ label: 'Dua koneksi pada unit sama', state: 'unknown', detail: 'Sumber mencantumkan kedua konektor, tetapi belum memastikan keduanya pada unit yang sama atau hanya pilihan varian.' });
  if (constraints.mic) {
    const rawMicNumber = numeric(product.mic ?? undefined);
    const micPasses = rawMicNumber !== null ? rawMicNumber >= 7.5 : (product.micScore ?? -1) >= 8;
    evidence.push({ label: 'Kualitas mic', state: product.micScore === null ? 'unknown' : micPasses ? 'pass' : 'fail', detail: product.micScore === null ? 'Nilai mic belum tercatat. Tidak dianggap bagus atau buruk.' : `Penilaian mic sumber: ${product.mic}. Ambang pilihan: A atau nilai angka 7.5/10.` });
    if ((constraints.usb || constraints.jack) && !['microphone', 'wireless-mic'].includes(product.category)) {
      evidence.push({ label: 'Mic saat berkabel', state: product.wiredMic === true ? 'pass' : product.wiredMic === false ? 'fail' : 'unknown', detail: product.wiredMic === true ? 'Mic dinilai pada produk berkabel. Pilihan varian dan dukungan perangkat tetap perlu dicek.' : 'Penilaian mic wireless belum membuktikan mic bekerja di USB-C atau jack 3.5 mm.' });
    }
  }
  if (constraints.music) evidence.push({ label: 'Nilai suara', state: product.sound === null ? 'unknown' : product.sound >= constraints.minSound ? 'pass' : 'fail', detail: product.sound === null ? 'Nilai suara belum tersedia.' : `${product.sound.toFixed(2)}/10${product.soundDerived ? ' (rata-rata komponen)' : ''}, ambang ${constraints.minSound}/10. Subjektif dan hanya bermakna dalam kelompok yang sama.` });
  for (const [required, value, label] of [[constraints.anc, product.anc, 'ANC'], [constraints.multipoint, product.multipoint, 'Multipoint']] as const) {
    if (required) { const fact = positiveFeature(value); evidence.push({ label, state: fact === null ? 'unknown' : fact ? 'pass' : 'fail', detail: value ? `Tercatat di sumber: ${value}.` : 'Belum tercatat di sumber.' }); }
  }
  if (constraints.tuning !== 'any') {
    const matches: Record<string, RegExp> = { neutral: /neutral|netral/i, warm: /warm|hangat/i, bass: /bass|v[ -]?shape/i, bright: /bright|airy|terang/i };
    evidence.push({ label: 'Karakter suara', state: product.tuning === null ? 'unknown' : matches[constraints.tuning].test(product.tuning) ? 'pass' : 'fail', detail: product.tuning ? `Deskripsi tuning sumber: ${product.tuning}.` : 'Karakter tuning belum tercatat. Nilai bass tidak dipakai untuk menebak banyaknya bass.' });
  }
  const state = evidence.some(item => item.state === 'fail') ? 'fail' : evidence.some(item => item.state === 'unknown') ? 'unknown' : 'pass';
  return { product, evidence, state, totalPrice, reserve, needsAccessory: constraints.usb && product.usbAudio !== true || constraints.jack && product.jack35 !== true, order: 0 };
}

export type SortMode = 'value' | 'price' | 'sound';

export function valueOrder(value: string | null): number {
  const match = value?.trim().toUpperCase().match(/^(S+|[A-E])([+-]*)$/);
  if (!match) return -1;
  const base = match[1].startsWith('S') ? 600 + match[1].length * 100 : ({ A: 500, B: 400, C: 300, D: 200, E: 100 }[match[1]] ?? 0);
  return base + [...match[2]].reduce((sum, char) => sum + (char === '+' ? 1 : -1), 0);
}

export function recommend(products: Product[], constraints: Constraints, sort: SortMode = 'value'): { groups: { key: string; label: string; items: Recommendation[] }[]; excluded: number; unknown: number; passing: number } {
  const filtered = products.filter(product => (!constraints.categories.length || constraints.categories.includes(product.category)) && (!constraints.search || `${product.name} ${product.driver ?? ''}`.toLowerCase().includes(constraints.search.toLowerCase())));
  const evaluations = filtered.map(product => evaluate(product, constraints));
  const eligible = evaluations.filter(result => result.state !== 'fail' && (!constraints.strict || result.state === 'pass'));
  const groups = new Map<string, Recommendation[]>();
  for (const result of eligible) {
    const list = groups.get(result.product.group) ?? [];
    list.push(result); groups.set(result.product.group, list);
  }
  const groupOrder = [...constraints.categories, ...LISTENING_CATEGORIES];
  return {
    groups: [...groups].map(([key, items]) => {
      items.sort((a, b) => {
        if (a.state !== b.state) return a.state === 'pass' ? -1 : 1;
        if ((a.totalPrice === null) !== (b.totalPrice === null)) return a.totalPrice === null ? 1 : -1;
        const uncertainty = a.evidence.filter(item => item.state === 'unknown').length - b.evidence.filter(item => item.state === 'unknown').length;
        if (uncertainty) return uncertainty;
        if (sort === 'price') return (a.totalPrice ?? Infinity) - (b.totalPrice ?? Infinity) || a.product.name.localeCompare(b.product.name);
        if (sort === 'sound') return (b.product.sound ?? -1) - (a.product.sound ?? -1) || (a.totalPrice ?? Infinity) - (b.totalPrice ?? Infinity);
        return valueOrder(b.product.valueRank) - valueOrder(a.product.valueRank)
          || (b.product.sound ?? -1) - (a.product.sound ?? -1)
          || (a.totalPrice ?? Infinity) - (b.totalPrice ?? Infinity)
          || a.product.name.localeCompare(b.product.name);
      });
      items.forEach((item, index) => { item.order = index + 1; });
      const category = items[0].product.category;
      const suffix = key.endsWith(':open') ? ' · open-back' : key.endsWith(':closed') ? ' · closed-back' : key.endsWith(':unknown') ? ' · tipe belum tercatat' : '';
      return { key, label: CATEGORY_LABELS[category] + suffix, items };
    }).sort((a, b) => {
      const order = (key: string) => { const index = groupOrder.indexOf(key.split(':')[0] as Category); return index < 0 ? 100 : index; };
      return order(a.key) - order(b.key);
    }),
    excluded: evaluations.filter(result => result.state === 'fail').length,
    unknown: evaluations.filter(result => result.state === 'unknown').length,
    passing: evaluations.filter(result => result.state === 'pass').length,
  };
}

export function readSharedConstraints(): Constraints {
  try {
    const raw = new URLSearchParams(location.search).get('filters');
    if (!raw) return { ...DEFAULT_CONSTRAINTS };
    const saved: unknown = JSON.parse(raw);
    if (!saved || typeof saved !== 'object') return { ...DEFAULT_CONSTRAINTS };
    const data = saved as Partial<Constraints>;
    const next = { ...DEFAULT_CONSTRAINTS };
    for (const key of ['usb', 'jack', 'mic', 'music', 'strict', 'anc', 'multipoint'] as const) if (typeof data[key] === 'boolean') next[key] = data[key];
    if (typeof data.budget === 'number' && Number.isFinite(data.budget)) next.budget = Math.max(10_000, Math.min(1e9, data.budget));
    if (typeof data.accessoryReserve === 'number' && Number.isFinite(data.accessoryReserve)) next.accessoryReserve = Math.max(0, Math.min(1e8, data.accessoryReserve));
    if (typeof data.minSound === 'number' && Number.isFinite(data.minSound)) next.minSound = Math.max(0, Math.min(10, data.minSound));
    if (Array.isArray(data.categories)) next.categories = data.categories.filter((category): category is Category => typeof category === 'string' && Object.hasOwn(CATEGORY_LABELS, category));
    if (typeof data.search === 'string') next.search = data.search.slice(0, 150);
    if (data.tuning && ['any', 'neutral', 'warm', 'bass', 'bright'].includes(data.tuning)) next.tuning = data.tuning;
    return next;
  } catch { return { ...DEFAULT_CONSTRAINTS }; }
}
