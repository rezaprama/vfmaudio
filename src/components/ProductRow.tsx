import { CheckCircleIcon, QuestionIcon, PlusIcon, MinusIcon } from '@phosphor-icons/react';
import type { Recommendation } from '../lib/types';
import { rupiah } from '../lib/recommend';

export function ProductRow({ result, selected, onCompare, onDetail, full }: { result: Recommendation; selected: boolean; onCompare: () => void; onDetail: () => void; full: boolean }) {
  const { product, evidence, state } = result;
  return <article className={`product-row ${full ? 'first-result' : ''}`}>
    <div className="rank" aria-label={`Urutan ${result.order} dalam kelompok`}>{String(result.order).padStart(2, '0')}</div>
    <div className="product-main">
      <div className="product-title-row"><button className="product-name" onClick={onDetail}>{product.name}</button><span className={`match-state ${state}`}>{state === 'pass' ? <CheckCircleIcon size={16} aria-hidden="true" /> : <QuestionIcon size={16} aria-hidden="true" />}{state === 'pass' ? 'Sesuai data' : 'Perlu cek'}</span></div>
      <div className="product-scores">
        <span>Value <strong>{product.valueRank ?? 'Belum dinilai'}</strong></span>
        <span>Suara <strong>{product.sound?.toFixed(2) ?? 'Belum dinilai'}{product.sound !== null && <small>/10</small>}</strong>{product.soundDerived && <small> rata-rata</small>}</span>
        <span>Mic <strong>{product.mic?.split('\n')[0] ?? 'Belum dinilai'}</strong></span>
      </div>
      <div className="evidence-summary">{evidence.filter(item => item.label !== 'Anggaran').slice(0, 3).map(item => <span key={item.label} className={`evidence-label ${item.state}`}>{item.state === 'pass' ? <CheckCircleIcon size={14} aria-hidden="true" /> : <QuestionIcon size={14} aria-hidden="true" />}{item.label}{item.state === 'unknown' ? ' belum pasti' : ''}</span>)}{evidence.length === 1 && <span>{product.connection?.replace(/\n/g, ' · ') ?? 'Rincian koneksi belum tercatat'}</span>}</div>
      <div className="row-actions"><button className="text-button" onClick={onDetail}>Alasan & rincian</button><button className="text-button compare-action" onClick={onCompare} aria-pressed={selected}>{selected ? <MinusIcon size={14} aria-hidden="true" /> : <PlusIcon size={14} aria-hidden="true" />}{selected ? 'Hapus pembanding' : 'Bandingkan'}</button></div>
    </div>
    <div className="product-price"><strong>{rupiah(result.totalPrice)}</strong>{result.reserve > 0 && <small>Termasuk cadangan {rupiah(result.reserve)}</small>}<small>Harga acuan sheet</small></div>
  </article>;
}
