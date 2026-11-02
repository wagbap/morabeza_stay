"""Exercise the endpoint's actual access query with different booking roles."""
import re
import sqlite3
import unittest
from pathlib import Path

SOURCE = (Path(__file__).resolve().parents[1] / 'server/api/dashboard/detalhes_reserva.php').read_text(encoding='utf-8')


class BookingAccessTests(unittest.TestCase):
    def test_customer_owner_and_unrelated_user(self):
        queries = [q for q in re.findall(r'\$query = "(.*?)";', SOURCE, re.S) if 'SELECT' in q]
        self.assertEqual(len(queries), 3)
        config = [('alojamento','reservas_alojamento','alojamentos','alojamento_id','proprietario_id','a'),
                  ('carro','reservas_carro','carros','carro_id','usuario_id','c'),
                  ('experiencia','reservas_experiencia','experiencias','experiencia_id','usuario_id','e')]
        for query, (category, table, listing, fk, owner, alias) in zip(queries, config):
            with self.subTest(category=category):
                predicate = query.split('WHERE', 1)[1].strip()
                sql = f'SELECT r.id FROM {table} r JOIN {listing} {alias} ON {alias}.id=r.{fk} WHERE {predicate}'
                db = sqlite3.connect(':memory:')
                db.execute(f'CREATE TABLE {listing}(id INTEGER, {owner} INTEGER)')
                db.execute(f'CREATE TABLE {table}(id INTEGER, usuario_id INTEGER, {fk} INTEGER, is_bloqueio INTEGER)')
                db.execute(f'INSERT INTO {listing} VALUES (1021, 42)')
                db.execute(f'INSERT INTO {table} VALUES (102, 3, 1021, 0)')
                for user_id, allowed in [(3, True), (42, True), (99, False)]:
                    result = db.execute(sql, (102, user_id, user_id)).fetchone()
                    self.assertEqual(result is not None, allowed)
                    if result:
                        self.assertEqual(result[0], 102)
                self.assertIsNone(db.execute(sql, (99, 42, 42)).fetchone())
                if category == 'alojamento':
                    db.execute(f'UPDATE {table} SET is_bloqueio=1')
                    self.assertIsNone(db.execute(sql, (102, 42, 42)).fetchone())
                db.close()


if __name__ == '__main__':
    unittest.main()
