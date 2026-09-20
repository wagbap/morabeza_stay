
import React, { useState, useEffect } from 'react';
import {
  Search, Loader2, Calendar, Check, X, Home, Compass, Car, RefreshCw, DollarSign, PauseCircle, AlertCircle,
} from 'lucide-react';
import DetalheReservaModal from './DetalheReservaModal';
import ReembolsoModal from '../../components/gest/ReembolsoModal';


const API_BASE = 'https://welovepalop.com';

const ReservasAdmin = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pesquisa, setPesquisa] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');   // todos, alojamento, carro, experiencia
  const [filtroStatus, setFiltroStatus] = useState('todos'); // todos, confirmada, pendente, suspensa, cancelada
  const [reservaSelecionada, setReservaSelecionada] = useState(null);
  
  // Estados para modais profissionais de confirmação/suspensão/cancelamento
  const [modalAcao, setModalAcao] = useState({ show: false, reserva: null, tipo: '' });
  const [motivoAcao, setMotivoAcao] = useState('');

  // Estados para o Modal de Reembolso
  const [showReembolsoModal, setShowReembolsoModal] = useState(false);
  const [reservaParaReembolso, setReservaParaReembolso] = useState(null);
  
  // Toast profissional
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // ---------------------------------------------------------
  // Carregar lista de reservas
  // ---------------------------------------------------------
  const carregarReservas = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/get_all_reservations.php`);
      const data = await response.json();
      if (data.status === 'success') {
        setReservas(data.data || []);
      } else {
        console.error('Backend devolveu erro:', data);
      }
    } catch (err) {
      console.error('Erro ao procurar histórico de reservas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarReservas();
  }, []);

  // ---------------------------------------------------------
  // Executar alteração de estado via Modal Profissional
  // ---------------------------------------------------------
  const executarAlteracaoEstado = async () => {
    if (!modalAcao.reserva || !modalAcao.tipo) return;

    const { id, tipo_reserva, codigo_reserva } = modalAcao.reserva;
    const proximoStatus = modalAcao.tipo;

    try {
      const response = await fetch(`${API_BASE}/api/admin/atualizar_status_reserva.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          tipo_reserva, 
          status: proximoStatus, 
          motivo: motivoAcao.trim() || `Alterado para ${proximoStatus} pelo Administrador` 
        }),
      });
      const data = await response.json();
      if (data.success) {
        showToast(`Reserva ${codigo_reserva || '#' + id} atualizada para '${proximoStatus}' com sucesso!`, 'success');
        carregarReservas();
        setModalAcao({ show: false, reserva: null, tipo: '' });
        setMotivoAcao('');
      } else {
        showToast(data.message || 'Erro ao atualizar estado', 'error');
      }
    } catch (err) {
      console.error('Erro ao atualizar estado:', err);
      showToast('Erro de conexão com o servidor', 'error');
    }
  };

  // ---------------------------------------------------------
  // Filtragem + pesquisa
  // ---------------------------------------------------------
  const filtradas = reservas.filter((r) => {
    const termo = pesquisa.toLowerCase();
    const buscaMatch =
      (r.codigo_reserva && r.codigo_reserva.toLowerCase().includes(termo)) ||
      (r.cliente && r.cliente.toLowerCase().includes(termo)) ||
      (r.item_nome && r.item_nome.toLowerCase().includes(termo));

    const tipoMatch = filtroTipo === 'todos' || r.tipo_reserva === filtroTipo;

    const statusNormalizado = (r.status || '').toLowerCase();
    let statusMatch = filtroStatus === 'todos';
    if (!statusMatch) {
      if (filtroStatus === 'confirmada')
        statusMatch = ['confirmada', 'approved', 'confirmado'].includes(statusNormalizado);
      if (filtroStatus === 'pendente')
        statusMatch = ['pendente', 'pending'].includes(statusNormalizado);
      if (filtroStatus === 'suspensa')
        statusMatch = ['suspensa', 'suspended'].includes(statusNormalizado);
      if (filtroStatus === 'cancelada')
        statusMatch = ['cancelada', 'cancelled'].includes(statusNormalizado);
    }

    return buscaMatch && tipoMatch && statusMatch;
  });

  // ---------------------------------------------------------
  // Badges
  // ---------------------------------------------------------
  const renderBadgeTipo = (tipo) => {
    switch (tipo) {
      case 'alojamento':
        return (
          <span className="flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
            <Home size={12} /> Alojamento
          </span>
        );
      case 'carro':
        return (
          <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-lg border border-green-100">
            <Car size={12} /> Rent-a-car
          </span>
        );
      case 'experiencia':
        return (
          <span className="flex items-center gap-1 text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
            <Compass size={12} /> Experiência
          </span>
        );
      default:
        return <span className="text-xs text-gray-500 font-medium">{tipo || '—'}</span>;
    }
  };

  const renderBadgeStatus = (status) => {
    const s = (status || '').toLowerCase();
    if (['confirmada', 'approved', 'confirmado'].includes(s)) {
      return (
        <span className="px-2.5 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
          Confirmada
        </span>
      );
    }
    if (['pendente', 'pending'].includes(s)) {
      return (
        <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold animate-pulse">
          Pendente
        </span>
      );
    }
    if (['suspensa', 'suspended'].includes(s)) {
      return (
        <span className="px-2.5 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold">
          Suspensa
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">
        Cancelada
      </span>
    );
  };

  const isConfirmada = (status) =>
    ['confirmada', 'approved', 'confirmado'].includes((status || '').toLowerCase());

  const isSuspensa = (status) =>
    ['suspensa', 'suspended'].includes((status || '').toLowerCase());

  const isCancelada = (status) =>
    ['cancelada', 'cancelled'].includes((status || '').toLowerCase());

  // ---------------------------------------------------------
  // Render
  // ---------------------------------------------------------
  return (
    <>
      <div className="space-y-6">
        
        {/* Toast Profissional */}
        {toast.show && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-xl text-white font-medium text-sm flex items-center gap-2 animate-in slide-in-from-top-2 ${
            toast.type === 'success' ? 'bg-emerald-600' : 
            toast.type === 'error' ? 'bg-red-600' : 
            'bg-amber-600'
          }`}>
            <AlertCircle size={18} />
            <span>{toast.message}</span>
          </div>
        )}

        {/* Topo informativo */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-[#003580]">Gestão de Reservas</h1>
            <p className="text-gray-600 mt-1">
              Acompanhe, aprove e gira as transações comerciais do marketplace.
            </p>
          </div>
          <button
            onClick={carregarReservas}
            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm rounded-xl border border-gray-200 transition shadow-sm"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Atualizar Tabela
          </button>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white/40 backdrop-blur-md p-4 rounded-xl border border-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Código, cliente ou produto..."
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-gray-200 focus:outline-none text-sm"
            />
          </div>

          <div>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 focus:outline-none"
            >
              <option value="todos">Todas as Categorias</option>
              <option value="alojamento">Alojamentos</option>
              <option value="carro">Rent-a-car</option>
              <option value="experiencia">Experiências</option>
            </select>
          </div>

          <div>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 focus:outline-none"
            >
              <option value="todos">Todos os Estados</option>
              <option value="confirmada">Confirmadas</option>
              <option value="pendente">Pendentes</option>
              <option value="suspensa">Suspensas</option>
              <option value="cancelada">Canceladas</option>
            </select>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-24 flex flex-col justify-center items-center gap-2 text-gray-500 text-sm">
              <Loader2 className="animate-spin text-[#003580]" size={32} />
              <span>A recolher reservas da base de dados unificada...</span>
            </div>
          ) : filtradas.length === 0 ? (
            <div className="py-24 flex flex-col justify-center items-center gap-3 text-gray-400">
              <Calendar size={48} className="text-gray-300" />
              <p className="text-sm">Nenhuma reserva encontrada com os filtros atuais.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50/50 text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4">Código</th>
                    <th className="px-6 py-4">Categoria</th>
                    <th className="px-6 py-4">Cliente</th>
                    <th className="px-6 py-4">Item Reservado</th>
                    <th className="px-6 py-4">Período / Data</th>
                    <th className="px-6 py-4 text-right">Valor Total</th>
                    <th className="px-6 py-4 text-center">Estado</th>
                    <th className="px-6 py-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white/40">
                  {filtradas.map((r, index) => (
                    <tr
                      key={`${r.tipo_reserva}-${r.id}-${index}`}
                      onClick={() => setReservaSelecionada(r)}
                      className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                      title="Clique para ver o detalhe completo"
                    >
                      <td className="px-6 py-4 font-mono font-bold text-xs text-gray-900 group-hover:text-[#003580]">
                        {r.codigo_reserva || `#${r.id}`}
                      </td>

                      <td className="px-6 py-4">{renderBadgeTipo(r.tipo_reserva)}</td>

                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">{r.cliente || '—'}</span>
                        <br />
                        <span className="text-[11px] text-gray-400">{r.cliente_email || ''}</span>
                      </td>

                      <td
                        className="px-6 py-4 font-medium text-gray-700 max-w-xs truncate"
                        title={r.item_nome}
                      >
                        {r.item_nome || '—'}
                      </td>

                      <td className="px-6 py-4 text-xs text-gray-500">
                        {r.data_inicio && r.data_fim ? (
                          r.data_inicio === r.data_fim ? (
                            <span>{new Date(r.data_inicio).toLocaleDateString()}</span>
                          ) : (
                            <span>
                              {new Date(r.data_inicio).toLocaleDateString()} al{' '}
                              {new Date(r.data_fim).toLocaleDateString()}
                            </span>
                          )
                        ) : (
                          <span>—</span>
                        )}
                      </td>

                      <td className="px-6 py-4 font-bold text-gray-900 text-right">
                        CVE {Number(r.valor || 0).toLocaleString()}
                      </td>

                      <td className="px-6 py-4 text-center">{renderBadgeStatus(r.status)}</td>

                      <td className="px-6 py-4">
                        <div
                          className="flex justify-center gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => setModalAcao({ show: true, reserva: r, tipo: 'confirmada' })}
                            disabled={isConfirmada(r.status)}
                            className="p-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg border border-green-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
                            title="Confirmar Reserva"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => setModalAcao({ show: true, reserva: r, tipo: 'suspensa' })}
                            disabled={isSuspensa(r.status)}
                            className="p-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg border border-orange-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
                            title="Suspender Reserva"
                          >
                            <PauseCircle size={14} />
                          </button>
                          <button
                            onClick={() => {
                              setReservaParaReembolso(r);
                              setShowReembolsoModal(true);
                            }}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg border border-blue-200 transition"
                            title="Processar Reembolso"
                          >
                            <DollarSign size={14} />
                          </button>
                          <button
                            onClick={() => setModalAcao({ show: true, reserva: r, tipo: 'cancelada' })}
                            disabled={isCancelada(r.status)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg border border-red-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
                            title="Cancelar Reserva"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmação / Ação Profissional (Substitui o window.confirm) */}
      {modalAcao.show && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {modalAcao.tipo === 'confirmada' && 'Confirmar Reserva'}
              {modalAcao.tipo === 'suspensa' && 'Suspender Reserva'}
              {modalAcao.tipo === 'cancelada' && 'Cancelar Reserva'}
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Tem a certeza de que deseja alterar o estado da reserva <strong>{modalAcao.reserva?.codigo_reserva || '#' + modalAcao.reserva?.id}</strong> para <span className="uppercase font-semibold">{modalAcao.tipo}</span>?
            </p>

            {modalAcao.tipo === 'cancelada' && (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Motivo do Cancelamento *</label>
                <textarea
                  value={motivoAcao}
                  onChange={(e) => setMotivoAcao(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
                  placeholder="Informe o motivo..."
                  required
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setModalAcao({ show: false, reserva: null, tipo: '' });
                  setMotivoAcao('');
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Voltar
              </button>
              <button
                type="button"
                disabled={modalAcao.tipo === 'cancelada' && !motivoAcao.trim()}
                onClick={executarAlteracaoEstado}
                className={`px-5 py-2 text-xs font-bold text-white rounded-xl transition shadow-md disabled:opacity-50 ${
                  modalAcao.tipo === 'confirmada' ? 'bg-green-600 hover:bg-green-700' :
                  modalAcao.tipo === 'suspensa' ? 'bg-orange-600 hover:bg-orange-700' :
                  'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirmar Ação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalhe */}
      {reservaSelecionada && (
        <DetalheReservaModal
          reserva={reservaSelecionada}
          onClose={() => setReservaSelecionada(null)}
        />
      )}

      {/* Modal de Reembolso Largo / Horizontal */}
      {showReembolsoModal && (
        <ReembolsoModal
          reserva={reservaParaReembolso}
          onClose={() => setShowReembolsoModal(false)}
          onSuccess={(msg) => {
            showToast(msg, 'success');
            carregarReservas();
          }}
        />
      )}
    </>
  );
};

export default ReservasAdmin;