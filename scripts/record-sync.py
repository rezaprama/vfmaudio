import datetime
import json
import pathlib
import urllib.request

record_path = pathlib.Path('.github/sync-heartbeat.json')
month = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m')
if record_path.exists() and json.loads(record_path.read_text())['month'] == month:
    print('Monthly source-check record already exists.')
else:
    with urllib.request.urlopen('https://vfmaudio.rezaprama.workers.dev/api/status', timeout=30) as response:
        status = json.load(response)
    latest = status['recent'][0]
    if latest['status'] not in ('updated', 'unchanged') or status['state']['last_error']:
        raise RuntimeError('A failed sync cannot create a successful monthly record.')
    checked_at = datetime.datetime.fromisoformat(latest['checked_at'].replace('Z', '+00:00'))
    if datetime.datetime.now(datetime.timezone.utc) - checked_at > datetime.timedelta(hours=24):
        raise RuntimeError('Source-check record must come from a recent successful sync.')
    record = {
        'month': month,
        'checkedAt': latest['checked_at'],
        'status': latest['status'],
        'productCount': latest['product_count'],
        'source': 'https://vfmaudio.rezaprama.workers.dev/api/status',
    }
    record_path.write_text(json.dumps(record, indent=2) + '\n', encoding='utf-8')
    print('Recorded a real successful monthly source check.')
