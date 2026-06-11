import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Search, Calendar, Car, Home, Compass, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function Calendario() {
  const [activeTab, setActiveTab] = useState('alojamentos');
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [disponibilidade, setDisponibilidade] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [userRoles, setUserRoles] = useState({
    anfitrion: false,
    guia: false,
    proprietarioVeiculos: false
  });
  const [tabsPermitidas, setTabsPermitidas] = useState([]);
  
  const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  // Buscar roles do usuário
  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        const savedUser = localStorage.getItem('morabeza_user') || localStorage.getItem('user');
        if (!savedUser) return;
        
        const user = JSON.parse(savedUser);
        const response = await fetch(`https://welovepalop.com/api/usuarios/listar_roles.php?usuario_id=${user.id}`);
        const data = await response.json();
        
        if (data.success && data.roles) {
          const isAnfitrion = data.roles.some(r => r.name === 'anfitrion' && r.status === 'approved');
          const isGuia = data.roles.some(r => r.name === 'guia_experiencias' && r.status === 'approved');
          const isProprietarioVeiculos = data.roles.some(r => r.name === 'proprietario_veiculos' && r.status === 'approved');
          
          setUserRoles({
            anfitrion: isAnfitrion,
            guia: isGuia,
            proprietarioVeiculos: isProprietarioVeiculos
          });
          
          // Determinar quais tabs mostrar baseado nas roles aprovadas
          const tabs = [];
          if (isAnfitrion) tabs.push('alojamentos');
          if (isProprietarioVeiculos) tabs.push('carros');
          if (isGuia) tabs.push('experiencias');
          
          setTabsPermitidas(tabs);
          
          // Se a tab atual não é permitida, mudar para a primeira permitida
          if (tabs.length > 0 && !tabs.includes(activeTab)) {
            setActiveTab(tabs[0]);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar roles:', error);
      }
    };
    
    fetchUserRoles();
  }, []);

  // Buscar itens baseado na tab ativa e roles
  useEffect(() => {
    if (tabsPermitidas.length > 0 && tabsPermitidas.includes(activeTab)) {
      fetchItems();
    }
  }, [activeTab, tabsPermitidas]);

  // Quando selecionar um item, buscar disponibilidade
  useEffect(() => {
    if (selectedItem) {
      fetchDisponibilidade();
    }
  }, [selectedItem, selectedMonth, selectedYear]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const savedUser = localStorage.getItem('morabeza_user') || localStorage.getItem('user');
      if (!savedUser) {
        setLoading(false);
        return;
      }
      
      const user = JSON.parse(savedUser);
      let url = '';
      
      switch(activeTab) {
        case 'alojamentos':
          url = `https://welovepalop.com/api/get_alojamentos_by_proprietario.php?proprietario_id=${user.id}`;
          break;
        case 'carros':
          url = `https://welovepalop.com/api/get_carros_by_proprietario.php?proprietario_id=${user.id}`;
          break;
        case 'experiencias':
          url = `https://welovepalop.com/api/get_experiencias_by_proprietario.php?proprietario_id=${user.id}`;
          break;
        default:
          url = '';
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      let itemsList = [];
      if (data.success && data.data) {
        itemsList = Array.isArray(data.data) ? data.data : [data.data];
      }
      
      setItems(itemsList);
      if (itemsList.length > 0 && !selectedItem) {
        setSelectedItem(itemsList[0]);
      } else if (itemsList.length === 0) {
        setSelectedItem(null);
      }
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDisponibilidade = async () => {
    if (!selectedItem) return;
    
    setLoading(true);
    try {
      const ano = selectedYear;
      const mes = selectedMonth;
      const ultimoDia = new Date(ano, mes + 1, 0);
      
      const disponibilidadeMap = {};
      
      // Para cada dia do mês, verificar disponibilidade
      for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
        const data = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        
        let url = '';
        if (activeTab === 'alojamentos') {
          url = `https://welovepalop.com/api/disponibilidade/alojamento.php?alojamento_id=${selectedItem.id}&data_checkin=${data}&data_checkout=${data}`;
        } else if (activeTab === 'carros') {
          url = `https://welovepalop.com/api/disponibilidade/carro.php?carro_id=${selectedItem.id}&data_inicio=${data}&data_fim=${data}`;
        } else if (activeTab === 'experiencias') {
          url = `https://welovepalop.com/api/disponibilidade/experiencia.php?experiencia_id=${selectedItem.id}&data=${data}`;
        }
        
        try {
          const response = await fetch(url);
          const result = await response.json();
          
          if (result.success && result.data) {
            disponibilidadeMap[dia] = result.data.disponivel;
          } else {
            disponibilidadeMap[dia] = true;
          }
        } catch (e) {
          disponibilidadeMap[dia] = true;
        }
      }
      
      setDisponibilidade(disponibilidadeMap);
    } catch (error) {
      console.error('Erro ao buscar disponibilidade:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDiasMes = () => {
    const ano = selectedYear;
    const mes = selectedMonth;
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const diaSemanaInicio = primeiroDia.getDay();
    
    let startOffset = diaSemanaInicio === 0 ? 6 : diaSemanaInicio - 1;
    
    const dias = [];
    
    // Dias do mês anterior
    const diasMesAnterior = new Date(ano, mes, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      dias.push({ dia: diasMesAnterior - i, mesAtual: false, status: null });
    }
    
    // Dias do mês atual
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      let status = null;
      
      if (disponibilidade[dia] === true) {
        status = 'Disponível';
      } else if (disponibilidade[dia] === false) {
        status = 'Reservado';
      }
      
      dias.push({ dia, mesAtual: true, status, data: `${ano}-${mes + 1}-${dia}` });
    }
    
    // Dias do mês seguinte
    const totalDias = dias.length;
    const diasFaltando = 42 - totalDias;
    for (let i = 1; i <= diasFaltando; i++) {
      dias.push({ dia: i, mesAtual: false, status: null });
    }
    
    return dias;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Disponível':
        return 'bg-[#dcfce7] text-[#16a34a]';
      case 'Reservado':
        return 'bg-[#fee2e2] text-[#dc2626]';
      case 'Pendente':
        return 'bg-[#fef3c7] text-[#d97706]';
      default:
        return 'bg-white text-[#0f172a]';
    }
  };

  const mudarMes = (direcao) => {
    let novoMes = selectedMonth + direcao;
    let novoAno = selectedYear;
    
    if (novoMes < 0) {
      novoMes = 11;
      novoAno--;
    } else if (novoMes > 11) {
      novoMes = 0;
      novoAno++;
    }
    
    setSelectedMonth(novoMes);
    setSelectedYear(novoAno);
  };

  const irParaHoje = () => {
    const hoje = new Date();
    setSelectedMonth(hoje.getMonth());
    setSelectedYear(hoje.getFullYear());
  };

  const filteredItems = items.filter(item => 
    item.titulo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTipoIcone = (tab) => {
    switch(tab) {
      case 'alojamentos': return <Home size={18} className="text-blue-600" />;
      case 'carros': return <Car size={18} className="text-green-600" />;
      case 'experiencias': return <Compass size={18} className="text-purple-600" />;
      default: return null;
    }
  };

  const getTipoLabel = () => {
    switch(activeTab) {
      case 'alojamentos': return 'Alojamentos';
      case 'carros': return 'Carros';
      case 'experiencias': return 'Experiências';
      default: return '';
    }
  };

  // Se não tem nenhuma role aprovada
  if (tabsPermitidas.length === 0 && !loading) {
    return (
      <div className="max-w-6xl w-full text-[#0f172a] px-4 py-6 md:px-0">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar size={40} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Acesso Restrito</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Você não tem permissão para aceder ao calendário de disponibilidade.
            É necessário ter uma das seguintes funções aprovadas: Anfitrião, Guia de Experiências ou Proprietário de Veículos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl w-full text-[#0f172a] px-4 py-6 md:px-0">
      
      <h1 className="text-[22px] font-bold mb-6">Calendário de Disponibilidade</h1>

      {/* Tabs - Apenas as roles aprovadas */}
      {tabsPermitidas.length > 0 && (
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {tabsPermitidas.includes('alojamentos') && (
            <button
              onClick={() => setActiveTab('alojamentos')}
              className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'alojamentos'
                  ? 'text-blue-900 border-b-2 border-blue-900'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Home size={16} /> Alojamentos
            </button>
          )}
          {tabsPermitidas.includes('carros') && (
            <button
              onClick={() => setActiveTab('carros')}
              className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'carros'
                  ? 'text-blue-900 border-b-2 border-blue-900'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Car size={16} /> Carros
            </button>
          )}
          {tabsPermitidas.includes('experiencias') && (
            <button
              onClick={() => setActiveTab('experiencias')}
              className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'experiencias'
                  ? 'text-blue-900 border-b-2 border-blue-900'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Compass size={16} /> Experiências
            </button>
          )}
        </div>
      )}

      {/* Controles de Topo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => mudarMes(-1)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 shadow-sm bg-white"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-[16px] md:text-[18px] font-bold text-[#0f172a] ml-1">
            {meses[selectedMonth]} {selectedYear}
          </h2>
          <button 
            onClick={irParaHoje}
            className="px-4 py-1.5 text-[13px] font-semibold text-[#475569] bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors ml-2"
          >
            Hoje
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Buscar ${getTipoLabel().toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
            />
          </div>
          
          {filteredItems.length > 0 && (
            <div className="relative w-full md:w-72">
              <select
                value={selectedItem?.id || ''}
                onChange={(e) => {
                  const item = items.find(i => i.id === parseInt(e.target.value));
                  setSelectedItem(item);
                }}
                className="appearance-none bg-white border border-gray-200 text-[#0f172a] text-[14px] font-medium rounded-xl px-4 py-2.5 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 cursor-pointer w-full"
              >
                {filteredItems.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.titulo}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto"></div>
          <p className="text-slate-500 mt-2">Carregando disponibilidade...</p>
        </div>
      )}

      {/* Grelha do Calendário */}
      {!loading && selectedItem && filteredItems.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
          
          <div className="overflow-x-auto w-full scrollbar-hide">
            <div className="min-w-[700px]">
              
              <div className="grid grid-cols-7 border-b border-gray-100">
                {diasSemana.map((dia, idx) => (
                  <div key={idx} className="py-4 text-center border-r border-gray-100 last:border-r-0">
                    <span className="text-[13px] font-bold text-[#0f172a]">{dia}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {getDiasMes().map((dayObj, index) => {
                  const statusColor = getStatusColor(dayObj.status);
                  const isCurrentMonth = dayObj.mesAtual;
                  
                  return (
                    <div 
                      key={index} 
                      className={`border-b border-r border-gray-100 p-1 md:p-1.5 min-h-[90px] md:min-h-[110px] ${!isCurrentMonth ? 'bg-gray-50/30' : ''}`}
                    >
                      <div className={`w-full h-full rounded-lg flex flex-col items-center justify-start pt-2 pb-1 ${statusColor} transition-colors`}>
                        <span className={`text-[14px] md:text-[15px] ${!isCurrentMonth ? 'text-gray-400' : ''} ${dayObj.status ? 'font-bold' : 'font-medium'}`}>
                          {dayObj.dia}
                        </span>
                        {dayObj.status && isCurrentMonth && (
                          <span className={`text-[10px] md:text-[11px] mt-auto mb-1 font-semibold ${statusColor}`}>
                            {dayObj.status}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Sem itens */}
      {!loading && filteredItems.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <div className="flex flex-col items-center gap-2">
            {getTipoIcone(activeTab)}
            <p className="text-slate-500 mt-2">Nenhum {getTipoLabel().toLowerCase()} encontrado</p>
            <p className="text-sm text-gray-400">
              Você ainda não tem {getTipoLabel().toLowerCase()} cadastrados ou aprovados
            </p>
          </div>
        </div>
      )}

      {/* Legenda */}
      <div className="flex flex-wrap items-center gap-6 mt-6 px-2">
        <div className="flex items-center gap-2">
          <div className="w-[18px] h-[18px] rounded-[4px] bg-[#dcfce7] border border-[#bbf7d0]"></div>
          <span className="text-[13px] font-semibold text-[#475569]">Disponível</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-[18px] h-[18px] rounded-[4px] bg-[#fee2e2] border border-[#fecaca]"></div>
          <span className="text-[13px] font-semibold text-[#475569]">Reservado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-[18px] h-[18px] rounded-[4px] bg-[#fef3c7] border border-[#fde68a]"></div>
          <span className="text-[13px] font-semibold text-[#475569]">Pendente</span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          {getTipoIcone(activeTab)}
          <span className="text-[12px] text-slate-400">
            Mostrando: {selectedItem?.titulo || 'Nenhum item selecionado'}
          </span>
        </div>
      </div>

    </div>
  );
}