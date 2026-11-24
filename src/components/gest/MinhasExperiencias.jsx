import '@fontsource-variable/inter';
import ConfirmarExclusao from '../ConfirmarExclusao';
import api from '../../api/api';
import ListaAnunciosGestao, { CartaoAnuncioGestao, GrelhaAnunciosGestao, IconeGestao as Icone } from './ListaAnunciosGestao';
// src/components/gest/MinhasExperiencias.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, Compass, Settings2, Users, Clock, CheckCircle, XCircle, Waves, Shield } from 'lucide-react';




// ============================================================
// HELPER: obter utilizador do JWT
// ============================================================
function obterUsuarioId() {
  try {
    const token = localStorage.getItem('token')
      || localStorage.getItem('morabeza_token')
      || localStorage.getItem('access_token')
      || localStorage.getItem('jwt');
    if (token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const parsed = JSON.parse(decodeURIComponent(
        atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      ));
      const user = parsed?.data || parsed?.user || parsed?.usuario || parsed;
      const id = user?.id || user?.userId || user?.user_id || user?.usuario_id || parsed?.sub;
      if (id) return Number(id);
    }
    const savedUser = localStorage.getItem('user') || localStorage.getItem('morabeza_user');
    if (savedUser) {
      const u = JSON.parse(savedUser);
      if (u?.id) return Number(u.id);
    }
    return null;
  } catch { return null; }
}

export default function MinhasExperiencias() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [experiencias, setExperiencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [deletandoId, setDeletandoId] = useState(null);
  const [exclusao, setExclusao] = useState(null);
  const [erroExclusao, setErroExclusao] = useState(null);
  const apagandoRef = useRef(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // ============================================================
  // CARREGAR EXPERIÊNCIAS DO ANFITRIÃO
  // ============================================================
  const fetchExperiencias = async () => {
    setLoading(true);
    setError(null);
    try {
      const usuarioId = obterUsuarioId();

      if (!usuarioId) {
        setError('gest_exp_nao_autenticado');
        setLoading(false);
        return;
      }

      const { data } = await api.get('/get_experiencias.php', { params: { usuario_id: usuarioId } });


      let lista = [];
      if (data.success && data.data) {
        lista = Array.isArray(data.data) ? data.data : [data.data];
      } else if (Array.isArray(data)) {
        lista = data;
      }

      // Validar que cada experiência tem id
      const listaValida = lista.filter(exp => exp && exp.id);

      const atualizadas = await Promise.all(listaValida.map(async exp => {
        try {
          const { data } = await api.get('/experiencia/buscar.php', { params: { id: exp.id } });
          if (data.success && String(data.data?.id) === String(exp.id)) {
            return { ...exp, modelo_reserva: data.data.modelo_reserva, equipamento_nome: data.data.equipamento_nome };
          }
        } catch { /* Preserve the existing listing when metadata is unavailable. */ }
        return exp;
      }));
      setExperiencias(atualizadas);
    } catch (err) {
      console.error('❌ Erro ao buscar experiências:', err);
      setError('gest_exp_erro_carregar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiencias();
  }, []);

  // ============================================================
  // DELETAR EXPERIÊNCIA
  // ============================================================
  const deletarExperiencia = async (exp) => {
    if (apagandoRef.current) return;
    apagandoRef.current = true;
    setErroExclusao(null);

    setDeletandoId(exp.id);
    try {
      const { data } = await api.delete('/experiencias.php', { params: { id: exp.id } });
      if (data.success) {
        setExclusao(null);
        showToast(t('gest_exp_eliminada'), 'success');
        fetchExperiencias();
      } else {
        setErroExclusao('gest_exp_erro_eliminar');
      }
    } catch (err) {
      console.error(err);
      setErroExclusao('gest_exp_erro_ligacao');
    } finally {
      apagandoRef.current = false;
      setDeletandoId(null);
    }
  };

  // ============================================================
  // FILTRAR
  // ============================================================
  const experienciasFiltradas = experiencias.filter(exp => {
    if (filtro !== 'todos' && exp.status !== filtro) return false;
    if (!busca.trim()) return true;
    const termo = busca.toLowerCase();
    return (
      (exp.titulo || '').toLowerCase().includes(termo) ||
      (exp.ilha || '').toLowerCase().includes(termo) ||
      (exp.localizacao || '').toLowerCase().includes(termo)
    );
  });

  return (
    <div className="w-full pb-8 text-left text-[#101127] [font-family:'Inter_Variable',Arial,sans-serif]">
      <ConfirmarExclusao aberto={!!exclusao} nome={exclusao?.titulo} loading={deletandoId !== null} erro={erroExclusao}
        tituloKey="gest_exp_apagar_titulo" confirmarKey="gest_exp_apagar_titulo"
        onClose={() => { if (!apagandoRef.current) setExclusao(null); }}
        onConfirm={() => { if (exclusao) void deletarExperiencia(exclusao); }} />
      {toast.show && <p role="status" className={`fixed right-6 top-6 z-50 rounded-xl px-5 py-3 text-sm text-white shadow-lg ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>{toast.message}</p>}
      <ListaAnunciosGestao icon={Compass} titulo={t('gest_header_experiencias_titulo')} descricao={t('gest_header_experiencias_descricao')} subtitulo={t('gest_exp_meus_anuncios')} adicionar={t('gest_exp_nova')} onAdicionar={() => navigate('/experiencia-registo/fluxo')} busca={busca} onBusca={setBusca} pesquisa={t('gest_exp_pesquisar')} filtro={filtro} onFiltro={setFiltro} filtros={['todos','aprovado','pendente','inativo'].map(value => ({value,label:t(`gest_lista_estado_${value}`)}))}>
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
