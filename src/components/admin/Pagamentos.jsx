import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, TrendingUp, Calendar, CheckCircle, XCircle, Clock, Search, RefreshCw, Loader2, Eye, Filter, Download } from 'lucide-react';

const Pagamentos = () => {
  const [pagamentos, setPagamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pesquisa, setPesquisa] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [selectedPagamento, setSelectedPagamento] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    totalRecebido: 0,
    totalComissao: 0,
    confirmados: 0,
    pendentes: 0,
    cancelados: 0
  });

  const carregarPagamentos = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/get_pagamentos.php');
      const data = await response.json();
      if (data.status === 'success') {
        setPagamentos(data.data);
        calcularStats(data.data);
      }
    } catch (err) {
      console.error("Erro ao carregar pagamentos:", err);
    }
    setLoading(false);
  };

  const calcularStats = (pagamentosList) => {
    const totalRecebido = pagamentosList
      .filter(p => p.status === 'confirmado' || p.status === 'pago')
      .reduce((sum, p) => sum + parseFloat(p.valor || 0), 0);
    
    const totalComissao = totalRecebido * 0.20;
    
    const confirmados = pagamentosList.filter(p => p.status === 'confirmado' || p.status === 'pago').length;
    const pendentes = pagamentosList.filter(p => p.status === 'pendente' || p.status === 'aguardando').length;
    const cancelados = pagamentosList.filter(p => p.status === 'cancelado' || p.status === 'falhou').length;

    setStats({
      totalRecebido,
      totalComissao,
      confirmados,
      pendentes,
      cancelados
    });
  };

  useEffect(() => { carregarPagamentos(); }, []);

  const formatarMoeda = (valor) => {
    if (!valor) return '0 CVE';
    return new Intl.NumberFormat('pt-PT').format(valor) + ' CVE';
  };

  const formatarData = (data) => {
    if (!data) return 'N/A';
    return new Date(data).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderBadgeStatus = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'confirmado' || s === 'pago' || s === 'success') {
      return <span className="px-2.5 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle size={12} /> Confirmado</span>;
    }
    if (s === 'pendente' || s === 'aguardando' || s === 'pending') {
      return <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold flex items-center gap-1"><Clock size={12} /> Pendente</span>;
    }
    return <span className="px-2.5 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold flex items-center gap-1"><XCircle size={12} /> Cancelado</span>;
  };

  const getTipoReservaIcon = (tipo) => {
    switch(tipo) {
      case 'alojamento': return '🏠';
      case 'carro': return '🚗';
      case 'experiencia': return '🧭';
      default: return '💰';
    }
  };

  // Filtragem
  const pagamentosFiltrados = pagamentos.filter(p => {
    const termo = pesquisa.toLowerCase();
    const buscaMatch = 
      (p.codigo_reserva && p.codigo_reserva.toLowerCase().includes(termo)) ||
      (p.cliente_nome && p.cliente_nome.toLowerCase().includes(termo)) ||
      (p.cliente_email && p.cliente_email.toLowerCase().includes(termo)) ||
      (p.tipo_reserva && p.tipo_reserva.toLowerCase().includes(termo));

    const statusMatch = filtroStatus === 'todos' || 
      (filtroStatus === 'confirmado' && (p.status === 'confirmado' || p.status === 'pago')) ||
      (filtroStatus === 'pendente' && (p.status === 'pendente' || p.status === 'aguardando')) ||
      (filtroStatus === 'cancelado' && (p.status === 'cancelado' || p.status === 'falhou'));

    return buscaMatch && statusMatch;
  });

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#003580]">Pagamentos</h1>
          <p className="text-gray-600 mt-1">Gestão de transações e pagamentos do sistema.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={carregarPagamentos} className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm rounded-xl border border-gray-200 transition shadow-sm">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Atualizar
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-[#003580] hover:bg-[#002060] text-white font-medium text-sm rounded-xl transition shadow-sm">
            <Download size={15} /> Exportar
          </button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-white p-5 rounded-xl border border-green-100">
          <DollarSign className="text-green-500 mb-2" size={24} />
          <p className="text-xl font-bold">{formatarMoeda(stats.totalRecebido)}</p>
          <p className="text-xs text-gray-500">Total Recebido</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-xl border border-blue-100">
          <TrendingUp className="text-blue-500 mb-2" size={24} />
          <p className="text-xl font-bold">{formatarMoeda(stats.totalComissao)}</p>
          <p className="text-xs text-gray-500">Comissão (20%)</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-white p-5 rounded-xl border border-emerald-100">
          <CheckCircle className="text-emerald-500 mb-2" size={24} />
          <p className="text-xl font-bold">{stats.confirmados}</p>
          <p className="text-xs text-gray-500">Confirmados</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-white p-5 rounded-xl border border-yellow-100">
          <Clock className="text-yellow-500 mb-2" size={24} />
          <p className="text-xl font-bold">{stats.pendentes}</p>
          <p className="text-xs text-gray-500">Pendentes</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-white p-5 rounded-xl border border-red-100">
          <XCircle className="text-red-500 mb-2" size={24} />
          <p className="text-xl font-bold">{stats.cancelados}</p>
          <p className="text-xs text-gray-500">Cancelados</p>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/40 backdrop-blur-md p-4 rounded-xl border border-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por código, cliente ou tipo..." 
            value={pesquisa} 
            onChange={(e) => setPesquisa(e.target.value)} 
            className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-gray-200 focus:outline-none text-sm" 
          />
        </div>
        <div>
          <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 focus:outline-none">
            <option value="todos">Todos os Status</option>
            <option value="confirmado">Confirmados</option>
            <option value="pendente">Pendentes</option>
            <option value="cancelado">Cancelados</option>
          </select>
        </div>
      </div>

      {/* Tabela de Pagamentos */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-24 flex flex-col justify-center items-center gap-2 text-gray-500 text-sm">
            <Loader2 className="animate-spin text-[#003580]" size={32} />
            <span>A carregar pagamentos...</span>
          </div>
        ) : pagamentosFiltrados.length === 0 ? (
          <div className="py-24 flex flex-col justify-center items-center gap-3 text-gray-400">
            <CreditCard size={48} className="text-gray-300" />
            <p className="text-sm">Nenhum pagamento encontrado com os filtros atuais.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/50 text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Código</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Item</th>
                  <th className="px-6 py-4 text-right">Valor</th>
                  <th className="px-6 py-4 text-right">Comissão</th>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white/40">
                {pagamentosFiltrados.map((pagamento) => (
                  <tr key={pagamento.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-xs text-gray-900">
                      {pagamento.codigo_reserva || `#${pagamento.id}`}
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-xs font-semibold">
                        <span>{getTipoReservaIcon(pagamento.tipo_reserva)}</span>
                        <span className="capitalize">{pagamento.tipo_reserva}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-semibold text-gray-900">{pagamento.cliente_nome || 'N/A'}</span>
                        <br />
                        <span className="text-[11px] text-gray-400">{pagamento.cliente_email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600 max-w-xs truncate" title={pagamento.item_nome}>
                      {pagamento.item_nome || '-'}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 text-right">
                      {formatarMoeda(pagamento.valor)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-500">
                      {formatarMoeda(pagamento.valor * 0.2)}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {formatarData(pagamento.data_pagamento || pagamento.created_at)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {renderBadgeStatus(pagamento.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-1.5">
                        <button 
                          onClick={() => {
                            setSelectedPagamento(pagamento);
                            setShowModal(true);
                          }}
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg border border-blue-200 transition" 
                          title="Ver Detalhes"
                        >
                          <Eye size={14} />
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

      {/* Modal de Detalhes do Pagamento */}
      {showModal && selectedPagamento && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#003580]">Detalhes do Pagamento</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <XCircle size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Cabeçalho */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Código da Reserva</p>
                  <p className="font-mono text-lg font-bold text-gray-800">{selectedPagamento.codigo_reserva || `#${selectedPagamento.id}`}</p>
                </div>
                {renderBadgeStatus(selectedPagamento.status)}
              </div>

              {/* Informações do Pagamento */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Valor Total</p>
                  <p className="text-xl font-bold text-green-600">{formatarMoeda(selectedPagamento.valor)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Comissão (20%)</p>
                  <p className="text-xl font-bold text-blue-600">{formatarMoeda(selectedPagamento.valor * 0.2)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Líquido a Receber</p>
                  <p className="text-xl font-bold text-purple-600">{formatarMoeda(selectedPagamento.valor * 0.8)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Data do Pagamento</p>
                  <p className="font-medium">{formatarData(selectedPagamento.data_pagamento || selectedPagamento.created_at)}</p>
                </div>
              </div>

              {/* Informações da Reserva */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-800 mb-3">Informações da Reserva</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Tipo</p>
                    <p className="font-medium capitalize">{selectedPagamento.tipo_reserva}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Item</p>
                    <p className="font-medium">{selectedPagamento.item_nome || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Informações do Cliente */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-800 mb-3">Informações do Cliente</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Nome</p>
                    <p className="font-medium">{selectedPagamento.cliente_nome || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium">{selectedPagamento.cliente_email || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Método de Pagamento */}
              {selectedPagamento.metodo_pagamento && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Método de Pagamento</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="capitalize">{selectedPagamento.metodo_pagamento}</p>
                  </div>
                </div>
              )}

              <button 
                onClick={() => setShowModal(false)}
                className="w-full bg-gray-200 text-gray-700 py-2.5 rounded-xl hover:bg-gray-300 transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pagamentos;