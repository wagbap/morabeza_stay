"""Exercise the endpoint's actual access query with different booking roles."""
import re
import sqlite3
import unittest
from pathlib import Path

SOURCE = (Path(__file__).resolve().parents[1] / 'server/api/dashboard/detalhes_reserva.php').read_text(encoding='utf-8')


class BookingAccessTests(unittest.TestCase):
    def test_customer_owner_and_unrelated_user(self):
        expression = re.search(r"\$sql = (.*?);", SOURCE, re.S).group(1)
        for category, table, listing, fk, owner in re.findall(
            r"'(alojamento|carro|experiencia)' => \['([^']+)', '([^']+)', '([^']+)', '([^']+)'\]", SOURCE
        ):
            with self.subTest(category=category):
                values = dict(table=table, listing=listing, fk=fk, owner=owner)
                parts = re.findall(r"'([^']*)'|\$(table|listing|fk|owner)", expression)
                sql = ''.join(literal if not variable else values[variable] for literal, variable in parts)
                if category == 'alojamento':
                    sql += ' AND COALESCE(r.is_bloqueio, 0) = 0'
                db = sqlite3.connect(':memory:')
                db.execute(f'CREATE TABLE {listing}(id INTEGER, {owner} INTEGER)')
                db.execute(f'CREATE TABLE {table}(id INTEGER, usuario_id INTEGER, {fk} INTEGER, is_bloqueio INTEGER)')
                db.execute(f'INSERT INTO {listing} VALUES (1021, 42)')
                db.execute(f'INSERT INTO {table} VALUES (102, 3, 1021, 0)')
                for user_id, allowed in [(3, True), (42, True), (99, False)]:
                    result = db.execute(sql, dict(id=102, cliente=user_id, anfitriao=user_id)).fetchone()
                    self.assertEqual(result is not None, allowed)
                    if result:
                        self.assertEqual(result[0], 102)
                self.assertIsNone(db.execute(sql, dict(id=99, cliente=42, anfitriao=42)).fetchone())
                if category == 'alojamento':
                    db.execute(f'UPDATE {table} SET is_bloqueio=1')
                    self.assertIsNone(db.execute(sql, dict(id=102, cliente=42, anfitriao=42)).fetchone())
                db.close()


if __name__ == '__main__':
    unittest.main()
