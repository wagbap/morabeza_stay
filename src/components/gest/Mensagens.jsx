// src/components/gest/Mensagens.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, X, ChevronLeft, Loader2, Home, Car, Compass } from 'lucide-react';

const API_BASE = 'https://welovepalop.com/api/mensagens';

function obterUsuario() {
  try {
    const token = localStorage.getItem('token') 
               || localStorage.getItem('morabeza_token')
               || localStorage.getItem('access_token')
               || localStorage.getItem('jwt');
    if (token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const parsed = JSON.parse(decodeURIComponent(
        atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      ));
      const user = parsed?.data || parsed?.user || parsed?.usuario || parsed;
      const id = user?.id || user?.userId || user?.user_id || user?.usuario_id || parsed?.sub;
      if (id) return {
        id: Number(id),
        nome: user.nome || user.name || 'Utilizador',
        foto: user.foto || user.picture || null
      };
    }
    const saved = localStorage.getItem('user') || localStorage.getItem('morabeza_user');
    if (saved) return JSON.parse(saved);
    return null;
  } catch { return null; }
}

// ============================================================
// ÍCONE + COR + LABEL do tipo de anúncio
// ============================================================
const getIconeTipo = (tipo, size = 14) => {
  switch(tipo) {
    case 'alojamento': return <Home size={size} className="text-blue-500" />;
    case 'carro': return <Car size={size} className="text-green-500" />;
    case 'experiencia': return <Compass size={size} className="text-purple-500" />;
    default: return <Home size={size} className="text-slate-400" />;
  }
};

const getLabelTipo = (tipo) => {
  switch(tipo) {
    case 'alojamento': return 'Alojamento';
    case 'carro': return 'Carro';
    case 'experiencia': return 'Experiência';
    default: return 'Anúncio';
  }
};

