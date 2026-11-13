import json
import pathlib
import sqlite3

database = sqlite3.connect(":memory:")
database.executescript(pathlib.Path("migrations/0001_catalog.sql").read_text())
sql = pathlib.Path(".cache/seed.sql").read_text(encoding="utf-8")
database.executescript(sql)
stored = json.loads(database.execute("SELECT payload FROM catalog_snapshots WHERE id='current'").fetchone()[0])
snapshot = json.loads(pathlib.Path("public/data/catalog.json").read_text(encoding="utf-8"))
assert stored == snapshot
assert max(len(line.encode("utf-8")) for line in sql.splitlines()) < 100_000
print(f"SQL round-trip PASS: {len(stored['products'])} products; all statements below 100KB.")
