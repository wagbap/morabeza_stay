import re
import sqlite3
from pathlib import Path

db = sqlite3.connect('tmp/repasses-seed.sqlite')
db.row_factory = sqlite3.Row

def clone(table, changes):
    row = dict(db.execute('SELECT * FROM ' + table + ' LIMIT 1').fetchone())
    row.update(changes)
    db.execute('INSERT INTO ' + table + ' (' + ','.join(row) + ') VALUES (' + ','.join('?' for _ in row) + ')', list(row.values()))

clone('usuarios', dict(id=900000, nome='Preservar', email='real@example.invalid', category='real', ativo=1))
clone('repasses', dict(id=900000, prestador_id=900000, reserva_id=None, valor=123, observacoes='Preservar'))
db.commit()
source = re.sub(r'^--.*$', '', Path('server/database/004_limpar_seed_repasses_referencia.sql').read_text(encoding='utf-8'), flags=re.M)
prepared = None
for statement in source.split(';'):
    statement = statement.strip()
    if not statement or statement.startswith('USE '):
        continue
    if statement.startswith('SET @seed_cleanup_sql'):
        sql = re.search(r", '((?:''|[^'])*)', 'SELECT 1'\)$", statement).group(1).replace("''", "'")
        table = re.search(r'DELETE FROM (\w+)', sql).group(1)
        prepared = sql if db.execute('SELECT 1 FROM sqlite_master WHERE type=? AND name=?', ('table', table)).fetchone() else 'SELECT 1'
        continue
    if statement.startswith(('PREPARE ', 'DEALLOCATE ')):
        continue
    if statement.startswith('EXECUTE '):
        statement = prepared
    m = re.match(r'DELETE (\w+) FROM (\w+) \w+ JOIN repasses rp ON rp.id=\w+.repasse_id WHERE (.*)', statement, re.S)
    if m:
        statement = 'DELETE FROM ' + m[2] + ' WHERE repasse_id IN (SELECT rp.id FROM repasses rp WHERE ' + m[3] + ')'
    db.execute(statement.replace('START TRANSACTION', 'BEGIN'))

assert db.execute('SELECT COUNT(*) FROM usuarios').fetchone()[0] == 1
assert db.execute('SELECT COUNT(*) FROM repasses').fetchone()[0] == 1
assert db.execute('SELECT id FROM usuarios').fetchone()[0] == 900000
assert db.execute('SELECT id FROM repasses').fetchone()[0] == 900000
for table in ['alojamentos', 'carros', 'experiencias', 'reservas_alojamento', 'reservas_carro', 'reservas_experiencia', 'dados_recebimento', 'reserva_validacoes', 'repasse_itens', 'repasse_transferencias']:
    assert db.execute('SELECT COUNT(*) FROM ' + table).fetchone()[0] == 0, table
db.close()
print('PASS: cleanup removes the isolated seed and preserves an unrelated user and payout; MySQL DELETE syntax adapted to SQLite.')
