import { useRef, useState } from 'react';

export default function useConfirmarImagem(remover) {
  const [imagem, setImagem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const busy = useRef(false);
  return {
    pedir: id => { if (!busy.current) { setErro(null); setImagem({ id }); } },
    dialog: {
      aberto: imagem !== null, loading, erro,
      tituloKey: 'imagem_apagar_titulo', confirmarKey: 'imagem_apagar_titulo', descricaoKey: 'imagem_apagar_pergunta',
      onClose: () => { if (!busy.current) setImagem(null); },
      onConfirm: async () => {
        if (!imagem || busy.current) return;
        busy.current = true; setLoading(true); setErro(null);
        try { await remover(imagem.id); setImagem(null); }
        catch (error) { setErro(error.message === 'imagem_ultima_obrigatoria' ? 'imagem_ultima_obrigatoria' : 'imagem_apagar_erro'); }
        finally { busy.current = false; setLoading(false); }
      },
    },
  };
}
