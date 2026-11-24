import '@fontsource-variable/inter';
// src/components/gest/Mensagens.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, X, ChevronLeft, Loader2, Home, Car, Compass, MessageCircle, CheckCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const API_BASE = 'https://welovepalop.com/api/mensagens';

// Relative profile paths belong to the API host, never the current /gest route.
function normalizarFotoPerfil(valor) {
  if (typeof valor !== 'string') return null;
  const caminho = valor.trim();
  if (!caminho || /^(null|undefined|false)$/i.test(caminho)) return null;
  try {
    const url = new URL(caminho.replace(/\\/g, '/'), 'https://welovepalop.com/');
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}

function AvatarFotoMensagem({ src, nome, className }) {
  const [carregada, setCarregada] = useState(false);
  const [falhou, setFalhou] = useState(false);
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  const iniciais = (Array.from(partes[0] || '')[0] || '') +
    (partes.length > 1 ? Array.from(partes.at(-1))[0] : '');

  return (
    <span role="img" aria-label={nome} className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-blue-600 font-semibold text-white ${className}`}>
      <span aria-hidden="true">{iniciais.toLocaleUpperCase()}</span>
      {src && !falhou && <img
        src={src} alt="" aria-hidden="true" decoding="async"
        referrerPolicy="no-referrer"
        className={`absolute inset-0 h-full w-full object-cover ${carregada ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setCarregada(true)}
        onError={() => setFalhou(true)}
      />}
    </span>
  );
}

function AvatarMensagem({ contacto, className }) {
  const { t } = useTranslation();
  const nome = typeof contacto.nome === 'string' && contacto.nome.trim()
    ? contacto.nome : t('mensagens_utilizador', 'Utilizador');
  const src = [contacto.foto, contacto.foto_perfil, contacto.picture, contacto.avatar]
    .map(normalizarFotoPerfil).find(Boolean) || null;
  // Remount image state when the profile URL or contact changes.
  return <AvatarFotoMensagem key={`${contacto.id}:${src}`} src={src} nome={nome} className={className} />;
}

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
    case 'alojamento': return <span className="text-blue-500"><Home size={size} /></span>;
    case 'carro': return <span className="text-green-500"><Car size={size} /></span>;
    case 'experiencia': return <span className="text-purple-500"><Compass size={size} /></span>;
    default: return <span className="text-slate-400"><Home size={size} /></span>;
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

// Nome a mostrar: título ou fallback "#ID"
const getNomeAnuncio = (titulo, tipo, id) => {
  if (titulo) return titulo;
  return `${getLabelTipo(tipo)} #${id}`;
};

export default function Mensagens({ onClose }) {
  const { t } = useTranslation();
  const [contactos, setContactos] = useState([]);
  const [apenasNaoLidas, setApenasNaoLidas] = useState(false);
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
        setContactos(data.data.filter(c => String(c.id) !== String(usuarioLogado.id) && (c.ultima_mensagem || c.ultima_mensagem_data || Number(c.nao_lidas_count) > 0)));
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
      } else {
        setNovaMensagem(texto);
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

  const conversas = apenasNaoLidas ? contactos.filter(c => Number(c.nao_lidas_count) > 0) : contactos;

  return (
    <div className="flex h-[calc(100vh-130px)] min-h-[570px] w-full gap-3 text-[#0b1737] [font-family:Inter_Variable,Arial,sans-serif]">
      <section className={`flex w-full flex-col overflow-hidden rounded-2xl border border-[#e4e8f0] bg-white shadow-sm md:w-[37%] md:min-w-[310px] md:max-w-[500px] ${isChatOpenMobile ? 'hidden md:flex' : ''}`}>
        <div className="border-b border-[#e4e8f0] px-5 pb-4 pt-5">
          <div className="flex items-center gap-3"><span className="text-[#0758f9]"><MessageCircle size={34} strokeWidth={2.2} /></span><h1 className="text-[28px] font-bold tracking-tight">{t('mensagens_painel_titulo', 'Mensagens')}</h1>{onClose && <button onClick={onClose} aria-label={t('mensagens_fechar', 'Fechar')} className="ml-auto text-slate-400"><X size={20} /></button>}</div>
          <p className="mt-2 text-[15px] text-[#506080]">{t('mensagens_painel_descricao', 'Converse com os seus clientes e com o apoio.')}</p>
          <div className="my-5 border-t border-[#e4e8f0]" />
          <h2 className="mb-4 text-lg font-bold">{t('mensagens_conversas', 'As suas conversas')}</h2>
          <label className="relative block"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#73809a]"><Search size={19} /></span><input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={t('mensagens_pesquisar', 'Pesquisar nas conversas')} className="h-11 w-full rounded-lg border border-[#d6dce8] pl-10 pr-3 text-sm outline-none focus:border-blue-500" /></label>
          <div className="mt-5 flex gap-2"><button type="button" onClick={() => setApenasNaoLidas(false)} className={`rounded-lg px-6 py-2.5 text-sm ${!apenasNaoLidas ? 'bg-[#dfeaff] font-semibold text-[#0758f9]' : 'border border-[#e4e8f0] text-[#465575]'}`}>{t('mensagens_todas', 'Todas')}</button><button type="button" onClick={() => setApenasNaoLidas(true)} className={`rounded-lg px-5 py-2.5 text-sm ${apenasNaoLidas ? 'bg-[#dfeaff] font-semibold text-[#0758f9]' : 'border border-[#e4e8f0] text-[#465575]'}`}>{t('mensagens_nao_lidas', 'Não lidas')}</button></div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? <div className="py-8 text-center text-blue-600"><Loader2 className="mx-auto animate-spin" /></div> : conversas.length === 0 ? <p className="px-4 py-8 text-center text-sm text-slate-400">{t('mensagens_sem_conversas', 'Nenhuma conversa encontrada')}</p> : conversas.map(contacto => <button type="button" key={contacto.id} onClick={() => { setActiveContact(contacto); setIsChatOpenMobile(true); }} className={`flex w-full items-start gap-4 rounded-xl border-l-4 px-4 py-4 text-left transition ${String(activeContact?.id) === String(contacto.id) ? 'border-[#0758f9] bg-[#eaf1ff]' : 'border-transparent hover:bg-slate-50'}`}>
            <AvatarMensagem contacto={contacto} className="h-14 w-14 text-base" />
            <span className="min-w-0 flex-1"><span className="flex items-baseline justify-between gap-2"><span className="truncate text-base font-bold">{contacto.nome || t('mensagens_utilizador', 'Utilizador')}</span><span className="shrink-0 text-xs text-[#667697]">{formatarHora(contacto.ultima_mensagem_data)}</span></span><span className="mt-1 block truncate text-sm text-[#435371]">{contacto.ultima_mensagem}</span>{contacto.anuncio_id && <span className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-[#435371]">{getIconeTipo(contacto.tipo_anuncio, 15)}<span className="truncate">{getNomeAnuncio(contacto.anuncio_titulo, contacto.tipo_anuncio, contacto.anuncio_id)}</span></span>}</span>
            {Number(contacto.nao_lidas_count) > 0 && <span className="mt-7 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#0758f9] px-1 text-xs font-bold text-white">{contacto.nao_lidas_count}</span>}
          </button>)}
        </div>
      </section>
      <section className={`min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#e4e8f0] bg-white shadow-sm ${isChatOpenMobile ? 'flex' : 'hidden md:flex'}`}>
        {activeContact ? <>
          <header className="flex h-[76px] shrink-0 items-center gap-4 border-b border-[#e4e8f0] px-5"><button type="button" onClick={() => setIsChatOpenMobile(false)} aria-label={t('mensagens_voltar', 'Voltar')} className="text-slate-600 md:hidden"><ChevronLeft size={22} /></button><AvatarMensagem contacto={activeContact} className="h-12 w-12 text-base" /><h2 className="truncate text-xl font-bold">{activeContact.nome}</h2></header>
          {anuncioAtivo && <div className="mx-5 mt-4 flex items-center gap-3 rounded-xl border border-[#e4e8f0] p-4"><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-[#eef4ff] text-[#0758f9]">{getIconeTipo(anuncioAtivo.tipo, 24)}</span><div className="min-w-0"><p className="truncate text-base font-bold">{getNomeAnuncio(anuncioAtivo.titulo, anuncioAtivo.tipo, anuncioAtivo.id)}</p><p className="mt-1 text-sm text-[#667697]">{t('mensagens_sobre_anuncio', 'Conversa sobre o an?ncio')}</p></div></div>}
          <div className="flex-1 overflow-y-auto px-5 py-6">{loadingChat ? <div className="py-8 text-center text-blue-600"><Loader2 className="mx-auto animate-spin" /></div> : mensagens.length === 0 ? <p className="py-12 text-center text-sm text-slate-400">{t('mensagens_vazia', 'Ainda n?o h? mensagens nesta conversa.')}</p> : mensagens.map((msg, i) => { const meu = Number(msg.remetente_id) === Number(usuarioLogado.id); return <div key={msg.id || i} className={`mb-6 flex items-start gap-3 ${meu ? 'justify-end' : ''}`}>{!meu && <AvatarMensagem contacto={activeContact} className="h-9 w-9 text-xs" />}<div className={`max-w-[80%] ${meu ? 'text-right' : ''}`}><p className={`rounded-2xl px-4 py-3 text-sm leading-relaxed break-words ${meu ? 'bg-[#0758f9] text-white' : 'bg-[#eef0f4] text-[#10192e]'}`}>{msg.mensagem}</p><span className="mt-1 inline-flex items-center gap-1 text-xs text-[#71809d]">{formatarHora(msg.created_at)}{meu && Number(msg.lida) === 1 && <span className="text-[#0758f9]"><CheckCheck size={15} /></span>}</span></div></div>; })}<div ref={messagesEndRef} /></div>
          <form onSubmit={e => { e.preventDefault(); enviarMensagem(); }} className="flex gap-3 border-t border-[#e4e8f0] p-4"><input ref={inputRef} value={novaMensagem} onChange={e => setNovaMensagem(e.target.value)} placeholder={t('mensagens_escrever', 'Escreva uma mensagem...')} className="h-12 min-w-0 flex-1 rounded-xl border border-[#d6dce8] px-4 text-sm outline-none focus:border-blue-500" /><button type="submit" disabled={!novaMensagem.trim()} aria-label={t('mensagens_enviar', 'Enviar mensagem')} className="flex h-12 w-14 items-center justify-center rounded-xl bg-[#0758f9] text-white disabled:opacity-40"><Send size={22} /></button></form>
        </> : <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-slate-400">{t('mensagens_selecionar', 'Selecione uma conversa')}</div>}
      </section>
    </div>
  );
}
