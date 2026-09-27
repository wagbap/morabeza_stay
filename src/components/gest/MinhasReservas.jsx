// src/pages/Reservas.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Loader2, RefreshCw, AlertCircle, Eye, Receipt, DollarSign, X, 
  Check, PauseCircle, Home, Car, Compass, Inbox
} from 'lucide-react';
import ReembolsoModal from './ReembolsoModal';

const API_BASE = 'https://welovepalop.com';

export default function Reservas() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Todas');
  const [reservas, setReservas] = useState([]);
  const [reservasRecebidas, setReservasRecebidas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecebidas, setLoadingRecebidas] = useState(false);
  const [cancelingId, setCancelingId] = useState(null);
  const [counts, setCounts] = useState({
    todas: 0,
    confirmadas: 0,
    pendentes: 0,
    canceladas: 0,
    concluidas: 0
  });

  // Modal de cancelamento (cliente)
  const [modalCancelar, setModalCancelar] = useState({ show: false, reserva: null });
  const [motivoCancelamento, setMotivoCancelamento] = useState('');

  // Modal de aprovar/cancelar (dono)
  const [modalAprovar, setModalAprovar] = useState({ 
    show: false, 
    reserva: null, 
    novoStatus: '', 
    processando: false 
  });
  const [motivoTipo, setMotivoTipo] = useState('normal');
  const [acaoCancelamento, setAcaoCancelamento] = useState('reembolso');

  // Modal de reembolso
  const [showReembolsoModal, setShowReembolsoModal] = useState(false);
  const [reservaParaReembolso, setReservaParaReembolso] = useState(null);

  // Toast
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const obterUsuarioId = () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('morabeza_token');
      if (token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const parsed = JSON.parse(jsonPayload);
        const userData = parsed.data || parsed;
        if (userData?.id) return userData.id;
      }
      const chaves = ['user', 'morabeza_user', 'morabeza_admin'];
      for (const chave of chaves) {
        const savedUser = localStorage.getItem(chave);
        if (savedUser) {
          const user = JSON.parse(savedUser);
          if (user?.id) return user.id;
        }
      }
    } catch (e) {
      console.error('Erro ao obter ID do utilizador:', e);
    }
    return null;
  };

  const fetchMinhasReservas = useCallback(async () => {
    setLoading(true);
    try {
      const usuarioId = obterUsuarioId();
      if (!usuarioId) { setLoading(false); return; }
      const response = await fetch(`${API_BASE}/api/dashboard/minhas_reservas.php?usuario_id=${usuarioId}`);
      const data = await response.json();
      if (data.success && data.data?.reservas) {
        const reservasData = data.data.reservas;
        setReservas(reservasData);
        const confirmadas = reservasData.filter(r => 
          ['confirmada', 'confirmado', 'approved'].includes(String(r.status).toLowerCase())
        ).length;
        const pendentes = reservasData.filter(r => 
          ['pendente', 'pending'].includes(String(r.status).toLowerCase())
        ).length;
        const canceladas = reservasData.filter(r => 
          ['cancelada', 'cancelled'].includes(String(r.status).toLowerCase())
        ).length;
        const concluidas = reservasData.filter(r => 
          ['concluída', 'concluida'].includes(String(r.status).toLowerCase())
        ).length;
        setCounts({
          todas: reservasData.length,
          confirmadas,
          pendentes,
          canceladas,
          concluidas
        });
      }
    } catch (error) {
      console.error('Erro ao buscar minhas reservas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReservasRecebidas = useCallback(async () => {
    setLoadingRecebidas(true);
    try {
      const usuarioId = obterUsuarioId();
      if (!usuarioId) { setLoadingRecebidas(false); return; }
      const response = await fetch(`${API_BASE}/api/dashboard/reservas_recebidas.php?usuario_id=${usuarioId}`);
      const data = await response.json();
      if (data.success && data.data?.reservas) {
        setReservasRecebidas(data.data.reservas);
      }
    } catch (error) {
      console.error('Erro ao buscar reservas recebidas:', error);
    } finally {
      setLoadingRecebidas(false);
    }
  }, []);

  useEffect(() => {
    fetchMinhasReservas();
    fetchReservasRecebidas();
  }, [fetchMinhasReservas, fetchReservasRecebidas]);

  const confirmarCancelamento = async () => {
    if (!modalCancelar.reserva) return;
    if (!motivoCancelamento.trim()) {
      showToast('Informe o motivo do cancelamento', 'error');
      return;
    }
    const reserva = modalCancelar.reserva;
    setCancelingId(reserva.id);
    try {
      const usuarioId = obterUsuarioId();
      if (!usuarioId) { showToast('Usuário não autenticado', 'error'); return; }
      const response = await fetch(`${API_BASE}/api/dashboard/minhas_reservas.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reserva_id: reserva.id,
          tipo: reserva.tipo,
          usuario_id: usuarioId,
          motivo: motivoCancelamento.trim()
        })
      });
      const data = await response.json();
      if (data.success) {
        showToast('Reserva cancelada com sucesso!', 'success');
        setModalCancelar({ show: false, reserva: null });
        setMotivoCancelamento('');
        fetchMinhasReservas();
      } else {
        showToast(data.message || 'Erro ao cancelar reserva', 'error');
      }
    } catch (error) {
      console.error('Erro ao cancelar reserva:', error);
      showToast('Erro ao cancelar reserva. Tente novamente.', 'error');
    } finally {
      setCancelingId(null);
    }
  };

  const abrirModalAprovar = (reserva, novoStatus) => {
    setModalAprovar({ show: true, reserva, novoStatus, processando: false });
    setMotivoTipo('normal');
    setAcaoCancelamento('reembolso');
  };

  const executarAlteracaoRecebida = async () => {
    if (!modalAprovar.reserva || !modalAprovar.novoStatus) return;
    const reserva = modalAprovar.reserva;
    const novoStatus = modalAprovar.novoStatus;
    const ehCancelamento = novoStatus === 'cancelada';
    setModalAprovar(prev => ({ ...prev, processando: true }));
    try {
      const usuarioId = obterUsuarioId();
      const response = await fetch(`${API_BASE}/api/dashboard/reservas_recebidas.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reserva_id: reserva.id,
          tipo: reserva.tipo,
          usuario_id: usuarioId,
          status: novoStatus,
          motivo: ehCancelamento 
            ? (motivoTipo === 'mau_tempo' ? 'Mau tempo' 
               : motivoTipo === 'falta_seguranca' ? 'Falta de segurança' 
               : 'Cancelada pelo anfitrião')
            : '',
          motivo_tipo: ehCancelamento ? motivoTipo : 'normal',
          acao: ehCancelamento ? acaoCancelamento : 'reembolso'
        })
      });
      const data = await response.json();
      if (data.success) {
        let msg = '';
        if (!ehCancelamento) {
          msg = 'Reserva aprovada com sucesso!';
        } else if (data.data?.tipo === 'reagendamento') {
          msg = 'Reserva marcada para reagendamento. Cliente notificado.';
        } else {
          msg = 'Reserva cancelada. Cliente reembolsado e notificado.';
        }
        showToast(msg, 'success');
        setModalAprovar({ show: false, reserva: null, novoStatus: '', processando: false });
        setMotivoTipo('normal');
        setAcaoCancelamento('reembolso');
        fetchReservasRecebidas();
      } else {
        showToast(data.message || 'Erro', 'error');
        setModalAprovar(prev => ({ ...prev, processando: false }));
      }
    } catch (err) {
      console.error('Erro:', err);
      showToast('Erro de rede', 'error');
      setModalAprovar(prev => ({ ...prev, processando: false }));
    }
  };

  const verDetalhes = (reservaId, tipo) => {
    navigate(`/gest/reserva/${reservaId}/${tipo}`);
  };

  const baixarRecibo = (reserva) => {
    const usuarioId = obterUsuarioId();
    window.open(
      `${API_BASE}/api/recibo.php?reserva_id=${reserva.id}&tipo=${reserva.tipo}&usuario_id=${usuarioId}`,
      '_blank'
    );
  };

  const abrirReembolso = (reserva) => {
    setReservaParaReembolso(reserva);
    setShowReembolsoModal(true);
  };

  const tabs = [
    { key: 'Todas', label: `Todas (${counts.todas})` },
    { key: 'Confirmadas', label: `Confirmadas (${counts.confirmadas})` },
    { key: 'Pendentes', label: `Pendentes (${counts.pendentes})` },
    { key: 'Canceladas', label: `Canceladas (${counts.canceladas})` },
    { key: 'Concluídas', label: `Concluídas (${counts.concluidas})` },
    { key: 'Recebidas', label: `Recebidas (${reservasRecebidas.length})`, destaque: true }
  ];

  const getFilteredReservas = () => {
    if (activeTab === 'Recebidas') return reservasRecebidas;
    if (activeTab === 'Todas') return reservas;
    const statusMap = {
      'Confirmadas': ['confirmada', 'confirmado', 'approved'],
      'Pendentes': ['pendente', 'pending'],
      'Canceladas': ['cancelada', 'cancelled'],
      'Concluídas': ['concluída', 'concluida']
    };
    const statusList = statusMap[activeTab] || [];
    return reservas.filter(r => statusList.includes(String(r.status).toLowerCase()));
  };

  const filteredReservas = getFilteredReservas();

  const podeCancelar = (status) => {
    const s = String(status).toLowerCase();
    return !['cancelada', 'concluída', 'concluida', 'cancelled'].includes(s);
  };

  const getStatusBadge = (status) => {
    const s = String(status).toLowerCase();
    if (s === 'confirmada' || s === 'confirmado' || s === 'approved') {
      return <span className="bg-[#e6f4ea] text-[#137333] px-3 py-1 rounded-md text-[12px] font-semibold inline-block">✅ Confirmada</span>;
    }
    if (s === 'pendente' || s === 'pending') {
      return <span className="bg-[#fef3c7] text-[#b45309] px-3 py-1 rounded-md text-[12px] font-semibold inline-block">⏳ Pendente</span>;
    }
    if (s === 'concluída' || s === 'concluida') {
      return <span className="bg-[#e0f2f1] text-[#0f766e] px-3 py-1 rounded-md text-[12px] font-semibold inline-block">✓ Concluída</span>;
    }
    if (s === 'cancelada' || s === 'cancelled') {
      return <span className="bg-[#fee2e2] text-[#b91c1c] px-3 py-1 rounded-md text-[12px] font-semibold inline-block">✗ Cancelada</span>;
    }
    return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-[12px] font-semibold inline-block">{status}</span>;
  };

  const formatarPeriodo = (reserva) => {
    if (reserva.tipo === 'alojamento') {
      return reserva.periodo || `${reserva.checkin || ''} - ${reserva.checkout || ''}`;
    } else if (reserva.tipo === 'carro') {
      return reserva.periodo || `${reserva.checkin || ''} - ${reserva.checkout || ''}`;
    } else if (reserva.tipo === 'experiencia') {
      return reserva.periodo || reserva.checkin || '';
    }
    return reserva.periodo || '';
  };

  const getNomeContraparte = (reserva) => {
    if (activeTab === 'Recebidas') {
      return reserva.cliente || reserva.cliente_nome || 'Cliente';
    }
    if (reserva.proprietario_nome) return reserva.proprietario_nome;
    if (reserva.anfitriao_nome) return reserva.anfitriao_nome;
    return 'Anfitrião';
  };

  const getItemImagem = (reserva) => {
    if (reserva.item_imagem && !reserva.item_imagem.includes('ui-avatars')) return reserva.item_imagem;
    return `https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=60&h=60&fit=crop`;
  };

  if (loading && loadingRecebidas) {
    return (
      <div className="max-w-6xl w-full text-[#0f172a] px-4 py-6 md:px-0">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto"></div>
          <p className="text-slate-500 mt-4">Carregando minhas reservas...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {toast.show && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-xl shadow-2xl text-white font-medium text-sm flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-emerald-600' : 
          toast.type === 'error' ? 'bg-red-600' : 'bg-amber-600'
        }`}>
          <AlertCircle size={18} />
          <span>{toast.message}</span>
        </div>
      )}

      <div className="max-w-6xl w-full text-[#0f172a] px-4 py-6 md:px-0">
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
          
          <div className="px-5 pt-5 pb-3 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-[#0f172a]">Minhas Reservas</h2>
                <p className="text-sm text-gray-500 mt-0.5">Acompanhe as suas reservas e as reservas feitas nos seus anúncios</p>
              </div>
              <button
                onClick={() => { fetchMinhasReservas(); fetchReservasRecebidas(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 font-medium text-xs rounded-lg border border-gray-200 transition shadow-sm"
              >
                <RefreshCw size={14} className={(loading || loadingRecebidas) ? 'animate-spin' : ''} /> Atualizar
              </button>
            </div>
          </div>

          <div className="border-b border-gray-100 px-5 pt-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
            <div className="flex gap-6 md:gap-8">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`pb-4 pt-3 text-[13px] md:text-[14px] font-medium transition-colors relative flex-shrink-0 flex items-center gap-1.5 ${
                    activeTab === tab.key 
                      ? (tab.destaque ? 'text-emerald-600' : 'text-[#2563eb]') 
                      : 'text-[#64748b] hover:text-[#0f172a]'
                  }`}
                >
                  {tab.destaque && <Inbox size={14} />}
                  {tab.label}
                  {activeTab === tab.key && (
                    <div className={`absolute bottom-0 left-0 right-0 h-[2px] rounded-t-full ${
                      tab.destaque ? 'bg-emerald-600' : 'bg-[#2563eb]'
                    }`}></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/50">
                  <th className="w-[25%] text-left text-[12px] font-semibold text-[#64748b] px-6 py-4">
                    {activeTab === 'Recebidas' ? 'Item / Cliente' : 'Item / Anfitrião'}
                  </th>
                  <th className="w-[15%] text-left text-[12px] font-semibold text-[#64748b] px-6 py-4">Período</th>
                  <th className="w-[10%] text-left text-[12px] font-semibold text-[#64748b] px-6 py-4">Valor</th>
                  <th className="w-[12%] text-left text-[12px] font-semibold text-[#64748b] px-6 py-4">Status</th>
                  <th className="w-[38%] text-center text-[12px] font-semibold text-[#64748b] px-6 py-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservas.length > 0 ? (
                  filteredReservas.map((reserva, index) => (
                    <tr key={`${reserva.tipo}-${reserva.id}-${index}`} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img 
                            src={getItemImagem(reserva)} 
                            alt={reserva.item_nome} 
                            className="w-[42px] h-[42px] rounded-lg object-cover border border-gray-200 flex-shrink-0" 
                          />
                          <div className="flex flex-col justify-center">
                            <span className="text-[14px] font-bold text-[#0f172a]">{reserva.item_nome || reserva.item}</span>
                            <span className="text-[13px] text-[#64748b] mt-0.5 flex items-center gap-1">
                              <span>👤</span> {getNomeContraparte(reserva)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[14px] font-medium text-[#0f172a]">{formatarPeriodo(reserva)}</td>
                      <td className="px-6 py-4 text-[14px] font-bold text-[#0f172a]">{reserva.valor} CVE</td>
                      <td className="px-6 py-4">{getStatusBadge(reserva.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          
                          <button 
                            onClick={() => verDetalhes(reserva.id, reserva.tipo)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg border border-blue-200 transition"
                            title="Ver detalhes"
                          >
                            <Eye size={14} />
                          </button>

                          {activeTab === 'Recebidas' ? (
                            <>
                              {['pendente', 'pending'].includes(String(reserva.status).toLowerCase()) && (
                                <button 
                                  onClick={() => abrirModalAprovar(reserva, 'confirmada')}
                                  disabled={cancelingId === reserva.id}
                                  className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg border border-emerald-200 transition disabled:opacity-50"
                                  title="Aprovar reserva"
                                >
                                  <Check size={14} />
                                </button>
                              )}
                              {['confirmada', 'confirmado', 'approved'].includes(String(reserva.status).toLowerCase()) && (
                                <button 
                                  onClick={() => abrirModalAprovar(reserva, 'cancelada')}
                                  disabled={cancelingId === reserva.id}
                                  className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg border border-red-200 transition disabled:opacity-50"
                                  title="Cancelar reserva"
                                >
                                  <X size={14} />
                                </button>
                              )}
                            </>
                          ) : (
                            <>
                              <button 
                                onClick={() => baixarRecibo(reserva)}
                                className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition"
                                title="Baixar recibo"
                              >
                                <Receipt size={14} />
                              </button>

                              <button 
                                onClick={() => abrirReembolso(reserva)}
                                className="p-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg border border-green-200 transition"
                                title="Solicitar reembolso"
                              >
                                <DollarSign size={14} />
                              </button>

                              {podeCancelar(reserva.status) && (
                                <button 
                                  onClick={() => setModalCancelar({ show: true, reserva })}
                                  disabled={cancelingId === reserva.id}
                                  className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg border border-red-200 transition disabled:opacity-30"
                                  title="Cancelar reserva"
                                >
                                  <X size={14} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-4xl">📭</span>
                        <p>Nenhuma reserva encontrada</p>
                        <p className="text-xs">As suas reservas aparecerão aqui</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="md:hidden flex flex-col">
            {filteredReservas.length > 0 ? (
              filteredReservas.map((reserva, index) => (
                <div key={`${reserva.tipo}-${reserva.id}-${index}`} className="p-5 border-b border-gray-100 flex flex-col gap-4 active:bg-gray-50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={getItemImagem(reserva)} 
                        alt={reserva.item_nome} 
                        className="w-[48px] h-[48px] rounded-lg object-cover border border-gray-200 flex-shrink-0" 
                      />
                      <div className="flex flex-col">
                        <span className="text-[14px] font-bold text-[#0f172a]">{reserva.item_nome || reserva.item}</span>
                        <span className="text-[12px] text-[#64748b] mt-0.5 flex items-center gap-1">
                          <span>👤</span> {getNomeContraparte(reserva)}
                        </span>
                      </div>
                    </div>
                    <span className="text-[14px] font-bold text-[#0f172a] text-right whitespace-nowrap">
                      {reserva.valor} CVE
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="text-[12px] text-[#64748b] font-medium">
                      <span className="block text-gray-400 text-[11px] mb-0.5">Período</span>
                      {formatarPeriodo(reserva)}
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusBadge(reserva.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button 
                      onClick={() => verDetalhes(reserva.id, reserva.tipo)}
                      className="flex items-center justify-center gap-1.5 bg-blue-50 border border-blue-200 text-[13px] font-semibold text-blue-700 py-2.5 rounded-lg active:bg-blue-100 transition-colors"
                    >
                      <Eye size={14} /> Ver
                    </button>

                    {activeTab === 'Recebidas' ? (
                      <>
                        {['pendente', 'pending'].includes(String(reserva.status).toLowerCase()) && (
                          <button 
                            onClick={() => abrirModalAprovar(reserva, 'confirmada')}
                            className="flex items-center justify-center gap-1.5 bg-emerald-50 border border-emerald-200 text-[13px] font-semibold text-emerald-700 py-2.5 rounded-lg active:bg-emerald-100 transition-colors"
                          >
                            <Check size={14} /> Aprovar
                          </button>
                        )}
                        {['confirmada', 'confirmado', 'approved'].includes(String(reserva.status).toLowerCase()) && (
                          <button 
                            onClick={() => abrirModalAprovar(reserva, 'cancelada')}
                            className="flex items-center justify-center gap-1.5 bg-red-50 border border-red-200 text-[13px] font-semibold text-red-600 py-2.5 rounded-lg active:bg-red-100 transition-colors col-span-2"
                          >
                            <X size={14} /> Cancelar
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => baixarRecibo(reserva)}
                          className="flex items-center justify-center gap-1.5 bg-slate-50 border border-slate-200 text-[13px] font-semibold text-slate-700 py-2.5 rounded-lg active:bg-slate-100 transition-colors"
                        >
                          <Receipt size={14} /> Recibo
                        </button>
                        <button 
                          onClick={() => abrirReembolso(reserva)}
                          className="flex items-center justify-center gap-1.5 bg-green-50 border border-green-200 text-[13px] font-semibold text-green-700 py-2.5 rounded-lg active:bg-green-100 transition-colors"
                        >
                          <DollarSign size={14} /> Reembolso
                        </button>
                        {podeCancelar(reserva.status) && (
                          <button 
                            onClick={() => setModalCancelar({ show: true, reserva })}
                            disabled={cancelingId === reserva.id}
                            className="flex items-center justify-center gap-1.5 bg-red-50 border border-red-200 text-[13px] font-semibold text-red-600 py-2.5 rounded-lg active:bg-red-100 transition-colors disabled:opacity-50 col-span-2"
                          >
                            <X size={14} /> {cancelingId === reserva.id ? 'A cancelar...' : 'Cancelar'}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-400">
                <span className="text-4xl">📭</span>
                <p className="mt-2">Nenhuma reserva encontrada</p>
              </div>
            )}
          </div>

          <div className="px-5 py-5 md:px-6 border-t border-gray-100 flex justify-between items-center">
            <button 
              onClick={() => { fetchMinhasReservas(); fetchReservasRecebidas(); }}
              className="text-[14px] text-[#2563eb] font-semibold hover:underline"
            >
              Atualizar reservas
            </button>
          </div>

        </div>
      </div>

      {modalCancelar.show && (
        <div className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <X size={22} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Cancelar Reserva</h3>
                <p className="text-xs text-slate-500">Esta ação não pode ser desfeita</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-4">
              Tem a certeza que deseja cancelar a reserva <strong>{modalCancelar.reserva?.codigo_reserva || '#' + modalCancelar.reserva?.id}</strong>?
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                Motivo do Cancelamento *
              </label>
              <textarea
                value={motivoCancelamento}
                onChange={(e) => setMotivoCancelamento(e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 resize-none"
                placeholder="Informe o motivo..."
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setModalCancelar({ show: false, reserva: null });
                  setMotivoCancelamento('');
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Voltar
              </button>
              <button
                type="button"
                disabled={!motivoCancelamento.trim() || cancelingId === modalCancelar.reserva?.id}
                onClick={confirmarCancelamento}
                className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {cancelingId === modalCancelar.reserva?.id ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    Cancelando...
                  </>
                ) : (
                  <>
                    <X size={12} />
                    Confirmar Cancelamento
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalAprovar.show && (
        <div className="fixed inset-0 z-[95] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                modalAprovar.novoStatus === 'confirmada' ? 'bg-emerald-100' : 'bg-red-100'
              }`}>
                {modalAprovar.novoStatus === 'confirmada' 
                  ? <Check size={22} className="text-emerald-600" />
                  : <X size={22} className="text-red-600" />
                }
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {modalAprovar.novoStatus === 'confirmada' ? 'Aprovar Reserva' : 'Cancelar Reserva'}
                </h3>
                <p className="text-xs text-slate-500">
                  {modalAprovar.novoStatus === 'confirmada' 
                    ? 'Confirma a reserva do hóspede?' 
                    : 'Esta ação não pode ser desfeita'}
                </p>
              </div>
            </div>

            <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">Código</span>
                <span className="font-bold text-slate-900">
                  {modalAprovar.reserva?.codigo_reserva || '#' + modalAprovar.reserva?.id}
                </span>
              </div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">Item</span>
                <span className="font-bold text-slate-900 truncate ml-2 max-w-[220px]">
                  {modalAprovar.reserva?.item_nome}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Cliente</span>
                <span className="font-bold text-slate-900">
                  {modalAprovar.reserva?.cliente || '—'}
                </span>
              </div>
            </div>

            {modalAprovar.novoStatus === 'cancelada' && modalAprovar.reserva?.tipo === 'experiencia' && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-xl">
                <label className="block text-xs font-bold text-orange-800 uppercase mb-2">
                  Motivo do cancelamento
                </label>
                <select
                  value={motivoTipo}
                  onChange={(e) => setMotivoTipo(e.target.value)}
                  className="w-full px-3 py-2 border border-orange-200 rounded-lg text-sm bg-white mb-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                >
                  <option value="normal">Cancelamento normal</option>
                  <option value="mau_tempo">Mau tempo</option>
                  <option value="falta_seguranca">Falta de segurança</option>
                </select>

                {(motivoTipo === 'mau_tempo' || motivoTipo === 'falta_seguranca') && (
                  <>
                    <p className="text-[11px] text-orange-700 mb-2 font-medium">
                      Nestes casos, o cliente pode escolher:
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setAcaoCancelamento('reagendamento')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                          acaoCancelamento === 'reagendamento' 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'bg-white border border-blue-200 text-blue-700 hover:bg-blue-50'
                        }`}
                      >
                        🔄 Reagendar
                      </button>
                      <button
                        type="button"
                        onClick={() => setAcaoCancelamento('reembolso')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                          acaoCancelamento === 'reembolso' 
                            ? 'bg-red-600 text-white shadow-md' 
                            : 'bg-white border border-red-200 text-red-700 hover:bg-red-50'
                        }`}
                      >
                        💰 Reembolsar
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            <p className="text-sm text-slate-600 mb-4">
              {modalAprovar.novoStatus === 'confirmada' && 
                'Ao aprovar, o hóspede será notificado e a reserva ficará confirmada.'}
              {modalAprovar.novoStatus === 'cancelada' && acaoCancelamento === 'reagendamento' && 
                'A reserva será marcada para reagendamento. O cliente receberá notificação para escolher uma nova data.'}
              {modalAprovar.novoStatus === 'cancelada' && acaoCancelamento === 'reembolso' && 
                'A reserva será cancelada e o cliente receberá reembolso integral automaticamente. O calendário será libertado.'}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setModalAprovar({ show: false, reserva: null, novoStatus: '', processando: false });
                  setMotivoTipo('normal');
                  setAcaoCancelamento('reembolso');
                }}
                disabled={modalAprovar.processando}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition disabled:opacity-50"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={executarAlteracaoRecebida}
                disabled={modalAprovar.processando}
                className={`px-5 py-2 text-xs font-bold text-white rounded-xl transition shadow-md disabled:opacity-50 flex items-center gap-2 ${
                  modalAprovar.novoStatus === 'confirmada' 
                    ? 'bg-emerald-600 hover:bg-emerald-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {modalAprovar.processando ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    A processar...
                  </>
                ) : (
                  <>
                    {modalAprovar.novoStatus === 'confirmada' 
                      ? <><Check size={12} /> Confirmar Aprovação</>
                      : <><X size={12} /> Confirmar Cancelamento</>
                    }
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showReembolsoModal && (
        <ReembolsoModal
          reserva={reservaParaReembolso}
          onClose={() => setShowReembolsoModal(false)}
          onSuccess={(msg) => {
            showToast(msg || 'Reembolso solicitado com sucesso!', 'success');
            fetchMinhasReservas();
          }}
        />
      )}
    </>
  );
}