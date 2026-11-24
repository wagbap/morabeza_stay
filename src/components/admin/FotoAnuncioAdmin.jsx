import React, { useEffect, useState } from 'react';
import { requestApiJson } from '../../services/apiJson';
import { extrairFotosCarro } from '../../features/carros/utils/fotosCarro';
import { IMAGEM_INDISPONIVEL } from '../../utils/imagemIndisponivel';

function fotos(item, categoria) {
  const galeria = extrairFotosCarro(item);
  // A listagem administrativa pode fornecer apenas a capa, sobretudo para
  // anúncios pendentes que não estão disponíveis no endpoint público.
  const capas = extrairFotosCarro({ imagens: [item.imagem_principal, item.imagem_url, item.imagem_capa, item.foto_principal, item.foto] });
  const values = [...new Set([...galeria, ...capas])];
  return categoria === 'experiencias' ? values.map(url => url.replace('/uploads/carros/', '/uploads/experiencias/')) : values;
}

export default function FotoAnuncioAdmin({ item, categoria }) {
  const [detalhes, setDetalhes] = useState(null);
  const [falhadas, setFalhadas] = useState([]);
  useEffect(() => {
    if (categoria === 'alojamentos') return;
    const controller = new AbortController();
    const endpoint = categoria === 'carros' ? '/carro/buscar.php' : '/experiencia/buscar.php';
    const params = { id: item.id };
    requestApiJson(endpoint, { params, signal: controller.signal, retries: 0 })
      .then(response => {
        if (!controller.signal.aborted && response?.success === true && response.data && (categoria !== 'carros' || String(response.data.id) === String(item.id))) {
          setDetalhes(response.data.carro || response.data.experiencia || response.data);
        }
      }).catch(() => { /* Keep the listing image if details are unavailable. */ });
    return () => controller.abort();
  }, [categoria, item.id]);
  const candidates = [...new Set([...(detalhes ? fotos(detalhes, categoria) : []), ...fotos(item, categoria)])];
  const src = candidates.find(url => !falhadas.includes(url)) || IMAGEM_INDISPONIVEL;
  return <img src={src} alt={item.titulo} loading="lazy" decoding="async"
    className="h-full w-full object-cover transition duration-300 hover:scale-105"
    onError={() => { if (src !== IMAGEM_INDISPONIVEL) setFalhadas(values => [...values, src]); }} />;
}
