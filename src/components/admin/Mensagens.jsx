import React, { useState } from 'react';
import { MessageSquare, Search, User, Mail, Clock, Star, Trash2 } from 'lucide-react';

const Mensagens = () => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('todas');

  const mensagens = [
    { id: 1, nome: 'João Silva', email: 'joao@email.com', assunto: 'Dúvida sobre reserva', mensagem: 'Gostaria de saber mais sobre...', data: '2026-06-01', lida: false, prioridade: 'alta' },
    { id: 2, nome: 'Maria Santos', email: 'maria@email.com', assunto: 'Cancelamento', mensagem: 'Preciso cancelar minha reserva...', data: '2026-05-31', lida: true, prioridade: 'media' },
    { id: 3, nome: 'Carlos Lima', email: 'carlos@email.com', assunto: 'Problema no pagamento', mensagem: 'Tentei pagar mas deu erro...', data: '2026-05-30', lida: false, prioridade: 'alta' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-[#003580]">Mensagens</h1>
          <p className="text-gray-600 mt-1">Gerir mensagens e contactos dos utilizadores.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Pesquisar mensagens..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64 pl-10 pr-4 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003580]/20" />
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button onClick={() => setActiveTab('todas')} className={`px-4 py-2 text-sm font-medium transition-all ${activeTab === 'todas' ? 'border-b-2 border-[#003580] text-[#003580]' : 'text-gray-500'}`}>Todas ({mensagens.length})</button>
        <button onClick={() => setActiveTab('nao_lidas')} className={`px-4 py-2 text-sm font-medium transition-all ${activeTab === 'nao_lidas' ? 'border-b-2 border-[#003580] text-[#003580]' : 'text-gray-500'}`}>Não lidas ({mensagens.filter(m => !m.lida).length})</button>
      </div>

      <div className="space-y-3">
        {mensagens.map((msg) => (
          <div key={msg.id} className={`bg-white/80 backdrop-blur-md rounded-xl border p-4 hover:shadow-md transition ${!msg.lida ? 'border-l-4 border-l-[#003580]' : ''}`}>
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"><User size={20} className="text-gray-500" /></div>
                <div>
                  <p className="font-semibold text-gray-800">{msg.nome}</p>
                  <p className="text-sm text-gray-500">{msg.email}</p>
                  <p className="font-medium text-gray-700 mt-1">{msg.assunto}</p>
                  <p className="text-sm text-gray-600 mt-1">{msg.mensagem}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12} /> {msg.data}</p>
                {msg.prioridade === 'alta' && <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">Urgente</span>}
              </div>
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
              <button className="px-3 py-1 text-sm bg-[#003580] text-white rounded-lg">Responder</button>
              <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg">Marcar como lida</button>
              <button className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-lg"><Trash2 size={14} /> Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Mensagens;