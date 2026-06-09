import React, { useState, useEffect } from 'react';
import { Search, Filter, Loader2, Calendar, Check, X, Home, Compass, Car, RefreshCw } from 'lucide-react';

const ReservasAdmin = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pesquisa, setPesquisa] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos'); // todos, alojamento, carro, experiencia
  const [filtroStatus, setFiltroStatus] = useState('todos'); // todos, confirmada, pendente, cancelada

  const carregarReservas = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/get_all_reservations.php');
      const data = await response.json();
      if (data.status === 'success') {
        setReservas(data.data);
      }
    } catch (err) {
      console.error("Erro ao procurar histórico de reservas:", err);
    }
    setLoading(false);
  };

  useEffect(() => { carregarReservas(); }, []);

  const alterarEstado = async (id, tipoReserva, proximoStatus) => {
    if (!window.confirm(`Tem a certeza de que deseja marcar esta reserva como ${proximoStatus}?`)) return;

    try {
      const response = await fetch('/api/admin/atualizar_status_reserva.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, tipo_reserva: tipoReserva, status: proximoStatus })
      });
      const data = await response.json();
      if (data.success) {
        carregarReservas(); // Atualiza a tabela na hora
      } else {
        alert("Erro: " + data.message);
      }
    } catch (err) {
      console.error("Erro ao atualizar estado:", err);
    }
  };

  // Lógica Avançada de Filtragem e Busca Unificada
  const filtradas = reservas.filter(r => {
    const termo = pesquisa.toLowerCase();
    const buscaMatch = 
      (r.codigo_reserva && r.codigo_reserva.toLowerCase().includes(termo)) ||
      (r.cliente && r.cliente.toLowerCase().includes(termo)) ||
      (r.item_nome && r.item_nome.toLowerCase().includes(termo));

    const tipoMatch = filtroTipo === 'todos' || r.tipo_reserva === filtroTipo;
    
    // Normalização básica dos estados armazenados na BD (ex: approved, confirmada, etc)
    const statusNormalizado = (r.status || '').toLowerCase();
    let statusMatch = filtroStatus === 'todos';
    if (!statusMatch) {
      if (filtroStatus === 'confirmada') statusMatch = statusNormalizado === 'confirmada' || statusNormalizado === 'approved' || statusNormalizado === 'confirmado';
      if (filtroStatus === 'pendente') statusMatch = statusNormalizado === 'pendente' || statusNormalizado === 'pending';
      if (filtroStatus === 'cancelada') statusMatch = statusNormalizado === 'cancelada' || statusNormalizado === 'cancelled';
    }

    return buscaMatch && tipoMatch && statusMatch;
  });

  const renderBadgeTipo = (tipo) => {
    switch (tipo) {
      case 'alojamento':
        return <span className="flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100"><Home size={12} /> Alojamento</span>;
      case 'carro':
        return <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-lg border border-green-100"><Car size={12} /> Rent-a-car</span>;
      case 'experiencia':
        return <span className="flex items-center gap-1 text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100"><Compass size={12} /> Experiência</span>;
      default:
        return <span className="text-xs text-gray-500 font-medium">{tipo}</span>;
    }
  };

  const renderBadgeStatus = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'confirmada' || s === 'approved' || s === 'confirmado') {
      return <span className="px-2.5 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">Confirmada</span>;
    }
    if (s === 'pendente' || s === 'pending') {
      return <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold animate-pulse">Pendente</span>;
    }
    return <span className="px-2.5 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">Cancelada</span>;
  };

  return (
    <div className="space-y-6">
      {/* Topo informativo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#003580]">Gestão de Reservas</h1>
          <p className="text-gray-600 mt-1">Acompanhe, aprove e gira as transações comerciais do marketplace.</p>
        </div>
        <button onClick={carregarReservas} className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm rounded-xl border border-gray-200 transition shadow-sm">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Atualizar Tabela
        </button>
      </div>

      {/* Controladores: Filtros e Pesquisa */}
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
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 focus:outline-none">
            <option value="todos">Todas as Categorias</option>
            <option value="alojamento">Alojamentos</option>
            <option value="carro">Rent-a-car</option>
            <option value="experiencia">Experiências</option>
          </select>
        </div>

        <div>
          <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 focus:outline-none">
            <option value="todos">Todos os Estados</option>
            <option value="confirmada">Confirmadas</option>
            <option value="pendente">Pendentes</option>
            <option value="cancelada">Canceladas</option>
          </select>
        </div>
      </div>

      {/* Tabela de Dados */}
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
                  <tr key={`${r.tipo_reserva}-${r.id}-${index}`} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-xs text-gray-900">
                      {r.codigo_reserva || `#${r.id}`}
                    </td>
                    <td className="px-6 py-4">{renderBadgeTipo(r.tipo_reserva)}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">{r.cliente}</span>
                      <br /><span className="text-[11px] text-gray-400">{r.cliente_email}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-700 max-w-xs truncate" title={r.item_nome}>
                      {r.item_nome}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {r.data_inicio === r.data_fim ? (
                        <span>{new Date(r.data_inicio).toLocaleDateString()}</span>
                      ) : (
                        <span>{new Date(r.data_inicio).toLocaleDateString()} al {new Date(r.data_fim).toLocaleDateString()}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 text-right">
                      CVE {Number(r.valor).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">{renderBadgeStatus(r.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-1.5">
                        <button 
                          onClick={() => alterarEstado(r.id, r.tipo_reserva, 'confirmada')}
                          disabled={r.status?.toLowerCase() === 'confirmada' || r.status?.toLowerCase() === 'approved'}
                          className="p-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg border border-green-200 disabled:opacity-30 disabled:cursor-not-allowed transition" 
                          title="Confirmar Reserva"
                        >
                          <Check size={14} />
                        </button>
                        <button 
                          onClick={() => alterarEstado(r.id, r.tipo_reserva, 'cancelada')}
                          disabled={r.status?.toLowerCase() === 'cancelada'}
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
  );
};

export default ReservasAdmin;