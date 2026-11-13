import datetime
import json
import pathlib
import sys

record_path = pathlib.Path('.github/sync-heartbeat.json')
month = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m')
if record_path.exists() and json.loads(record_path.read_text())['month'] == month:
    print('Monthly source-check record already exists.')
else:
    result = json.loads(pathlib.Path(sys.argv[1]).read_text())
    if not isinstance(result.get('changed'), bool) or not isinstance(result.get('count'), int) or result['count'] <= 0:
        raise RuntimeError('A failed sync cannot create a successful monthly record.')
    checked_at = datetime.datetime.fromisoformat(result['checkedAt'].replace('Z', '+00:00'))
    if datetime.datetime.now(datetime.timezone.utc) - checked_at > datetime.timedelta(hours=24):
        raise RuntimeError('Source-check record must come from a recent successful sync.')
    record = {
        'month': month,
        'checkedAt': result['checkedAt'],
        'status': 'updated' if result['changed'] else 'unchanged',
        'productCount': result['count'],
        'source': 'https://vfmaudio.rezaprama.workers.dev/api/status',
    }
    record_path.write_text(json.dumps(record, indent=2) + '\n', encoding='utf-8')
    print('Recorded a real successful monthly source check.')
