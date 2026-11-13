export type Category =
  | 'iem' | 'tws' | 'half-in-ear' | 'ows' | 'wireless-headphone'
  | 'headphone' | 'wired-earphone' | 'gaming' | 'dongle-dac' | 'cable'
  | 'eartips' | 'desktop-dac' | 'microphone' | 'headphone-amp'
  | 'speaker' | 'bluetooth-speaker' | 'soundbar' | 'dap' | 'soundcard' | 'wireless-mic';

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number | null;
  valueRank: string | null;
  qualityRank: string | null;
  sound: number | null;
  soundDerived: boolean;
  mic: string | null;
  micScore: number | null;
  connection: string | null;
  usbAudio: boolean | null;
  jack35: boolean | null;
  bluetooth: boolean | null;
  wiredMic: boolean | null;
  bothModesVerified: boolean | null;
  tuning: string | null;
  driver: string | null;
  battery: string | null;
  codec: string | null;
  anc: string | null;
  multipoint: string | null;
  group: string;
  source: { sheet: string; gid: string; row: number; url: string };
  scores: Record<string, number>;
}

export interface Catalog {
  version: 1;
  products: Product[];
  fetchedAt: string;
  sourceTitle: string | null;
  sourceUrl: string;
  attribution: string;
  sheetCounts: Record<string, number>;
}

export interface SyncStatus {
  checkedAt: string | null;
  lastSuccessAt: string | null;
  lastChangedAt: string | null;
  lastError: string | null;
  mode: 'live' | 'snapshot';
}

export interface Constraints {
  budget: number;
  categories: Category[];
  usb: boolean;
  jack: boolean;
  mic: boolean;
  music: boolean;
  minSound: number;
  anc: boolean;
  multipoint: boolean;
  strict: boolean;
  accessoryReserve: number;
  tuning: 'any' | 'neutral' | 'warm' | 'bass' | 'bright';
  search: string;
}

export type EvidenceState = 'pass' | 'unknown' | 'fail';
export interface Evidence { label: string; state: EvidenceState; detail: string }
export interface Recommendation {
  product: Product;
  evidence: Evidence[];
  state: EvidenceState;
  totalPrice: number | null;
  reserve: number;
  needsAccessory: boolean;
  order: number;
}
