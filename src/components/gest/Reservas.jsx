import React, { useState, useEffect } from 'react';
import { Eye, RefreshCw, Home, Car, Compass, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function Reservas() {
  const [activeTab, setActiveTab] = useState('Todas');
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [counts, setCounts] = useState({
    todas: 0,
    confirmadas: 0,
    pendentes: 0,
    canceladas: 0,
    concluidas: 0
  });

  // Função para padronizar o status da API e evitar bugs de maiúscula/minúscula
  const formatStatus = (status) => {
    if (!status) return 'Pendente';
    const s = status.toLowerCase();
    if (s === 'confirmada') return 'Confirmada';
    if (s === 'cancelada') return 'Cancelada';
    if (s === 'concluída' || s === 'concluida') return 'Concluída';
    return 'Pendente';
  };

  // Buscar reservas da API
  useEffect(() => {
    fetchReservas();
  }, []);

  const fetchReservas = async () => {
    setLoading(true);
    try {
      const savedUser = localStorage.getItem('morabeza_user') || localStorage.getItem('user');
      if (!savedUser) {
        setLoading(false);
        return;
      }
      
      const user = JSON.parse(savedUser);
      
      const response = await fetch(`https://welovepalop.com/api/dashboard/reservas_recentes.php?usuario_id=${user.id}`);
      const data = await response.json();
      
      if (data.success && data.data?.reservas) {
        const reservasData = data.data.reservas;
        
        const reservasFormatadas = reservasData.map(reserva => ({
          ...reserva,
          status: formatStatus(reserva.status), // Usa o formatador aqui
          tipo: reserva.tipo || 'desconhecido',
          cliente_nome: reserva.cliente_nome || 'Cliente',
          cliente_foto: reserva.cliente_foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(reserva.cliente_nome || 'Cliente')}&background=0D8ABC&color=fff`,
          item_nome: reserva.item_nome || 'Item não identificado',
          valor: reserva.valor || '0',
          periodo: reserva.periodo || 'Data não informada',
          codigo: reserva.codigo || 'N/A'
        }));
        
        setReservas(reservasFormatadas);
        
        const confirmadas = reservasFormatadas.filter(r => r.status === 'Confirmada').length;
        const pendentes = reservasFormatadas.filter(r => r.status === 'Pendente').length;
        const canceladas = reservasFormatadas.filter(r => r.status === 'Cancelada').length;
        const concluidas = reservasFormatadas.filter(r => r.status === 'Concluída').length;
        
        setCounts({
          todas: reservasFormatadas.length,
          confirmadas,
          pendentes,
          canceladas,
          concluidas
        });
      } else {
        setReservas([]);
      }
    } catch (error) {
      console.error('Erro ao buscar reservas:', error);
      showToast('Erro ao carregar reservas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // Confirmar reserva
  const confirmarReserva = async (reserva) => {
    setActionLoading(reserva.id);
    try {
      const response = await fetch('https://welovepalop.com/api/dashboard/atualizar_status_reserva.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: reserva.id,
          tipo: reserva.tipo,
          status: 'confirmada'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        showToast(`Reserva ${reserva.codigo} confirmada com sucesso!`, 'success');
        fetchReservas();
        setShowConfirmModal(null);
      } else {
        showToast(data.message || 'Erro ao confirmar reserva', 'error');
      }
    } catch (error) {
      console.error('Erro:', error);
      showToast('Erro de conexão', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Cancelar reserva
  const cancelarReserva = async (reserva) => {
    if (!motivoCancelamento.trim()) {
      showToast('Por favor, informe o motivo do cancelamento', 'error');
      return;
    }
    
    setActionLoading(reserva.id);
    try {
      const response = await fetch('https://welovepalop.com/api/dashboard/atualizar_status_reserva.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: reserva.id,
          tipo: reserva.tipo,
          status: 'cancelada',
          motivo: motivoCancelamento
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        showToast(`Reserva ${reserva.codigo} cancelada`, 'warning');
        fetchReservas();
        setShowCancelModal(null);
        setMotivoCancelamento('');
      } else {
        showToast(data.message || 'Erro ao cancelar reserva', 'error');
      }
    } catch (error) {
      console.error('Erro:', error);
      showToast('Erro de conexão', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // AQUI FOI CORRIGIDO: As 'keys' agora estão no singular para dar match correto com o banco
  const tabs = [
    { key: 'Todas', label: `Todas (${counts.todas})` },
    { key: 'Confirmada', label: `Confirmadas (${counts.confirmadas})` },
    { key: 'Pendente', label: `Pendentes (${counts.pendentes})` },
    { key: 'Cancelada', label: `Canceladas (${counts.canceladas})` },
    { key: 'Concluída', label: `Concluídas (${counts.concluidas})` }
  ];

  const getFilteredReservas = () => {
    if (activeTab === 'Todas') return reservas;
    return reservas.filter(r => r.status === activeTab);
  };

  const filteredReservas = getFilteredReservas();

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Confirmada':
        return <span className="bg-[#e6f4ea] text-[#137333] px-3 py-1 rounded-md text-[12px] font-semibold flex items-center gap-1"><CheckCircle size={12} /> Confirmada</span>;
      case 'Pendente':
        return <span className="bg-[#fef3c7] text-[#b45309] px-3 py-1 rounded-md text-[12px] font-semibold flex items-center gap-1"><AlertCircle size={12} /> Pendente</span>;
      case 'Concluída':
        return <span className="bg-[#e0f2f1] text-[#0f766e] px-3 py-1 rounded-md text-[12px] font-semibold flex items-center gap-1">✓ Concluída</span>;
      case 'Cancelada':
        return <span className="bg-[#fee2e2] text-[#b91c1c] px-3 py-1 rounded-md text-[12px] font-semibold flex items-center gap-1"><XCircle size={12} /> Cancelada</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-[12px] font-semibold">{status}</span>;
    }
  };

  const getTipoIcone = (tipo) => {
    switch(tipo) {
      case 'alojamento': return <Home size={16} className="text-blue-600" />;
      case 'carro': return <Car size={16} className="text-green-600" />;
      case 'experiencia': return <Compass size={16} className="text-purple-600" />;
      default: return <AlertCircle size={16} className="text-gray-400" />;
    }
  };

  const getTipoNome = (tipo) => {
    switch(tipo) {
      case 'alojamento': return 'Alojamento';
      case 'carro': return 'Viatura';
      case 'experiencia': return 'Experiência';
      default: return 'Outro';
    }
  };

  const podeAcao = (status) => {
    return status === 'Pendente';
  };

  const abrirConfirmModal = (reserva) => {
    setShowConfirmModal(reserva);
  };

  const abrirCancelModal = (reserva) => {
    setShowCancelModal(reserva);
  };

  if (loading) {
    return (
      <div className="max-w-7xl w-full text-[#0f172a] px-4 py-6 md:px-0">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto"></div>
          <p className="text-slate-500 mt-4">Carregando reservas dos seus anúncios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl w-full text-[#0f172a] px-4 py-6 md:px-0">
      
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-top-2 ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 
          toast.type === 'error' ? 'bg-red-500 text-white' : 
          'bg-yellow-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
        
        {/* Header com Título */}
        <div className="px-5 pt-5 pb-3 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-[#0f172a]">Gestão de Reservas</h2>
              <p className="text-sm text-gray-500 mt-0.5">Reservas feitas nos seus anúncios</p>
            </div>
            <button 
              onClick={fetchReservas}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Atualizar"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Navegação por Tabs */}
        <div className="border-b border-gray-100 px-5 pt-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <div className="flex gap-6 md:gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-4 pt-3 text-[13px] md:text-[14px] font-medium transition-colors relative flex-shrink-0 ${
                  activeTab === tab.key ? 'text-[#2563eb]' : 'text-[#64748b] hover:text-[#0f172a]'
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2563eb] rounded-t-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Mensagem quando não há reservas */}
        {filteredReservas.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="flex flex-col items-center gap-2">
              <Home size={48} className="text-gray-300" />
              <p className="text-lg font-medium">Nenhuma reserva encontrada</p>
              <p className="text-sm">
                {activeTab === 'Todas' 
                  ? 'Você ainda não tem reservas nos seus anúncios' 
                  : `Nenhuma reserva com status encontrado na aba selecionada`}
              </p>
            </div>
          </div>
        )}

        {/* Desktop Table */}
        {filteredReservas.length > 0 && (
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-[12px] font-semibold text-[#64748b] px-6 py-3">Cliente / Item</th>
                  <th className="text-left text-[12px] font-semibold text-[#64748b] px-6 py-3">Período</th>
                  <th className="text-left text-[12px] font-semibold text-[#64748b] px-6 py-3">Valor</th>
                  <th className="text-left text-[12px] font-semibold text-[#64748b] px-6 py-3">Status</th>
                  <th className="text-left text-[12px] font-semibold text-[#64748b] px-6 py-3">Código</th>
                  <th className="text-center text-[12px] font-semibold text-[#64748b] px-6 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservas.map((reserva, index) => (
                  <tr key={reserva.id || index} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={reserva.cliente_foto} 
                          alt={reserva.cliente_nome} 
                          className="w-10 h-10 rounded-full object-cover border border-gray-200" 
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(reserva.cliente_nome)}&background=0D8ABC&color=fff`;
                          }}
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{reserva.cliente_nome}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            {getTipoIcone(reserva.tipo)}
                            <span className="text-xs text-gray-500">{getTipoNome(reserva.tipo)}</span>
                            <span className="text-xs text-gray-400 mx-1">•</span>
                            <span className="text-xs text-gray-600 truncate max-w-[200px]" title={reserva.item_nome}>
                              {reserva.item_nome}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{reserva.periodo}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{reserva.valor} CVE</td>
                    <td className="px-6 py-4">{getStatusBadge(reserva.status)}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {reserva.codigo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                          title="Ver detalhes"
                        >
                          <Eye size={18} />
                        </button>
                        
                        {podeAcao(reserva.status) && (
                          <>
                            <button 
                              onClick={() => abrirConfirmModal(reserva)}
                              disabled={actionLoading === reserva.id}
                              className="text-green-600 hover:text-green-700 transition-colors p-1 disabled:opacity-50"
                              title="Confirmar reserva"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button 
                              onClick={() => abrirCancelModal(reserva)}
                              disabled={actionLoading === reserva.id}
                              className="text-red-600 hover:text-red-700 transition-colors p-1 disabled:opacity-50"
                              title="Cancelar reserva"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile Cards */}
        {filteredReservas.length > 0 && (
          <div className="md:hidden flex flex-col divide-y divide-gray-100">
            {filteredReservas.map((reserva, index) => (
              <div key={reserva.id || index} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={reserva.cliente_foto} 
                      alt={reserva.cliente_nome} 
                      className="w-12 h-12 rounded-full object-cover border border-gray-200" 
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(reserva.cliente_nome)}&background=0D8ABC&color=fff`;
                      }}
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{reserva.cliente_nome}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        {getTipoIcone(reserva.tipo)}
                        <span className="text-xs text-gray-500">{reserva.item_nome}</span>
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(reserva.status)}
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs">Período</p>
                    <p className="text-gray-700">{reserva.periodo}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Valor</p>
                    <p className="font-bold text-gray-900">{reserva.valor} CVE</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Código</p>
                    <p className="text-xs font-mono text-gray-500">{reserva.codigo}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button className="flex-1 py-2 text-center text-blue-600 font-medium text-sm bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    Ver detalhes
                  </button>
                  {podeAcao(reserva.status) && (
                    <>
                      <button 
                        onClick={() => abrirConfirmModal(reserva)}
                        className="px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                        title="Confirmar"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button 
                        onClick={() => abrirCancelModal(reserva)}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        title="Cancelar"
                      >
                        <XCircle size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer com Stats */}
        {reservas.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/30">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Total de reservas</span>
              <span className="font-semibold text-gray-900">{filteredReservas.length} {activeTab !== 'Todas' ? activeTab.toLowerCase() + '(s)' : ''}</span>
            </div>
          </div>
        )}

      </div>

      {/* Modal de Confirmação */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowConfirmModal(null)}>
          <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Confirmar Reserva</h3>
              <p className="text-gray-500 mt-2">
                Tem certeza que deseja confirmar a reserva <strong>{showConfirmModal.codigo}</strong>?
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {showConfirmModal.item_nome} - {showConfirmModal.cliente_nome}
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => confirmarReserva(showConfirmModal)}
                disabled={actionLoading === showConfirmModal.id}
                className="flex-1 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {actionLoading === showConfirmModal.id ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Processando...
                  </div>
                ) : (
                  'Sim, Confirmar'
                )}
              </button>
              <button 
                onClick={() => setShowConfirmModal(null)}
                className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg hover:bg-gray-200 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cancelamento */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCancelModal(null)}>
          <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <XCircle size={32} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Cancelar Reserva</h3>
              <p className="text-gray-500 mt-2">
                Tem certeza que deseja cancelar a reserva <strong>{showCancelModal.codigo}</strong>?
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {showCancelModal.item_nome} - {showCancelModal.cliente_nome}
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo do cancelamento *
              </label>
              <textarea
                value={motivoCancelamento}
                onChange={(e) => setMotivoCancelamento(e.target.value)}
                rows={3}
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                placeholder="Informe o motivo do cancelamento..."
              />
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => cancelarReserva(showCancelModal)}
                disabled={actionLoading === showCancelModal.id || !motivoCancelamento.trim()}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {actionLoading === showCancelModal.id ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Processando...
                  </div>
                ) : (
                  'Sim, Cancelar'
                )}
              </button>
              <button 
                onClick={() => {
                  setShowCancelModal(null);
                  setMotivoCancelamento('');
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg hover:bg-gray-200 transition"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}