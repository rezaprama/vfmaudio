CREATE TABLE IF NOT EXISTS catalog_snapshots (
  id TEXT PRIMARY KEY CHECK (id IN ('current', 'previous')),
  checksum TEXT NOT NULL,
  payload TEXT NOT NULL,
  imported_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sync_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  checked_at TEXT NOT NULL,
  last_success_at TEXT,
  last_changed_at TEXT,
  last_error TEXT
);

CREATE TABLE IF NOT EXISTS sync_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  checked_at TEXT NOT NULL,
  status TEXT NOT NULL,
  product_count INTEGER,
  message TEXT
);
