// src/components/anuncios/ChatSimples.jsx
import React, { useState, useEffect } from 'react';
import { Send, Loader2, X } from 'lucide-react';

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
      if (id) return { id: Number(id), nome: user.nome || user.name || 'Utilizador', foto: user.foto };
    }
    const saved = localStorage.getItem('user') || localStorage.getItem('morabeza_user');
    if (saved) return JSON.parse(saved);
    return null;
  } catch { return null; }
}

// ============================================================
// TOAST DE SISTEMA
// ============================================================
function ToastSistema({ visivel, mensagem, tipo = 'success', onFechar }) {
  useEffect(() => {
    if (visivel) {
      const timer = setTimeout(() => {
        if (onFechar) onFechar();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [visivel, onFechar]);

  const cores = {
    success: 'bg-slate-900 text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-blue-600 text-white'
  };

  return (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-[300] transition-all duration-500 ease-out pointer-events-none ${
        visivel ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div className={`${cores[tipo]} rounded-2xl px-5 py-3 shadow-2xl flex items-center gap-3 backdrop-blur-md border border-white/10 pointer-events-auto min-w-[280px] max-w-[90vw]`}>
        {/* Ícone check verde */}
        {tipo === 'success' && (
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
        )}
        {tipo === 'error' && (
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <X size={14} />
          </div>
        )}
        {tipo === 'info' && (
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </div>
        )}
        <p className="text-sm font-medium flex-1">{mensagem}</p>
      </div>
    </div>
  );
}

/**
 * Chat simples para colocar num anúncio.
 * Fecha automaticamente após envio + mostra toast de sistema.
 */
export default function ChatSimples({ 
  anuncioId, 
  tipoAnuncio = 'alojamento',
  anuncioTitulo = 'Anúncio',
  proprietarioId,
  onClose
}) {
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);
  const [toast, setToast] = useState({ visivel: false, mensagem: '', tipo: 'success' });
  const [fechando, setFechando] = useState(false);
  const usuarioLogado = obterUsuario();

  const ehProprio = Number(proprietarioId) === Number(usuarioLogado?.id);

  const mostrarToast = (mensagem, tipo = 'success') => {
    setToast({ visivel: true, mensagem, tipo });
  };

  const fecharSuavemente = () => {
    setFechando(true);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300); // espera a animação
  };

  const enviar = async () => {
    if (!mensagem.trim()) return;
    
    if (!usuarioLogado?.id) {
      setErro('Faça login para enviar mensagem');
      mostrarToast('Faça login para enviar mensagem', 'error');
      return;
    }

    setEnviando(true);
    setErro(null);

    try {
      const response = await fetch('https://welovepalop.com/api/mensagens/enviar_simples.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: usuarioLogado.id,
          anuncio_id: anuncioId,
          tipo_anuncio: tipoAnuncio,
          mensagem: mensagem.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        setMensagem('');
        // 1. Mostrar toast de sistema
        mostrarToast('Mensagem enviada com sucesso', 'success');
        // 2. Fechar modal suavemente após 600ms
        setTimeout(() => fecharSuavemente(), 600);
      } else {
        setErro(data.message || 'Erro ao enviar');
        mostrarToast(data.message || 'Erro ao enviar', 'error');
      }
    } catch (err) {
      setErro('Erro de rede. Tente novamente.');
      mostrarToast('Erro de rede. Tente novamente.', 'error');
    } finally {
      setEnviando(false);
    }
  };

  // Bloquear scroll do body quando está aberto
  useEffect(() => {
    if (onClose) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [onClose]);

  const conteudo = ehProprio ? (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
      <p className="text-sm text-slate-500">Este é o seu anúncio</p>
    </div>
  ) : (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      {/* Círculo com nome do anúncio */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
          {anuncioTitulo.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-500 font-medium">Enviar mensagem sobre</p>
          <p className="text-sm font-bold text-slate-900 truncate">{anuncioTitulo}</p>
        </div>
        {onClose && (
          <button
            onClick={fecharSuavemente}
            className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Textarea */}
      <textarea
        value={mensagem}
        onChange={(e) => setMensagem(e.target.value)}
        placeholder="Escreva a sua mensagem..."
        rows={4}
        className="w-full border border-slate-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-60"
        disabled={enviando}
        autoFocus
      />

      {/* Erro inline */}
      {erro && (
        <p className="text-xs text-red-600 mt-2 font-medium">{erro}</p>
      )}

      {/* Botão enviar */}
      <button
        onClick={enviar}
        disabled={!mensagem.trim() || enviando}
        className={`w-full mt-3 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
          enviando
            ? 'bg-blue-900 text-white opacity-80'
            : mensagem.trim()
              ? 'bg-blue-900 hover:bg-blue-950 text-white active:scale-[0.98]'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
        }`}
      >
        {enviando ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            A enviar...
          </>
        ) : (
          <>
            <Send size={16} />
            Enviar mensagem
          </>
        )}
      </button>

      {/* Login hint */}
      {!usuarioLogado && (
        <p className="text-[10px] text-slate-400 text-center mt-2">
          Precisa estar logado para enviar
        </p>
      )}
    </div>
  );

  // Se não tem onClose, é inline (não é modal)
  if (!onClose) {
    return (
      <>
        {conteudo}
        <ToastSistema
          visivel={toast.visivel}
          mensagem={toast.mensagem}
          tipo={toast.tipo}
          onFechar={() => setToast(prev => ({ ...prev, visivel: false }))}
        />
      </>
    );
  }

  // Modal com animação
  return (
    <>
      {/* Overlay com fade suave */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 transition-opacity duration-300 ${
          fechando ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={(e) => {
          if (e.target === e.currentTarget && !enviando) fecharSuavemente();
        }}
      >
        {/* Conteúdo com slide+fade */}
        <div
          className={`w-full max-w-md transition-all duration-300 ease-out ${
            fechando 
              ? 'opacity-0 scale-95 translate-y-4' 
              : 'opacity-100 scale-100 translate-y-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {conteudo}
        </div>
      </div>

      {/* Toast de sistema */}
      <ToastSistema
        visivel={toast.visivel}
        mensagem={toast.mensagem}
        tipo={toast.tipo}
        onFechar={() => setToast(prev => ({ ...prev, visivel: false }))}
      />
    </>
  );
}