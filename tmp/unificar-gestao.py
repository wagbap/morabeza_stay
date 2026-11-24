from pathlib import Path
import re,json
root=Path('src')
p=root/'components/gest/ListaCarrosUnidades.jsx'
s=p.read_text(encoding='utf-8').replace(".join(' ? ')",".join(' · ')")
pos=s.index('    return <>')
s=s[:pos]+'''    return () => controller.abort();
  }, [carros, usuarioId]);

  const eliminar = async carro => {
    if (deleting.current) return;
    deleting.current = true; setAApagar(carro.id); setErro('');
    try {
      const data = await excluirCarro(carro.id);
      if (data?.success) { setExclusao(null); onDeleted?.(carro.id); }
      else setErro(chaveErroExclusao(data));
    } catch (err) { setErro(chaveErroExclusao(err.response?.data, err.response?.status)); }
    finally { deleting.current = false; setAApagar(null); }
  };
  return <>
'''+s[pos+len('    return <>'):]
p.write_text(s,encoding='utf-8')
p=root/'components/gest/MinhasExperiencias.jsx';s=p.read_text(encoding='utf-8')
s=s.replace("import { createElement } from 'react';", "import ListaAnunciosGestao, { CartaoAnuncioGestao, GrelhaAnunciosGestao, IconeGestao as Icone } from './ListaAnunciosGestao';")
s=re.sub(r"import \{ Loader2, Compass.*?from 'lucide-react';", "import { Loader2, Compass, Settings2, Users, Clock, CheckCircle, XCircle, Waves, Shield } from 'lucide-react';",s)
s=re.sub(r'function Icone\(.*?\n}\n','',s,flags=re.S)
s=s.replace("const [busca, setBusca] = useState('');", "const [busca, setBusca] = useState('');\n  const [filtro, setFiltro] = useState('todos');")
s=s.replace('    if (!busca.trim()) return true;',"    if (filtro !== 'todos' && exp.status !== filtro) return false;\n    if (!busca.trim()) return true;")
start=s.index('      <header ')
s=s[:start]+'''      <ListaAnunciosGestao icon={Compass} titulo={t('gest_header_experiencias_titulo')} descricao={t('gest_header_experiencias_descricao')} subtitulo={t('gest_exp_meus_anuncios')} adicionar={t('gest_exp_nova')} onAdicionar={() => navigate('/experiencia-registo/fluxo')} busca={busca} onBusca={setBusca} pesquisa={t('gest_exp_pesquisar')} filtro={filtro} onFiltro={setFiltro} filtros={['todos','aprovado','pendente','inativo'].map(value => ({value,label:t(`gest_lista_estado_${value}`)}))}>
        {loading ? <p role="status" className="flex justify-center gap-3 py-16"><Icone icon={Loader2} className="animate-spin" />{t('gest_exp_carregar')}</p> : error ? <div role="alert"><p>{t(error)}</p><button type="button" onClick={fetchExperiencias}>{t('atualizar')}</button></div> : !experienciasFiltradas.length ? <p className="rounded-xl bg-white p-8 text-center">{t('gest_exp_sem_resultados')}</p> : <GrelhaAnunciosGestao>{experienciasFiltradas.map(exp => {
          const equipamento = exp.modelo_reserva === 'por_equipamento';
          const grupo = exp.modelo_reserva === 'grupo_privado';
          const ativo = exp.status === 'aprovado';
          const pendente = exp.status === 'pendente';
          return <CartaoAnuncioGestao key={exp.id} icon={Compass} imagem={exp.imagem_principal} titulo={exp.titulo} localizacao={[exp.ilha,exp.localizacao].filter(Boolean).join(' · ')}
            preco={equipamento ? t('experiencia_card_ver_precos_duracoes') : `${Number((grupo ? exp.preco_grupo : exp.preco) || 0).toLocaleString('pt-PT')} CVE ${t(grupo ? 'experiencia_card_unidade_grupo' : 'por_pessoa')}`}
            estado={{icon:ativo ? CheckCircle : pendente ? Clock : XCircle,texto:t(ativo ? 'gest_frota_ativo' : pendente ? 'gest_exp_pendente' : 'gest_exp_inativo'),cor:ativo ? 'bg-[#b5f6b5] text-[#164c20]' : pendente ? 'bg-[#ffe187] text-[#302609]' : 'bg-slate-200 text-slate-600'}}
            resumo={<span className="flex items-center gap-2"><Icone icon={equipamento ? Waves : Users} />{t(equipamento ? 'experiencia_card_por_equipamento' : grupo ? 'experiencia_card_por_grupo' : 'experiencia_card_por_participante')}</span>}
            nota={<span>{exp.duracao || '—'} · {t('gest_exp_participantes',{count:Number(exp.max_pessoas)||0})}</span>}
            acoes={[{label:t('gest_exp_configurar'),icon:Settings2,onClick:()=>navigate(`/gest/experiencia/${exp.id}/sessoes`)},{label:t('gest_exp_politicas'),icon:Shield,onClick:()=>navigate(`/gest/experiencia/${exp.id}/politicas`)}]}
            onVer={()=>navigate(`/experiencia/${exp.slug||exp.id}`)} onEditar={()=>navigate(`/experiencia-registo/editar/${exp.id}`)} onEliminar={()=>{setErroExclusao(null);setExclusao(exp);}} eliminando={deletandoId===exp.id} bloquearExclusao={deletandoId!==null} />;
        })}</GrelhaAnunciosGestao>}
      </ListaAnunciosGestao>
    </div>
  );
}
'''
# Use the existing configured HTTP client, preserving endpoint semantics.
s=s.replace("const API_BASE = 'https://welovepalop.com';",'')
s=s.replace('const res = await fetch(`${API_BASE}/api/get_experiencias.php?usuario_id=${usuarioId}`);\n      const data = await res.json();',"const { data } = await api.get('/get_experiencias.php', { params: { usuario_id: usuarioId } });")
s=s.replace("const res = await fetch(`${API_BASE}/api/experiencias.php?id=${exp.id}`, {\n        method: 'DELETE'\n      });\n      const data = await res.json();", "const { data } = await api.delete('/experiencias.php', { params: { id: exp.id } });")
s=re.sub(r'^.*console.log\(.*\);\n','',s,flags=re.M)
p.write_text(s,encoding='utf-8')
# Keep the accommodation list's existing data and deletion handlers.
p=root/'components/AlojamentoRegisto/MeusAlojamentos.jsx';s=p.read_text(encoding='utf-8')
s=re.sub(r"import \{\n  Home, Edit.*?from 'lucide-react';", "import { Home, Settings2, CalendarCheck, CheckCircle, Clock, XCircle } from 'lucide-react';\nimport ListaAnunciosGestao, { CartaoAnuncioGestao, GrelhaAnunciosGestao } from '../gest/ListaAnunciosGestao';\nimport { extrairFotosAlojamento } from '../../features/alojamento/utils/fotosAlojamento';",s,flags=re.S)
s=re.sub(r"const API_URL = .*?;\n",'',s)
a=s.index('      const response = await fetch(');b=s.index('      if (data.success)',a)
s=s[:a]+'''      setError(null);
      const { data } = await api.get('/alojamento/meus_alojamentos.php', { params: { proprietario_id: proprietarioId }, headers: token ? { Authorization: `Bearer ${token}` } : undefined });

'''+s[b:]
a=s.index('  // ---------- Componente auxiliar de status');b=s.index('  // Filtragem',a);s=s[:a]+s[b:]
a=s.index('  // ---------- Estados de carregamento')
s=s[:a]+'''  return <>
    <ConfirmarExclusao aberto={!!exclusao} nome={exclusao?.titulo} loading={aApagar} erro={erroExclusao} onClose={() => { if (!pedidoExclusaoRef.current) setExclusao(null); }} onConfirm={confirmarExclusao} />
    <ListaAnunciosGestao icon={Home} titulo={t('gest_aloj_titulo')} descricao={t('gest_aloj_descricao')} subtitulo={t('gest_aloj_titulo')} adicionar={t('gest_frota_adicionar')} onAdicionar={()=>navigate('/alojamento-registro/fluxo')} busca={searchTerm} onBusca={v=>{setSearchTerm(v);setPagina(1);}} pesquisa={t('gest_aloj_pesquisar')} filtro={filtroStatus} onFiltro={v=>{setFiltroStatus(v);setPagina(1);}} filtros={['todos','aprovado','pendente','inativo'].map(value=>({value,label:t(`gest_lista_estado_${value}`)}))}>
      {loading ? <p role="status" className="py-16 text-center">{t('gest_exp_carregar')}</p> : error ? <div role="alert"><p>{t('gest_lista_erro')}</p><button type="button" onClick={buscarAlojamentos}>{t('atualizar')}</button></div> : !itensPagina.length ? <p className="rounded-xl bg-white p-8 text-center">{t('gest_exp_sem_resultados')}</p> : <GrelhaAnunciosGestao>{itensPagina.map(a=>{
        const ativo=a.status==='aprovado', pendente=a.status==='pendente';
        return <CartaoAnuncioGestao key={a.id} icon={Home} imagem={extrairFotosAlojamento(a)[0]} titulo={a.titulo} localizacao={[a.ilha,a.localizacao].filter(Boolean).join(' · ')} preco={`${formatarPreco(a.preco_noite)} / ${t('noite')}`}
          estado={{icon:ativo?CheckCircle:pendente?Clock:XCircle,texto:t(ativo?'gest_frota_ativo':pendente?'gest_exp_pendente':'gest_exp_inativo'),cor:ativo?'bg-[#b5f6b5] text-[#164c20]':pendente?'bg-[#ffe187] text-[#302609]':'bg-slate-200 text-slate-600'}}
          resumo={t('gest_aloj_gerir')} nota={t('gest_aloj_nota')}
          acoes={[{label:t('gest_aloj_gerir'),icon:Settings2,onClick:()=>handleEditar(a.id)},{label:t('sidebar_reservas'),icon:CalendarCheck,onClick:()=>navigate('/gest/reservas')}]}
          onVer={()=>handleVer(a)} onEditar={()=>handleEditar(a.id)} onEliminar={()=>handleExcluir(a.id,a.titulo)} eliminando={aApagar&&exclusao?.id===a.id} bloquearExclusao={aApagar} />;
      })}</GrelhaAnunciosGestao>}
      <PaginacaoAnuncios total={alojamentosFiltrados.length} pagina={paginaAtual} porPagina={porPagina} onChange={setPagina} />
    </ListaAnunciosGestao>
  </>;
};
export default MeusAlojamentos;
'''
# Move this single-feature listing to its feature directory.
s=s.replace("from '../PaginacaoAnuncios'","from '../../../components/PaginacaoAnuncios'").replace("from '../../Toast'","from '../../../Toast'").replace("from '../ConfirmarExclusao'","from '../../../components/ConfirmarExclusao'").replace("from '../../api/api'","from '../../../api/api'").replace("from '../../utils/erroExclusao'","from '../../../utils/erroExclusao'").replace("from '../gest/ListaAnunciosGestao'","from '../../../components/gest/ListaAnunciosGestao'").replace("from '../../features/alojamento/utils/fotosAlojamento'","from '../utils/fotosAlojamento'")
(root/'features/alojamento/components/MeusAlojamentosGestao.jsx').write_text(s,encoding='utf-8')
for file,target in [('AlojamentoRegisto/MeusAlojamentos.jsx','meus-alojamentos'),('CarroRegisto/MeusCarros.jsx','unidades-veiculos'),('ExperienciaRegisto/MeusExperiencias.jsx','minhas-experiencias')]:
 (root/'components'/file).write_text(f"import {{ Navigate }} from 'react-router-dom';\nexport default function ListaAnunciosAnterior() {{ return <Navigate to=\"/gest/{target}\" replace />; }}\n",encoding='utf-8')
p=root/'components/gest/GestaoRouter.jsx';s=p.read_text(encoding='utf-8').replace("import MinhasExperiencias from './MinhasExperiencias';","import MinhasExperiencias from './MinhasExperiencias';\nimport MeusAlojamentosGestao from '../../features/alojamento/components/MeusAlojamentosGestao';").replace("['/gest/unidades-veiculos', '/gest/minhas-experiencias']","['/gest/unidades-veiculos', '/gest/minhas-experiencias', '/gest/meus-alojamentos']").replace('<Route path="minhas-experiencias"','<Route path="meus-alojamentos" element={<LayoutGestao><MeusAlojamentosGestao /></LayoutGestao>} />\n      <Route path="minhas-experiencias"');p.write_text(s,encoding='utf-8')
p=root/'components/gest/Sidebar.jsx';s=p.read_text(encoding='utf-8');pos=s.index('              {userRoles.guia && (',s.index('to="/gest/reservas"'));s=s[:pos]+'''              {userRoles.anfitrion && <Link to="/gest/meus-alojamentos" onClick={onClose} className={linkClass('/gest/meus-alojamentos')} aria-current={isActive('/gest/meus-alojamentos') ? 'page' : undefined}><span className={iconClass('/gest/meus-alojamentos')}><Home className="h-full w-full" strokeWidth={2} /></span><span className="text-[15px] truncate">{t('gest_aloj_titulo')}</span></Link>}
'''+s[pos:];p.write_text(s,encoding='utf-8')
pt={'gest_lista_filtrar_estado':'Filtrar por estado','gest_lista_estado_todos':'Todos os estados','gest_lista_estado_disponivel':'Disponíveis','gest_lista_estado_indisponivel':'Indisponíveis','gest_lista_estado_manutencao':'Manutenção','gest_lista_estado_aprovado':'Aprovados','gest_lista_estado_pendente':'Pendentes','gest_lista_estado_inativo':'Inativos','gest_aloj_titulo':'Meus alojamentos','gest_aloj_descricao':'Gere os anúncios, quartos e preços dos teus alojamentos.','gest_aloj_pesquisar':'Pesquisar os meus alojamentos','gest_aloj_gerir':'Gerir quartos e preços','gest_aloj_nota':'Consulta e atualiza os dados do teu alojamento.','gest_lista_erro':'Não foi possível carregar os anúncios.'}
en=dict(zip(pt,['Filter by status','All statuses','Available','Unavailable','Maintenance','Approved','Pending','Inactive','My accommodations','Manage your accommodation listings, rooms and prices.','Search my accommodations','Manage rooms and prices','Review and update your accommodation details.','Unable to load listings.']))
for lang in ['pt','en','fr','es','de','ir','cv']:
 p=root/f'locales/{lang}.js';s=p.read_text(encoding='utf-8');data=pt if lang=='pt' else en;s=s.replace('export default {','export default {\n'+''.join('  '+k+': '+json.dumps(v,ensure_ascii=False)+',\n' for k,v in data.items()),1);p.write_text(s,encoding='utf-8')
