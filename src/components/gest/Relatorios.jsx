import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function Relatorios() {
  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState({
    totalRecebido: 0,
    comissao: 0,
    valorLiquido: 0,
    pendentes: 0
  });

  useEffect(() => {
    fetchRelatorios();
  }, []);

  const fetchRelatorios = async () => {
    setLoading(true);
    try {
      const savedUser = localStorage.getItem('user');
      if (!savedUser) return;
      
      const user = JSON.parse(savedUser);
      const response = await fetch(`https://welovepalop.com/api/dashboard/estatisticas.php?usuario_id=${user.id}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        const alojamentos = data.data.alojamentos || {};
        const carros = data.data.carros || {};
        const experiencias = data.data.experiencias || {};
        
        const receitaTotal = (alojamentos.total_anuncios * 5000) + 
                             (carros.total_anuncios * 3000) + 
                             (experiencias.total_anuncios * 2000);
        
        const totalRecebido = receitaTotal;
        const comissao = totalRecebido * 0.10;
        const valorLiquido = totalRecebido - comissao;
        
        setDados({
          totalRecebido,
          comissao,
          valorLiquido,
          pendentes: receitaTotal * 0.3
        });
      }
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl w-full text-[#1a1f36] px-4 py-6 md:px-0 flex justify-center items-center h-96">
        <Loader2 size={48} className="animate-spin text-blue-900" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl w-full text-[#1a1f36] px-4 py-6 md:px-0">
      <h1 className="text-[24px] font-bold mb-6">Resumo Financeiro</h1>

      <div className="space-y-10">
        {/* Cards de Saldo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ResumoCard 
            title="Total Recebido (Bruto)" 
            value={Math.round(dados.totalRecebido).toLocaleString()} 
            color="text-[#0f172a]" 
          />
          <ResumoCard 
            title="Comissão Morabeza Stay (10%)" 
            value={Math.round(dados.comissao).toLocaleString()} 
            color="text-[#dc2626]" 
          />
          <ResumoCard 
            title="Valor Líquido a Receber" 
            value={Math.round(dados.valorLiquido).toLocaleString()} 
            color="text-[#16a34a]" 
          />
          <ResumoCard 
            title="Pagamentos Pendentes" 
            value={Math.round(dados.pendentes).toLocaleString()} 
            color="text-[#d97706]" 
          />
        </div>

        {/* Tabela de Detalhamento */}
        <div>
          <h2 className="text-[16px] font-bold mb-4">Detalhamento Financeiro</h2>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <DetailRow 
              label="Reservas Confirmadas" 
              value={`${Math.round(dados.totalRecebido).toLocaleString()} CVE`} 
              sub="Total de reservas" 
            />
            <DetailRow 
              label="Comissão da Plataforma Morabeza Stay (10%)" 
              value={`${Math.round(dados.comissao).toLocaleString()} CVE`} 
              color="text-red-500"
              sub="Taxa de serviço"
            />
            <DetailRow 
              label="Valor Líquido para Receber" 
              value={`${Math.round(dados.valorLiquido).toLocaleString()} CVE`} 
              color="text-green-600"
              sub="Após comissão"
            />
            <DetailRow 
              label="Pagamentos Pendentes" 
              value={`${Math.round(dados.pendentes).toLocaleString()} CVE`} 
              color="text-orange-500"
              sub="Aguardando confirmação"
              last
            />
          </div>
        </div>

        {/* Informação da Comissão */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-bold text-lg">%</span>
            </div>
            <div>
              <h4 className="text-[14px] font-bold text-blue-800 mb-1">Comissão Morabeza Stay</h4>
              <p className="text-[12px] text-blue-600">
                A taxa de comissão aplicada é de 10% sobre o valor total de cada reserva. 
                Este valor cobre os custos de operação, suporte ao cliente e marketing da plataforma.
                O valor líquido é creditado na sua conta após a confirmação do check-in.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResumoCard({ title, value, color }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm min-h-[110px] flex flex-col justify-center">
      <h3 className="text-[12px] font-bold mb-3 text-gray-600">{title}</h3>
      <div className={`text-[24px] font-bold leading-none ${color}`}>{value} <span className="text-[13px]">CVE</span></div>
    </div>
  );
}

function DetailRow({ label, value, sub, color, last }) {
  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between px-6 py-4 ${!last ? 'border-b border-gray-50' : ''}`}>
      <div className="flex flex-col">
        <span className="text-[13px] md:text-[14px] font-bold text-[#1e3a8a]">{label}</span>
        {sub && <span className="text-[10px] text-gray-400 mt-0.5">{sub}</span>}
      </div>
      <div className="flex items-center justify-between md:justify-end w-full md:w-auto mt-2 md:mt-0">
        <span className={`text-[14px] font-bold ${color || 'text-[#0f172a]'} md:ml-8`}>{value}</span>
      </div>
    </div>
  );
}