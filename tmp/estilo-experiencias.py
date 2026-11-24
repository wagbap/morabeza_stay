from pathlib import Path
import json
p=Path('src/features/experiencias/components/Experiencias.jsx');s=p.read_text(encoding='utf-8')
s=s.replace("import axios from 'axios';", "import api from '../../../api/api';\nimport '@fontsource-variable/roboto';\nimport '@fontsource-variable/roboto/italic.css';")
s=s.replace("const filtroDestino = queryParams.get('localizacao') || queryParams.get('destino') || '';", "const filtroIlha = queryParams.get('destino') || 'Santiago';\n  const filtroZona = queryParams.get('localizacao') || '';\n  const filtroTipo = queryParams.get('tipo_experiencia') || '';\n  const filtroDestino = filtroZona || filtroIlha;")
s=s.replace("{ value: 'recomendados', label: 'Recomendados' }", "{ value: 'recomendados', label: t('exp_ordem_recomendados') }").replace("{ value: 'preco_asc', label: 'Preço mais baixo' }", "{ value: 'preco_asc', label: t('exp_ordem_preco_asc') }").replace("{ value: 'preco_desc', label: 'Preço mais alto' }", "{ value: 'preco_desc', label: t('exp_ordem_preco_desc') }").replace("{ value: 'avaliacao', label: 'Melhor avaliação' }", "{ value: 'avaliacao', label: t('exp_ordem_avaliacao') }")
s=s.replace("let url = 'https://welovepalop.com/api/get_experiencias.php';", "let url = '/get_experiencias.php';").replace('await axios.get(url)','await api.get(url)')
a=s.index('      const buscaSimples = filtroDestino.toLowerCase();');b=s.index('    setExperienciasFiltradas(filtradas);',a)
s=s[:a]+'''      const normalizar = value => String(value || '').normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase();
      const atendeIlha = !filtroIlha || normalizar(exp.ilha).includes(normalizar(filtroIlha));
      const atendeZona = !filtroZona || normalizar(exp.localizacao).includes(normalizar(filtroZona));
      const texto = normalizar([exp.titulo, exp.categoria_nome, exp.descricao, exp.equipamento_nome, exp.tipo].filter(Boolean).join(' '));
      const termos = { 'jet-ski': ['jet ski','jet-ski','jetski','mota de agua'], quad: ['quad','atv','moto4'], barco: ['barco','boat','catamara','veleiro'], 'visita-guiada': ['visita','guia','guided','tour'] };
      const atendeTipo = !filtroTipo || (termos[filtroTipo] || [filtroTipo]).some(termo => texto.includes(termo));
      return atendePreco && atendeCategoria && atendeIlha && atendeZona && atendeTipo;
    });
'''+s[b:]
s=s.replace('[experiencias, orcamento, categoriasSelecionadas, filtroDestino]', '[experiencias, orcamento, categoriasSelecionadas, filtroIlha, filtroZona, filtroTipo]')
s=s.replace('    buscarDados(queryString);','').replace('    buscarDados();','')
s=s.replace('className="bg-[#f8f9fc] min-h-screen"','data-exp-page className="min-h-screen bg-[#f7f6fb] text-[#09082e] [font-family:Roboto_Variable,Arial,sans-serif]"')
s=s.replace('relative -mt-12 z-40 px-4 flex justify-center','relative -mt-[60px] z-40 flex justify-center px-4 xl:px-[4.125%]')
s=s.replace('w-full max-w-6xl','w-full max-w-[1468px]')
s=s.replace('<SearchBarExperiencias onBuscar={handleSearchBar} />','<SearchBarExperiencias onBuscar={handleSearchBar} zonas={experiencias} />')
s=s.replace('max-w-[1400px] mx-auto py-16 px-6','mx-auto max-w-[1600px] px-4 pb-16 pt-[56px] xl:px-10')
s=s.replace('text-left text-[10px] font-black uppercase tracking-widest text-gray-400 mb-8 flex gap-2','mb-8 flex gap-2 text-left text-base font-extrabold uppercase tracking-wide text-slate-500')
s=s.replace('flex flex-col lg:grid lg:grid-cols-12 gap-12 items-start','flex flex-col items-start gap-8 lg:grid lg:grid-cols-[minmax(230px,340px)_minmax(0,1fr)] xl:gap-12')
s=s.replace('w-full lg:col-span-3 lg:sticky lg:top-28 z-10','z-10 w-full min-w-0 lg:sticky lg:top-28')
s=s.replace('w-full scroll-mt-6 lg:col-span-9','w-full min-w-0 scroll-mt-6')
s=s.replace('flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10','mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:flex-wrap md:items-center xl:flex-nowrap')
s=s.replace('text-2xl md:text-3xl font-black text-[#1a2b6d] leading-tight italic uppercase tracking-tighter text-left','text-left text-[28px] font-black uppercase italic leading-tight tracking-[-1.2px] text-[#08072d] xl:text-[38px]')
s=s.replace("{filtroDestino || t('explorar')}: <span className=\"text-blue-600 text-4xl\">", "{t('explorar')}: <span className=\"text-[#0800ff]\">")
s=s.replace('flex items-center gap-2 bg-white p-1.5 rounded-full shadow-sm border border-gray-100','flex max-w-full items-center gap-1 rounded-full border border-gray-100 bg-white p-2 shadow-[0_3px_7px_#1118270d]')
s=s.replace('flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition','flex items-center gap-3 rounded-full bg-[#0800ff] px-4 py-3.5 text-[12px] font-extrabold uppercase tracking-[0.06em] text-white transition hover:bg-blue-800 xl:px-7 xl:text-[15px]')
s=s.replace('Ordenar por: {labelOrdenarAtual}',"{t('exp_ordenar_por')}: {labelOrdenarAtual}")
s=s.replace("onClick={() => setViewMode('grid')}", "aria-label={t('exp_ver_grelha')} aria-pressed={viewMode === 'grid'} onClick={() => setViewMode('grid')}")
s=s.replace("onClick={() => setViewMode('list')}", "aria-label={t('exp_ver_lista')} aria-pressed={viewMode === 'list'} onClick={() => setViewMode('list')}")
s=s.replace('<LayoutGrid size={18} />','<LayoutGrid size={25} />').replace('<List size={18} />','<List size={25} />')
s=s.replace('grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 text-left','grid grid-cols-1 gap-10 text-left md:grid-cols-2')
p.write_text(s,encoding='utf-8')
p=Path('src/features/experiencias/components/ExperiencesHero.jsx');s=p.read_text(encoding='utf-8');a=s.index('const POSTER =');b=s.index(';',a);s=s[:a]+"const POSTER = '/media/experiences-19147576-poster.jpg'"+s[b:];p.write_text(s,encoding='utf-8')
pt={'exp_busca_jet_ski':'Jet Ski','exp_busca_quad':'Quad','exp_busca_barco':'Passeios de barco','exp_busca_guiadas':'Visitas guiadas','exp_busca_placeholder':'Jet Ski, quad, barco...','exp_busca_tipos':'Tipos de experiência','exp_busca_ilha':'Ilha','exp_busca_zona':'Zona','exp_busca_todas_zonas':'Todas as zonas','exp_busca_data':'Escolher data','exp_ordem_recomendados':'Recomendados','exp_ordem_preco_asc':'Preço mais baixo','exp_ordem_preco_desc':'Preço mais alto','exp_ordem_avaliacao':'Melhor avaliação','exp_ordenar_por':'Ordenar por','exp_ver_grelha':'Ver em grelha','exp_ver_lista':'Ver em lista'}
en=dict(zip(pt,['Jet Ski','Quad','Boat trips','Guided visits','Jet Ski, quad, boat...','Experience types','Island','Area','All areas','Choose a date','Recommended','Lowest price','Highest price','Best rated','Sort by','Grid view','List view']))
for lang in ['pt','en','fr','es','de','ir','cv']:
 p=Path('src/locales')/(lang+'.js');s=p.read_text(encoding='utf-8');s=s.replace('export default {','export default {\n'+''.join('  '+k+': '+json.dumps(v,ensure_ascii=False)+',\n' for k,v in (pt if lang=='pt' else en).items()),1);p.write_text(s,encoding='utf-8')