const getCorTipo = (tipo) => {
  switch(tipo) {
    case 'alojamento': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'carro': return 'bg-green-50 text-green-700 border-green-200';
    case 'experiencia': return 'bg-purple-50 text-purple-700 border-purple-200';
    default: return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

// Nome a mostrar: título ou fallback "#ID"
const getNomeAnuncio = (titulo, tipo, id) => {
  if (titulo) return titulo;
  return `${getLabelTipo(tipo)} #${id}`;
};

export default function Mensagens({ onClose }) {
  const [contactos, setContactos] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [isChatOpenMobile, setIsChatOpenMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const user = obterUsuario();
    if (user) setUsuarioLogado(user);
  }, []);

  useEffect(() => {
    if (usuarioLogado?.id) fetchContactos();
  }, [usuarioLogado, searchTerm]);

  useEffect(() => {
    if (activeContact?.id && usuarioLogado?.id) {
      fetchMensagens(activeContact);
      marcarLidas();
    }
  }, [activeContact?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  // ============ FETCH CONTACTOS ============
  const fetchContactos = async () => {
    if (!usuarioLogado?.id) return;
    setLoading(true);
    try {
      const url = `${API_BASE}/usuarios.php?usuario_id=${usuarioLogado.id}` + 
                  (searchTerm ? `&busca=${encodeURIComponent(searchTerm)}` : '');
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success && data.data) {
        setContactos(data.data);
      }
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============ FETCH MENSAGENS ============
  const fetchMensagens = async (contacto) => {
    if (!contacto?.id || !usuarioLogado?.id) return;
    try {
      setLoadingChat(true);
      const url = `${API_BASE}/conversa.php?usuario_id=${usuarioLogado.id}&outro_usuario_id=${contacto.id}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success && data.data) {
        setMensagens(data.data);
      } else {
        setMensagens([]);
      }
    } catch (error) {
      console.error('Erro:', error);
      setMensagens([]);
    } finally {
      setLoadingChat(false);
    }
  };

  // ============ MARCAR LIDAS ============
  const marcarLidas = async () => {
    if (!activeContact?.id || !usuarioLogado?.id) return;
    try {
      await fetch(`${API_BASE}/marcar_lidas.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: usuarioLogado.id,
          remetente_id: activeContact.id
        })
      });
      setContactos(prev => prev.map(c => 
        c.id === activeContact.id ? { ...c, nao_lidas_count: 0, mensagem_nao_lida: false } : c
      ));
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  // ============ ENVIAR MENSAGEM ============
  const enviarMensagem = async () => {
    if (!novaMensagem.trim() || !activeContact) return;
    
    const texto = novaMensagem;
    setNovaMensagem('');
    
    try {
      const payload = { mensagem: texto };
      if (activeContact.anuncio_id) payload.anuncio_id = activeContact.anuncio_id;
      if (activeContact.tipo_anuncio) payload.tipo_anuncio = activeContact.tipo_anuncio;

      const response = await fetch(
        `${API_BASE}/conversa.php?usuario_id=${usuarioLogado.id}&outro_usuario_id=${activeContact.id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );
      const data = await response.json();
      
      if (data.success) {
        setMensagens(prev => [...prev, {
          id: data.data?.id || Date.now(),
          remetente_id: usuarioLogado.id,
          destinatario_id: activeContact.id,
          mensagem: texto,
          anuncio_id: activeContact.anuncio_id || null,
          tipo_anuncio: activeContact.tipo_anuncio || null,
          anuncio_titulo: activeContact.anuncio_titulo || null,
          created_at: new Date().toISOString(),
          lida: 0
        }]);
      }
    } catch (error) {
      console.error('Erro:', error);
      setNovaMensagem(texto);
    }
  };

  const formatarHora = (data) => {
    if (!data) return '';
    const d = new Date(data);
    const hoje = new Date();
    if (d.toDateString() === hoje.toDateString()) {
      return d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
  };

  if (!usuarioLogado) {
    return (
      <div className="w-full h-[calc(100vh-120px)] bg-white rounded-xl border border-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">A carregar...</p>
        </div>
      </div>
    );
  }

  // ============ ANÚNCIO ATIVO ============
  const anuncioAtivo = (() => {
    for (let i = mensagens.length - 1; i >= 0; i--) {
      if (mensagens[i].anuncio_id) {
        return {
          id: mensagens[i].anuncio_id,
          tipo: mensagens[i].tipo_anuncio || activeContact?.tipo_anuncio || 'alojamento',
          titulo: mensagens[i].anuncio_titulo || activeContact?.anuncio_titulo || null
        };
      }
    }
    if (activeContact?.anuncio_id) {
      return {
        id: activeContact.anuncio_id,
        tipo: activeContact.tipo_anuncio || 'alojamento',
        titulo: activeContact.anuncio_titulo || null
      };
    }
    return null;
  })();

  return (
    <div className="w-full h-[calc(100vh-120px)] min-h-[600px] bg-white rounded-xl border border-gray-100 shadow-sm flex overflow-hidden">
      
      {/* ============ PAINEL ESQUERDO — Lista de contactos ============ */}
      <div className={`w-full md:w-[340px] flex-shrink-0 flex flex-col border-r border-gray-100 ${isChatOpenMobile ? 'hidden md:flex' : 'flex'}`}>
        
        <div className="flex items-center justify-between p-4 border-b border-gray-100 h-[64px]">
          <h2 className="text-lg font-bold">Mensagens</h2>
          {onClose && (
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500">
              <X size={18} />
            </button>
          )}
        </div>

        <div className="p-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
            </div>
          ) : contactos.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm px-4">
              Nenhum contacto encontrado
            </div>
          ) : (
            contactos.map((contacto) => {
              const naoLidas = contacto.nao_lidas_count || 0;
              const temAnuncio = contacto.anuncio_id;
              return (
                <div 
                  key={contacto.id}
                  onClick={() => { setActiveContact(contacto); setIsChatOpenMobile(true); }}
                  className={`flex items-start gap-3 p-3.5 cursor-pointer border-l-2 transition-colors ${
                    activeContact?.id === contacto.id 
                      ? 'bg-blue-50 border-blue-600' 
                      : 'bg-white border-transparent hover:bg-gray-50'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img 
                      src={contacto.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(contacto.nome || 'U')}&background=0D8ABC&color=fff`} 
                      alt={contacto.nome} 
                      className="w-12 h-12 rounded-full object-cover border border-gray-200"
                    />
                    {/* 🔴 Badge vermelha */}
                    {naoLidas > 0 && (
                      <span className="absolute -bottom-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 border-2 border-white shadow-md">
                        {naoLidas > 99 ? '99+' : naoLidas}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className={`text-sm truncate ${naoLidas > 0 ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                        {contacto.nome || 'Utilizador'}
                      </span>
                      <span className="text-[11px] text-gray-400 whitespace-nowrap ml-2">
                        {formatarHora(contacto.ultima_mensagem_data)}
                      </span>
                    </div>

                    {/* 🏷️ Badge do anúncio — NOME */}
                    {temAnuncio && (
                      <div className="flex items-center gap-1 mb-1">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${getCorTipo(contacto.tipo_anuncio)} max-w-full`}>
                          {getIconeTipo(contacto.tipo_anuncio, 10)}
                          <span className="truncate">
                            {getNomeAnuncio(contacto.anuncio_titulo, contacto.tipo_anuncio, contacto.anuncio_id)}
                          </span>
                        </span>
                      </div>
                    )}

                    <p className={`text-xs truncate ${naoLidas > 0 ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                      {contacto.ultima_mensagem || 'Nenhuma mensagem ainda'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ============ PAINEL DIREITO — Conversa ============ */}
      <div className={`flex-1 bg-gray-50 flex flex-col ${!isChatOpenMobile ? 'hidden md:flex' : 'flex'}`}>
        
        {activeContact ? (
          <>
            {/* Cabeçalho */}
            <div className="bg-white border-b border-gray-100">
              <div className="flex items-center gap-3 p-3.5 h-[64px]">
                <button 
                  onClick={() => setIsChatOpenMobile(false)}
                  className="md:hidden p-1 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronLeft size={20} />
                </button>
                <img 
                  src={activeContact.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeContact.nome || 'U')}&background=0D8ABC&color=fff`} 
                  alt={activeContact.nome} 
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{activeContact.nome}</p>
                  <p className="text-[11px] text-gray-500">{activeContact.online ? 'Online' : 'Offline'}</p>
                </div>
              </div>

              {/* 🏷️ Barra do anúncio — NOME */}
              {anuncioAtivo && (
                <div className={`flex items-center gap-2 px-4 py-2 border-t text-xs font-medium ${getCorTipo(anuncioAtivo.tipo)}`}>
                  {getIconeTipo(anuncioAtivo.tipo, 13)}
                  <span>Referente a</span>
                  <span className="font-bold truncate max-w-[240px]">
                    {getNomeAnuncio(anuncioAtivo.titulo, anuncioAtivo.tipo, anuncioAtivo.id)}
                  </span>
                </div>
              )}
            </div>

            {/* Lista de mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingChat ? (
                <div className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
                </div>
              ) : mensagens.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">
                  Nenhuma mensagem ainda. Diga olá! 👋
                </div>
              ) : (
                mensagens.map((msg, i) => {
                  const isMeu = Number(msg.remetente_id) === Number(usuarioLogado.id);
                  const mostrarBadgeAnuncio = msg.anuncio_id && 
                    (i === 0 || mensagens[i-1]?.anuncio_id !== msg.anuncio_id);

                  return (
                    <React.Fragment key={msg.id || i}>
                      {/* Separador do anúncio — NOME */}
                      {mostrarBadgeAnuncio && (
                        <div className="flex justify-center my-2">
                          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${getCorTipo(msg.tipo_anuncio)} max-w-[90%]`}>
                            {getIconeTipo(msg.tipo_anuncio, 11)}
                            <span className="truncate">
                              {getNomeAnuncio(msg.anuncio_titulo, msg.tipo_anuncio, msg.anuncio_id)}
                            </span>
                          </span>
                        </div>
                      )}

                      <div className={`flex ${isMeu ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-3.5 py-2 rounded-2xl ${
                          isMeu 
                            ? 'bg-blue-600 text-white rounded-tr-sm' 
                            : 'bg-white border border-gray-200 text-gray-900 rounded-tl-sm'
                        }`}>
                          <p className="text-sm leading-relaxed break-words">{msg.mensagem}</p>
                          <span className={`text-[10px] block text-right mt-1 ${isMeu ? 'text-blue-200' : 'text-gray-400'}`}>
                            {formatarHora(msg.created_at)}
                          </span>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-gray-100">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-2 py-1">
                <input 
                  ref={inputRef}
                  type="text" 
                  placeholder="Escreva uma mensagem..." 
                  value={novaMensagem}
                  onChange={(e) => setNovaMensagem(e.target.value)}
                  onKeyPress={(e) => { if (e.key === 'Enter') enviarMensagem(); }}
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm px-2 py-1.5"
                />
                <button 
                  onClick={enviarMensagem}
                  disabled={!novaMensagem.trim()}
                  className={`p-2 rounded-full ${
                    novaMensagem.trim() ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div>
              <div className="w-a16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Send size={28} className="text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">Selecione uma conversa</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}