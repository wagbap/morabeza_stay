// src/components/ExperienciaRegisto/Disponibilidade.jsx

import React, { useState } from 'react';
import { Calendar, Clock, Plus, Trash2, AlertCircle } from 'lucide-react';

const DIAS_SEMANA = [
  { id: 'segunda', nome: 'Segunda' },
  { id: 'terca', nome: 'Terça' },
  { id: 'quarta', nome: 'Quarta' },
  { id: 'quinta', nome: 'Quinta' },
  { id: 'sexta', nome: 'Sexta' },
  { id: 'sabado', nome: 'Sábado' },
  { id: 'domingo', nome: 'Domingo' }
];

const HORARIOS_SUGERIDOS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

const Disponibilidade = ({ dados = {}, onChange, readOnly = false }) => {
  const [novoHorario, setNovoHorario] = useState('');
  const [mostrarHorarioForm, setMostrarHorarioForm] = useState(false);
  
  const dias_disponiveis = dados.dias_disponiveis || [];
  const horarios = dados.horarios || [];
  
  const toggleDia = (diaId) => {
    if (readOnly) return;
    const novos = dias_disponiveis.includes(diaId)
      ? dias_disponiveis.filter(d => d !== diaId)
      : [...dias_disponiveis, diaId];
    onChange({ ...dados, dias_disponiveis: novos });
  };
  
  const adicionarHorario = () => {
    if (!novoHorario) return;
    if (horarios.includes(novoHorario)) return;
    
    const novosHorarios = [...horarios, novoHorario].sort();
    onChange({ ...dados, horarios: novosHorarios });
    setNovoHorario('');
    setMostrarHorarioForm(false);
  };
  
  const removerHorario = (horario) => {
    const novosHorarios = horarios.filter(h => h !== horario);
    onChange({ ...dados, horarios: novosHorarios });
  };
  
  return (
    <div className="space-y-6">
      {/* Dias da semana */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Calendar size={18} className="text-[#006ce4]" />
          Dias disponíveis
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {DIAS_SEMANA.map(dia => (
            <button
              key={dia.id}
              type="button"
              onClick={() => toggleDia(dia.id)}
              disabled={readOnly}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                dias_disponiveis.includes(dia.id)
                  ? 'bg-[#006ce4] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${readOnly && 'cursor-default'}`}
            >
              {dia.nome.substring(0, 3)}
            </button>
          ))}
        </div>
        {dias_disponiveis.length === 0 && !readOnly && (
          <p className="text-sm text-yellow-600 mt-2">⚠️ Selecione pelo menos um dia da semana</p>
        )}
      </div>
      
      {/* Horários */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Clock size={18} className="text-[#006ce4]" />
          Horários disponíveis
        </h3>
        
        {/* Horários selecionados */}
        {horarios.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {horarios.map(horario => (
              <div key={horario} className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1">
                <Clock size={12} className="text-gray-500" />
                <span className="text-sm">{horario}</span>
                {!readOnly && (
                  <button onClick={() => removerHorario(horario)} className="ml-1 text-gray-400 hover:text-red-500">
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Botão adicionar horário */}
        {!readOnly && (
          <>
            {mostrarHorarioForm ? (
              <div className="flex gap-2 items-center">
                <select
                  value={novoHorario}
                  onChange={(e) => setNovoHorario(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4]"
                >
                  <option value="">Selecione um horário</option>
                  {HORARIOS_SUGERIDOS.map(h => (
                    <option key={h} value={h} disabled={horarios.includes(h)}>{h}</option>
                  ))}
                </select>
                <button
                  onClick={adicionarHorario}
                  className="px-3 py-2 bg-[#006ce4] text-white rounded-lg hover:bg-[#0053b3]"
                >
                  Adicionar
                </button>
                <button
                  onClick={() => setMostrarHorarioForm(false)}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setMostrarHorarioForm(true)}
                className="flex items-center gap-1 text-sm text-[#006ce4] hover:text-[#0053b3]"
              >
                <Plus size={16} /> Adicionar horário
              </button>
            )}
          </>
        )}
        
        {horarios.length === 0 && !readOnly && (
          <p className="text-sm text-yellow-600 mt-2">⚠️ Adicione pelo menos um horário</p>
        )}
      </div>
      
      {/* Resumo */}
      {(dias_disponiveis.length > 0 || horarios.length > 0) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-800">
            ✅ Disponível em {dias_disponiveis.length} dia(s) da semana, com {horarios.length} horário(s)
          </p>
        </div>
      )}
      
      {/* Informação */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
        <AlertCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          Os hóspedes poderão escolher entre os dias e horários disponíveis ao fazer a reserva.
        </p>
      </div>
    </div>
  );
};

export default Disponibilidade;