import React, { useState, useEffect } from 'react';

export default function Reservas() {
  const [activeTab, setActiveTab] = useState('Todas');
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    todas: 0,
    confirmadas: 0,
    pendentes: 0,
    canceladas: 0,
    concluidas: 0
  });

  // Buscar reservas da API - como CLIENTE
  useEffect(() => {
    fetchMinhasReservas();
  }, []);

  const fetchMinhasReservas = async () => {
    setLoading(true);
    try {
      const savedUser = localStorage.getItem('user');
      if (!savedUser) {
        setLoading(false);
        return;
      }
      
      const user = JSON.parse(savedUser);
      
      // Buscar reservas do cliente (usuario_id = user.id)
      const response = await fetch(`https://welovepalop.com/api/dashboard/minhas_reservas.php?usuario_id=${user.id}`);
      const data = await response.json();
      
      if (data.success && data.data?.reservas) {
        const reservasData = data.data.reservas;
        setReservas(reservasData);
        
        // Calcular contagens por status
        const confirmadas = reservasData.filter(r => 
          r.status === 'Confirmada' || r.status === 'confirmada' || r.status === 'CONFIRMADA'
        ).length;
        
        const pendentes = reservasData.filter(r => 
          r.status === 'Pendente' || r.status === 'pendente' || r.status === 'PENDENTE'
        ).length;
        
        const canceladas = reservasData.filter(r => 
          r.status === 'Cancelada' || r.status === 'cancelada' || r.status === 'CANCELADA'
        ).length;
        
        const concluidas = reservasData.filter(r => 
          r.status === 'Concluída' || r.status === 'concluida' || r.status === 'CONCLUIDA' ||
          r.status === 'Concluida'
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
  };

  // Lista dos separadores com contagens reais
  const tabs = [
    { key: 'Todas', label: `Todas (${counts.todas})` },
    { key: 'Confirmadas', label: `Confirmadas (${counts.confirmadas})` },
    { key: 'Pendentes', label: `Pendentes (${counts.pendentes})` },
    { key: 'Canceladas', label: `Canceladas (${counts.canceladas})` },
    { key: 'Concluídas', label: `Concluídas (${counts.concluidas})` }
  ];

  // Filtrar reservas baseado no tab ativo
  const getFilteredReservas = () => {
    if (activeTab === 'Todas') return reservas;
    
    const statusMap = {
      'Confirmadas': ['Confirmada', 'confirmada', 'CONFIRMADA'],
      'Pendentes': ['Pendente', 'pendente', 'PENDENTE'],
      'Canceladas': ['Cancelada', 'cancelada', 'CANCELADA'],
      'Concluídas': ['Concluída', 'Concluida', 'concluida', 'concluída', 'CONCLUIDA']
    };
    
    const statusList = statusMap[activeTab] || [];
    return reservas.filter(r => statusList.includes(r.status));
  };

  const filteredReservas = getFilteredReservas();

  // Função para dar a cor certa a cada status
  const getStatusBadge = (status) => {
    const statusLower = String(status).toLowerCase();
    
    if (statusLower === 'confirmada') {
      return <span className="bg-[#e6f4ea] text-[#137333] px-3 py-1 rounded-md text-[12px] font-semibold inline-block">✅ Confirmada</span>;
    }
    if (statusLower === 'pendente') {
      return <span className="bg-[#fef3c7] text-[#b45309] px-3 py-1 rounded-md text-[12px] font-semibold inline-block">⏳ Pendente</span>;
    }
    if (statusLower === 'concluída' || statusLower === 'concluida') {
      return <span className="bg-[#e0f2f1] text-[#0f766e] px-3 py-1 rounded-md text-[12px] font-semibold inline-block">✓ Concluída</span>;
    }
    if (statusLower === 'cancelada') {
      return <span className="bg-[#fee2e2] text-[#b91c1c] px-3 py-1 rounded-md text-[12px] font-semibold inline-block">✗ Cancelada</span>;
    }
    return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-[12px] font-semibold inline-block">{status}</span>;
  };

  // Função para formatar o período baseado no tipo
  const formatarPeriodo = (reserva) => {
    if (reserva.tipo === 'alojamento') {
      return reserva.periodo || `${reserva.data_checkin || ''} - ${reserva.data_checkout || ''}`;
    } else if (reserva.tipo === 'carro') {
      return reserva.periodo || `${reserva.data_levantamento || ''} - ${reserva.data_devolucao || ''}`;
    } else if (reserva.tipo === 'experiencia') {
      return reserva.periodo || reserva.data_participacao || '';
    }
    return reserva.periodo || '';
  };

  // Função para obter ícone do tipo
  const getTipoIcone = (tipo) => {
    if (tipo === 'alojamento') return '🏠';
    if (tipo === 'carro') return '🚗';
    if (tipo === 'experiencia') return '🏄';
    return '📦';
  };

  // Função para obter o nome do proprietário/anfitrião
  const getProprietarioNome = (reserva) => {
    if (reserva.proprietario_nome) return reserva.proprietario_nome;
    if (reserva.anfitriao_nome) return reserva.anfitriao_nome;
    return 'Anfitrião';
  };

  // Função para obter a imagem do item
  const getItemImagem = (reserva) => {
    if (reserva.item_imagem && !reserva.item_imagem.includes('ui-avatars')) return reserva.item_imagem;
    return `https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=60&h=60&fit=crop`;
  };

  if (loading) {
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
    <div className="max-w-6xl w-full text-[#0f172a] px-4 py-6 md:px-0">
  
      {/* Container Principal Branco */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
        
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-[#0f172a]">Minhas Reservas</h2>
              <p className="text-sm text-gray-500 mt-0.5">Acompanhe as suas reservas</p>
            </div>
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

        {/* --- VERSÃO DESKTOP (Tabela) --- */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="w-[30%] text-left text-[12px] font-semibold text-[#64748b] px-6 py-4">Item / Anfitrião</th>
                <th className="w-[25%] text-left text-[12px] font-semibold text-[#64748b] px-6 py-4">Período</th>
                <th className="w-[15%] text-left text-[12px] font-semibold text-[#64748b] px-6 py-4">Valor</th>
                <th className="w-[15%] text-left text-[12px] font-semibold text-[#64748b] px-6 py-4">Status</th>
                <th className="w-[15%] text-center text-[12px] font-semibold text-[#64748b] px-6 py-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservas.length > 0 ? (
                filteredReservas.map((reserva, index) => (
                  <tr key={reserva.id || index} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
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
                            <span>👤</span> {getProprietarioNome(reserva)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[14px] font-medium text-[#0f172a]">{formatarPeriodo(reserva)}</td>
                    <td className="px-6 py-4 text-[14px] font-bold text-[#0f172a]">{reserva.valor} CVE</td>
                    <td className="px-6 py-4">{getStatusBadge(reserva.status)}</td>
                    <td className="px-6 py-4 text-center">
                      <button className="text-[14px] font-semibold text-[#2563eb] hover:underline px-3 py-1 rounded-md hover:bg-blue-50 transition-colors">
                        Ver
                      </button>
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

        {/* --- VERSÃO MOBILE (Cartões) --- */}
        <div className="md:hidden flex flex-col">
          {filteredReservas.length > 0 ? (
            filteredReservas.map((reserva, index) => (
              <div key={reserva.id || index} className="p-5 border-b border-gray-100 flex flex-col gap-4 active:bg-gray-50">
                
                {/* Linha 1: Info Principal */}
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
                        <span>👤</span> {getProprietarioNome(reserva)}
                      </span>
                    </div>
                  </div>
                  <span className="text-[14px] font-bold text-[#0f172a] text-right whitespace-nowrap">
                    {reserva.valor} CVE
                  </span>
                </div>

                {/* Linha 2: Detalhes Secundários */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="text-[12px] text-[#64748b] font-medium">
                    <span className="block text-gray-400 text-[11px] mb-0.5">Período</span>
                    {formatarPeriodo(reserva)}
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusBadge(reserva.status)}
                  </div>
                </div>

                {/* Linha 3: Botão de Ação */}
                <div className="mt-1">
                  <button className="w-full bg-white border border-gray-200 text-[14px] font-semibold text-[#2563eb] py-2.5 rounded-lg active:bg-blue-50 active:border-blue-200 transition-colors shadow-sm">
                    Ver detalhes da reserva
                  </button>
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

        {/* Rodapé */}
        <div className="px-5 py-5 md:px-6 border-t border-gray-100">
          <button 
            onClick={fetchMinhasReservas}
            className="text-[14px] text-[#2563eb] font-semibold hover:underline block text-center md:text-left"
          >
            Atualizar reservas
          </button>
        </div>

      </div>

    </div>
  );
}