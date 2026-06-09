import React, { useState, useEffect } from 'react';
import { Eye, Check, X, Loader2, Search, Download } from 'lucide-react';

const ClientesAdmin = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pesquisa, setPesquisa] = useState('');
  const [rejeitando, setRejeitando] = useState(null);
  const [motivo, setMotivo] = useState('');
  const [visualizandoDoc, setVisualizandoDoc] = useState(null);
  const [pdfError, setPdfError] = useState(null);

  const carregarUsuarios = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin_users.php');
      const data = await response.json();
      if (data.status === 'success') {
        setUsuarios(data.data);
      }
    } catch (err) { 
      console.error("Erro ao carregar utilizadores:", err); 
    }
    setLoading(false);
  };

  useEffect(() => { 
    carregarUsuarios(); 
  }, []);

  const parseRoles = (rolesString) => {
    if (!rolesString || rolesString === 'null' || rolesString === '') {
      return [];
    }
    
    const roles = [];
    const items = rolesString.split(',');
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const firstColon = item.indexOf(':');
      if (firstColon === -1) continue;
      
      const secondColon = item.indexOf(':', firstColon + 1);
      if (secondColon === -1) continue;
      
      const thirdColon = item.indexOf(':', secondColon + 1);
      
      const name = item.substring(0, firstColon);
      const status = item.substring(firstColon + 1, secondColon);
      let document_url = null;
      let role_id = 0;
      
      if (thirdColon !== -1) {
        document_url = item.substring(secondColon + 1, thirdColon);
        role_id = parseInt(item.substring(thirdColon + 1));
      } else {
        document_url = item.substring(secondColon + 1);
      }
      
      if (role_id === 0 || isNaN(role_id)) {
        const roleMap = {
          'anfitrion': 2,
          'guia_experiencias': 3,
          'proprietario_veiculos': 4,
          'admin': 5,
          'parceiro_comercial': 6,
          'hospede': 1
        };
        role_id = roleMap[name] || 0;
      }
      
      roles.push({
        name,
        status,
        document_url: document_url === 'sem_doc' ? null : document_url,
        role_id: role_id
      });
    }
    
    return roles;
  };

  // Função robusta para limpar URL
  const limparUrl = (url) => {
    if (!url) return '';
    
    let cleanUrl = url.trim();
    
    // Remover protocolos duplicados com ou sem espaço
    cleanUrl = cleanUrl.replace(/^https?:\s*https?:\/\//i, 'https://');
    cleanUrl = cleanUrl.replace(/^https?:\/\/https?:\/\//i, 'https://');
    cleanUrl = cleanUrl.replace(/https:\/\/https:\/\//g, 'https://');
    cleanUrl = cleanUrl.replace(/http:\/\/http:\/\//g, 'http://');
    
    // Corrigir https:/ (apenas uma barra)
    cleanUrl = cleanUrl.replace(/^https:\/([^/])/, 'https://$1');
    cleanUrl = cleanUrl.replace(/^http:\/([^/])/, 'http://$1');
    
    // Remover espaços da URL
    cleanUrl = cleanUrl.replace(/\s/g, '');
    
    // Remover caracteres especiais indesejados
    cleanUrl = cleanUrl.replace(/[<>"{}|\\^`\[\]]/g, '');
    
    // Garantir que tem protocolo
    if (!cleanUrl.match(/^https?:\/\//i)) {
      cleanUrl = 'https://' + cleanUrl;
    }
    
    // Validar se a URL parece minimamente correta
    if (!cleanUrl.match(/^https?:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}/)) {
      console.warn('URL suspeita após limpeza:', cleanUrl);
    }
    
    return cleanUrl;
  };

  const visualizarDocumento = async (url) => {
    if (!url) {
      alert('URL do documento não encontrada');
      return;
    }
    
    setPdfError(null);
    const cleanUrl = limparUrl(url);
    
    console.log('📄 URL original:', url);
    console.log('📄 URL limpa:', cleanUrl);
    
    const proxyUrl = `/api/proxy_pdf.php?url=${encodeURIComponent(cleanUrl)}`;
    
    // Testar se o proxy está acessível
    try {
      const testResponse = await fetch(proxyUrl, { method: 'HEAD' });
      if (!testResponse.ok) {
        throw new Error(`Proxy respondeu com status ${testResponse.status}`);
      }
      setVisualizandoDoc(proxyUrl);
    } catch (err) {
      console.error('Erro ao acessar proxy:', err);
      setPdfError(`Não foi possível carregar o documento. URL: ${cleanUrl.substring(0, 100)}...`);
    }
  };

  const baixarDocumento = async (url, nome) => {
    if (!url) {
      alert('URL do documento não encontrada');
      return;
    }
    
    const cleanUrl = limparUrl(url);
    const proxyUrl = `/api/proxy_pdf.php?url=${encodeURIComponent(cleanUrl)}`;
    
    try {
      const response = await fetch(proxyUrl);
      const blob = await response.blob();
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `documento_${nome.replace(/\s/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Erro ao baixar:', err);
      alert('Erro ao baixar o documento. Tente novamente.');
    }
  };

  const gerenciarSolicitacao = async (userId, roleId, acao, motivoRejeicao = null) => {
    if (!userId || userId <= 0) {
      alert('Erro: ID do usuário inválido');
      return;
    }
    
    if (!roleId || roleId <= 0) {
      alert('Erro: ID do role inválido');
      return;
    }
    
    try {
      const adminSession = JSON.parse(localStorage.getItem('morabeza_admin') || '{}');
      const payload = {
        user_id: parseInt(userId),
        role_id: parseInt(roleId),
        acao: acao,
        motivo: motivoRejeicao || null,
        admin_id: adminSession.id ? parseInt(adminSession.id) : 21
      };
      
      const response = await fetch('/api/usuarios/aprovar_role.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
        setRejeitando(null);
        setMotivo('');
        carregarUsuarios();
      } else {
        alert('Erro: ' + data.message);
      }
    } catch (err) { 
      console.error("Erro:", err);
      alert('Erro de conexão: ' + err.message);
    }
  };

  const filtrarUsuarios = () => {
    return usuarios.filter(u => 
      u.nome?.toLowerCase().includes(pesquisa.toLowerCase()) || 
      u.email?.toLowerCase().includes(pesquisa.toLowerCase())
    );
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#003580]">Verificação Anti-Fraude</h1>
          <p className="text-gray-600 mt-1">Analise os comprovativos enviados e aprove a entrada de parceiros comerciais.</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Procurar utilizador..." 
            value={pesquisa} 
            onChange={(e) => setPesquisa(e.target.value)} 
            className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003580]/20" 
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex justify-center items-center gap-2">
            <Loader2 className="animate-spin text-[#003580]" size={24} />
            <span className="text-gray-600">A carregar utilizadores...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/50 text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Utilizador</th>
                  <th className="px-6 py-4">Contacto</th>
                  <th className="px-6 py-4">Nível Solicitado</th>
                  <th className="px-6 py-4">Documentação</th>
                  <th className="px-6 py-4 text-center">Decisão/Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtrarUsuarios().length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500">
                      Nenhum utilizador encontrado
                    </td>
                  </tr>
                ) : (
                  filtrarUsuarios().map((usuario) => {
                    const roles = parseRoles(usuario.roles_status);
                    const rolesPendentes = roles.filter(r => r.status === 'pending' || r.status === 'rejected');
                    
                    if (rolesPendentes.length === 0) return null;
                    
                    return rolesPendentes.map((role, index) => (
                      <tr key={`${usuario.id}-${index}`} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{usuario.nome}</div>
                          <div className="text-xs text-gray-400">ID: {usuario.id}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs">{usuario.email}</div>
                          <div className="text-xs text-gray-400">{usuario.phone || 'Sem telefone'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="capitalize px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold tracking-wide">
                            {role.name.replace(/_/g, ' ')}
                          </span>
                          <span className={`ml-2 px-2 py-1 rounded-md text-xs font-semibold ${
                            role.status === 'pending' 
                              ? 'bg-yellow-50 text-yellow-700' 
                              : 'bg-red-50 text-red-700'
                          }`}>
                            {role.status === 'pending' ? '⏳ Pendente' : '❌ Rejeitado'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {role.document_url ? (
                            <div className="flex gap-2 flex-wrap">
                              <button
                                onClick={() => visualizarDocumento(role.document_url)}
                                className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
                              >
                                <Eye size={16} /> Visualizar
                              </button>
                              <button
                                onClick={() => baixarDocumento(role.document_url, usuario.nome)}
                                className="inline-flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition"
                              >
                                <Download size={16} /> Baixar
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Sem documento</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button 
                              onClick={() => gerenciarSolicitacao(usuario.id, role.role_id, 'approve')} 
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition shadow-sm"
                            >
                              <Check size={14} /> Aprovar
                            </button>
                            <button 
                              onClick={() => setRejeitando({ userId: usuario.id, roleId: role.role_id })} 
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg transition border border-red-200"
                            >
                              <X size={14} /> Rejeitar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ));
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Visualização PDF */}
      {visualizandoDoc && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50 rounded-t-2xl">
              <h3 className="text-lg font-bold text-gray-900">Visualizar Documento</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = visualizandoDoc;
                    link.download = 'documento.pdf';
                    link.click();
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
                >
                  <Download size={16} /> Baixar
                </button>
                <button
                  onClick={() => {
                    setVisualizandoDoc(null);
                    setPdfError(null);
                  }}
                  className="p-2 hover:bg-gray-200 rounded-lg transition"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 p-4 bg-gray-100">
              {pdfError ? (
                <div className="h-full flex flex-col items-center justify-center bg-red-50 rounded-lg">
                  <X size={48} className="text-red-500 mb-4" />
                  <p className="text-red-600 text-center max-w-md">{pdfError}</p>
                  <button
                    onClick={() => setVisualizandoDoc(null)}
                    className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                  >
                    Fechar
                  </button>
                </div>
              ) : (
                <iframe
                  src={visualizandoDoc}
                  className="w-full h-full rounded-lg shadow-lg"
                  title="Visualizador de PDF"
                  style={{ border: 'none' }}
                  onError={() => setPdfError('Erro ao carregar o PDF. O arquivo pode estar corrompido ou inacessível.')}
                />
              )}
            </div>
            <div className="p-4 border-t bg-gray-50 rounded-b-2xl flex justify-end">
              <button
                onClick={() => {
                  setVisualizandoDoc(null);
                  setPdfError(null);
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Rejeição */}
      {rejeitando && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Recusar Solicitação</h3>
            <p className="text-sm text-gray-500 mb-4">Insira o motivo da rejeição:</p>
            <textarea 
              value={motivo} 
              onChange={(e) => setMotivo(e.target.value)} 
              rows={4} 
              placeholder="Ex: Documento ilegível ou expirado..."
              className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 text-sm mb-4 resize-none" 
              autoFocus
            />
            <div className="flex gap-3 justify-end text-sm font-semibold">
              <button 
                onClick={() => {
                  setRejeitando(null);
                  setMotivo('');
                }} 
                className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-xl transition"
              >
                Cancelar
              </button>
              <button 
                onClick={() => gerenciarSolicitacao(rejeitando.userId, rejeitando.roleId, 'reject', motivo)} 
                disabled={!motivo.trim()} 
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition shadow-sm disabled:opacity-50"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientesAdmin;