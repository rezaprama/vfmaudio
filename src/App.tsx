import { useMemo, useState, type FormEvent } from 'react';
import { MagnifyingGlassIcon, SlidersHorizontalIcon, SunIcon, MoonIcon, ArrowUpRightIcon, ArrowsLeftRightIcon, XIcon, LinkIcon, ArrowClockwiseIcon, CheckCircleIcon, QuestionIcon, XCircleIcon, CaretDownIcon } from '@phosphor-icons/react';
import { CATEGORY_LABELS, SOURCE_URL } from './lib/source';
import { DEFAULT_CONSTRAINTS, LISTENING_CATEGORIES, evaluate, parseNeeds, readSharedConstraints, recommend, rupiah, type SortMode } from './lib/recommend';
import type { Category, Constraints, Product } from './lib/types';
import { useCatalog } from './lib/useCatalog';
import Modal from './components/Modal';
import { ProductRow } from './components/ProductRow';

const EXAMPLES = [
  { label: 'Rp1 juta · Zoom + musik', text: 'Budget 1 juta, IEM atau headphone wireless, USB-C dan 3.5 mm, mic oke untuk Zoom, buat musik audiophile.' },
  { label: 'TWS Rp500 ribu', text: 'TWS budget 500 ribu, mic bagus buat meeting, untuk musik.' },
  { label: 'IEM netral Rp750 ribu', text: 'IEM netral, budget 750 ribu, untuk musik.' },
];
const dateTime = (value: string | null | undefined) => value ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' }).format(new Date(value)) + ' WIB' : 'Belum tersedia';
const categoryEntries = Object.entries(CATEGORY_LABELS) as [Category, string][];

