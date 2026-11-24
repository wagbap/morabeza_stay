from pathlib import Path
import json
pt={'aloj_filtro_nome_titulo':'Procurar por nome','aloj_filtro_nome_placeholder':'Nome do hotel ou alojamento','aloj_filtro_nome_ajuda':'Já sabe onde quer ficar? Pesquise pelo nome.'}
en={'aloj_filtro_nome_titulo':'Search by name','aloj_filtro_nome_placeholder':'Hotel or accommodation name','aloj_filtro_nome_ajuda':'Already know where to stay? Search by name.'}
for lang in ['pt','en','fr','es','de','ir','cv']:
 p=Path('src/locales')/(lang+'.js');s=p.read_text(encoding='utf-8');s=s.replace('export default {','export default {\n'+''.join('  '+k+': '+json.dumps(v,ensure_ascii=False)+',\n' for k,v in (pt if lang=='pt' else en).items()),1);p.write_text(s,encoding='utf-8')
