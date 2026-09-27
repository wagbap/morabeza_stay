// src/features/experiencias/HorarioModalExperiencia.jsx
import React, { useState, useEffect } from 'react';
import { X, Clock, Sun, Sunset, Check, User, Bus, Loader, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const API_BASE = 'https://welovepalop.com';

const HorarioModal = ({ 
  onClose, 
  onSelectHorario, 
  currentPeriodo, 
  currentHorario,
  experienciaId,
  dataSelecionada 
}) => {
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState('manha');
  const [selectedHorario, setSelectedHorario] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔥 TODOS OS HORÁRIOS POR PERÍODO
  const HORARIOS_POR_PERIODO = {
    manha: {
      label: t('manha', 'Manhã'),
      icon: Sun,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      timeRange: '08:00 - 11:00',
      recomendado: true,
      horarios: [
        { hora: '08:00', vagas: 7 },
        { hora: '08:15', vagas: 7 },
        { hora: '08:30', vagas: 6 },
        { hora: '08:45', vagas: 7 },
        { hora: '09:00', vagas: 5 },
        { hora: '09:15', vagas: 4 },
        { hora: '09:30', vagas: 6 },
        { hora: '09:45', vagas: 7 },
        { hora: '10:00', vagas: 3 },
        { hora: '10:15', vagas: 2 }
      ]
    },
    meio_dia: {
      label: t('meio_dia', 'Meio dia'),
      icon: Sun,
      color: 'text-orange-400',
      bgColor: 'bg-orange-50',
      timeRange: '12:00 - 14:00',
      recomendado: false,
      horarios: [
        { hora: '12:00', vagas: 8 },
        { hora: '12:15', vagas: 6 },
        { hora: '12:30', vagas: 5 },
        { hora: '12:45', vagas: 7 },
        { hora: '13:00', vagas: 4 },
        { hora: '13:15', vagas: 3 },
        { hora: '13:30', vagas: 6 },
        { hora: '13:45', vagas: 7 },
        { hora: '14:00', vagas: 2 },
        { hora: '14:15', vagas: 1 }
      ]
    },
    tarde: {
      label: t('tarde', 'Tarde'),
      icon: Sunset,
      color: 'text-red-400',
      bgColor: 'bg-red-50',
      timeRange: '15:00 - 17:00',
      recomendado: false,
      horarios: [
        { hora: '15:00', vagas: 9 },
        { hora: '15:15', vagas: 7 },
        { hora: '15:30', vagas: 5 },
        { hora: '15:45', vagas: 6 },
        { hora: '16:00', vagas: 4 },
        { hora: '16:15', vagas: 3 },
        { hora: '16:30', vagas: 8 },
        { hora: '16:45', vagas: 5 },
        { hora: '17:00', vagas: 2 },
        { hora: '17:15', vagas: 1 }
      ]
    }
  };

  const [horariosData, setHorariosData] = useState(HORARIOS_POR_PERIODO);

  // 🔥 Buscar horários reais da API (se disponível)
  useEffect(() => {
    const fetchHorarios = async () => {
      if (!experienciaId || !dataSelecionada) return;
      
      setLoading(true);
      try {
        const params = new URLSearchParams({
          experiencia_id: experienciaId,
          data: dataSelecionada,
        });
        const res = await fetch(`${API_BASE}/api/get_horarios_experiencia.php?${params.toString()}`);
        const data = await res.json();
        
        if (data.success && data.horarios) {
          // Se a API retornar dados, usa-os
          setHorariosData(data.horarios);
        }
      } catch (err) {
        console.error('Erro ao buscar horários:', err);
        // Mantém os dados de fallback
      } finally {
        setLoading(false);
      }
    };

    fetchHorarios();
  }, [experienciaId, dataSelecionada]);

  // Inicializar com o período e horário atuais
  useEffect(() => {
    if (currentPeriodo) {
      const periodoLower = currentPeriodo.toLowerCase();
      let periodKey = 'manha';
      if (periodoLower === 'manhã' || periodoLower === 'manha') periodKey = 'manha';
      else if (periodoLower === 'meio dia' || periodoLower === 'meio_dia') periodKey = 'meio_dia';
      else if (periodoLower === 'tarde') periodKey = 'tarde';
      
      setSelectedPeriod(periodKey);
      
      // Se o horário atual pertence a este período, seleciona-o
      if (currentHorario) {
        const periodoData = horariosData[periodKey];
        const horarioExiste = periodoData?.horarios?.some(h => h.hora === currentHorario);
        if (horarioExiste) {
          setSelectedHorario(currentHorario);
        } else if (periodoData?.horarios?.length > 0) {
          setSelectedHorario(periodoData.horarios[0].hora);
        }
      }
    }
  }, [currentPeriodo, currentHorario, horariosData]);

  // 🔥 Quando muda de período, seleciona o primeiro horário disponível
  useEffect(() => {
    const periodoData = horariosData[selectedPeriod];
    if (periodoData?.horarios?.length > 0) {
      const horarioExiste = periodoData.horarios.some(h => h.hora === selectedHorario);
      if (!horarioExiste) {
        setSelectedHorario(periodoData.horarios[0].hora);
      }
    }
  }, [selectedPeriod, horariosData, selectedHorario]);

  const handleConfirm = () => {
    const periodoData = horariosData[selectedPeriod];
    if (periodoData && selectedHorario) {
      onSelectHorario(selectedHorario, periodoData.label);
    }
  };

  const getStatusColor = (vagas) => {
    if (vagas >= 4) return 'text-green-600';
    if (vagas >= 1) return 'text-orange-500';
    return 'text-slate-300';
  };

  const getStatusBg = (vagas) => {
    if (vagas >= 4) return 'bg-green-50 border-green-200';
    if (vagas >= 1) return 'bg-orange-50 border-orange-200';
    return 'bg-slate-50 border-slate-200';
  };

  const periodoAtual = horariosData[selectedPeriod];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition z-10 bg-white rounded-full p-1"
        >
          <X size={24} />
        </button>

        <div className="p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1A2B6D] mb-2">
            {t('escolher_horario_passeio', 'Escolher horário do passeio')}
          </h2>
          <p className="text-slate-500 text-sm mb-8">
            {t('escolha_horario_disponivel', 'Escolha o período e o horário disponível para o seu tour.')}
          </p>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader size={32} className="animate-spin text-blue-600" />
              <span className="ml-3 text-slate-500 font-medium">
                {t('carregando_horarios', 'A carregar horários...')}
              </span>
            </div>
          ) : (
            <>
              {/* 🔥 SELEÇÃO DE PERÍODO */}
              <div className="mb-6">
                <label className="text-[10px] font-black tracking-[0.1em] text-blue-900 block mb-3 uppercase">
                  {t('periodo', 'Período')}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(horariosData).map(([key, p]) => {
                    const Icon = p.icon;
                    const isSelected = selectedPeriod === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedPeriod(key)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all gap-1 ${
                          isSelected 
                            ? 'border-blue-600 bg-blue-50/30 ring-1 ring-blue-600 shadow-sm' 
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <Icon size={20} className={isSelected ? p.color : 'text-slate-300'} />
                        <span className={`text-xs font-bold mt-1 ${isSelected ? 'text-blue-700' : 'text-slate-600'}`}>
                          {p.label}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium">{p.timeRange}</span>
                        {p.recomendado && (
                          <span className="text-[8px] text-green-600 font-bold">⭐ {t('recomendado', 'Recomendado')}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 🔥 GRELHA DE HORÁRIOS DO PERÍODO SELECIONADO */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[10px] font-black tracking-[0.1em] text-blue-900 uppercase">
                    {t('horarios_disponiveis', 'Horários Disponíveis')} — {periodoAtual?.label}
                  </label>
                  <span className="text-[9px] text-slate-400 flex items-center gap-1">
                    <Info size={10}/> {t('vagas_por_horario', 'Vagas por horário')}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {periodoAtual?.horarios?.map((h) => {
                    const isSelected = selectedHorario === h.hora;
                    const isEsgotado = h.vagas === 0;
                    return (
                      <button
                        key={h.hora}
                        onClick={() => !isEsgotado && setSelectedHorario(h.hora)}
                        disabled={isEsgotado}
                        className={`flex flex-col items-center justify-center py-3 rounded-xl border-2 transition-all ${
                          isSelected 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                            : isEsgotado 
                              ? 'bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed' 
                              : `bg-white border-slate-200 hover:border-blue-300`
                        }`}
                      >
                        <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {h.hora}
                        </span>
                        <span className={`text-[9px] font-medium mt-0.5 ${
                          isSelected ? 'text-blue-100' : getStatusColor(h.vagas)
                        }`}>
                          {isEsgotado ? t('esgotado', 'Esgotado') : `${h.vagas} ${t('disp', 'disp.')}`}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Legenda */}
                <div className="flex items-center justify-between mt-4 px-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-[9px] text-slate-500 font-medium">{t('disponivel_4_mais', 'Disponível (4 ou mais)')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span className="text-[9px] text-slate-500 font-medium">{t('poucas_vagas', 'Poucas vagas (1 a 3)')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                    <span className="text-[9px] text-slate-500 font-medium">{t('esgotado', 'Esgotado')}</span>
                  </div>
                </div>
              </div>

              {/* 🔥 INFORMAÇÃO DO PERÍODO SELECIONADO */}
              {periodoAtual && (
                <div className={`${periodoAtual.bgColor} border border-slate-100 rounded-xl p-4 mb-6`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <periodoAtual.icon className={periodoAtual.color} size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {periodoAtual.label} — {periodoAtual.timeRange}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {selectedHorario 
                          ? `${t('horario_selecionado', 'Horário selecionado')}: ${selectedHorario}`
                          : t('selecione_horario', 'Selecione um horário')
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Banner de itens incluídos */}
          <div className="bg-[#F6FBF9] border border-[#E8F5F0] rounded-xl p-4 flex flex-wrap gap-6 items-center mb-6">
            <span className="text-[11px] font-bold text-slate-700">
              {t('incluido_todos_horarios', 'Incluído em todos os horários:')}
            </span>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
              <User size={14} className="text-[#2D8A61]"/> {t('guia_local', 'Guia local')}
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
              <Bus size={14} className="text-[#2D8A61]"/> {t('transporte_ida_volta', 'Transporte ida e volta')}
            </div>
          </div>

          <button 
            onClick={handleConfirm}
            disabled={loading || !selectedHorario}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                {t('a_carregar', 'A carregar...')}
              </>
            ) : (
              <>
                <Check size={18} />
                {selectedHorario 
                  ? `${t('confirmar_horario', 'Confirmar Horário')} — ${selectedHorario}`
                  : t('selecione_horario', 'Selecione um horário')
                }
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HorarioModal;