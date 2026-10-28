import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import CardOferta from '../../../components/CardOferta';
import { Calendar, Users, Fuel, Gauge } from 'lucide-react';


import { requestApiJson } from '../../../services/apiJson';
import { extrairFotosCarro } from '../utils/fotosCarro';

const pedidos = new Map();
const carregarFotos = carro => {
  const key = String(carro.slug || carro.id);
  if (!pedidos.has(key)) {
    pedidos.set(key, requestApiJson('/get_carro_detalhes.php', {
      params: carro.slug ? { slug: carro.slug } : { id: carro.id },
    }).then(result => {
      if (!result.success || !result.data) throw new Error('Invalid vehicle response');
      return extrairFotosCarro(result.data);
    }).finally(() => pedidos.delete(key)));
  }
  return pedidos.get(key);
};

const CardCarro = ({ carro, isList = false, onFavoritoChange }) => {
  const [img, setImg] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (!carro?.id && !carro?.slug) return;
    let cancelado = false;
    carregarFotos({ id: carro.id, slug: carro.slug }).then(urls => {
      if (!cancelado) setImg({ id: carro.id, urls });
    }).catch(() => {
      // Preserve photos supplied by the listing if the details endpoint fails.
    });
    return () => { cancelado = true; };
  }, [carro?.id, carro?.slug]);

  if (!carro || (!carro.id && !carro.slug)) return null;

  const photos = img?.id === carro.id && img.urls.length ? img.urls : extrairFotosCarro(carro);

  return <CardOferta {...carro} isList={isList} onFavoritoChange={onFavoritoChange}
    basePath="/carros" tipoFavorito="carro" periodo="por_dia"
    routeState={{ carro }}
    titulo={carro.titulo || t('carro')}
    tipo={carro.tipo || carro.categoria_nome || t('carro')}
    localizacao={carro.localizacao || carro.cidade || carro.ilha}
    imagem_url={photos[0]}
    imagens_extra={photos.slice(1)}
    total_avaliacoes={carro.total_avaliacoes ?? carro.total_reviews}
    preco_noite={carro.preco_dia}
    facts={[
      { icon: Calendar, text: carro.ano || '\u2014' },
      { icon: Users, text: carro.passageiros ? `${carro.passageiros} ${t('card_oferta_lugares')}` : '\u2014' },
      { icon: Fuel, text: carro.combustivel || '\u2014' },
      { icon: Gauge, text: carro.transmissao || '\u2014' },
    ]}
  />;
};
export default CardCarro;
