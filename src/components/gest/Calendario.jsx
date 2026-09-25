// src/components/gest/Calendario.jsx
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Search, Car, Home, Compass, ChevronDown, Check } from 'lucide-react';

export default function Calendario() {
  const [activeTab, setActiveTab] = useState('alojamentos');
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [disponibilidade, setDisponibilidade] = useState({});
  const [tabsPermitidas, setTabsPermitidas] = useState(['alojamentos', 'carros', 'experiencias']);
  
  // Estado para controlar a abertura do dropdown personalizado (LOV)
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const dropdownRef = useRef(null);

  const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  // Fechar o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownAberto(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      const savedUser = localStorage.getItem('morabeza_user') || localStorage.getItem('user');
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
    const fetchUserRoles = async () => {
      const userId = obterUserId();
      if (!userId) return;

      try {
        const response = await fetch(`https://welovepalop.com/api/usuarios/listar_roles.php?usuario_id=${userId}`);
        const data = await response.json();
        
        if (data.success && data.roles && data.roles.length > 0) {
          const isAnfitrion = data.roles.some(r => r.name === 'anfitrion' && r.status === 'approved');
          const isGuia = data.roles.some(r => r.name === 'guia_experiencias' && r.status === 'approved');
          const isProprietarioVeiculos = data.roles.some(r => r.name === 'proprietario_veiculos' && r.status === 'approved');
          
          const tabs = [];
          if (isAnfitrion) tabs.push('alojamentos');
          if (isProprietarioVeiculos) tabs.push('carros');
          if (isGuia) tabs.push('experiencias');
          
          if (tabs.length > 0) {
            setTabsPermitidas(tabs);
            if (!tabs.includes(activeTab)) {
              setActiveTab(tabs[0]);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao buscar roles:', error);
      }
    };
    
    fetchUserRoles();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  useEffect(() => {
    if (selectedItem) {
      fetchDisponibilidade();
    }
  }, [selectedItem, selectedMonth, selectedYear]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const userId = obterUserId();
      if (!userId) {
        setLoading(false);
        return;
      }
      
      let url = '';
      if (activeTab === 'alojamentos') {
        url = `https://welovepalop.com/api/get_alojamentos_by_proprietario.php?proprietario_id=${userId}`;
      } else if (activeTab === 'carros') {
        url = `https://welovepalop.com/api/get_carros_by_proprietario.php?proprietario_id=${userId}`;
      } else if (activeTab === 'experiencias') {
        url = `https://welovepalop.com/api/get_experiencias_by_proprietario.php?proprietario_id=${userId}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      let itemsList = [];
      if (data.success && data.data) {
        itemsList = Array.isArray(data.data) ? data.data : [data.data];
      }
      
      setItems(itemsList);
      if (itemsList.length > 0) {
        setSelectedItem(itemsList[0]);
      } else {
        setSelectedItem(null);
      }
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDisponibilidade = async () => {
    if (!selectedItem) return;
    
    try {
      const ano = selectedYear;
      const mes = selectedMonth;
      const ultimoDia = new Date(ano, mes + 1, 0).getDate();
      const disponibilidadeMap = {};
      
      for (let dia = 1; dia <= ultimoDia; dia++) {
        const dataStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        let url = '';
        if (activeTab === 'alojamentos') {
          url = `https://welovepalop.com/api/disponibilidade/alojamento.php?alojamento_id=${selectedItem.id}&data_checkin=${dataStr}&data_checkout=${dataStr}`;
        } else if (activeTab === 'carros') {
          url = `https://welovepalop.com/api/disponibilidade/carro.php?carro_id=${selectedItem.id}&data_inicio=${dataStr}&data_fim=${dataStr}`;
        } else if (activeTab === 'experiencias') {
          url = `https://welovepalop.com/api/disponibilidade/experiencia.php?experiencia_id=${selectedItem.id}&data=${dataStr}`;
        }
        
        try {
          const response = await fetch(url);
          const result = await response.json();
          disponibilidadeMap[dia] = result.success && result.data ? result.data.disponivel : true;
        } catch (e) {
          disponibilidadeMap[dia] = true;
        }
      }
      
      setDisponibilidade(disponibilidadeMap);
    } catch (error) {
      console.error('Erro ao buscar disponibilidade:', error);
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
    const diasMesAnterior = new Date(ano, mes, 0).getDate();
    
    for (let i = startOffset - 1; i >= 0; i--) {
      dias.push({ dia: diasMesAnterior - i, mesAtual: false, status: null });
    }
    
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      let status = null;
      if (disponibilidade[dia] === true) status = 'Disponível';
      else if (disponibilidade[dia] === false) status = 'Reservado';
      
      dias.push({ dia, mesAtual: true, status });
    }
    
    const totalDias = dias.length;
    const diasFaltando = 42 - totalDias;
    for (let i = 1; i <= diasFaltando; i++) {
      dias.push({ dia: i, mesAtual: false, status: null });
    }
    
    return dias;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Disponível': return 'bg-[#dcfce7] text-[#16a34a] font-bold';
      case 'Reservado': return 'bg-[#fee2e2] text-[#dc2626] font-bold';
      default: return 'bg-white text-[#0f172a]';
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

  return (
    <div className="max-w-6xl w-full text-[#0f172a] px-4 py-6 md:px-0">
      <h1 className="text-[22px] font-bold mb-6">Calendário de Disponibilidade</h1>

      {/* Tabs Principais */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {tabsPermitidas.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 capitalize ${
              activeTab === tab ? 'text-blue-900 border-b-2 border-blue-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {getTipoIcone(tab)} {tab}
          </button>
        ))}
      </div>

      {/* Controles do Mês e LOV (Dropdown com Search Bar interna) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => mudarMes(-1)} className="p-1.5 hover:bg-gray-100 rounded-lg border border-gray-200 bg-white">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-[16px] md:text-[18px] font-bold text-[#0f172a]">
            {meses[selectedMonth]} {selectedYear}
          </h2>
          <button onClick={() => { setSelectedMonth(new Date().getMonth()); setSelectedYear(new Date().getFullYear()); }} className="px-4 py-1.5 text-[13px] font-semibold text-[#475569] bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50">
            Hoje
          </button>
        </div>

        {/* 🚀 LOV (List of Values) em formato de Dropdown com Search Bar */}
        {items.length > 0 && (
          <div className="relative w-full md:w-80" ref={dropdownRef}>
            <button
              onClick={() => setDropdownAberto(!dropdownAberto)}
              className="w-full flex items-center justify-between bg-white border border-gray-200 text-[#0f172a] text-[14px] font-medium rounded-xl px-4 py-2.5 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2 truncate">
                {getTipoIcone(activeTab)}
                <span className="truncate">{selectedItem?.titulo || 'Selecione um item...'}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${dropdownAberto ? 'rotate-180' : ''}`} />
            </button>

            {dropdownAberto && (
              <div className="absolute right-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 z-50 p-2 animate-in fade-in zoom-in duration-150">
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Pesquisar anúncio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none bg-gray-50/50"
                    autoFocus
                  />
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1">
                  {filteredItems.length > 0 ? (
                    filteredItems.map(item => {
                      const isSelected = selectedItem?.id === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setSelectedItem(item);
                            setDropdownAberto(false);
                            setSearchTerm('');
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                            isSelected ? 'bg-blue-50 text-blue-900 font-bold' : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <span className="truncate">{item.titulo}</span>
                          {isSelected && <Check size={14} className="text-blue-900" />}
                        </button>
                      );
                    })
                  ) : (
                    <p className="text-center py-3 text-xs text-gray-400">Nenhum anúncio encontrado</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto"></div>
          <p className="text-slate-500 mt-2">Carregando calendário...</p>
        </div>
      )}

      {/* Grelha do Calendário */}
      {!loading && selectedItem && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
            {diasSemana.map((dia, idx) => (
              <div key={idx} className="py-3 text-center border-r border-gray-100 last:border-r-0">
                <span className="text-[13px] font-bold text-[#0f172a]">{dia}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {getDiasMes().map((dayObj, index) => (
              <div key={index} className={`border-b border-r border-gray-100 p-2 min-h-[95px] ${!dayObj.mesAtual ? 'bg-gray-50/40 text-gray-400' : ''}`}>
                <div className={`w-full h-full rounded-lg flex flex-col items-center justify-center p-1 ${getStatusColor(dayObj.status)}`}>
                  <span className="text-[14px] font-semibold">{dayObj.dia}</span>
                  {dayObj.status && dayObj.mesAtual && (
                    <span className="text-[10px] mt-1 uppercase tracking-wider">{dayObj.status}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && filteredItems.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
          <p className="text-base font-medium">Nenhum registo encontrado para esta categoria.</p>
        </div>
      )}

      {/* Legenda */}
      <div className="flex flex-wrap items-center gap-6 mt-6 px-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#dcfce7] border border-[#bbf7d0]"></div>
          <span className="text-xs font-semibold text-slate-600">Disponível</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#fee2e2] border border-[#fecaca]"></div>
          <span className="text-xs font-semibold text-slate-600">Reservado</span>
        </div>
      </div>
    </div>
  );
}