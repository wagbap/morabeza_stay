import React from 'react';
import { User, Trash2, Plus } from 'lucide-react';

const ParticipantePrincipalAlojamento = ({ 
  participantes = [], 
  addParticipante, 
  removeParticipante, 
  updateParticipante 
}) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-blue-900">
          Outros hóspedes
          <span className="font-normal text-slate-400 text-xs ml-1">(opcional)</span>
        </h3>
        <button 
          onClick={addParticipante}
          className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:text-blue-800 transition-colors"
        >
          <Plus size={14}/> Adicionar hóspede
        </button>
      </div>

      {participantes.length === 0 && (
        <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
          <User size={24} className="text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Nenhum hóspede adicional adicionado</p>
          <p className="text-[10px] text-slate-300 mt-1">Clique em "Adicionar hóspede" para incluir mais pessoas</p>
        </div>
      )}

      {participantes.map((participante, index) => (
        <div key={participante.id} className="border border-slate-200 rounded-lg p-4 mb-4 relative bg-white">
          <button 
            onClick={() => removeParticipante(participante.id)}
            className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors"
            type="button"
          >
            <Trash2 size={16}/>
          </button>
          
          <div className="flex items-center gap-2 mb-3">
            <User size={14} className="text-blue-500"/>
            <span className="text-xs font-bold text-slate-600">Hóspede {index + 2}</span>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <input 
              type="text" 
              value={participante.nome_completo || ''}
              onChange={(e) => updateParticipante(participante.id, 'nome_completo', e.target.value)}
              placeholder="Nome completo do hóspede" 
              className="w-full h-[40px] border border-slate-200 rounded-lg px-3 text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ParticipantePrincipalAlojamento;