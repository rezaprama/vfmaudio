import { useCallback, useEffect, useState } from 'react';
import type { Catalog, SyncStatus } from './types';

function validCatalog(value: unknown): value is Catalog {
  return !!value && typeof value === 'object' && 'version' in value && value.version === 1 && 'products' in value && Array.isArray(value.products) && value.products.length > 0;
}

export function useCatalog() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError(null);
    try {
      let data: { catalog: Catalog; status: SyncStatus };
      try {
        const response = await fetch('/api/catalog', { signal });
        if (!response.ok) throw new Error('API belum tersedia.');
        data = await response.json();
        if (!validCatalog(data.catalog)) throw new Error('Katalog belum valid.');
      } catch (error) {
        if (signal?.aborted) return;
        const response = await fetch('/data/catalog.json', { signal });
        if (!response.ok) throw new Error('Snapshot tidak dapat diunduh.');
        const fallback: unknown = await response.json();
        if (!validCatalog(fallback)) throw new Error('Snapshot belum valid.');
        data = { catalog: fallback, status: { checkedAt: null, lastSuccessAt: fallback.fetchedAt, lastChangedAt: fallback.fetchedAt, lastError: 'Koneksi katalog live terputus. Menampilkan snapshot saat deployment.', mode: 'snapshot' } };
      }
      if (!signal?.aborted) { setCatalog(data.catalog); setStatus(data.status); }
    } catch {
      if (!signal?.aborted) setError('Katalog belum bisa diunduh. Periksa koneksi, lalu coba muat ulang.');
    } finally { if (!signal?.aborted) setLoading(false); }
  }, []);
  useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort(); }, [load]);
  return { catalog, status, loading, error, reload: () => { void load(); } };
}
