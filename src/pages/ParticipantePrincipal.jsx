import React from 'react';
import { User } from 'lucide-react';

const ParticipantePrincipal = ({ participantePrincipal, updateParticipantePrincipal }) => {
  return (
    <div className="mb-10">
      <h3 className="text-sm font-bold text-blue-900 mb-4">
        Participante principal 
        <span className="font-normal text-slate-400 text-xs ml-1">(responsável pela reserva)</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="w-full">
          <label className="text-xs font-bold text-slate-700 block mb-2">Nome completo *</label>
          <input 
            type="text" 
            value={participantePrincipal.nome_completo}
            onChange={(e) => updateParticipantePrincipal('nome_completo', e.target.value)}
            placeholder="Ex: João Maria Silva" 
            className="w-full h-[45px] border border-slate-200 rounded-lg px-3 text-sm outline-none focus:border-blue-500"
          />
        </div>
        <div className="w-full">
          <label className="text-xs font-bold text-slate-700 block mb-2">Email *</label>
          <input 
            type="email" 
            value={participantePrincipal.email}
            onChange={(e) => updateParticipantePrincipal('email', e.target.value)}
            placeholder="Ex: joao@email.com" 
            className="w-full h-[45px] border border-slate-200 rounded-lg px-3 text-sm outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-2">Telefone *</label>
          <div className="flex border border-slate-200 rounded-lg overflow-hidden h-[45px]">
            <div className="bg-slate-50 px-3 flex items-center border-r border-slate-200 text-xs font-bold gap-1">🇨🇻 +238</div>
            <input 
              type="tel" 
              value={participantePrincipal.phone}
              onChange={(e) => updateParticipantePrincipal('phone', e.target.value)}
              className="flex-1 px-3 text-sm outline-none" 
              placeholder="991 23 45" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantePrincipal;