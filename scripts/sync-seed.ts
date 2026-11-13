import { mkdir, writeFile } from 'node:fs/promises';
import { fetchCatalog } from '../src/lib/source';

const catalog = await fetchCatalog();
await mkdir('public/data', { recursive: true });
await mkdir('.cache', { recursive: true });
await writeFile('public/data/catalog.json', JSON.stringify(catalog));
const escape = (value: string) => `'${value.replace(/'/g, "''")}'`;
const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify({ products: catalog.products, title: catalog.sourceTitle })));
const checksum = Buffer.from(hash).toString('hex');
// Stage chunks below D1's 100KB SQL limit, then publish the complete snapshot.
const payload = JSON.stringify(catalog);
const characters = Array.from(payload);
const statements = ["CREATE TABLE IF NOT EXISTS catalog_import (id INTEGER PRIMARY KEY, payload TEXT NOT NULL);", "INSERT OR REPLACE INTO catalog_import (id, payload) VALUES (1, '');"];
for (let offset = 0; offset < characters.length; offset += 12_000) statements.push(`UPDATE catalog_import SET payload=payload || ${escape(characters.slice(offset, offset + 12_000).join(''))} WHERE id=1;`);
statements.push(`INSERT INTO catalog_snapshots (id, checksum, payload, imported_at) SELECT 'current', ${escape(checksum)}, payload, ${escape(catalog.fetchedAt)} FROM catalog_import WHERE id=1 ON CONFLICT(id) DO UPDATE SET checksum=excluded.checksum,payload=excluded.payload,imported_at=excluded.imported_at;`);
statements.push(`INSERT INTO sync_state (id, checked_at, last_success_at, last_changed_at) VALUES (1, ${escape(catalog.fetchedAt)}, ${escape(catalog.fetchedAt)}, ${escape(catalog.fetchedAt)}) ON CONFLICT(id) DO UPDATE SET checked_at=excluded.checked_at,last_success_at=excluded.last_success_at,last_changed_at=excluded.last_changed_at,last_error=NULL;`);
statements.push('DROP TABLE catalog_import;');
await writeFile('.cache/seed.sql', statements.join('\n'));
console.log(JSON.stringify({ count: catalog.products.length, sheets: catalog.sheetCounts, title: catalog.sourceTitle, bytes: JSON.stringify(catalog).length }, null, 2));
