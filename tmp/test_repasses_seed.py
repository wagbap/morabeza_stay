import re
import sqlite3
from datetime import date, timedelta
from pathlib import Path

schema = Path('server/database/estrutura-referencia.sql').read_text(encoding='utf-8') + '\n' + Path('server/database/003_repasses_por_reserva.sql').read_text(encoding='utf-8')
source = Path('server/database/004_seed_repasses_referencia.sql').read_text(encoding='utf-8')
tables = set(re.findall(r'INSERT INTO `([^`]+)`', source))
tables.add('repasse_confirmacoes')
db_path = Path('tmp/repasses-seed.sqlite')
if db_path.exists():
    db_path.unlink()
db = sqlite3.connect(db_path)
for table in tables:
    body = re.search(r'CREATE TABLE(?: IF NOT EXISTS)? `?' + table + r'`? \((.*?)\) ENGINE', schema, re.S).group(1)
    columns = []
    for line in body.splitlines():
        m = re.match(r'\s*`?(\w+)`?\s+(.+)', line)
        if not m or m[1] in ['PRIMARY', 'UNIQUE', 'KEY']:
            continue
        name, definition = m.groups()
        if name == 'id':
            columns.append('id INTEGER PRIMARY KEY AUTOINCREMENT')
            continue
        kind = 'NUMERIC' if re.match(r'(?:int|bigint|tinyint|decimal)', definition, re.I) else 'TEXT'
        default = re.search(r"DEFAULT\s+('[^']*'|NULL|-?\d+(?:\.\d+)?|current_timestamp\(\))", definition, re.I)
        value = default[1] if default else None
        if value and value.lower() == 'current_timestamp()':
            value = "'2026-10-30 12:00:00'"
        columns.append('`' + name + '` ' + kind + (' NOT NULL' if 'NOT NULL' in definition else '') + (' DEFAULT ' + value if value else ''))
    db.execute('CREATE TABLE `' + table + '` (' + ','.join(columns) + ')')

def parse_date(value):
    return date.fromisoformat(str(value)[:10])

db.create_function('CURDATE', 0, lambda: '2026-10-30')
db.create_function('SUBDATE', 2, lambda value, n: (parse_date(value) - timedelta(days=int(n))).isoformat())
db.create_function('ADDDATE', 2, lambda value, n: (parse_date(value) + timedelta(days=int(n))).isoformat())
db.create_function('WEEKDAY', 1, lambda value: parse_date(value).weekday())
db.create_function('GREATEST', -1, max)
db.create_function('DATEDIFF', 2, lambda a, b: (parse_date(a) - parse_date(b)).days)
db.create_function('CONCAT', -1, lambda *values: ''.join(map(str, values)))

def run_seed():
    variables = {}
    stripped = re.sub(r'^--.*$', '', source, flags=re.M)
    for statement in stripped.split(';'):
        statement = statement.strip()
        if not statement or statement.startswith(('USE ', 'SET NAMES')):
            continue
        for key in sorted(variables, key=len, reverse=True):
            value = variables[key]
            quoted = 'NULL' if value is None else str(value) if isinstance(value, (int, float)) else "'" + str(value).replace("'", "''") + "'"
            statement = re.sub(re.escape(key) + r'\b', lambda m: quoted, statement)
        if statement.startswith('SET @'):
            key, expr = statement[4:].split(' = ', 1)
            variables[key] = db.execute('SELECT ' + expr).fetchone()[0]
        else:
            statement = statement.replace('START TRANSACTION', 'BEGIN').replace('FROM DUAL ', '')
            db.execute(statement)

run_seed()
counts = {table: db.execute('SELECT COUNT(*) FROM `' + table + '`').fetchone()[0] for table in tables}
run_seed()
assert counts == {table: db.execute('SELECT COUNT(*) FROM `' + table + '`').fetchone()[0] for table in tables}, 'Seed must be idempotent'
assert counts['usuarios'] == 6
assert counts['repasses'] == 2
assert counts['reservas_alojamento'] + counts['reservas_carro'] + counts['reservas_experiencia'] == 6
db.commit()
db.close()
print('PASS: seed executed twice, required columns enforced, six bookings and two isolated linked payouts; MySQL expressions adapted to SQLite.')
