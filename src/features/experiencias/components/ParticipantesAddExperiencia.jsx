import React from 'react';
import { User, Plus, Trash2, Users } from 'lucide-react';

const ParticipantesAdicionais = ({ participantes, addParticipante, removeParticipante, updateParticipante }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
        <h3 className="text-sm font-bold text-blue-900 uppercase">
          Participantes adicionais ({participantes.length})
        </h3>
        <button 
          onClick={addParticipante} 
          className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:opacity-70 transition"
        >
          <Plus size={14}/> Novo participante
        </button>
      </div>

      {participantes.map((p, index) => (
        <div key={p.id} className="p-5 border border-slate-200 rounded-xl relative group bg-white shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User size={14} className="text-blue-600" />
            </div>
            <span className="text-sm font-bold text-blue-900">Participante {index + 2}</span>
            <button 
              onClick={() => removeParticipante(p.id)} 
              className="ml-auto text-red-400 hover:text-red-600 transition p-1"
            >
              <Trash2 size={18}/>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1.5">Nome completo *</label>
              <input 
                type="text" 
                value={p.nome_completo}
                onChange={(e) => updateParticipante(p.id, 'nome_completo', e.target.value)}
                placeholder="Ex: Maria da Luz Gomes" 
                className="w-full h-[42px] border border-slate-200 rounded-lg px-3 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1.5">Idade *</label>
                <select 
                  value={p.idade}
                  onChange={(e) => updateParticipante(p.id, 'idade', e.target.value)}
                  className="w-full h-[42px] border border-slate-200 rounded-lg px-3 text-sm outline-none bg-white"
                >
                  <option value="adulto">Adulto (+12 anos)</option>
                  <option value="crianca">Criança (3-11 anos)</option>
                  <option value="bebe">Bebê (0-2 anos)</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1.5">Nacionalidade *</label>
                <select 
                  value={p.nacionalidade}
                  onChange={(e) => updateParticipante(p.id, 'nacionalidade', e.target.value)}
                  className="w-full h-[42px] border border-slate-200 rounded-lg px-3 text-sm outline-none bg-white"
                >
                  <option>Cabo Verde</option>
                  <option>Portugal</option>
                  <option>Brasil</option>
                  <option>Angola</option>
                  <option>Outra</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      ))}

      {participantes.length === 0 && (
        <div className="text-center py-10 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/30">
          <Users size={32} className="mx-auto mb-2 opacity-40" />
          <p>Nenhum participante adicional</p>
          <p className="text-xs mt-1">Clique em "Novo participante" para adicionar</p>
        </div>
      )}
    </div>
  );
};

export default ParticipantesAdicionais;