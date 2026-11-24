import PaginacaoAnuncios from '../../../components/PaginacaoAnuncios';
import { useToast } from '../../../Toast';
import ConfirmarExclusao from '../../../components/ConfirmarExclusao';
import { useTranslation } from 'react-i18next';
import api from '../../../api/api';
import { chaveErroExclusao } from '../../../utils/erroExclusao';
import { readSidebarSession } from '../../../utils/managementSession';
// src/components/AlojamentoRegisto/MeusAlojamentos.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Settings2, CalendarCheck, CheckCircle, Clock, XCircle } from 'lucide-react';
import ListaAnunciosGestao, { CartaoAnuncioGestao, GrelhaAnunciosGestao } from '../../../components/gest/ListaAnunciosGestao';
import { extrairFotosAlojamento } from '../utils/fotosAlojamento';
import ReservasAnuncioModal from './ReservasAnuncioModal';


// Função para extrair o ID do utilizador do Token JWT de forma segura
const obterUserIdDoToken = () => {
  return readSidebarSession(localStorage)?.user?.id || null;
};

const MeusAlojamentos = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [exclusao, setExclusao] = useState(null);
  const [aApagar, setAApagar] = useState(false);
  const [erroExclusao, setErroExclusao] = useState(null);
  const pedidoExclusaoRef = useRef(false);
  const [proprietarioId, setProprietarioId] = useState(null);
  const [alojamentos, setAlojamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagina, setPagina] = useState(1);
  const porPagina = 9;
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [anuncioReservas, setAnuncioReservas] = useState(null);

  // 1. Buscar o ID do utilizador logado através do Token JWT
  useEffect(() => {
    const userId = obterUserIdDoToken();
    if (userId) {
      setProprietarioId(Number(userId));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // 2. Função de busca (depende do proprietarioId e envia o Token JWT no cabeçalho)
  const buscarAlojamentos = useCallback(async () => {
    if (!proprietarioId) return;

    try {
      setLoading(true);
      const session = readSidebarSession(localStorage);
      if (Number(session?.user?.id) !== proprietarioId) {
        setAlojamentos([]);
        return;
      }
      const token = session.token;

      setError(null);
      const { data } = await api.get('/alojamento/meus_alojamentos.php', { params: { proprietario_id: proprietarioId }, headers: token ? { Authorization: `Bearer ${token}` } : undefined });

      if (data.success) {
        setAlojamentos((data.data || []).filter(a => {
          const owner = a.proprietario_id ?? a.usuario_id ?? a.user_id;
          return owner == null || Number(owner) === proprietarioId;
        }));
      } else {
        setError(data.message || 'Erro ao carregar dados');
      }
    } catch (err) {
      console.error('Erro:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [proprietarioId]);

  // 3. Disparar a busca sempre que o proprietarioId mudar
  useEffect(() => {
    if (proprietarioId) {
      buscarAlojamentos();
    }
  }, [proprietarioId, buscarAlojamentos]);

  // ---------- Handlers ----------
  const handleEditar = (id) => {
    navigate(`/alojamento-registro/editar/${id}`);
  };

  // ✅ Ver → abre a página pública de detalhes do alojamento (InfoAlojamento)
  //    Usa slug se existir (rota canónica) e cai para id caso contrário.
  const handleVer = (alojamento) => {
    const identificador = alojamento?.slug || alojamento?.id;
    if (!identificador) return;
    navigate(`/alojamento/${identificador}`);
  };

  const handleExcluir = (id, titulo) => {
    if (pedidoExclusaoRef.current) return;
    setErroExclusao(null);
    setExclusao({ id, titulo });
  };
  const confirmarExclusao = async () => {
    if (!exclusao || pedidoExclusaoRef.current) return;
    pedidoExclusaoRef.current = true;
    setAApagar(true);
    setErroExclusao(null);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('morabeza_token');
      const { data } = await api.delete('/alojamento/excluir.php', {
        params: { id: exclusao.id }, timeout: 15000,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (data?.success === true) {
        setAlojamentos(prev => prev.filter(item => String(item.id) !== String(exclusao.id)));
        setExclusao(null);
        showToast(t('exclusao_sucesso'), 'success');
      } else setErroExclusao(chaveErroExclusao(data));
    } catch (err) {
      setErroExclusao(chaveErroExclusao(err.response?.data, err.response?.status));
    } finally {
      pedidoExclusaoRef.current = false;
      setAApagar(false);
    }
  };

  const formatarPreco = (preco) => {
    if (!preco) return '0 CVE';
    return new Intl.NumberFormat('pt-PT').format(preco) + ' CVE';
  };

  // Filtragem
  const alojamentosFiltrados = alojamentos.filter(a => {
    const matchSearch = (a.titulo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (a.localizacao || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filtroStatus === 'todos' || a.status === filtroStatus;
    return matchSearch && matchStatus;
  });
  const paginaAtual = Math.min(pagina, Math.max(1, Math.ceil(alojamentosFiltrados.length / porPagina)));
  const itensPagina = alojamentosFiltrados.slice((paginaAtual - 1) * porPagina, paginaAtual * porPagina);


  return <>
    {anuncioReservas && <ReservasAnuncioModal anuncio={anuncioReservas} anuncios={alojamentos} proprietarioId={proprietarioId} onClose={() => setAnuncioReservas(null)} />}
    <ConfirmarExclusao aberto={!!exclusao} nome={exclusao?.titulo} loading={aApagar} erro={erroExclusao} onClose={() => { if (!pedidoExclusaoRef.current) setExclusao(null); }} onConfirm={confirmarExclusao} />
    <ListaAnunciosGestao icon={Home} titulo={t('gest_aloj_titulo')} descricao={t('gest_aloj_descricao')} subtitulo={t('gest_aloj_titulo')} adicionar={t('gest_frota_adicionar')} onAdicionar={()=>navigate('/alojamento-registro/fluxo')} busca={searchTerm} onBusca={v=>{setSearchTerm(v);setPagina(1);}} pesquisa={t('gest_aloj_pesquisar')} filtro={filtroStatus} onFiltro={v=>{setFiltroStatus(v);setPagina(1);}} filtros={['todos','aprovado','pendente','inativo'].map(value=>({value,label:t(`gest_lista_estado_${value}`)}))}>
      {loading ? <p role="status" className="py-16 text-center">{t('gest_exp_carregar')}</p> : error ? <div role="alert"><p>{t('gest_lista_erro')}</p><button type="button" onClick={buscarAlojamentos}>{t('atualizar')}</button></div> : !itensPagina.length ? <p className="rounded-xl bg-white p-8 text-center">{t('gest_exp_sem_resultados')}</p> : <GrelhaAnunciosGestao>{itensPagina.map(a=>{
        const ativo=a.status==='aprovado', pendente=a.status==='pendente';
        return <CartaoAnuncioGestao key={a.id} icon={Home} imagem={extrairFotosAlojamento(a)[0]} titulo={a.titulo} localizacao={[a.ilha,a.localizacao].filter(Boolean).join(' · ')} preco={`${formatarPreco(a.preco_noite)} / ${t('noite')}`}
          estado={{icon:ativo?CheckCircle:pendente?Clock:XCircle,texto:t(ativo?'gest_frota_ativo':pendente?'gest_exp_pendente':'gest_exp_inativo'),cor:ativo?'bg-[#b5f6b5] text-[#164c20]':pendente?'bg-[#ffe187] text-[#302609]':'bg-slate-200 text-slate-600'}}
          nota={t('gest_aloj_nota')}
          acoes={[{label:t('gest_aloj_gerir'),icon:Settings2,onClick:()=>handleEditar(a.id)},{label:t('sidebar_reservas'),icon:CalendarCheck,onClick:()=>setAnuncioReservas(a)}]}
          onVer={()=>handleVer(a)} onEditar={()=>handleEditar(a.id)} onEliminar={()=>handleExcluir(a.id,a.titulo)} eliminando={aApagar&&exclusao?.id===a.id} bloquearExclusao={aApagar} />;
      })}</GrelhaAnunciosGestao>}
      <PaginacaoAnuncios total={alojamentosFiltrados.length} pagina={paginaAtual} porPagina={porPagina} onChange={setPagina} />
    </ListaAnunciosGestao>
  </>;
};
export default MeusAlojamentos;
