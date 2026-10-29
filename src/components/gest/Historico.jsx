import { useTranslation } from 'react-i18next';
import usePaginacao from '../../hooks/usePaginacao';
import PaginacaoLista from './PaginacaoLista';
import HeaderGestao from './HeaderGestao';
// src/components/gest/Historico.jsx
import React, { useState, useEffect } from 'react';
import { Loader2, Home, Car, Compass, Award, Filter } from 'lucide-react';

export default function Historico() {
  const { t } = useTranslation();
  const [pagamentos, setPagamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState({
    anfitrion: false,
    guia: false,
    proprietarioVeiculos: false
  });
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [resumo, setResumo] = useState({
    totalBruto: 0,
    totalLiquido: 0,
    totalPago: 0,
    totalPendente: 0
  });

  // Obter ID do utilizador de forma segura (JWT ou LocalStorage)
  const obterUserId = () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('morabeza_token');
      if (token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const parsed = JSON.parse(jsonPayload);
        if (parsed.data?.id) return parsed.data.id;
        if (parsed.id) return parsed.id;
      }
      const savedUser = localStorage.getItem('user') || localStorage.getItem('morabeza_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        return user.id;
      }
    } catch (e) {
      console.error('Erro ao obter ID:', e);
    }
    return null;
  };

  useEffect(() => {
    fetchHistorico();
  }, []);

  const fetchHistorico = async () => {
    setLoading(true);
    try {
      const userId = obterUserId();
      if (!userId) {
        setLoading(false);
        return;
      }
      
      // Buscar roles do usuário
      const rolesResponse = await fetch(`https://welovepalop.com/api/usuarios/listar_roles.php?usuario_id=${userId}`);
      const rolesData = await rolesResponse.json();
      
      let isAnfitrion = false;
      let isGuia = false;
      let isProprietarioVeiculos = false;
      
      if (rolesData.success && rolesData.roles) {
        isAnfitrion = rolesData.roles.some(r => r.name === 'anfitrion' && r.status === 'approved');
        isGuia = rolesData.roles.some(r => r.name === 'guia_experiencias' && r.status === 'approved');
        isProprietarioVeiculos = rolesData.roles.some(r => r.name === 'proprietario_veiculos' && r.status === 'approved');
        
        setUserRoles({
          anfitrion: isAnfitrion,
          guia: isGuia,
          proprietarioVeiculos: isProprietarioVeiculos
        });
      }
      
      // Buscar reservas
      const response = await fetch(`https://welovepalop.com/api/dashboard/reservas_recentes.php?usuario_id=${userId}`);
      const data = await response.json();
      
      let pagamentosList = [];
      let totalBruto = 0;
      let totalLiquido = 0;
      let totalPago = 0;
      let totalPendente = 0;
      
      if (data.success && data.data?.reservas) {
        // Filtrar reservas apenas dos tipos que o usuário tem role
        const reservasFiltradas = data.data.reservas.filter(reserva => {
          if (reserva.tipo === 'alojamento' && !isAnfitrion) return false;
          if (reserva.tipo === 'carro' && !isProprietarioVeiculos) return false;
          if (reserva.tipo === 'experiencia' && !isGuia) return false;
          return true;
        });
        
        pagamentosList = reservasFiltradas.map((reserva) => {
          const valorBruto = parseFloat(reserva.valor) || 0;
          const valorLiquido = valorBruto * 0.9;
          const statusPagamento = reserva.status === 'Confirmada' ? 'Pago' : 'Pendente';
          
          if (statusPagamento === 'Pago') {
            totalPago += valorLiquido;
          } else {
            totalPendente += valorLiquido;
          }
          totalBruto += valorBruto;
          totalLiquido += valorLiquido;
          
          return {
            id: reserva.codigo || `#RES${String(reserva.id)}`,
            data: reserva.created_at ? new Date(reserva.created_at).toLocaleDateString('pt-PT') : 'Data não informada',
            desc: reserva.item_nome,
            periodo: reserva.periodo || 'Período não informado',
            tipo: reserva.tipo,
            bruto: valorBruto,
            liquido: valorLiquido,
            status: statusPagamento
          };
        });
      }
      
      setPagamentos(pagamentosList);
      setResumo({
        totalBruto,
        totalLiquido,
        totalPago,
        totalPendente
      });
      
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTipoIcone = (tipo) => {
    switch(tipo) {
      case 'alojamento': return <Home size={14} className="text-blue-500" />;
      case 'carro': return <Car size={14} className="text-green-500" />;
      case 'experiencia': return <Compass size={14} className="text-purple-500" />;
      default: return null;
    }
  };

  // Filtrar pagamentos por tipo
  const pagamentosFiltrados = filtroTipo === 'todos' 
    ? pagamentos 
    : pagamentos.filter(p => p.tipo === filtroTipo);

  const hasAnyRole = userRoles.anfitrion || userRoles.guia || userRoles.proprietarioVeiculos;

  const paginacao = usePaginacao(pagamentosFiltrados, filtroTipo);

  if (loading) {
    return (
      <div className="max-w-6xl w-full text-[#1a1f36] px-4 py-6 md:px-0 flex justify-center items-center h-96">
        <Loader2 size={48} className="animate-spin text-blue-900" />
      </div>
    );
  }

  if (!hasAnyRole) {
    return (
      <div className="max-w-6xl w-full text-[#1a1f36] px-4 py-6 md:px-0">
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award size={40} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Acesso Restrito</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Você não tem permissão para aceder ao histórico de pagamentos.
            É necessário ter uma das seguintes funções aprovadas:
            Anfitrião, Guia de Experiências ou Proprietário de Veículos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl w-full text-[#1a1f36] px-4 py-6 md:px-0">
      <HeaderGestao secao="historico" className="mb-6" />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-[11px] font-bold text-gray-400 mb-1">Total Bruto</p>
          <p className="text-[22px] font-bold text-gray-800">{resumo.totalBruto.toLocaleString()} CVE</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-[11px] font-bold text-gray-400 mb-1">Total Líquido (após 10%)</p>
          <p className="text-[22px] font-bold text-green-600">{resumo.totalLiquido.toLocaleString()} CVE</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-[11px] font-bold text-gray-400 mb-1">Já Recebido</p>
          <p className="text-[22px] font-bold text-blue-600">{resumo.totalPago.toLocaleString()} CVE</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-[11px] font-bold text-gray-400 mb-1">A Receber</p>
          <p className="text-[22px] font-bold text-orange-600">{resumo.totalPendente.toLocaleString()} CVE</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <span className="text-[12px] font-medium text-gray-500">Filtrar por tipo:</span>
        </div>
        <button
          onClick={() => setFiltroTipo('todos')}
          className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
            filtroTipo === 'todos' 
              ? 'bg-blue-900 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Todos
        </button>
        {userRoles.anfitrion && (
          <button
            onClick={() => setFiltroTipo('alojamento')}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors flex items-center gap-1 ${
              filtroTipo === 'alojamento' 
                ? 'bg-blue-900 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Home size={12} /> Alojamentos
          </button>
        )}
        {userRoles.proprietarioVeiculos && (
          <button
            onClick={() => setFiltroTipo('carro')}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors flex items-center gap-1 ${
              filtroTipo === 'carro' 
                ? 'bg-blue-900 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Car size={12} /> Carros
          </button>
        )}
        {userRoles.guia && (
          <button
            onClick={() => setFiltroTipo('experiencia')}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors flex items-center gap-1 ${
              filtroTipo === 'experiencia' 
                ? 'bg-blue-900 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Compass size={12} /> Experiências
          </button>
        )}
      </div>
      
      <div data-lista-paginada className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {pagamentosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Award size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500">Nenhum pagamento encontrado</p>
            <p className="text-xs text-gray-400 mt-1">
              {filtroTipo !== 'todos' ? 'Nenhum pagamento para o tipo selecionado' : 'Os seus pagamentos aparecerão aqui'}
            </p>
          </div>
        ) : (
          <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[800px] text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase">Data</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase">Descrição</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase">Reserva</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase">Bruto</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase">Líquido (90%)</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginacao.items.map((pag, i) => (
                  <tr key={i} className="even:bg-slate-50/30 hover:bg-blue-50/40 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap text-[13px] font-medium tabular-nums">{pag.data}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {getTipoIcone(pag.tipo)}
                        <div className="flex flex-col">
                          <span className="text-[14px] font-bold">{pag.desc}</span>
                          <span className="text-[12px] text-gray-500">{pag.periodo}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[13px] font-bold text-[#2563eb]">{pag.id}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-[14px] font-semibold tabular-nums">{pag.bruto.toLocaleString()} CVE</td>
                    <td className="px-5 py-4 whitespace-nowrap text-[14px] font-semibold tabular-nums text-green-600">{pag.liquido.toLocaleString()} CVE</td>
                    <td className="px-5 py-4">
                      <span className={`px-3 py-1 rounded-md text-[11px] font-bold ${
                        pag.status === 'Pago' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {pag.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="divide-y divide-slate-100 md:hidden">
            {paginacao.items.map((pag, index) => <article key={`${pag.id}-${index}`} className="space-y-3 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium tabular-nums text-slate-500">{pag.data}</span>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${pag.status === 'Pago' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{pag.status}</span>
              </div>
              <div className="flex items-start gap-2"><span className="mt-0.5 shrink-0">{getTipoIcone(pag.tipo)}</span><div className="min-w-0"><h3 className="text-sm font-bold text-slate-900">{pag.desc}</h3><p className="mt-1 text-xs text-slate-500">{pag.periodo}</p></div></div>
              <p className="break-all text-xs font-medium text-blue-600">{pag.id}</p>
              <dl className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
                <div><dt className="text-xs text-slate-500">{t('lista_bruto')}</dt><dd className="mt-1 text-sm font-semibold tabular-nums text-slate-800">{pag.bruto.toLocaleString()} CVE</dd></div>
                <div><dt className="text-xs text-slate-500">{t('lista_liquido')}</dt><dd className="mt-1 text-sm font-semibold tabular-nums text-green-600">{pag.liquido.toLocaleString()} CVE</dd></div>
              </dl>
            </article>)}
          </div>
          <PaginacaoLista {...paginacao} />
          </>
        )}
      </div>
      
      <div className="mt-6 bg-gray-50 rounded-xl p-4 border border-gray-100">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-blue-600 font-bold text-sm">%</span>
          </div>
          <div>
            <p className="text-[12px] text-gray-600">
              <span className="font-bold">Nota:</span> O valor líquido apresentado já tem deduzida a comissão de 10% da Morabeza Stay. 
              Os pagamentos são processados após a confirmação do check-in pelo hóspede.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}