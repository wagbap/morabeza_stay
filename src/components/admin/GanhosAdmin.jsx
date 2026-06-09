  import React, { useState, useEffect } from 'react';
  import { DollarSign, Wallet, ArrowUpRight, Landmark, Loader2 } from 'lucide-react';

  const GanhosAdmin = () => {
    const [financeiro, setFinanceiro] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      fetch('/api/admin_earnings.php')
        .then(res => res.json())
        .then(data => { if (data.status === 'success') setFinanceiro(data); setLoading(false); })
        .catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="py-20 flex justify-center items-center gap-2 text-gray-600"><Loader2 className="animate-spin text-[#003580]" /> A calcular fluxos financeiros...</div>;

    const { resumo, historico } = financeiro;

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-[#003580]">Controlo de Ganhos</h1>
          <p className="text-gray-600 mt-1">Demonstração financeira integrada das divisões da Morabeza Stay.</p>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white flex items-center gap-4">
            <div className="bg-blue-50 p-4 rounded-xl text-[#003580]"><Landmark size={24} /></div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Volume Total Bruto</p>
              <p className="text-xl font-bold text-gray-900">CVE {Number(resumo.total).toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white flex items-center gap-4">
            <div className="bg-green-50 p-4 rounded-xl text-green-600"><Wallet size={24} /></div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Comissão Líquida (20%)</p>
              <p className="text-xl font-bold text-green-600">CVE {Number(resumo.comissao).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Quebra por Categoria */}
        <h3 className="text-lg font-semibold text-[#003580] pt-4">Faturamento por Divisão</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/60 p-5 rounded-xl border border-white/60">
            <p className="text-sm font-medium text-gray-500">Alojamentos</p>
            <p className="text-2xl font-bold text-gray-800 mt-2">CVE {Number(resumo.alojamentos).toLocaleString()}</p>
          </div>
          <div className="bg-white/60 p-5 rounded-xl border border-white/60">
            <p className="text-sm font-medium text-gray-500">Rent-a-car</p>
            <p className="text-2xl font-bold text-gray-800 mt-2">CVE {Number(resumo.carros).toLocaleString()}</p>
          </div>
          <div className="bg-white/60 p-5 rounded-xl border border-white/60">
            <p className="text-sm font-medium text-gray-500">Experiências</p>
            <p className="text-2xl font-bold text-gray-800 mt-2">CVE {Number(resumo.experiencias).toLocaleString()}</p>
          </div>
        </div>

        {/* Histórico Transacional */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white overflow-hidden p-6 mt-4">
          <h3 className="text-lg font-semibold text-[#003580] mb-4">Últimas Transações Registadas</h3>
          <div className="divide-y divide-gray-100">
            {historico.map((t, idx) => (
              <div key={idx} className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{t.codigo_reserva}</p>
                  <p className="text-xs text-gray-400">{t.tipo} • {new Date(t.data).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                  <span>CVE {Number(t.valor).toLocaleString()}</span>
                  <ArrowUpRight size={16} className="text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  export default GanhosAdmin;