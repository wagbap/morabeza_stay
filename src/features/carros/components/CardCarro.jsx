import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import CardOferta from '../../../components/CardOferta';
import { Calendar, Users, Fuel, Gauge } from 'lucide-react';


import { requestApiJson } from '../../../services/apiJson';
import { extrairFotosCarro } from '../utils/fotosCarro';

const pedidos = new Map();
const cacheFotos = new Map();
const fila = [];
let ativos = 0;
const proximo = () => {
  if (ativos >= 4 || !fila.length) return;
  ativos++;
  const executar = fila.shift();
  executar().finally(() => { ativos--; proximo(); });
};
const carregarFotos = carro => {
  const key = `${carro.id || ''}:${carro.slug || ''}`;
  const cached = cacheFotos.get(key);
  if (cached && Date.now() - cached.time < 60000) return Promise.resolve(cached.urls);
  if (!pedidos.has(key)) {
    const promise = new Promise((resolve, reject) => {
      fila.push(async () => {
        try {
          // The registration endpoint contains the uploaded gallery. The public
          // details endpoint can inject a stock photo even when no photos exist.
          const result = await requestApiJson('/carro/buscar.php', {
            params: carro.id ? { id: carro.id } : { slug: carro.slug }, retries: 0,
          });
          if (!result.success || !result.data) throw new Error('Invalid vehicle response');
          const urls = extrairFotosCarro(result.data.carro || result.data);
          cacheFotos.set(key, { urls, time: Date.now() });
          resolve(urls);
        } catch (error) { reject(error); }
      });
      proximo();
    }).finally(() => pedidos.delete(key));
    pedidos.set(key, promise);
  }
  return pedidos.get(key);
};

const CardCarro = ({ carro, isList = false, onFavoritoChange }) => {
  const [img, setImg] = useState(null);
  const fotoRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (!carro?.id && !carro?.slug) return;
    let cancelado = false;
    const key = `${carro.id || ''}:${carro.slug || ''}`;
    const carregar = () => carregarFotos({ id: carro.id, slug: carro.slug }).then(urls => {
      if (!cancelado) setImg({ key, urls });
    }).catch(() => { /* Keep listing photos if the details endpoint is unavailable. */ });
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); carregar(); }
    }, { rootMargin: '250px' });
    if (fotoRef.current) observer.observe(fotoRef.current);
    return () => { cancelado = true; observer.disconnect(); };
  }, [carro?.id, carro?.slug]);

  if (!carro || (!carro.id && !carro.slug)) return null;

  const photos = img?.key === `${carro.id || ''}:${carro.slug || ''}` ? img.urls : extrairFotosCarro(carro);

  return <CardOferta {...carro} imageContainerRef={fotoRef} isList={isList} onFavoritoChange={onFavoritoChange}
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
