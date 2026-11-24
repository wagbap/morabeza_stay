from pathlib import Path
import json
p=Path('src/features/alojamento/components/SearchBarAlojamento.jsx');s=p.read_text(encoding='utf-8')
s=s.replace("const LIMITES =", "const ZONAS = ['Praia', 'Tarrafal', 'Assomada', 'Cidade Velha', 'São Domingos', 'Santa Cruz', 'São Salvador do Mundo', 'São Lourenço dos Órgãos', 'São Miguel'];\n\nconst LIMITES =",1)
s=s.replace("useState(urlParams.get('destino') || 'Santiago')", "useState('Santiago')")
needle="  const [startDate,  setStartDate]"
pos=s.index(needle);s=s[:pos]+"  const [zona, setZona] = useState(urlParams.get('zona') || '');\n"+s[pos:]
s=s.replace("setDestino(urlParams.get('destino') || 'Santiago');", "setDestino('Santiago');\n    setZona(urlParams.get('zona') || '');")
s=s.replace('      destino,\n      entrada:', '      destino,\n      zona,\n      entrada:')
s=s.replace('[destino, startDate, endDate, adultos, criancas, quartos, totalHospedes, pet, navigate, onSearch, t]', '[destino, zona, startDate, endDate, adultos, criancas, quartos, totalHospedes, pet, navigate, onSearch, t]')
s=s.replace("    setDestino('Santiago');\n    setStartDate(null);", "    setDestino('Santiago');\n    setZona('');\n    setStartDate(null);")
s=s.replace('const temFiltros = startDate ||', 'const temFiltros = zona || startDate ||')
s=s.replace('<div className={`max-w-7xl mx-auto px-4 relative z-50 font-sans ${className}`}>', '<div data-aloj-search className={`max-w-7xl mx-auto px-4 relative z-50 font-sans ${className}`}>')
s=s.replace('flex flex-col md:flex-row items-stretch md:items-center', 'flex flex-col xl:flex-row items-stretch xl:items-center')
s=s.replace('md:border-b-0 md:border-r', 'xl:border-b-0 xl:border-r')
s=s.replace('px-4 py-3 border-b', 'min-h-16 px-4 py-3 border-b')
s=s.replace('w-8 h-8 rounded-full border border-gray-200', 'w-8 h-8 rounded-full border border-gray-200')
s=s.replace("t('label_destino', 'DESTINO')", "t('aloj_pesquisa_ilha')").replace("t('label_destino', 'Destino')", "t('aloj_pesquisa_ilha')")
marker='        {/* ---------------- DATAS ---------------- */}'
zona='''        <label className="flex min-h-16 min-w-0 flex-1 items-center gap-3 rounded-xl border-b border-gray-100 px-4 py-3 xl:border-b-0 xl:border-r">
          <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 text-blue-600"><MapPin size={20} /></span>
          <span className="min-w-0 flex-1"><span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">{t('aloj_pesquisa_zona')}</span><select aria-label={t('aloj_pesquisa_zona')} value={zona} onChange={e => setZona(e.target.value)} className="w-full cursor-pointer bg-transparent py-0.5 text-sm font-bold text-gray-900 outline-none focus-visible:ring-2 focus-visible:ring-blue-600"><option value="">{t('aloj_pesquisa_todas_zonas')}</option>{[...new Set([...ZONAS, ...(zona ? [zona] : [])])].map(v => <option key={v} value={v}>{v}</option>)}</select></span>
        </label>

'''
s=s.replace(marker,zona+marker)
s=s.replace('className="flex items-center gap-3 w-full text-left"', 'className="flex items-center gap-3 w-full text-left"')
s=s.replace('w-full px-4 py-3 border transition-all rounded-xl', 'min-h-16 w-full px-4 py-3 border-b border-gray-100 transition-all rounded-xl')
s=s.replace('w-full md:w-auto flex gap-2', 'w-full xl:w-auto flex gap-2')
s=s.replace('flex-1 md:flex-none bg-blue-600', 'min-h-12 flex-1 xl:flex-none bg-blue-600')
s=s.replace('py-4 px-8 rounded-xl text-xs', 'py-3 px-8 rounded-xl text-xs')
s=s.replace('className="absolute top-full left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 mt-2 z-[100]', 'data-exp-calendar\n                className="absolute top-full left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 mt-2 z-[100]')
p.write_text(s,encoding='utf-8')
p=Path('src/features/alojamento/components/Alojamentos.jsx');s=p.read_text(encoding='utf-8').replace("      destino:  p.get('destino')  || '',", "      destino:  p.get('destino')  || '',\n      zona: p.get('zona') || '',")
s=s.replace('          destino:  searchParams.destino,', '          destino:  searchParams.destino,\n          zona: searchParams.zona,')
s=s.replace('    searchParams.destino,\n    searchParams.entrada,', '    searchParams.destino,\n    searchParams.zona,\n    searchParams.entrada,')
needle='      // 5) Pet-friendly'
pos=s.index(needle);s=s[:pos]+'''      const zonaNorm = normalizarTexto(searchParams.zona);
      if (zonaNorm && ![casa.localizacao, casa.cidade, casa.zona].some(valor => normalizarTexto(valor).includes(zonaNorm))) return false;

'''+s[pos:]
s=s.replace('    filtroDestino,\n    searchParams.hospedes,', '    filtroDestino,\n    searchParams.zona,\n    searchParams.hospedes,')
s=s.replace('relative -mt-12 z-40 px-4 flex justify-center', 'relative -mt-[58px] md:-mt-12 z-40 px-4 flex justify-center')
s=s.replace('w-full max-w-6xl', 'w-full max-w-7xl')
p.write_text(s,encoding='utf-8')
p=Path('src/features/alojamento/components/AlojamentoHero.jsx');s=p.read_text(encoding='utf-8').replace('h-[450px]', 'h-[390px] md:h-[450px]').replace('mb-4 text-4xl font-black', 'mb-4 text-[34px] font-black').replace('max-w-4xl text-lg font-medium', 'max-w-4xl text-[17px] font-medium');p.write_text(s,encoding='utf-8')
pt={'aloj_pesquisa_ilha':'Ilha','aloj_pesquisa_zona':'Cidade ou zona','aloj_pesquisa_todas_zonas':'Todas as cidades ou zonas'}
en={'aloj_pesquisa_ilha':'Island','aloj_pesquisa_zona':'City or area','aloj_pesquisa_todas_zonas':'All cities or areas'}
for lang in ['pt','en','fr','es','de','ir','cv']:
 p=Path('src/locales')/(lang+'.js');s=p.read_text(encoding='utf-8').replace('export default {','export default {\n'+''.join('  '+k+': '+json.dumps(v,ensure_ascii=False)+',\n' for k,v in (pt if lang=='pt' else en).items()),1);p.write_text(s,encoding='utf-8')
