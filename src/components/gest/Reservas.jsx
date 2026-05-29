import React, { useState } from 'react';

export default function Reservas() {
  // Estado para controlar o separador (tab) ativo
  const [activeTab, setActiveTab] = useState('Todas (20)');

  // Lista dos separadores conforme a imagem
  const tabs = [
    'Todas (20)', 
    'Confirmadas (12)', 
    'Pendentes (4)', 
    'Canceladas (2)', 
    'Concluídas (2)'
  ];

  // Dados mockados baseados na imagem
  const reservas = [
    {
      id: 1,
      nome: 'Maria Fernandes',
      servico: 'Apartamento Vista Mar',
      imagem: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
      periodo: '12 - 15 Mai 2024',
      valor: '16.500 CVE',
      status: 'Confirmada'
    },
    {
      id: 2,
      nome: 'Carlos Mendes',
      servico: 'Toyota Hilux 2022',
      imagem: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop',
      periodo: '10 - 12 Mai 2024',
      valor: '8.000 CVE',
      status: 'Pendente'
    },
    {
      id: 3,
      nome: 'Ana Costa',
      servico: 'Tour Cidade Velha',
      imagem: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
      periodo: '08 Mai 2024',
      valor: '5.000 CVE',
      status: 'Confirmada'
    },
    {
      id: 4,
      nome: 'Pedro Lima',
      servico: 'Moradia Achada',
      imagem: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
      periodo: '01 - 05 Mai 2024',
      valor: '48.000 CVE',
      status: 'Concluída'
    },
    {
      id: 5,
      nome: 'Sofia Duarte',
      servico: 'Hyundai Tucson 2021',
      imagem: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
      periodo: '28 - 30 Abr 2024',
      valor: '6.000 CVE',
      status: 'Cancelada'
    }
  ];

  // Função para dar a cor certa a cada status (mantida igual)
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmada':
        return <span className="bg-[#e6f4ea] text-[#137333] px-3 py-1 rounded-md text-[12px] font-semibold inline-block">Confirmada</span>;
      case 'Pendente':
        return <span className="bg-[#fef3c7] text-[#b45309] px-3 py-1 rounded-md text-[12px] font-semibold inline-block">Pendente</span>;
      case 'Concluída':
        return <span className="bg-[#e0f2f1] text-[#0f766e] px-3 py-1 rounded-md text-[12px] font-semibold inline-block">Concluída</span>;
      case 'Cancelada':
        return <span className="bg-[#fee2e2] text-[#b91c1c] px-3 py-1 rounded-md text-[12px] font-semibold inline-block">Cancelada</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-[12px] font-semibold inline-block">{status}</span>;
    }
  };

  return (
    // px-4 no mobile para não colar nos bordos do telemóvel
    <div className="max-w-6xl w-full text-[#0f172a] px-4 py-6 md:px-0">
      
  
      {/* Container Principal Branco */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
        
        {/* Navegação por Tabs (Scroll horizontal garantido no mobile com scrollbar-hide) */}
        <div className="border-b border-gray-100 px-5 pt-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <div className="flex gap-6 md:gap-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                // text-[13px] no mobile para caberem mais tabs
                className={`pb-4 pt-3 text-[13px] md:text-[14px] font-medium transition-colors relative flex-shrink-0 ${
                  activeTab === tab ? 'text-[#2563eb]' : 'text-[#64748b] hover:text-[#0f172a]'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2563eb] rounded-t-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* --- VERSÃO DESKTOP (Tabela) --- */}
        {/* Escondida no mobile, visível a partir de md (768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[800px]">
            {/* Cabeçalho da Tabela */}
            <thead>
              <tr className="border-b border-gray-50 bg-white">
                <th className="w-[30%] text-left text-[13px] font-semibold text-[#64748b] px-6 py-4">Cliente / Serviço</th>
                <th className="w-[25%] text-left text-[13px] font-semibold text-[#64748b] px-6 py-4">Período</th>
                <th className="w-[15%] text-left text-[13px] font-semibold text-[#64748b] px-6 py-4">Valor</th>
                <th className="w-[15%] text-left text-[13px] font-semibold text-[#64748b] px-6 py-4">Status</th>
                <th className="w-[15%] text-center text-[13px] font-semibold text-[#64748b] px-6 py-4">Ações</th>
              </tr>
            </thead>
            {/* Corpo da Tabela */}
            <tbody>
              {reservas.map((reserva) => (
                <tr key={reserva.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img src={reserva.imagem} alt={reserva.nome} className="w-[42px] h-[42px] rounded-lg object-cover border border-gray-200 flex-shrink-0" />
                      <div className="flex flex-col justify-center">
                        <span className="text-[14px] font-bold text-[#0f172a]">{reserva.nome}</span>
                        <span className="text-[13px] text-[#64748b] mt-0.5">{reserva.servico}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[14px] font-medium text-[#0f172a]">{reserva.periodo}</td>
                  <td className="px-6 py-4 text-[14px] font-bold text-[#0f172a]">{reserva.valor}</td>
                  <td className="px-6 py-4">{getStatusBadge(reserva.status)}</td>
                  <td className="px-6 py-4 text-center">
                    <button className="text-[14px] font-semibold text-[#2563eb] hover:underline px-3 py-1 rounded-md hover:bg-blue-50 transition-colors">Ver</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- VERSÃO MOBILE (Cartões) --- */}
        {/* Visível no mobile, escondida a partir de md (768px) */}
        <div className="md:hidden flex flex-col">
          {reservas.map((reserva) => (
            <div key={reserva.id} className="p-5 border-b border-gray-100 flex flex-col gap-4 active:bg-gray-50">
              
              {/* Linha 1: Info Principal (Foto, Nome, Serviço e Valor) */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img 
                    src={reserva.imagem} 
                    alt={reserva.nome} 
                    className="w-[48px] h-[48px] rounded-lg object-cover border border-gray-200 flex-shrink-0" 
                  />
                  <div className="flex flex-col">
                    <span className="text-[14px] font-bold text-[#0f172a]">{reserva.nome}</span>
                    <span className="text-[12px] text-[#64748b] mt-0.5">{reserva.servico}</span>
                  </div>
                </div>
                {/* Valor em destaque no topo direito */}
                <span className="text-[14px] font-bold text-[#0f172a] text-right whitespace-nowrap">
                  {reserva.valor}
                </span>
              </div>

              {/* Linha 2: Detalhes Secundários (Período e Status) */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="text-[12px] text-[#64748b] font-medium">
                  <span className="block text-gray-400 text-[11px] mb-0.5">Período</span>
                  {reserva.periodo}
                </div>
                {/* Badge de status alinhado à direita */}
                <div className="flex-shrink-0">
                  {getStatusBadge(reserva.status)}
                </div>
              </div>

              {/* Linha 3: Botão de Ação (Largo para facilitar o toque) */}
              <div className="mt-1">
                <button className="w-full bg-white border border-gray-200 text-[14px] font-semibold text-[#2563eb] py-2.5 rounded-lg active:bg-blue-50 active:border-blue-200 transition-colors shadow-sm">
                  Ver detalhes da reserva
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Rodapé (Adaptado para mobile) */}
        <div className="px-5 py-5 md:px-6">
          <a href="#" className="text-[14px] text-[#2563eb] font-semibold hover:underline block text-center md:text-left">
            Ver todas as reservas antigas
          </a>
        </div>

      </div>

    </div>
  );
}