export default function App() {
  const { catalog, status, loading, error, reload } = useCatalog();
  const [constraints, setConstraints] = useState<Constraints>(readSharedConstraints);
  const [query, setQuery] = useState('');
  const [notices, setNotices] = useState<string[]>([]);
  const [sort, setSort] = useState<SortMode>('value');
  const [expanded, setExpanded] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [detail, setDetail] = useState<Product | null>(null);
  const [comparison, setComparison] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [theme, setTheme] = useState(document.documentElement.dataset.theme ?? 'light');
  const results = useMemo(() => recommend(catalog?.products ?? [], constraints, sort), [catalog, constraints, sort]);
  const count = results.groups.reduce((sum, group) => sum + group.items.length, 0);
  const compareProducts = catalog?.products.filter(product => selected.includes(product.id)) ?? [];
  const stale = !!status?.lastSuccessAt && Date.now() - Date.parse(status.lastSuccessAt) > 24 * 60 * 60 * 1000;
  const activeRequirements = [constraints.usb, constraints.jack, constraints.mic, constraints.music, constraints.anc, constraints.multipoint].filter(Boolean).length;

  function patch<K extends keyof Constraints>(key: K, value: Constraints[K]) { setConstraints(current => ({ ...current, [key]: value })); setExpanded([]); }
  function toggleCategory(category: Category) { patch('categories', constraints.categories.includes(category) ? constraints.categories.filter(item => item !== category) : [...constraints.categories, category]); }
  function applyNeeds(text: string) {
    if (!text.trim()) { setNotices(['Tulis kebutuhanmu terlebih dahulu, atau pilih salah satu contoh.']); return; }
    const parsed = parseNeeds(text, constraints);
    setConstraints(parsed.constraints); setNotices(parsed.notices); setExpanded([]); setQuery(text);
  }
  function submit(event: FormEvent) { event.preventDefault(); applyNeeds(query); }
  function toggleCompare(id: string) {
    if (selected.includes(id)) setSelected(selected.filter(item => item !== id));
    else if (selected.length < 3) setSelected([...selected, id]);
    else setToast('Maksimal 3 produk. Hapus satu pembanding untuk menambah yang lain.');
  }
  function changeTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next; setTheme(next);
    try { localStorage.setItem('vfmaudio-theme', next); } catch { /* Theme remains usable when storage is disabled. */ }
  }
  async function share() {
    const url = new URL(location.href); url.search = ''; url.hash = ''; url.searchParams.set('filters', JSON.stringify(constraints));
    history.replaceState(null, '', url);
    try { await navigator.clipboard.writeText(url.href); setToast('Tautan filter disalin. Pilihan ini tersimpan dalam URL.'); }
    catch { setToast('Filter tersimpan di URL browser. Salin alamat halaman untuk membagikannya.'); }
  }
  function reset() { setConstraints({ ...DEFAULT_CONSTRAINTS }); setQuery(''); setNotices([]); setExpanded([]); setSort('value'); }

  return <div className={`app ${selected.length ? 'has-comparison' : ''}`}>
    <a className="skip-link" href="#hasil">Lewati ke hasil pencarian</a>
    <header className="masthead wrap">
      <a className="wordmark" href="#" onClick={event => { event.preventDefault(); reset(); window.scrollTo({ top: 0 }); }} aria-label="vfmaudio, kembali ke awal">vfm<span>audio</span><span className="wordmark-period">.</span></a>
      <nav aria-label="Navigasi utama"><a href="#katalog">Katalog</a><a href="#metode">Cara menilai</a><a className="source-nav" href={SOURCE_URL} target="_blank" rel="noreferrer">Kitab asli <ArrowUpRightIcon size={14} aria-hidden="true" /></a></nav>
      <button className="icon-button theme-button" onClick={changeTheme} aria-label={theme === 'light' ? 'Aktifkan tema gelap' : 'Aktifkan tema terang'}>{theme === 'light' ? <MoonIcon size={20} aria-hidden="true" /> : <SunIcon size={20} aria-hidden="true" />}</button>
    </header>

    <main className="wrap" id="katalog">
      <section className="intro" aria-labelledby="main-heading">
        <div><p className="edition">Catatan belanja audio</p><h1 id="main-heading">Suara yang <em>sepadan.</em></h1><p className="intro-copy">Mulai dari kebutuhanmu. Temukan perangkat audio yang masuk anggaran, lalu periksa komprominya.</p></div>
        <div className="source-note"><span className="note-index">Sumber / 01</span><p>Kitab Audio<br /><strong>Fernanda Gunsan</strong></p><small>{loading ? 'Memuat katalog…' : catalog ? `${catalog.products.length} produk · ${Object.keys(catalog.sheetCounts).length} kategori` : 'Katalog belum tersedia'}</small><a href="#sumber">Lihat status data <ArrowUpRightIcon size={13} aria-hidden="true" /></a></div>
      </section>

      <section className="request-section" aria-label="Pencarian berdasarkan kebutuhan">
        <form onSubmit={submit} className="request-form"><label htmlFor="needs">Audio seperti apa yang kamu cari?</label><div className="request-input-row"><textarea id="needs" value={query} onChange={event => setQuery(event.target.value)} maxLength={1500} placeholder="Misalnya: uang 1 juta, IEM atau headphone wireless, USB-C dan 3.5 mm, mic untuk Zoom, enak buat musik." rows={2} /><button className="primary-button" type="submit"><MagnifyingGlassIcon size={19} aria-hidden="true" />Cari yang cocok</button></div></form>
        <div className="examples"><span>Coba kebutuhan:</span>{EXAMPLES.map(example => <button key={example.label} onClick={() => applyNeeds(example.text)}>{example.label}</button>)}</div>
        {notices.length > 0 && <div className="parse-notice" role="status">{notices.map(notice => <p key={notice}>{notice}</p>)}</div>}
      </section>

      {(status?.lastError || stale) && <div className="data-warning" role="status"><QuestionIcon size={20} aria-hidden="true" /><p>{status?.mode === 'snapshot' ? 'Katalog live belum terhubung. Menampilkan snapshot unduhan.' : status?.lastError ? 'Pemeriksaan sumber terakhir gagal. Hasil memakai data terakhir yang berhasil disimpan.' : 'Sumber belum berhasil diperiksa dalam 24 jam.'} <span>Terakhir berhasil: {dateTime(status?.lastSuccessAt)}.</span></p><button className="text-button" onClick={reload}>Coba lagi</button></div>}

      <div className="catalog-layout">
        <aside className={`filters ${filtersOpen ? 'is-open' : ''}`} aria-label="Filter kebutuhan">
          <div className="filters-heading"><h2><SlidersHorizontalIcon size={18} aria-hidden="true" /> Batasanmu</h2><button className="text-button desktop-reset" onClick={reset}>Reset</button><button className="text-button mobile-filter-toggle" onClick={() => setFiltersOpen(!filtersOpen)} aria-expanded={filtersOpen} aria-controls="filter-fields">{filtersOpen ? 'Tutup' : 'Ubah'} <CaretDownIcon size={14} aria-hidden="true" /></button></div>
          <div className="filter-fields" id="filter-fields">
            <div className="field"><label htmlFor="budget">Anggaran total</label><div className="money-input"><span>Rp</span><input id="budget" type="number" min="10000" max="1000000000" step="10000" value={constraints.budget} onChange={event => patch('budget', Math.max(0, Number(event.target.value)))} /></div><span className="field-hint">{rupiah(constraints.budget)}</span></div>
            <fieldset><legend>Jenis perangkat</legend>{LISTENING_CATEGORIES.map(category => <label className="check-label" key={category}><input type="checkbox" checked={constraints.categories.includes(category)} onChange={() => toggleCategory(category)} /><span>{CATEGORY_LABELS[category]}</span>{catalog && <small>{catalog.products.filter(product => product.category === category).length}</small>}</label>)}<label htmlFor="more-category" className="small-label">Kategori lain</label><select id="more-category" value="" onChange={event => { if (event.target.value) toggleCategory(event.target.value as Category); }}><option value="">Tambah kategori…</option>{categoryEntries.filter(([category]) => !LISTENING_CATEGORIES.includes(category)).map(([category, label]) => <option key={category} value={category}>{constraints.categories.includes(category) ? 'Hapus: ' : ''}{label}</option>)}</select>{constraints.categories.filter(category => !LISTENING_CATEGORIES.includes(category)).map(category => <button className="selected-category" key={category} onClick={() => toggleCategory(category)}>{CATEGORY_LABELS[category]}<XIcon size={14} aria-hidden="true" /><span className="sr-only">Hapus kategori</span></button>)}<button className="text-button" onClick={() => patch('categories', [])}>Semua kategori</button></fieldset>
            <fieldset><legend>Harus mendukung</legend>{([['usb', 'USB-C untuk audio'], ['jack', 'Jack 3.5 mm'], ['mic', 'Mic untuk meeting'], ['music', 'Nilai suara minimum'], ['anc', 'ANC'], ['multipoint', 'Multipoint']] as const).map(([key, label]) => <label className="check-label" key={key}><input type="checkbox" checked={constraints[key]} onChange={event => patch(key, event.target.checked)} /><span>{label}</span></label>)}{constraints.music && <div className="field inline-field"><label htmlFor="min-sound">Minimum suara /10</label><input id="min-sound" type="number" min="0" max="10" step="0.5" value={constraints.minSound} onChange={event => patch('minSound', Math.max(0, Math.min(10, Number(event.target.value))))} /></div>}<p className="field-hint">USB-C charging belum tentu bisa audio. Mic wireless belum tentu aktif saat berkabel.</p></fieldset>
            <div className="field"><label htmlFor="tuning">Karakter suara</label><select id="tuning" value={constraints.tuning} onChange={event => patch('tuning', event.target.value as Constraints['tuning'])}><option value="any">Bebas</option><option value="neutral">Netral</option><option value="warm">Hangat</option><option value="bass">Bass / V-shape</option><option value="bright">Terang / airy</option></select></div>
            <div className="field"><label htmlFor="reserve">Cadangan aksesori</label><div className="money-input"><span>Rp</span><input id="reserve" type="number" min="0" max="100000000" step="25000" value={constraints.accessoryReserve} onChange={event => patch('accessoryReserve', Math.max(0, Number(event.target.value)))} /></div><span className="field-hint">Estimasi sendiri untuk adaptor atau kabel. Ditambahkan ke setiap harga; kompatibilitas belum otomatis terjamin.</span></div>
            <label className="check-label strict-control"><input type="checkbox" checked={constraints.strict} onChange={event => patch('strict', event.target.checked)} /><span>Hanya data terverifikasi<small>Sembunyikan hasil yang perlu dicek.</small></span></label>
            <button className="secondary-button reset-mobile" onClick={reset}>Reset semua filter</button>
          </div>
        </aside>

        <section className="results" id="hasil" aria-labelledby="results-heading" tabIndex={-1}>
          <div className="results-heading"><div><p className="section-index">Pilihan sesuai kebutuhan</p><h2 id="results-heading">{loading ? 'Membaca kitab…' : `${count} pilihan untukmu`}<span className="heading-period">.</span></h2></div><button className="icon-button" onClick={() => { void share(); }} aria-label="Salin tautan filter"><LinkIcon size={21} aria-hidden="true" /></button></div>
          <div className="result-controls"><div className="field search-field"><label htmlFor="product-search">Cari nama produk atau driver</label><MagnifyingGlassIcon size={17} aria-hidden="true" /><input id="product-search" type="search" value={constraints.search} onChange={event => patch('search', event.target.value)} placeholder="Nama produk atau driver" /></div><div className="sort-field"><label htmlFor="sort">Urutkan</label><select id="sort" value={sort} onChange={event => setSort(event.target.value as SortMode)}><option value="value">Value dari kitab</option><option value="price">Harga terendah</option><option value="sound">Nilai suara</option></select></div></div>
          <p className="result-explainer">{activeRequirements ? `${results.passing} sesuai data · ${results.unknown} perlu cek · ${results.excluded} tidak memenuhi.` : 'Urutan berlaku dalam setiap kategori.'} Nilai dari Kitab Audio Fernanda Gunsan; antarjenis perangkat tidak setara. <a href="#metode">Baca metodenya</a></p>
          <div className="result-live" role="status" aria-live="polite"><span className="sr-only">{loading ? 'Memuat katalog audio.' : `${count} hasil dalam ${results.groups.length} kelompok.`}</span></div>
          {loading && <div className="loading-state"><div className="loading-line" /><p>Membaca harga dan penilaian dari katalog…</p><small>Menyiapkan kelompok perangkat, koneksi, dan bukti kebutuhan.</small></div>}
          {!loading && error && <div className="empty-state" role="alert"><h3>Katalog belum bisa dibuka.</h3><p>{error}</p><button className="secondary-button" onClick={reload}><ArrowClockwiseIcon size={17} aria-hidden="true" />Muat ulang katalog</button></div>}
          {!loading && !error && !count && <div className="empty-state"><span className="empty-index">0 / cocok</span><h3>Belum ada yang memenuhi semua batasan.</h3><p>{constraints.strict && results.unknown > 0 ? `Ada ${results.unknown} produk yang sebagian datanya belum lengkap. Tampilkan untuk melihat apa yang perlu dicek.` : 'Coba kurangi syarat koneksi, perluas kategori, atau ubah anggaran. Kami tetap menandai data yang belum tercatat.'}</p>{constraints.strict && results.unknown > 0 ? <button className="secondary-button" onClick={() => patch('strict', false)}>Tampilkan yang perlu dicek</button> : <button className="secondary-button" onClick={reset}>Reset batasan pencarian</button>}</div>}
          {!loading && !error && results.groups.map(group => <section className="result-group" key={group.key} aria-label={group.label}><div className="group-heading"><h3>{group.label}</h3><span>{group.items.length} pilihan</span></div>{group.items.slice(0, expanded.includes(group.key) ? undefined : 3).map((result, index) => <ProductRow key={result.product.id} result={result} full={index === 0} selected={selected.includes(result.product.id)} onCompare={() => toggleCompare(result.product.id)} onDetail={() => setDetail(result.product)} />)}{group.items.length > 3 && <button className="show-more" onClick={() => setExpanded(expanded.includes(group.key) ? expanded.filter(key => key !== group.key) : [...expanded, group.key])}>{expanded.includes(group.key) ? 'Ringkas daftar' : `Lihat ${group.items.length - 3} pilihan lainnya`}<CaretDownIcon size={15} aria-hidden="true" /></button>}</section>)}
          <p className="price-note">Harga adalah acuan di sheet, bukan harga checkout langsung. Cek varian, stok, garansi, dan tautan belanja pada sumber asli.</p>
        </section>
      </div>

      <section className="method-section" id="metode" aria-labelledby="method-heading"><div className="method-title"><p className="section-index">Catatan penilaian</p><h2 id="method-heading">Baca angkanya.<br /><em>Pahami batasnya.</em></h2></div><div className="method-copy"><h3>Value mengikuti penilaian penulis.</h3><p>Kecocokan syarat didahulukan. Setelah itu, urutan mengikuti tier value dari Kitab Audio, nilai suara dalam kelompok yang sama, lalu harga. Tier kualitas tetap terpisah dari tier value. Produk tanpa nilai value tidak mendapat nilai rekaan.</p><h3>Data kosong tetap kosong.</h3><p>Label “Sesuai data” berarti syarat yang kamu pilih tercatat memenuhi di sumber. “Perlu cek” berarti ada fakta yang belum tersedia. Label ini bukan hasil uji mandiri. Nilai mic minimal A atau 7.5/10 dipakai untuk filter meeting; sistem belum menilai tiap kondisi ruangan atau mode kabel.</p><h3>Selera tidak punya sertifikat.</h3><p>Penilaian suara bersifat subjektif. Skor IEM, TWS, serta headphone tidak dibandingkan silang. Headphone open-back dan closed-back juga dipisahkan. Nilai bass menunjukkan kualitas, bukan jumlah bass. Ambang suara untuk musik dapat kamu ubah; kata “audiophile” tidak dianggap sertifikasi.</p><h3>Cadangan bukan paket yang dijamin cocok.</h3><p>Cadangan aksesori adalah nominal yang kamu isi, ditambahkan ke harga perangkat. Kecocokan pin kabel IEM, dukungan TRRS/CTIA, varian konektor, dan mic pada perangkatmu tetap perlu dicek. Sediakan cadangan jika memakai adaptor, lalu bandingkan rincian pada sumber.</p></div></section>

      <section className="source-section" id="sumber" aria-labelledby="source-heading"><div><p className="section-index">Asal & kesegaran data</p><h2 id="source-heading">Kitab tetap jadi rujukan.</h2><p>Ringkasan ini membantu menyaring pilihan. Review lengkap dan tautan belanja milik penulis tetap tersedia di sumber asli.</p><a className="secondary-button" href={SOURCE_URL} target="_blank" rel="noreferrer">Buka Kitab Audio <ArrowUpRightIcon size={16} aria-hidden="true" /></a></div><dl className="source-dates"><div><dt>Pemeriksaan terakhir</dt><dd>{dateTime(status?.checkedAt)}</dd></div><div><dt>Data terakhir berhasil</dt><dd>{dateTime(status?.lastSuccessAt)}</dd></div><div><dt>Snapshot berubah</dt><dd>{dateTime(status?.lastChangedAt)}</dd></div><div><dt>Jadwal pemeriksaan</dt><dd>Setiap 6 jam, sekitar 01.17 / 07.17 / 13.17 / 19.17 WIB</dd></div><div><dt>Judul dari sumber</dt><dd>{catalog?.sourceTitle ?? 'Belum tersedia'}</dd></div></dl></section>
    </main>

    <footer className="footer wrap"><p><strong>vfmaudio.</strong> Pilih dengan alasan.</p><p>Data: <a href={SOURCE_URL} target="_blank" rel="noreferrer">Fernanda Gunsan</a> · Proyek independen</p><a href="https://github.com/rezaprama/vfmaudio" target="_blank" rel="noreferrer">Kode sumber <ArrowUpRightIcon size={14} aria-hidden="true" /></a></footer>

    {selected.length > 0 && <div className="compare-tray" aria-label="Produk pembanding"><div><ArrowsLeftRightIcon size={21} aria-hidden="true" /><span><strong>{selected.length}/3</strong> produk dipilih</span><small>{compareProducts.map(product => product.name).join(' · ')}</small></div><button className="primary-button" disabled={selected.length < 2} onClick={() => setComparison(true)}>Bandingkan{selected.length < 2 ? ' (pilih 2)' : ''}</button><button className="icon-button" onClick={() => setSelected([])} aria-label="Hapus semua pembanding"><XIcon size={20} aria-hidden="true" /></button></div>}
    {toast && <div className="toast" role="status"><p>{toast}</p><button className="icon-button" onClick={() => setToast('')} aria-label="Tutup pemberitahuan"><XIcon size={16} aria-hidden="true" /></button></div>}

    {detail && <Modal title={detail.name} close={() => setDetail(null)}><p className="detail-category">{CATEGORY_LABELS[detail.category]} · baris {detail.source.row}</p><p className="detail-price">{rupiah(detail.price)}</p><p className="detail-source">Penilaian Kitab Audio oleh Fernanda Gunsan, bersifat subjektif.</p><h3>Kecocokan dengan batasanmu</h3><div className="evidence-list">{evaluate(detail, constraints).evidence.map(item => <div className={`evidence-item ${item.state}`} key={item.label}>{item.state === 'pass' ? <CheckCircleIcon size={20} aria-hidden="true" /> : item.state === 'fail' ? <XCircleIcon size={20} aria-hidden="true" /> : <QuestionIcon size={20} aria-hidden="true" />}<div><strong>{item.label}: {item.state === 'pass' ? 'sesuai data' : item.state === 'fail' ? 'tidak memenuhi' : 'perlu dicek'}</strong><p>{item.detail}</p></div></div>)}</div><h3>Yang tercatat di sumber</h3><dl className="specs">{[['Value', detail.valueRank], ['Tier kualitas', detail.qualityRank], ['Suara', detail.sound !== null ? `${detail.sound.toFixed(2)}/10${detail.soundDerived ? ' (rata-rata komponen)' : ''}` : null], ['Mic', detail.mic], ['Koneksi / kabel', detail.connection], ['Tuning', detail.tuning], ['Driver / chip', detail.driver], ['Baterai', detail.battery], ['Codec', detail.codec], ['ANC', detail.anc], ['Multipoint', detail.multipoint]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value ?? 'Belum tercatat'}</dd></div>)}</dl>{Object.keys(detail.scores).length > 0 && <><h3>Komponen nilai suara</h3><div className="score-grid">{Object.entries(detail.scores).map(([label, value]) => <div key={label}><span>{label}</span><strong>{value.toFixed(1)}<small>/10</small></strong></div>)}</div></>}<a className="primary-button source-link" href={detail.source.url} target="_blank" rel="noreferrer">Baca review & tautan belanja <ArrowUpRightIcon size={17} aria-hidden="true" /></a><p className="field-hint">Membuka tab {detail.source.sheet}, baris {detail.source.row}, pada sheet asli. Tautan afiliasi penulis tidak diganti.</p></Modal>}
    {comparison && <Modal title="Bandingkan pilihanmu" close={() => setComparison(false)} wide><p className="comparison-note">Skor hanya dapat dibandingkan dalam kategori yang sama. Kolom “belum tercatat” bukan nilai nol. Kecocokan mengikuti filter saat ini.</p>{new Set(compareProducts.map(product => product.group)).size > 1 && <p className="data-warning">Pilihan berasal dari kelompok berbeda. Bandingkan kebutuhan dan harga; jangan bandingkan angka suaranya secara langsung.</p>}<div className="comparison-grid" style={{ '--compare-count': compareProducts.length } as React.CSSProperties}>{compareProducts.map(product => { const result = evaluate(product, constraints); return <article key={product.id}><span className="section-index">{CATEGORY_LABELS[product.category]}</span><h3>{product.name}</h3><p className="comparison-price">{rupiah(result.totalPrice)}</p><dl className="specs">{[['Value', product.valueRank], ['Suara', product.sound?.toFixed(2)], ['Mic', product.mic], ['Koneksi', product.connection], ['Tuning', product.tuning], ['Baterai', product.battery], ['ANC', product.anc], ['Multipoint', product.multipoint]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value ?? 'Belum tercatat'}</dd></div>)}</dl><ul className="compare-evidence">{result.evidence.map(item => <li key={item.label}>{item.label}: {item.state === 'pass' ? 'sesuai data' : item.state === 'fail' ? 'tidak memenuhi' : 'perlu cek'}</li>)}</ul><a className="secondary-button" href={product.source.url} target="_blank" rel="noreferrer">Baris sumber <ArrowUpRightIcon size={14} aria-hidden="true" /></a></article>; })}</div></Modal>}
  </div>;
}
