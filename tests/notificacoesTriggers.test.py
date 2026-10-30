"""Exercise emitted trigger statements using SQLite syntax adaptation.
MariaDB DDL/locking must still be checked on the hosting server.
"""
import re
import sqlite3
import unittest
import uuid
from pathlib import Path

SQL = (Path(__file__).resolve().parents[1] / 'server/database/001_notificacoes_contexto.sql').read_text(encoding='utf-8')
CONFIG = [('alojamento','alojamentos','proprietario_id','status','alojamento_imagens','alojamento_id','reservas_alojamento'),('carro','carros','usuario_id','status_carro','carro_imagens','carro_id','reservas_carro'),('experiencia','experiencias','usuario_id','status','experiencia_imagens','experiencia_id','reservas_experiencia')]

class TriggerTests(unittest.TestCase):
    def setUp(self):
        self.db = sqlite3.connect(':memory:')
        self.db.row_factory = sqlite3.Row
        self.db.create_function('UUID',0,lambda:str(uuid.uuid4()))
        self.db.create_function('CONCAT',-1,lambda *xs:None if None in xs else ''.join(map(str,xs)))
        self.db.executescript('''CREATE TABLE notificacoes_anfitriao(id INTEGER PRIMARY KEY,usuario_id INTEGER,tipo TEXT,titulo TEXT,mensagem TEXT,anuncio_id INTEGER,tipo_anuncio TEXT,anuncio_titulo TEXT,anuncio_imagem TEXT,reserva_id INTEGER,pedido_id INTEGER,evento_chave TEXT,lida INTEGER DEFAULT 0,criado_em TEXT DEFAULT CURRENT_TIMESTAMP,UNIQUE(usuario_id,evento_chave));
        CREATE TABLE pedidos_documentos(id INTEGER PRIMARY KEY,anuncio_id INTEGER,anuncio_tipo TEXT,prestador_id INTEGER,tipo_documento TEXT,estado TEXT,motivo TEXT,prazo TEXT,motivo_rejeicao TEXT);''')
        for cat,table,owner,state,gallery,fk,book in CONFIG:
            image = 'imagem_principal' if cat == 'experiencia' else 'imagem_url'
            self.db.execute(f'CREATE TABLE {table}(id INTEGER PRIMARY KEY,{owner} INTEGER,titulo TEXT,{image} TEXT,{state} TEXT,motivo_rejeicao TEXT)')
            self.db.execute(f'CREATE TABLE {gallery}(id INTEGER PRIMARY KEY,{fk} INTEGER,caminho_url TEXT,principal INTEGER,ordem INTEGER)')
            self.db.execute(f'CREATE TABLE {book}(id INTEGER PRIMARY KEY,{fk} INTEGER,usuario_id INTEGER,status TEXT,pagamento_status TEXT,is_bloqueio INTEGER DEFAULT 0)')
        triggers = re.findall(r'CREATE TRIGGER (\w+) AFTER (INSERT|UPDATE) ON (\w+)\s+FOR EACH ROW\s+BEGIN\n(.*?)\nEND\$\$',SQL,re.S)
        self.assertEqual(len(triggers),14)
        for name,event,table,body in triggers:
            inserts = re.findall(r'INSERT INTO notificacoes_anfitriao.*?ON DUPLICATE KEY UPDATE id=notificacoes_anfitriao.id;',body,re.S)
            for i,statement in enumerate(inserts):
                guards=[]
                if table=='pedidos_documentos':
                    cat=CONFIG[i][0]
                    guards.append(f"NEW.anuncio_tipo='{cat}'")
                    if event=='UPDATE':guards.append('NOT (OLD.estado IS NEW.estado)')
                else:
                    match=re.match(r'IF (.*?) THEN\n',body)
                    if match:guards.append(match[1].replace('<=>','IS'))
                statement=statement.replace('ON DUPLICATE KEY UPDATE id=notificacoes_anfitriao.id','ON CONFLICT(usuario_id,evento_chave) DO NOTHING')
                when=' WHEN '+' AND '.join(guards) if guards else ''
                self.db.executescript(f'CREATE TRIGGER {name}_{i} AFTER {event} ON {table}{when} BEGIN {statement} END;')
        for cat,table,owner,state,gallery,fk,book in CONFIG:
            self.db.execute(f"INSERT INTO {table} VALUES(7,42,?, '/uploads/fallback.jpg','pendente',NULL)",(cat+' real',))
            self.db.execute(f"INSERT INTO {gallery} VALUES(1,7,'/uploads/secondary.jpg',0,0)")
            self.db.execute(f"INSERT INTO {gallery} VALUES(2,7,'/uploads/cover.jpg',1,5)")
        self.db.execute('DELETE FROM notificacoes_anfitriao')
        self.db.commit()

    def test_image_columns_match_supplied_schema(self):
        root = Path(__file__).resolve().parents[1]
        schema = (root / 'server/database/estrutura-referencia.sql').read_text(encoding='utf-8')
        api = (root / 'server/api/usuarios/notificacoes.php').read_text(encoding='utf-8')
        for cat, table, *_ in CONFIG:
            definition = re.search(r'CREATE TABLE `' + table + r'` \((.*?)\) ENGINE', schema, re.S).group(1)
            columns = set(re.findall(r'^  `(\w+)`', definition, re.M))
            for column in re.findall(r'SELECT a\.(\w+) FROM ' + table + r' a', api):
                self.assertIn(column, columns, table + '.' + column)
            for statement in re.findall(r'INSERT INTO notificacoes_anfitriao.*?ON DUPLICATE KEY UPDATE.*?;', SQL, re.S):
                if 'FROM ' + table + ' a WHERE' not in statement:
                    continue
                for column in re.findall(r'a\.(\w+)', statement):
                    self.assertIn(column, columns, table + '.' + column)

    def test_reservations_owner_cover_and_unchanged_update(self):
        for cat,table,owner,state,gallery,fk,book in CONFIG:
            self.db.execute(f"INSERT INTO {book}(id,{fk},usuario_id,status,pagamento_status) VALUES(1,7,99,'pendente','aguardando')")
            self.db.execute(f"UPDATE {book} SET status=status WHERE id=1")
            self.db.execute(f"UPDATE {book} SET status='confirmada',pagamento_status='pago' WHERE id=1")
            self.db.execute(f"UPDATE {book} SET status='cancelada' WHERE id=1")
            rows=self.db.execute('SELECT * FROM notificacoes_anfitriao WHERE tipo_anuncio=?',(cat,)).fetchall()
            self.assertEqual(len(rows),3)
            self.assertTrue(all(r['usuario_id']==42 and r['reserva_id']==1 and r['anuncio_titulo']==cat+' real' and r['anuncio_imagem']=='/uploads/cover.jpg' for r in rows))
        self.assertEqual(len({r[0] for r in self.db.execute('SELECT evento_chave FROM notificacoes_anfitriao')}),9)

    def test_block_and_rollback(self):
        self.db.execute("INSERT INTO reservas_alojamento VALUES(1,7,42,'pendente','aguardando',1)")
        self.assertEqual(self.db.execute('SELECT COUNT(*) FROM notificacoes_anfitriao').fetchone()[0],0)
        self.db.execute("INSERT INTO reservas_carro VALUES(1,7,99,'confirmada','pago',0)")
        self.db.rollback()
        self.assertEqual(self.db.execute('SELECT COUNT(*) FROM notificacoes_anfitriao').fetchone()[0],0)

    def test_documents_all_categories(self):
        for i,(cat,*_) in enumerate(CONFIG,1):
            self.db.execute("INSERT INTO pedidos_documentos VALUES(?,7,?,42,'seguro','pendente','Precisamos do documento','2099-12-31',NULL)",(i,cat))
            for state in ['enviado','rejeitado','enviado','aprovado']:
                self.db.execute('UPDATE pedidos_documentos SET estado=? WHERE id=?',(state,i))
                self.db.execute('UPDATE pedidos_documentos SET estado=? WHERE id=?',(state,i))
            rows=self.db.execute('SELECT * FROM notificacoes_anfitriao WHERE pedido_id=?',(i,)).fetchall()
            self.assertEqual(len(rows),5)
            self.assertTrue(all(r['usuario_id']==42 and r['tipo_anuncio']==cat and r['anuncio_id']==7 for r in rows))

    def test_moderation_state_only(self):
        for cat,table,owner,state,gallery,fk,book in CONFIG:
            self.db.execute(f"UPDATE {table} SET {state}='aprovado' WHERE id=7")
            self.db.execute(f"UPDATE {table} SET titulo='Novo nome' WHERE id=7")
        self.assertEqual(self.db.execute('SELECT COUNT(*) FROM notificacoes_anfitriao').fetchone()[0],3)

if __name__=='__main__':unittest.main()
