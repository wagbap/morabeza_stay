import React, { useState, useEffect } from 'react';
import { Search, Loader2, Users, RefreshCw, User, Mail, Phone, Calendar as CalendarIcon, Check, X, Eye, Shield, Activity, UserCheck, UserX } from 'lucide-react';

const ClientesAdmin = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pesquisa, setPesquisa] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos'); // todos, ativo, inativo
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const carregarClientes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/get_clientes.php');
      const data = await response.json();
      if (data.status === 'success') {
        setClientes(data.data);
      }
    } catch (err) {
      console.error("Erro ao carregar clientes:", err);
    }
    setLoading(false);
  };

  useEffect(() => { carregarClientes(); }, []);

  const alterarStatus = async (id, ativo) => {
    const acao = ativo ? 'ativar' : 'desativar';
    if (!window.confirm(`Tem a certeza de que deseja ${acao} este cliente?`)) return;

    try {
      const response = await fetch('/api/admin/alterar_status_cliente.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ativo })
      });
      const data = await response.json();
      if (data.success) {
        carregarClientes();
        setShowModal(false);
      } else {
        alert("Erro: " + data.message);
      }
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  };

  // Lógica de Filtragem
  const clientesFiltrados = clientes.filter(c => {
    const termo = pesquisa.toLowerCase();
    const buscaMatch = 
      (c.nome && c.nome.toLowerCase().includes(termo)) ||
      (c.email && c.email.toLowerCase().includes(termo)) ||
      (c.telefone && c.telefone.toLowerCase().includes(termo));

    const statusMatch = filtroStatus === 'todos' || 
      (filtroStatus === 'ativo' && c.ativo === 1) ||
      (filtroStatus === 'inativo' && c.ativo === 0);

    return buscaMatch && statusMatch;
  });

  const renderBadgeStatus = (ativo) => {
    if (ativo) {
      return <span className="px-2.5 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">Ativo</span>;
    }
    return <span className="px-2.5 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">Inativo</span>;
  };

  const formatarData = (data) => {
    if (!data) return 'N/A';
    return new Date(data).toLocaleDateString('pt-PT');
  };

  // Estatísticas
  const totalAtivos = clientes.filter(c => c.ativo === 1).length;
  const totalInativos = clientes.filter(c => c.ativo === 0).length;

  return (
    <div className="space-y-6">
      {/* Topo informativo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#003580]">Gestão de Clientes</h1>
          <p className="text-gray-600 mt-1">Gerencie todos os clientes registados na plataforma.</p>
        </div>
        <button onClick={carregarClientes} className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm rounded-xl border border-gray-200 transition shadow-sm">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Atualizar Lista
        </button>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-100">
          <Users className="text-blue-500 mb-2" size={20} />
          <p className="text-2xl font-bold">{clientes.length}</p>
          <p className="text-xs text-gray-500">Total de Clientes</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-white p-4 rounded-xl border border-green-100">
          <UserCheck className="text-green-500 mb-2" size={20} />
          <p className="text-2xl font-bold">{totalAtivos}</p>
          <p className="text-xs text-gray-500">Clientes Ativos</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-white p-4 rounded-xl border border-red-100">
          <UserX className="text-red-500 mb-2" size={20} />
          <p className="text-2xl font-bold">{totalInativos}</p>
          <p className="text-xs text-gray-500">Clientes Inativos</p>
        </div>
      </div>

      {/* Controladores: Filtros e Pesquisa */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/40 backdrop-blur-md p-4 rounded-xl border border-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Nome, email ou telefone..." 
            value={pesquisa} 
            onChange={(e) => setPesquisa(e.target.value)} 
            className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-gray-200 focus:outline-none text-sm" 
          />
        </div>

        <div>
          <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 focus:outline-none">
            <option value="todos">Status: Todos</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
          </select>
        </div>
      </div>

      {/* Tabela de Dados */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-24 flex flex-col justify-center items-center gap-2 text-gray-500 text-sm">
            <Loader2 className="animate-spin text-[#003580]" size={32} />
            <span>A carregar lista de clientes...</span>
          </div>
        ) : clientesFiltrados.length === 0 ? (
          <div className="py-24 flex flex-col justify-center items-center gap-3 text-gray-400">
            <Users size={48} className="text-gray-300" />
            <p className="text-sm">Nenhum cliente encontrado com os filtros atuais.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/50 text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Contacto</th>
                  <th className="px-6 py-4">Data de Registo</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white/40">
                {clientesFiltrados.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-xs text-gray-900">
                      #{cliente.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#003580] to-[#6b82c6] flex items-center justify-center text-white font-bold text-sm">
                          {cliente.nome?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900">{cliente.nome || 'N/A'}</span>
                          <br />
                          <span className="text-[11px] text-gray-400">{cliente.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {cliente.telefone ? (
                        <div className="flex items-center gap-1">
                          <Phone size={12} className="text-gray-400" />
                          <span className="text-xs">{cliente.telefone}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Não informado</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {formatarData(cliente.criado_em || cliente.created_at)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {renderBadgeStatus(cliente.ativo === 1)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-1.5">
                        <button 
                          onClick={() => {
                            setSelectedCliente(cliente);
                            setShowModal(true);
                          }}
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg border border-blue-200 transition" 
                          title="Ver Detalhes"
                        >
                          <Eye size={14} />
                        </button>
                        {cliente.ativo === 1 ? (
                          <button 
                            onClick={() => alterarStatus(cliente.id, 0)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg border border-red-200 transition" 
                            title="Desativar Cliente"
                          >
                            <X size={14} />
                          </button>
                        ) : (
                          <button 
                            onClick={() => alterarStatus(cliente.id, 1)}
                            className="p-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg border border-green-200 transition" 
                            title="Ativar Cliente"
                          >
                            <Check size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Detalhes do Cliente */}
      {showModal && selectedCliente && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#003580]">Detalhes do Cliente</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Perfil */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#003580] to-[#6b82c6] flex items-center justify-center text-white text-2xl font-bold">
                  {selectedCliente.nome?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{selectedCliente.nome || 'N/A'}</h3>
                  <p className="text-gray-500">{selectedCliente.email}</p>
                  <div className="flex gap-2 mt-2">
                    {renderBadgeStatus(selectedCliente.ativo === 1)}
                  </div>
                </div>
              </div>

              {/* Informações Detalhadas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Telefone</p>
                  <p className="font-medium">{selectedCliente.telefone || 'Não informado'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Data de Registo</p>
                  <p className="font-medium">{formatarData(selectedCliente.criado_em || selectedCliente.created_at)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Tipo de Conta</p>
                  <p className="font-medium capitalize">{selectedCliente.tipo_conta || 'Cliente'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">ID do Cliente</p>
                  <p className="font-mono text-sm">#{selectedCliente.id}</p>
                </div>
              </div>

              {/* Último Login */}
              {selectedCliente.ultimo_login && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Último Login</p>
                  <p className="font-medium">{formatarData(selectedCliente.ultimo_login)}</p>
                </div>
              )}

              {/* Ações */}
              <div className="flex gap-3 pt-4 border-t">
                {selectedCliente.ativo === 1 ? (
                  <button 
                    onClick={() => {
                      alterarStatus(selectedCliente.id, 0);
                    }}
                    className="flex-1 bg-red-600 text-white py-2.5 rounded-xl hover:bg-red-700 transition"
                  >
                    Desativar Conta
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      alterarStatus(selectedCliente.id, 1);
                    }}
                    className="flex-1 bg-green-600 text-white py-2.5 rounded-xl hover:bg-green-700 transition"
                  >
                    Ativar Conta
                  </button>
                )}
                <button 
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-xl hover:bg-gray-300 transition"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientesAdmin;