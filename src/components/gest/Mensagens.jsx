import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, MoreHorizontal, Paperclip, Send, ChevronLeft, Search, X } from 'lucide-react';

export default function Mensagens() {
  const [contactos, setContactos] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [loading, setLoading] = useState(false);
  const [isChatOpenMobile, setIsChatOpenMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Carregar usuário logado
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setUsuarioLogado(user);
      } catch (e) {
        console.error('Erro ao carregar usuário:', e);
      }
    }
  }, []);

  // Buscar contactos
  useEffect(() => {
    if (usuarioLogado) {
      fetchContactos();
    }
  }, [usuarioLogado, searchTerm]);

  // Buscar mensagens quando mudar o contacto ativo
  useEffect(() => {
    if (activeContact && usuarioLogado) {
      fetchMensagens();
      marcarMensagensComoLidas();
    }
  }, [activeContact]);

  // Scroll para o fim das mensagens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  const fetchContactos = async () => {
    setLoading(true);
    try {
      const url = `https://welovepalop.com/api/mensagens/usuarios.php?usuario_id=${usuarioLogado.id}` + 
                  (searchTerm ? `&busca=${encodeURIComponent(searchTerm)}` : '');
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setContactos(data.data);
        if (data.data.length > 0 && !activeContact) {
          setActiveContact(data.data[0]);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar contactos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMensagens = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://welovepalop.com/api/mensagens/conversa.php?usuario_id=${usuarioLogado.id}&outro_usuario_id=${activeContact.id}`
      );
      const data = await response.json();
      
      if (data.success) {
        setMensagens(data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
    } finally {
      setLoading(false);
    }
  };

  const marcarMensagensComoLidas = async () => {
    try {
      await fetch('https://welovepalop.com/api/mensagens/marcar_lidas.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: usuarioLogado.id,
          remetente_id: activeContact.id
        })
      });
    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error);
    }
  };

  const enviarMensagem = async () => {
    if (!novaMensagem.trim()) return;
    
    const mensagemEnviar = novaMensagem;
    setNovaMensagem('');
    
    try {
      const response = await fetch(
        `https://welovepalop.com/api/mensagens/conversa.php?usuario_id=${usuarioLogado.id}&outro_usuario_id=${activeContact.id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mensagem: mensagemEnviar })
        }
      );
      const data = await response.json();
      
      if (data.success) {
        // Adicionar mensagem à lista localmente
        setMensagens(prev => [...prev, {
          id: data.data.id,
          remetente_id: usuarioLogado.id,
          destinatario_id: activeContact.id,
          mensagem: mensagemEnviar,
          created_at: data.data.created_at,
          lida: 0,
          remetente_nome: usuarioLogado.nome,
          remetente_foto: usuarioLogado.foto
        }]);
        
        // Atualizar a última mensagem na lista de contactos
        setContactos(prev => prev.map(c => 
          c.id === activeContact.id 
            ? { ...c, ultima_mensagem: mensagemEnviar, ultima_mensagem_data: data.data.created_at }
            : c
        ));
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensagem();
    }
  };

  const openChat = (contacto) => {
    setActiveContact(contacto);
    setIsChatOpenMobile(true);
  };

  const formatarData = (data) => {
    if (!data) return '';
    const date = new Date(data);
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(ontem.getDate() - 1);
    
    if (date.toDateString() === hoje.toDateString()) {
      return date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === ontem.toDateString()) {
      return 'Ontem';
    } else {
      return date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
    }
  };

  const getTipoContaBadge = (tipo) => {
    if (tipo === 'proprietario') {
      return <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Anfitrião</span>;
    }
    return null;
  };

  const filteredContactos = contactos.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl w-full h-[calc(100vh-120px)] min-h-[600px] bg-white rounded-xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex overflow-hidden text-[#0f172a]">
      
      {/* --- PAINEL ESQUERDO: Lista de Conversas --- */}
      <div className={`w-full md:w-[320px] lg:w-[350px] flex-shrink-0 flex flex-col border-r border-gray-100 ${isChatOpenMobile ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Cabeçalho da Lista */}
        <div className="flex items-center justify-between p-4 border-b border-gray-50 h-[72px]">
          <h2 className="text-[18px] font-bold">Mensagens</h2>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        {/* Busca */}
        <div className="p-3 border-b border-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar contatos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Lista de Contactos */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {loading && contactos.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto"></div>
            </div>
          ) : filteredContactos.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              Nenhum contato encontrado
            </div>
          ) : (
            filteredContactos.map((contacto) => (
              <div 
                key={contacto.id}
                onClick={() => openChat(contacto)}
                className={`flex items-start gap-3 p-4 cursor-pointer transition-colors border-l-2 ${
                  activeContact?.id === contacto.id 
                    ? 'bg-[#eff6ff] border-[#2563eb]'
                    : 'bg-white border-transparent hover:bg-gray-50'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <img 
                    src={contacto.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(contacto.nome)}&background=0D8ABC&color=fff`} 
                    alt={contacto.nome} 
                    className="w-11 h-11 rounded-full object-cover border border-gray-200"
                  />
                  {contacto.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#16a34a] border-2 border-white rounded-full"></span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[14px] font-bold truncate ${activeContact?.id === contacto.id ? 'text-[#2563eb]' : 'text-[#0f172a]'}`}>
                        {contacto.nome}
                      </span>
                      {getTipoContaBadge(contacto.tipo_conta)}
                    </div>
                    <span className="text-[11px] font-medium text-[#64748b] whitespace-nowrap ml-2">
                      {formatarData(contacto.ultima_mensagem_data)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[13px] text-[#64748b] truncate flex-1">
                      {contacto.ultima_mensagem || 'Nenhuma mensagem ainda'}
                    </p>
                    {contacto.mensagem_nao_lida && (
                      <span className="w-2.5 h-2.5 bg-[#2563eb] rounded-full ml-2 flex-shrink-0"></span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- PAINEL DIREITO: Chat Activo --- */}
      <div className={`flex-1 bg-[#f8f9fc] flex flex-col ${!isChatOpenMobile ? 'hidden md:flex' : 'flex'}`}>
        
        {activeContact ? (
          <>
            {/* Cabeçalho do Chat */}
            <div className="bg-white flex items-center justify-between p-4 border-b border-gray-100 h-[72px] shadow-sm z-10">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsChatOpenMobile(false)}
                  className="md:hidden p-1.5 -ml-1.5 mr-1 hover:bg-gray-100 rounded-lg text-gray-600"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <img 
                  src={activeContact.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeContact.nome)}&background=0D8ABC&color=fff`} 
                  alt={activeContact.nome} 
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-bold text-[#0f172a]">{activeContact.nome}</span>
                    {getTipoContaBadge(activeContact.tipo_conta)}
                  </div>
                  {activeContact.online ? (
                    <span className="text-[12px] font-semibold text-[#16a34a]">Online</span>
                  ) : (
                    <span className="text-[12px] text-[#64748b]">Offline</span>
                  )}
                </div>
              </div>

              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Área das Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              {mensagens.map((msg, index) => {
                const isRemetente = msg.remetente_id === usuarioLogado?.id;
                return (
                  <div key={msg.id || index} className={`flex ${isRemetente ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] md:max-w-[70%] ${isRemetente ? 'order-1' : 'order-1'}`}>
                      <div className={`p-3.5 rounded-2xl ${isRemetente ? 'bg-[#2563eb] text-white rounded-tr-sm' : 'bg-white border border-gray-100 text-[#0f172a] rounded-tl-sm shadow-[0_1px_2px_rgba(0,0,0,0.02)]'}`}>
                        <p className="text-[14px] leading-relaxed break-words">{msg.mensagem}</p>
                        <span className={`text-[10px] font-medium block text-right mt-1.5 ${isRemetente ? 'text-blue-200' : 'text-[#94a3b8]'}`}>
                          {formatarData(msg.created_at)}
                          {isRemetente && msg.lida === 1 && <span className="ml-1">✓✓</span>}
                          {isRemetente && msg.lida === 0 && <span className="ml-1">✓</span>}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input de Mensagem */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex items-center gap-3 bg-[#f8fafc] border border-gray-200 rounded-full px-2 py-1.5 focus-within:ring-2 focus-within:ring-[#2563eb]/20 focus-within:border-[#2563eb] transition-all">
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100">
                  <Paperclip className="w-5 h-5" />
                </button>
                
                <input 
                  ref={inputRef}
                  type="text" 
                  placeholder="Escreva uma mensagem..." 
                  value={novaMensagem}
                  onChange={(e) => setNovaMensagem(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 bg-transparent border-none focus:outline-none text-[14px] text-[#0f172a] placeholder-gray-400 py-2"
                />
                
                <button 
                  onClick={enviarMensagem}
                  disabled={!novaMensagem.trim()}
                  className={`p-2.5 transition-colors rounded-full flex items-center justify-center mr-0.5 ${
                    novaMensagem.trim() 
                      ? 'text-[#2563eb] hover:bg-blue-50 cursor-pointer' 
                      : 'text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-5 h-5 ml-0.5" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div>
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhuma conversa selecionada</h3>
              <p className="text-sm text-gray-400">Selecione um contato para começar a conversar</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}