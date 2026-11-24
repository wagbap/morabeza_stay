from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

entries={}
with ZipFile('output/carros-pontos1-2-3-4-5.zip') as old:
    for name in old.namelist():
        if not name.startswith('frontend/') and not name.endswith('/'):
            entries[name]=old.read(name)
for path in Path('dist').rglob('*'):
    if path.is_file():entries['frontend/'+path.relative_to('dist').as_posix()]=path.read_bytes()
for name in list(entries):
    if name.startswith('api/') or name.startswith('sql/') or name.startswith('bin/'):
        path=Path('server')/name
        if path.is_file():entries[name]=path.read_bytes()
for name in ['carroFotos.php','get_carro_fotos.php']:
    entries['api/'+name]=Path('server/api',name).read_bytes()
entries['sql/galeria_carros.sql']=Path('server/sql/galeria_carros.sql').read_bytes()
docs={
    'LEIA-ME.md':'ENTREGA_CARROS_PONTOS_1_A_9.md',
    'DOCUMENTOS-PONTO-3.md':'DOCUMENTOS_CONDUTOR_PONTO_3.md',
    'HORARIOS-PONTO-4.md':'HORARIOS_CARROS_PONTO_4.md',
    'CAUCAO-PONTO-5.md':'CAUCAO_PONTO_5.md',
    'FORMULARIO-PONTO-6.md':'AJUSTES_FORMULARIO_PONTO_6.md',
    'DATAS-PONTO-7.md':'DATAS_PESQUISA_PONTO_7.md',
    'IPHONE-PONTO-8.md':'FICHA_IPHONE_PONTO_8.md',
    'GALERIA-PONTO-9.md':'GALERIA_CARROS_PONTO_9.md',
}
for name,source in docs.items():entries[name]=Path('server',source).read_bytes()
entries['PESQUISA-CARROS-SANTIAGO.md']=Path('server/PESQUISA_CARROS_SANTIAGO.md').read_bytes()
entries['PESQUISA-ALOJAMENTOS-MOBILE.md']=Path('server/PESQUISA_ALOJAMENTOS_MOBILE.md').read_bytes()
entries['CALENDARIOS-LIMPAR-FECHAR.md']=Path('server/CALENDARIOS_LIMPAR_FECHAR.md').read_bytes()
entries['AVALIACOES-ALOJAMENTO.md']=Path('server/AVALIACOES_ALOJAMENTO_VISUAL.md').read_bytes()
entries['PESQUISA-FILTROS-SERVICOS.md']=Path('server/PESQUISA_FILTROS_SERVICOS.md').read_bytes()
entries['PADRAO-UI-LISTAGENS.md']=Path('server/PADRAO_UI_LISTAGENS.md').read_bytes()
entries['EXPERIENCIAS-DATA-UNICA.md']=Path('server/EXPERIENCIAS_DATA_UNICA.md').read_bytes()
entries['UI-RESPONSIVA-DISPOSITIVOS.md']=Path('server/UI_RESPONSIVA_DISPOSITIVOS.md').read_bytes()
entries['SESSAO-EXPERIENCIAS-PONTO-10.md']=Path('server/SESSAO_EXPERIENCIAS_PONTO_10.md').read_bytes()
entries['api/get_carro.php']=Path('server/api/get_carro.php').read_bytes()
assert not any('.local.php' in name or '.env' in name for name in entries)
out=Path('output/carros-pontos1-a-9.zip')
with ZipFile(out,'w',ZIP_DEFLATED) as archive:
    for name,data in entries.items():archive.writestr(name,data)
with ZipFile(out) as archive:
    assert archive.testzip() is None
    for name in ['api/get_carro_detalhes.php','api/carroFotos.php','api/get_carro_fotos.php','sql/galeria_carros.sql']:
        assert archive.read(name)==(Path('server')/name).read_bytes()
    assert archive.read('frontend/index.html')==Path('dist/index.html').read_bytes()
print(f'{out}: {len(entries)} ficheiros, {out.stat().st_size} bytes; integridade e fontes verificadas.')
