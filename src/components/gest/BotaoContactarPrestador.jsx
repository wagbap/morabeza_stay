import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import Mensagens from '../gest/Mensagens';

export default function BotaoContactarPrestador({ 
  anuncio, 
  tipoAnuncio = 'alojamento',
  usuarioLogado,
  label = 'Contactar Prestador',
  className = ''
}) {
  const [aberto, setAberto] = useState(false);

  if (!anuncio || !usuarioLogado) return null;

  // Descobrir o dono conforme o tipo
  const donoId = tipoAnuncio === 'alojamento' 
    ? anuncio.proprietario_id 
    : anuncio.usuario_id;

  // Não mostrar se for o próprio dono
  if (Number(donoId) === Number(usuarioLogado.id)) return null;
  if (!donoId) {
    console.warn('Anúncio sem dono:', anuncio);
    return null;
  }

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        className={`inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors ${className}`}
      >
        <MessageCircle className="w-4 h-4" />
        {label}
      </button>

      {aberto && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setAberto(false); }}
        >
          <div className="w-full max-w-6xl">
            <Mensagens
              anuncioId={anuncio.id}
              prestadorId={donoId}
              tipoAnuncio={tipoAnuncio}
              onClose={() => setAberto(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}