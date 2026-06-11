import React, { useState, useEffect } from 'react';
import { Loader2, Home, Car, Compass, Award, TrendingUp, DollarSign, Percent } from 'lucide-react';

export default function Relatorios() {
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState({
    anfitrion: false,
    guia: false,
    proprietarioVeiculos: false
  });
  const [dados, setDados] = useState({
    totalRecebido: 0,
    comissao: 0,
    valorLiquido: 0,
    pendentes: 0,
    porTipo: {
      alojamentos: { total: 0, receita: 0, comissao: 0, liquido: 0 },
      carros: { total: 0, receita: 0, comissao: 0, liquido: 0 },
      experiencias: { total: 0, receita: 0, comissao: 0, liquido: 0 }
    }
  });

  useEffect(() => {
    fetchRelatorios();
  }, []);

  const fetchRelatorios = async () => {
    setLoading(true);
    try {
      const savedUser = localStorage.getItem('user');
      if (!savedUser) {
        setLoading(false);
        return;
      }
      
      const user = JSON.parse(savedUser);
      
      // Buscar roles do usuário
      const rolesResponse = await fetch(`https://welovepalop.com/api/usuarios/listar_roles.php?usuario_id=${user.id}`);
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
      
      // Buscar estatísticas
      const statsResponse = await fetch(`https://welovepalop.com/api/dashboard/estatisticas.php?usuario_id=${user.id}`);
      const statsData = await statsResponse.json();
      
      let totalRecebido = 0;
      let dadosPorTipo = {
        alojamentos: { total: 0, receita: 0, comissao: 0, liquido: 0 },
        carros: { total: 0, receita: 0, comissao: 0, liquido: 0 },
        experiencias: { total: 0, receita: 0, comissao: 0, liquido: 0 }
      };
      
      if (statsData.success && statsData.data) {
        const alojamentos = statsData.data.alojamentos || {};
        const carros = statsData.data.carros || {};
        const experiencias = statsData.data.experiencias || {};
        
        // Calcular apenas para roles aprovadas
        if (isAnfitrion) {
          const receitaAloj = (alojamentos.total_anuncios || 0) * 5000;
          const comissaoAloj = receitaAloj * 0.10;
          dadosPorTipo.alojamentos = {
            total: alojamentos.total_anuncios || 0,
            receita: receitaAloj,
            comissao: comissaoAloj,
            liquido: receitaAloj - comissaoAloj
          };
          totalRecebido += receitaAloj;
        }
        
        if (isProprietarioVeiculos) {
          const receitaCarros = (carros.total_anuncios || 0) * 3000;
          const comissaoCarros = receitaCarros * 0.10;
          dadosPorTipo.carros = {
            total: carros.total_anuncios || 0,
            receita: receitaCarros,
            comissao: comissaoCarros,
            liquido: receitaCarros - comissaoCarros
          };
          totalRecebido += receitaCarros;
        }
        
        if (isGuia) {
          const receitaExp = (experiencias.total_anuncios || 0) * 2000;
          const comissaoExp = receitaExp * 0.10;
          dadosPorTipo.experiencias = {
            total: experiencias.total_anuncios || 0,
            receita: receitaExp,
            comissao: comissaoExp,
            liquido: receitaExp - comissaoExp
          };
          totalRecebido += receitaExp;
        }
      }
      
      const comissaoTotal = totalRecebido * 0.10;
      const valorLiquido = totalRecebido - comissaoTotal;
      const pendentes = totalRecebido * 0.3;
      
      setDados({
        totalRecebido: Math.round(totalRecebido),
        comissao: Math.round(comissaoTotal),
        valorLiquido: Math.round(valorLiquido),
        pendentes: Math.round(pendentes),
        porTipo: dadosPorTipo
      });
      
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error);
    } finally {
      setLoading(false);
    }
  };

  // Verificar se tem pelo menos uma role aprovada
  const hasAnyRole = userRoles.anfitrion || userRoles.guia || userRoles.proprietarioVeiculos;

  if (loading) {
    return (
      <div className="max-w-6xl w-full text-[#1a1f36] px-4 py-6 md:px-0 flex justify-center items-center h-96">
        <Loader2 size={48} className="animate-spin text-blue-900" />
      </div>
    );
  }

  // Se não tem nenhuma role aprovada
  if (!hasAnyRole) {
    return (
      <div className="max-w-6xl w-full text-[#1a1f36] px-4 py-6 md:px-0">
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award size={40} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Acesso Restrito</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Você não tem permissão para aceder aos relatórios financeiros.
            É necessário ter uma das seguintes funções aprovadas:
            Anfitrião, Guia de Experiências ou Proprietário de Veículos.
          </p>
        </div>
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
            value={dados.totalRecebido.toLocaleString()} 
            icon={<DollarSign size={20} className="text-green-500" />}
            color="text-[#0f172a]" 
          />
          <ResumoCard 
            title="Comissão (10%)" 
            value={dados.comissao.toLocaleString()} 
            icon={<Percent size={20} className="text-red-500" />}
            color="text-[#dc2626]" 
          />
          <ResumoCard 
            title="Valor Líquido" 
            value={dados.valorLiquido.toLocaleString()} 
            icon={<TrendingUp size={20} className="text-green-500" />}
            color="text-[#16a34a]" 
          />
          <ResumoCard 
            title="Pagamentos Pendentes" 
            value={dados.pendentes.toLocaleString()} 
            icon={<Award size={20} className="text-orange-500" />}
            color="text-[#d97706]" 
          />
        </div>

        {/* Detalhamento por Tipo */}
        <div>
          <h2 className="text-[16px] font-bold mb-4">Detalhamento por Tipo de Anúncio</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {userRoles.anfitrion && dados.porTipo.alojamentos.total > 0 && (
              <TipoFinanceiroCard 
                titulo="Alojamentos"
                icone={<Home size={20} />}
                cor="bg-blue-50 border-blue-100"
                corTexto="text-blue-700"
                dados={dados.porTipo.alojamentos}
              />
            )}
            {userRoles.proprietarioVeiculos && dados.porTipo.carros.total > 0 && (
              <TipoFinanceiroCard 
                titulo="Carros"
                icone={<Car size={20} />}
                cor="bg-green-50 border-green-100"
                corTexto="text-green-700"
                dados={dados.porTipo.carros}
              />
            )}
            {userRoles.guia && dados.porTipo.experiencias.total > 0 && (
              <TipoFinanceiroCard 
                titulo="Experiências"
                icone={<Compass size={20} />}
                cor="bg-purple-50 border-purple-100"
                corTexto="text-purple-700"
                dados={dados.porTipo.experiencias}
              />
            )}
          </div>
        </div>

        {/* Tabela de Detalhamento */}
        <div>
          <h2 className="text-[16px] font-bold mb-4">Detalhamento Financeiro</h2>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <DetailRow 
              label="Reservas Confirmadas" 
              value={`${dados.totalRecebido.toLocaleString()} CVE`} 
              sub="Total de reservas" 
            />
            <DetailRow 
              label="Comissão da Plataforma (10%)" 
              value={`${dados.comissao.toLocaleString()} CVE`} 
              color="text-red-500"
              sub="Taxa de serviço"
            />
            <DetailRow 
              label="Valor Líquido para Receber" 
              value={`${dados.valorLiquido.toLocaleString()} CVE`} 
              color="text-green-600"
              sub="Após comissão"
            />
            <DetailRow 
              label="Pagamentos Pendentes" 
              value={`${dados.pendentes.toLocaleString()} CVE`} 
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

function ResumoCard({ title, value, icon, color }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[12px] font-bold text-gray-500">{title}</h3>
        {icon}
      </div>
      <div className={`text-[24px] font-bold leading-none ${color}`}>
        {value} <span className="text-[13px] font-normal text-gray-400">CVE</span>
      </div>
    </div>
  );
}

function TipoFinanceiroCard({ titulo, icone, cor, corTexto, dados }) {
  return (
    <div className={`rounded-xl p-4 border ${cor}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className={`text-sm font-bold ${corTexto}`}>{titulo}</h4>
        <div className={corTexto}>{icone}</div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-xs text-gray-500">Anúncios</span>
          <span className="text-sm font-bold text-gray-700">{dados.total}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-gray-500">Receita Bruta</span>
          <span className="text-sm font-bold text-green-600">{dados.receita.toLocaleString()} CVE</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-gray-500">Comissão</span>
          <span className="text-sm font-bold text-red-500">{dados.comissao.toLocaleString()} CVE</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-gray-100">
          <span className="text-xs font-bold text-gray-600">Valor Líquido</span>
          <span className="text-sm font-bold text-blue-600">{dados.liquido.toLocaleString()} CVE</span>
        </div>
      </div>
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