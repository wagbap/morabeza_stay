import React from 'react';
import { UserPlus, Edit2, Save, X, Plus, Trash2, Loader } from 'lucide-react';

const ParticipantesAnterioresTabela = ({ 
  participantesAnteriores, 
  carregandoDados, 
  editandoParticipante,
  editForm,
  setEditForm,
  deletandoParticipante,
  user,
  buscarDadosUsuario,
  iniciarEdicao,
  salvarEdicao,
  cancelarEdicao,
  adicionarParticipanteAnterior,
  deletarParticipante
}) => {
  if (carregandoDados) {
    return (
      <div className="mt-10 p-8 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center gap-3">
        <Loader size={20} className="animate-spin text-blue-600" />
        <p className="text-sm text-slate-500">Carregando seus participantes anteriores...</p>
      </div>
    );
  }

  if (participantesAnteriores.length === 0) {
    return (
      <div className="mt-10 p-6 bg-slate-50 border border-slate-200 rounded-xl text-center">
        <UserPlus size={32} className="mx-auto mb-3 text-slate-300" />
        <p className="text-sm text-slate-500">Nenhum participante encontrado em reservas anteriores</p>
        <p className="text-xs text-slate-400 mt-1">Adicione participantes acima e eles ficarão salvos para próximas reservas</p>
      </div>
    );
  }

  return (
    <div className="mt-10 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-3 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus size={18} className="text-blue-600" />
            <h3 className="text-sm font-bold text-blue-800">
              Participantes de reservas anteriores ({participantesAnteriores.length})
            </h3>
          </div>
          <button 
            onClick={() => buscarDadosUsuario(user?.email, user?.google_id)}
            className="text-[10px] text-blue-600 hover:text-blue-800 font-bold"
          >
            Atualizar
          </button>
        </div>
        <p className="text-[10px] text-slate-500 mt-1">
          ✏️ Editar | ➕ Adicionar à reserva atual | ❌ Remover permanentemente
        </p>
      </div>
      
      <div className="overflow-x-auto max-h-80 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Nome</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Idade</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Nacionalidade</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Tipo</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {participantesAnteriores.map((p, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                {editandoParticipante === p.nome_completo ? (
                  <>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={editForm.nome_completo}
                        onChange={(e) => setEditForm({...editForm, nome_completo: e.target.value})}
                        className="w-full px-2 py-1 border border-blue-300 rounded text-sm"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <select
                        value={editForm.idade}
                        onChange={(e) => setEditForm({...editForm, idade: e.target.value})}
                        className="w-full px-2 py-1 border border-blue-300 rounded text-sm"
                      >
                        <option value="adulto">Adulto</option>
                        <option value="crianca">Criança</option>
                        <option value="bebe">Bebê</option>
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <select
                        value={editForm.nacionalidade}
                        onChange={(e) => setEditForm({...editForm, nacionalidade: e.target.value})}
                        className="w-full px-2 py-1 border border-blue-300 rounded text-sm"
                      >
                        <option>Cabo Verde</option>
                        <option>Portugal</option>
                        <option>Brasil</option>
                        <option>Angola</option>
                        <option>Outra</option>
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.tipo === 'principal' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {p.tipo === 'principal' ? 'Principal' : 'Acompanhante'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => salvarEdicao(p)}
                          className="w-7 h-7 rounded-full bg-green-100 hover:bg-green-200 text-green-600 transition-all flex items-center justify-center"
                          title="Salvar"
                        >
                          <Save size={14} />
                        </button>
                        <button
                          onClick={cancelarEdicao}
                          className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all flex items-center justify-center"
                          title="Cancelar"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{p.nome_completo}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.idade === 'adulto' ? 'bg-green-100 text-green-700' : 
                        p.idade === 'crianca' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {p.idade === 'adulto' ? 'Adulto' : p.idade === 'crianca' ? 'Criança' : 'Bebê'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{p.nacionalidade}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.tipo === 'principal' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {p.tipo === 'principal' ? 'Principal' : 'Acompanhante'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => iniciarEdicao(p)}
                          className="w-7 h-7 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition-all flex items-center justify-center"
                          title="Editar"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => adicionarParticipanteAnterior(p)}
                          className="w-7 h-7 rounded-full bg-green-50 hover:bg-green-100 text-green-600 transition-all flex items-center justify-center"
                          title="Adicionar à reserva"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          onClick={() => deletarParticipante(p)}
                          disabled={deletandoParticipante === p.nome_completo}
                          className="w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 text-red-500 transition-all flex items-center justify-center disabled:opacity-50"
                          title="Remover permanentemente"
                        >
                          {deletandoParticipante === p.nome_completo ? (
                            <Loader size={12} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ParticipantesAnterioresTabela;