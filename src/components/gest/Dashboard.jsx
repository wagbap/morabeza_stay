import React from 'react';
import { Star, ArrowUpRight } from 'lucide-react';

export default function Dashboard() {
  const reservasRecentes = [
    {
      id: 1,
      nome: 'Maria Fernandes',
      imagem: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
      item: 'Alojamento - Praia',
      data: '12 - 15 Mai 2024',
      status: 'Confirmada',
      valor: '16.500 CVE'
    },
    {
      id: 2,
      nome: 'Carlos Mendes',
      imagem: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop',
      item: 'Carro - Toyota Hilux',
      data: '10 - 12 Mai 2024',
      status: 'Pendente',
      valor: '8.000 CVE'
    },
    {
      id: 3,
      nome: 'Ana Costa',
      imagem: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
      item: 'Experiência - Tour',
      data: '08 Mai 2024',
      status: 'Confirmada',
      valor: '5.000 CVE'
    }
  ];

  return (
    <div className="max-w-6xl w-full text-[#0f172a] px-4 sm:px-0">
      
      {/* 1. Primeira Linha: Cards Principais */}
      {/* grid-cols-1 no mobile, sm:grid-cols-2 no tablet, lg:grid-cols-4 no desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <h3 className="text-[13px] font-bold mb-3">Anúncios Ativos</h3>
            <span className="text-[28px] font-bold leading-none">12</span>
          </div>
          <a href="#" className="text-[13px] text-[#2563eb] font-medium hover:underline mt-4 inline-block">
            Ver todos
          </a>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <h3 className="text-[13px] font-bold mb-3">Reservas Confirmadas</h3>
            <span className="text-[28px] font-bold leading-none">18</span>
          </div>
          <a href="#" className="text-[13px] text-[#2563eb] font-medium hover:underline mt-4 inline-block">
            Ver todas
          </a>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <h3 className="text-[13px] font-bold mb-3">Ganhos (Este mês)</h3>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-[28px] font-bold leading-none">96.500</span>
              <span className="text-[15px] font-bold">CVE</span>
            </div>
          </div>
          <a href="#" className="text-[13px] text-[#2563eb] font-medium hover:underline mt-4 inline-block">
            Ver detalhes
          </a>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <h3 className="text-[13px] font-bold mb-2">Avaliação Média</h3>
            <div className="flex flex-col">
              <span className="text-[28px] font-bold leading-none mb-1">4.8</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4].map((star) => (
                  <Star key={star} className="w-[16px] h-[16px] fill-[#facc15] text-[#facc15]" />
                ))}
                <Star className="w-[16px] h-[16px] fill-[#e2e8f0] text-[#e2e8f0]" />
              </div>
            </div>
          </div>
          <a href="#" className="text-[13px] text-[#2563eb] font-medium hover:underline mt-3 inline-block">
            Ver avaliações
          </a>
        </div>

      </div>

      {/* 2. Segunda Linha: Desempenho */}
      <div className="mb-6">
        <h2 className="text-[14px] font-bold mb-3">Desempenho (Últimos 30 dias)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <h3 className="text-[13px] font-bold mb-4">Visualizações</h3>
            <div className="flex items-end justify-between">
              <span className="text-[24px] font-bold leading-none">2.450</span>
              <div className="flex items-center">
                <span className="text-[12px] font-bold text-[#10b981]">+18%</span>
                <div className="ml-1 bg-[#0ea5e9] rounded-[4px] p-[2px]">
                  <ArrowUpRight className="w-[10px] h-[10px] text-white" strokeWidth={3} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <h3 className="text-[13px] font-bold mb-4">Cliques</h3>
            <div className="flex items-end justify-between">
              <span className="text-[24px] font-bold leading-none">320</span>
              <div className="flex items-center">
                <span className="text-[12px] font-bold text-[#10b981]">+12%</span>
                <div className="ml-1 bg-[#0ea5e9] rounded-[4px] p-[2px]">
                  <ArrowUpRight className="w-[10px] h-[10px] text-white" strokeWidth={3} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <h3 className="text-[13px] font-bold mb-4">Taxa de Reserva</h3>
            <div className="flex items-end justify-between">
              <span className="text-[24px] font-bold leading-none">13%</span>
              <div className="flex items-center">
                <span className="text-[12px] font-bold text-[#10b981]">+5%</span>
                <div className="ml-1 bg-[#0ea5e9] rounded-[4px] p-[2px]">
                  <ArrowUpRight className="w-[10px] h-[10px] text-white" strokeWidth={3} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <h3 className="text-[13px] font-bold mb-4">Receita Total</h3>
            <div className="flex items-end justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-[24px] font-bold leading-none">256.000</span>
                <span className="text-[12px] font-bold">CVE</span>
              </div>
              <div className="flex items-center">
                <span className="text-[12px] font-bold text-[#10b981]">+22%</span>
                <div className="ml-1 bg-[#0ea5e9] rounded-[4px] p-[2px]">
                  <ArrowUpRight className="w-[10px] h-[10px] text-white" strokeWidth={3} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Terceira Linha: Reservas Recentes */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-50">
          <h2 className="text-[14px] font-bold">Reservas Recentes</h2>
          <a href="#" className="text-[13px] text-[#2563eb] font-medium hover:underline">
            Ver todas
          </a>
        </div>

        <div className="flex flex-col">
          {reservasRecentes.map((reserva, index) => (
            <div 
              key={reserva.id} 
              // Flex-col no mobile, flex-row no lg (desktop)
              className={`flex flex-col lg:flex-row lg:items-center justify-between px-5 py-4 lg:py-3 hover:bg-gray-50/50 transition-colors gap-3 lg:gap-0 ${index !== reservasRecentes.length - 1 ? 'border-b border-gray-50' : ''}`}
            >
              
              {/* Header Mobile: Cliente + Status */}
              <div className="flex items-center justify-between w-full lg:w-[25%]">
                <div className="flex items-center gap-3">
                  <img 
                    src={reserva.imagem} 
                    alt={reserva.nome} 
                    className="w-[36px] h-[36px] rounded-lg object-cover border border-gray-200 flex-shrink-0"
                  />
                  <span className="text-[13px] font-bold">{reserva.nome}</span>
                </div>
                {/* Status visível apenas no mobile, alinhado no topo */}
                <div className="lg:hidden">
                  {reserva.status === 'Confirmada' ? (
                    <span className="bg-[#e6f4ea] text-[#137333] px-3 py-1 rounded-[5px] text-[12px] font-medium inline-block">
                      Confirmada
                    </span>
                  ) : (
                    <span className="bg-[#fef3c7] text-[#b45309] px-3 py-1 rounded-[5px] text-[12px] font-medium inline-block">
                      Pendente
                    </span>
                  )}
                </div>
              </div>

              {/* Informações Secundárias */}
              <div className="flex flex-col lg:flex-row lg:items-center w-full lg:w-[75%] pl-[48px] lg:pl-0 gap-1 lg:gap-0">
                
                <div className="w-full lg:w-[33%] text-[13px] font-medium text-[#475569]">
                  {reserva.item}
                </div>

                <div className="w-full lg:w-[27%] text-[13px] font-medium text-[#475569]">
                  {reserva.data}
                </div>

                {/* Status visível apenas no desktop */}
                <div className="hidden lg:block w-[20%]">
                  {reserva.status === 'Confirmada' ? (
                    <span className="bg-[#e6f4ea] text-[#137333] px-3 py-1 rounded-[5px] text-[12px] font-medium inline-block">
                      Confirmada
                    </span>
                  ) : (
                    <span className="bg-[#fef3c7] text-[#b45309] px-3 py-1 rounded-[5px] text-[12px] font-medium inline-block">
                      Pendente
                    </span>
                  )}
                </div>

                <div className="w-full lg:w-[20%] text-left lg:text-right text-[14px] lg:text-[13px] font-bold mt-2 lg:mt-0 text-[#2563eb] lg:text-[#0f172a]">
                  {reserva.valor}
                </div>

              </div>

            </div>
          ))}
        </div>

      </div>

    </div>
  );
}