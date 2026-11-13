import { fetchCatalog } from '../src/lib/source';
import { timingSafeEqual } from 'node:crypto';
import type { Catalog, SyncStatus } from '../src/lib/types';

interface SnapshotRow { payload: string; checksum: string; imported_at: string }
interface StateRow { checked_at: string; last_success_at: string | null; last_changed_at: string | null; last_error: string | null }

const headers = {
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cache-Control': 'no-store',
};

function json(data: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), { status, headers: { ...headers, ...extra } });
}

export async function syncCatalog(env: Env): Promise<{ changed: boolean; count: number }> {
  const checkedAt = new Date().toISOString();
  try {
    const catalog = await fetchCatalog();
    const current = await env.DB.prepare("SELECT payload, checksum, imported_at FROM catalog_snapshots WHERE id = 'current'").first<SnapshotRow>();
    if (current) {
      const previous: Catalog = JSON.parse(current.payload);
      for (const [sheet, count] of Object.entries(previous.sheetCounts)) {
        if ((catalog.sheetCounts[sheet] ?? 0) < count * 0.75) throw new Error(`Jumlah produk ${sheet} turun lebih dari 25%. Periksa perubahan struktur sebelum impor.`);
      }
    }
    const encoded = new TextEncoder().encode(JSON.stringify({ products: catalog.products, title: catalog.sourceTitle }));
    const hash = await crypto.subtle.digest('SHA-256', encoded);
    const checksum = [...new Uint8Array(hash)].map(byte => byte.toString(16).padStart(2, '0')).join('');
    const changed = current?.checksum !== checksum;
    const payload = JSON.stringify(catalog);
    if (new TextEncoder().encode(payload).byteLength > 1_500_000) throw new Error('Snapshot melebihi batas penyimpanan aplikasi. Perlu pemisahan data sebelum impor.');
    const statements: D1PreparedStatement[] = [];
    if (changed) {
      statements.push(env.DB.prepare("INSERT INTO catalog_snapshots (id, checksum, payload, imported_at) SELECT 'previous', checksum, payload, imported_at FROM catalog_snapshots WHERE id = 'current' ON CONFLICT(id) DO UPDATE SET checksum=excluded.checksum, payload=excluded.payload, imported_at=excluded.imported_at"));
      statements.push(env.DB.prepare("INSERT INTO catalog_snapshots (id, checksum, payload, imported_at) VALUES ('current', ?, ?, ?) ON CONFLICT(id) DO UPDATE SET checksum=excluded.checksum, payload=excluded.payload, imported_at=excluded.imported_at").bind(checksum, payload, checkedAt));
    }
    statements.push(env.DB.prepare('INSERT INTO sync_state (id, checked_at, last_success_at, last_changed_at, last_error) VALUES (1, ?, ?, ?, NULL) ON CONFLICT(id) DO UPDATE SET checked_at=excluded.checked_at, last_success_at=excluded.last_success_at, last_changed_at=COALESCE(excluded.last_changed_at, sync_state.last_changed_at), last_error=NULL').bind(checkedAt, checkedAt, changed ? checkedAt : null));
    statements.push(env.DB.prepare('INSERT INTO sync_runs (checked_at, status, product_count) VALUES (?, ?, ?)').bind(checkedAt, changed ? 'updated' : 'unchanged', catalog.products.length));
    statements.push(env.DB.prepare('DELETE FROM sync_runs WHERE id NOT IN (SELECT id FROM sync_runs ORDER BY id DESC LIMIT 100)'));
    await env.DB.batch(statements);
    console.log(JSON.stringify({ event: 'catalog_sync', changed, count: catalog.products.length, checkedAt }));
    return { changed, count: catalog.products.length };
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 400) : 'Sinkronisasi gagal.';
    await env.DB.batch([
      env.DB.prepare('INSERT INTO sync_state (id, checked_at, last_error) VALUES (1, ?, ?) ON CONFLICT(id) DO UPDATE SET checked_at=excluded.checked_at, last_error=excluded.last_error').bind(checkedAt, message),
      env.DB.prepare("INSERT INTO sync_runs (checked_at, status, message) VALUES (?, 'error', ?)").bind(checkedAt, message),
    ]);
    console.error(JSON.stringify({ event: 'catalog_sync_error', checkedAt, message }));
    throw error;
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    if (url.pathname === '/api/admin/sync' && request.method === 'POST') {
      const token = request.headers.get('Authorization')?.replace(/^Bearer /, '') ?? '';
      if (!env.SYNC_TOKEN || !token || token.length > 512) return json({ error: 'Akses ditolak.' }, 401);
      const encoder = new TextEncoder();
      const [expected, received] = await Promise.all([
        crypto.subtle.digest('SHA-256', encoder.encode(env.SYNC_TOKEN)),
        crypto.subtle.digest('SHA-256', encoder.encode(token)),
      ]);
      if (!timingSafeEqual(new Uint8Array(expected), new Uint8Array(received))) return json({ error: 'Akses ditolak.' }, 401);
      // Only an authenticated operator can invoke the same importer used by the cron trigger.
      try { return json(await syncCatalog(env)); }
      catch { return json({ error: 'Sinkronisasi gagal. Snapshot terakhir dipertahankan.' }, 502); }
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') return json({ error: 'Metode tidak didukung.' }, 405, { Allow: 'GET, HEAD' });
    try {
      if (url.pathname === '/api/catalog') {
        const [snapshot, state] = await Promise.all([
          env.DB.prepare("SELECT payload, checksum, imported_at FROM catalog_snapshots WHERE id = 'current'").first<SnapshotRow>(),
          env.DB.prepare('SELECT * FROM sync_state WHERE id = 1').first<StateRow>(),
        ]);
        if (!snapshot) return json({ error: 'Katalog belum tersedia. Silakan coba lagi.' }, 503);
        const status: SyncStatus = { checkedAt: state?.checked_at ?? null, lastSuccessAt: state?.last_success_at ?? null, lastChangedAt: state?.last_changed_at ?? snapshot.imported_at, lastError: state?.last_error ?? null, mode: 'live' };
        const etag = `"${snapshot.checksum}:${state?.checked_at ?? ''}:${state?.last_error ? 'error' : 'ok'}"`;
        const responseHeaders = { ...headers, ETag: etag, 'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' };
        if (request.headers.get('If-None-Match') === etag) return new Response(null, { status: 304, headers: responseHeaders });
        return new Response(request.method === 'HEAD' ? null : JSON.stringify({ catalog: JSON.parse(snapshot.payload), status }), { headers: responseHeaders });
      }
      if (url.pathname === '/api/status') {
        const [state, recent] = await Promise.all([
          env.DB.prepare('SELECT * FROM sync_state WHERE id = 1').first<StateRow>(),
          env.DB.prepare('SELECT checked_at, status, product_count, message FROM sync_runs ORDER BY id DESC LIMIT 10').all(),
        ]);
        return json({ state, recent: recent.results, scheduler: 'github-actions', schedule: '17 */6 * * *', timezone: 'UTC' });
      }
      return json({ error: 'Endpoint tidak ditemukan.' }, 404);
    } catch (error) {
      console.error(JSON.stringify({ event: 'api_error', path: url.pathname, message: error instanceof Error ? error.message : 'Unknown error' }));
      return json({ error: 'Katalog sementara tidak dapat dibaca. Snapshot unduhan masih tersedia.' }, 503);
    }
  },
  async scheduled(_controller: ScheduledController, env: Env): Promise<void> {
    await syncCatalog(env);
  },
} satisfies ExportedHandler<Env>;
