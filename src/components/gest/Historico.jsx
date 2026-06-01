import React, { useState, useEffect } from 'react';

export default function Historico() {
  const [pagamentos, setPagamentos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPagamentos();
  }, []);

  const fetchPagamentos = async () => {
    try {
      const savedUser = localStorage.getItem('user');
      if (!savedUser) return;
      
      const user = JSON.parse(savedUser);
      const response = await fetch(`https://welovepalop.com/api/dashboard/reservas_recentes.php?usuario_id=${user.id}`);
      const data = await response.json();
      
      if (data.success && data.data?.reservas) {
        const pagos = data.data.reservas.map((reserva, index) => ({
          id: reserva.codigo || `#RES${String(index + 1).padStart(4, '0')}`,
          data: reserva.created_at ? new Date(reserva.created_at).toLocaleDateString('pt-PT') : 'Data não informada',
          desc: reserva.item,
          periodo: reserva.data || 'Período não informado',
          bruto: parseFloat(reserva.valor) || 0,
          liquido: (parseFloat(reserva.valor) || 0) * 0.9,
          status: reserva.status === 'Confirmada' ? 'Pago' : 'Pendente'
        }));
        setPagamentos(pagos);
      } else {
        setPagamentos([
          { id: '#RES1234', data: '10 Mai 2024', desc: 'Apartamento Vista Mar', periodo: '12 - 15 Mai', bruto: 16500, liquido: 14850, status: 'Pago' },
          { id: '#RES1235', data: '08 Mai 2024', desc: 'Toyota Hilux', periodo: '10 - 12 Mai', bruto: 8000, liquido: 7200, status: 'Pendente' },
          { id: '#RES1236', data: '05 Mai 2024', desc: 'Mergulho com Tartarugas', periodo: '08 Mai', bruto: 5000, liquido: 4500, status: 'Pago' },
        ]);
      }
    } catch (error) {
      console.error('Erro ao buscar pagamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl w-full text-[#1a1f36] px-4 py-6 md:px-0 flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl w-full text-[#1a1f36] px-4 py-6 md:px-0">
      <h1 className="text-[24px] font-bold mb-6">Histórico de Pagamentos</h1>
      
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase">Data</th>
                <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase">Descrição</th>
                <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase">Reserva</th>
                <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase">Bruto</th>
                <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase">Líquido (10%)</th>
                <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase">Status</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pagamentos.map((pag, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-5 text-[13px] font-bold">{pag.data}</td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-[14px] font-bold">{pag.desc}</span>
                      <span className="text-[12px] text-gray-500">{pag.periodo}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-[13px] font-bold text-[#2563eb]">{pag.id}</td>
                  <td className="px-6 py-5 text-[14px] font-bold">{pag.bruto.toLocaleString()} CVE</td>
                  <td className="px-6 py-5 text-[14px] font-bold text-green-600">{pag.liquido.toLocaleString()} CVE</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-md text-[11px] font-bold ${
                      pag.status === 'Pago' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {pag.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}