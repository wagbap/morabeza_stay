import React, { useState, useEffect } from 'react';
import { Eye, RefreshCw, Home, Car, Compass, CheckCircle, XCircle, AlertCircle, PauseCircle, Trash2, DollarSign } from 'lucide-react';
import ReembolsoModal from './ReembolsoModal';

export default function Reservas() {
  const [activeTab, setActiveTab] = useState('Todas');
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  
  const [showReembolsoModal, setShowReembolsoModal] = useState(false);
  const [reservaSelecionadaReembolso, setReservaSelecionadaReembolso] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(null);
  const [showSuspendModal, setShowSuspendModal] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  
  const [motivoCancelamento, setMotivoCancelamento] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [counts, setCounts] = useState({
    todas: 0,
    confirmadas: 0,
    pendentes: 0,
    canceladas: 0,
    suspensas: 0,
    concluidas: 0
  });

  const formatStatus = (status) => {
    if (!status) return 'Pendente';
    const s = status.toLowerCase();
    if (s === 'confirmada' || s === 'approved' || s === 'confirmado') return 'Confirmada';
    if (s === 'cancelada' || s === 'cancelled') return 'Cancelada';
    if (s === 'suspensa' || s === 'suspended') return 'Suspensa';
    if (s === 'concluída' || s === 'concluida') return 'Concluída';
    return 'Pendente';
  };

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
          status: formatStatus(reserva.status),
          tipo: reserva.tipo || 'desconhecido',
          cliente_nome: reserva.cliente_nome || 'Cliente',
          cliente_foto: reserva.cliente_foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(reserva.cliente_nome || 'Cliente')}&background=0D8ABC&color=fff`,
          item_nome: reserva.item_nome || 'Item não identificado',
          valor: reserva.valor || '0',
          periodo: reserva.periodo || 'Data não informada',
          codigo: reserva.codigo || 'N/A'
        }));
        
        setReservas(reservasFormatadas);
        
        setCounts({
          todas: reservasFormatadas.length,
          confirmadas: reservasFormatadas.filter(r => r.status === 'Confirmada').length,
          pendentes: reservasFormatadas.filter(r => r.status === 'Pendente').length,
          canceladas: reservasFormatadas.filter(r => r.status === 'Cancelada').length,
          suspensas: reservasFormatadas.filter(r => r.status === 'Suspensa').length,
          concluidas: reservasFormatadas.filter(r => r.status === 'Concluída').length
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

  const executarAcaoAPI = async (reserva, novoStatus, sucessoMsg, modalSetter) => {
    setActionLoading(reserva.id);
    try {
      const response = await fetch('https://welovepalop.com/api/admin/atualizar_status_reserva.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: reserva.id,
          tipo_reserva: reserva.tipo,
          status: novoStatus,
          motivo: motivoCancelamento.trim() || 'Ação executada pelo Anfitrião'
        })
      });
      
      const rawText = await response.text();
      let data;
      
      try {
        const jsonStart = rawText.indexOf('{');
        const jsonEnd = rawText.lastIndexOf('}') + 1;
        data = JSON.parse(jsonStart !== -1 && jsonEnd !== -1 ? rawText.slice(jsonStart, jsonEnd) : rawText);
      } catch (parseError) {
        showToast('Erro de leitura no servidor.', 'error');
        setActionLoading(null);
        return;
      }
      
      if (data && data.success) {
        showToast(sucessoMsg, 'success');
        fetchReservas();
        modalSetter(null);
        setMotivoCancelamento('');
      } else {
        showToast(data?.message || 'Erro ao processar ação', 'error');
      }
    } catch (error) {
      showToast('Erro de conexão com o servidor', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const tabs = [
    { key: 'Todas', label: `Todas (${counts.todas})` },
    { key: 'Confirmada', label: `Confirmadas (${counts.confirmadas})` },
    { key: 'Pendente', label: `Pendentes (${counts.pendentes})` },
    { key: 'Suspensa', label: `Suspensas (${counts.suspensas})` },
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
      case 'Confirmada': return <span className="bg-[#e6f4ea] text-[#137333] px-3 py-1 rounded-md text-[12px] font-semibold flex items-center gap-1"><CheckCircle size={12} /> Confirmada</span>;
      case 'Pendente': return <span className="bg-[#fef3c7] text-[#b45309] px-3 py-1 rounded-md text-[12px] font-semibold flex items-center gap-1"><AlertCircle size={12} /> Pendente</span>;
      case 'Suspensa': return <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-md text-[12px] font-semibold flex items-center gap-1"><PauseCircle size={12} /> Suspensa</span>;
      case 'Concluída': return <span className="bg-[#e0f2f1] text-[#0f766e] px-3 py-1 rounded-md text-[12px] font-semibold flex items-center gap-1">✓ Concluída</span>;
      case 'Cancelada': return <span className="bg-[#fee2e2] text-[#b91c1c] px-3 py-1 rounded-md text-[12px] font-semibold flex items-center gap-1"><XCircle size={12} /> Cancelada</span>;
      default: return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-[12px] font-semibold">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl w-full text-[#0f172a] px-4 py-6 md:px-0">
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-500 text-white' : toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white'}`}>
          {toast.message}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-3 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-[#0f172a]">Gestão de Reservas</h2>
            <p className="text-sm text-gray-500">Reservas feitas nos seus anúncios</p>
          </div>
          <button onClick={fetchReservas} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="border-b border-gray-100 px-5 pt-2 overflow-x-auto whitespace-nowrap">
          <div className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-4 pt-3 text-sm font-medium transition relative ${activeTab === tab.key ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
              >
                {tab.label}
                {activeTab === tab.key && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-t-full"></div>}
              </button>
            ))}
          </div>
        </div>

        {filteredReservas.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Home size={48} className="mx-auto text-gray-300 mb-2" />
            <p className="text-lg font-medium">Nenhuma reserva encontrada</p>
          </div>
        )}

        {filteredReservas.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-left text-xs text-gray-500">
                  <th className="px-6 py-3">Cliente / Item</th>
                  <th className="px-6 py-3">Período</th>
                  <th className="px-6 py-3">Valor</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Código</th>
                  <th className="px-center py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredReservas.map((reserva) => (
                  <tr key={reserva.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img src={reserva.cliente_foto} alt="" className="w-10 h-10 rounded-full object-cover border" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{reserva.cliente_nome}</p>
                        <p className="text-xs text-gray-500">{reserva.item_nome}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{reserva.periodo}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{reserva.valor} CVE</td>
                    <td className="px-6 py-4">{getStatusBadge(reserva.status)}</td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{reserva.codigo}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => setShowConfirmModal(reserva)} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Confirmar">
                          <CheckCircle size={18} />
                        </button>
                        <button onClick={() => setShowSuspendModal(reserva)} className="p-1 text-orange-600 hover:bg-orange-50 rounded" title="Suspender">
                          <PauseCircle size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            setReservaSelecionadaReembolso(reserva);
                            setShowReembolsoModal(true);
                          }} 
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded" 
                          title="Reembolsar"
                        >
                          <DollarSign size={18} />
                        </button>
                        <button onClick={() => setShowCancelModal(reserva)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Cancelar">
                          <XCircle size={18} />
                        </button>
                        <button onClick={() => setShowDeleteModal(reserva)} className="p-1 text-gray-400 hover:text-red-700 hover:bg-red-50 rounded" title="Eliminar Definitivamente">
                          <Trash2 size={18} />
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

      {/* Modal Confirmar */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 text-center">
            <h3 className="text-lg font-bold mb-2">Confirmar Reserva</h3>
            <p className="text-gray-500 text-sm mb-4">Deseja aprovar a reserva <strong>{showConfirmModal.codigo}</strong>?</p>
            <div className="flex gap-3">
              <button onClick={() => executarAcaoAPI(showConfirmModal, 'confirmada', 'Reserva confirmada!', setShowConfirmModal)} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold">Sim, Confirmar</button>
              <button onClick={() => setShowConfirmModal(null)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Suspender */}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 text-center">
            <h3 className="text-lg font-bold mb-2 text-orange-600">Suspender Reserva</h3>
            <p className="text-gray-500 text-sm mb-4">Deseja colocar temporariamente a reserva <strong>{showSuspendModal.codigo}</strong> como suspensa?</p>
            <div className="flex gap-3">
              <button onClick={() => executarAcaoAPI(showSuspendModal, 'suspensa', 'Reserva suspensa com sucesso!', setShowSuspendModal)} className="flex-1 bg-orange-600 text-white py-2 rounded-lg font-semibold">Sim, Suspender</button>
              <button onClick={() => setShowSuspendModal(null)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold">Voltar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reembolso */}
      {showReembolsoModal && (
        <ReembolsoModal 
          reserva={reservaSelecionadaReembolso}
          onClose={() => setShowReembolsoModal(false)}
          onSuccess={(mensagem) => {
            showToast(mensagem, 'success');
            fetchReservas();
          }}
        />
      )}

      {/* Modal Cancelar */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 text-left">
            <h3 className="text-lg font-bold mb-2 text-red-600 text-center">Cancelar Reserva</h3>
            <p className="text-gray-500 text-sm mb-3 text-center">Tem certeza que deseja cancelar a reserva <strong>{showCancelModal.codigo}</strong>?</p>
            <textarea value={motivoCancelamento} onChange={(e) => setMotivoCancelamento(e.target.value)} placeholder="Informe o motivo..." className="w-full border p-2 rounded text-sm mb-4" rows={3}></textarea>
            <div className="flex gap-3">
              <button disabled={!motivoCancelamento.trim()} onClick={() => executarAcaoAPI(showCancelModal, 'cancelada', 'Reserva cancelada.', setShowCancelModal)} className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold disabled:opacity-50">Sim, Cancelar</button>
              <button onClick={() => setShowCancelModal(null)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold">Voltar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 text-center">
            <h3 className="text-lg font-bold mb-2 text-red-700">Eliminar Definitivamente</h3>
            <p className="text-gray-500 text-sm mb-4">Atenção! Esta ação apaga o registo da base de dados de forma irreversível. Deseja continuar?</p>
            <div className="flex gap-3">
              <button onClick={() => executarAcaoAPI(showDeleteModal, 'eliminar', 'Reserva eliminada da base de dados.', setShowDeleteModal)} className="flex-1 bg-red-700 text-white py-2 rounded-lg font-semibold">Sim, Eliminar</button>
              <button onClick={() => setShowDeleteModal(null)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}