import React, { useEffect, useState } from 'react';
import { requestApiJson } from '../../services/apiJson';
import { extrairFotosCarro } from '../../features/carros/utils/fotosCarro';
import { IMAGEM_INDISPONIVEL } from '../../utils/imagemIndisponivel';

function fotos(item, categoria) {
  const values = [...new Set([...extrairFotosCarro({ ...item, imagem_principal: null, imagem_url: null, imagem_capa: null }), ...extrairFotosCarro(item)])];
  return categoria === 'experiencias' ? values.map(url => url.replace('/uploads/carros/', '/uploads/experiencias/')) : values;
}

export default function FotoAnuncioAdmin({ item, categoria }) {
  const [detalhes, setDetalhes] = useState(null);
  const [falhadas, setFalhadas] = useState([]);
  useEffect(() => {
    if (categoria === 'alojamentos') return;
    const controller = new AbortController();
    const endpoint = categoria === 'carros' ? '/get_carro_detalhes.php' : '/experiencia/buscar.php';
    requestApiJson(endpoint, { params: { id: item.id }, signal: controller.signal, retries: 0 })
      .then(response => {
        if (!controller.signal.aborted && response?.success === true && response.data) {
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
