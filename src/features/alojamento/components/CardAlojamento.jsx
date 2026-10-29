import ConversaoPreco from '../../../components/ConversaoPreco';
import React, { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Star, House, Building2, Users, BedDouble, Bath, ChevronLeft, ChevronRight, ArrowRight, Share2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import BotaoFavorito from '../../../components/BotaoFavorito';
import { extrairFotosAlojamento } from '../utils/fotosAlojamento';
import { obterCasasBanho } from '../utils/casasBanho';

const IMAGEM_LOCAL = '/images/alojamento-indisponivel.svg';

const CardAlojamento = (props) => {
  const { id, slug, titulo, localizacao, tipo_propriedade, tipo, estrelas, total_avaliacoes,
    preco_mostrar, preco_noite, preco_rotulo, imagem_url, imagens_extra, isList } = props;
  const { t } = useTranslation();
  const location = useLocation();
  const [slide, setSlide] = useState(0);
  const [shareStatus, setShareStatus] = useState(null);
  const [fotosComErro, setFotosComErro] = useState([]);
  const price = Number(preco_mostrar ?? preco_noite ?? 0);
  const todasFotos = useMemo(() => extrairFotosAlojamento({ imagem_url, imagens_extra, imagens: props.imagens, fotos: props.fotos }), [imagem_url, imagens_extra, props.imagens, props.fotos]);
  const photos = todasFotos.filter(url => !fotosComErro.includes(url));
  const active = slide % Math.max(1, photos.length);
  const type = tipo_propriedade || tipo || t('alojamento', 'Alojamento');
  const rating = Number(estrelas) || 0;
  const link = `/alojamentos/${encodeURIComponent(String(slug || id).trim())}${location.search}`;
  const share = async () => {
    const url = new URL(link, window.location.origin).href;
    try {
      if (navigator.share) await navigator.share({ title: titulo, url });
      else {
        await navigator.clipboard.writeText(url);
        setShareStatus('alojamento_card_copiado');
      }
    } catch (error) {
      if (error.name !== 'AbortError') setShareStatus('alojamento_card_partilha_erro');
    }
  };
  const countLabel = (value, singular, plural) => value == null || typeof value === 'object'
    ? '\u2014' : `${value} ${t(Number(value) === 1 ? singular : plural)}`;
  const facts = [
    { icon: /apart/i.test(type) ? Building2 : House, text: type },
    { icon: Users, text: countLabel(props.capacidade_efetiva ?? props.capacidade, 'hospede', 'hospedes') },
    { icon: BedDouble, text: countLabel(props.numero_quartos ?? props.quartos, 'quarto', 'quartos') },
    { icon: Bath, text: countLabel(obterCasasBanho(props.casas_banho, props.comodidades), 'alojamento_card_banho', 'alojamento_card_banhos') },
  ];
  const item = { ...props, imagem_url: photos[0], tipo: 'alojamento' };

  return (
    <article className={`relative isolate overflow-hidden rounded-[14px] border border-slate-200 bg-white transition-shadow hover:shadow-lg ${isList ? 'flex flex-col md:flex-row' : 'flex h-full flex-col'}`}>
      <div className={`relative h-[240px] shrink-0 overflow-hidden rounded-t-[13px] bg-[#b5b5b5] ${isList ? 'w-full md:w-[38%] md:rounded-l-[14px] md:rounded-tr-none' : 'w-full'}`}>
        <img key={photos[active] || 'empty'} src={photos[active] || IMAGEM_LOCAL} alt={titulo} width={640} height={480} loading={props.imagemPrioritaria ? 'eager' : 'lazy'} decoding="async" className="absolute inset-0 h-full w-full object-cover object-center" onError={() => {
          const url = photos[active];
          if (url) setFotosComErro(previous => previous.includes(url) ? previous : [...previous, url]);
        }} />
        <span className="absolute left-3 bottom-3 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">{type}</span>
        <button type="button" onClick={share} aria-label={t('alojamento_card_partilhar')} className="absolute right-14 top-2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-gray-600 shadow-sm hover:bg-white"><Share2 size={22} /></button>
        <BotaoFavorito onFavoritoChange={props.onFavoritoChange} tipo="alojamentos" item={item} size={25} className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center" />
        {photos.length > 1 && <>
          <button type="button" onClick={() => setSlide((active + photos.length - 1) % photos.length)} aria-label={t('alojamento_card_anterior', 'Previous photo')} className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white p-1.5 text-blue-600 hover:bg-white"><ChevronLeft size={22} /></button>
          <button type="button" onClick={() => setSlide((active + 1) % photos.length)} aria-label={t('alojamento_card_seguinte', 'Next photo')} className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white p-1.5 text-blue-600 hover:bg-white"><ChevronRight size={22} /></button>
          <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center gap-1.5">
            {photos.map((photo, index) => <span key={photo} className={`h-2 w-2 rounded-full ${active === index ? 'bg-white' : 'bg-white/50'}`} />)}
          </div>
        </>}
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500"><span className="text-blue-600"><MapPin size={15} /></span><span className="truncate">{localizacao || props.ilha}</span></div>
        <h3 className="line-clamp-2 text-xl font-bold leading-tight tracking-tight text-slate-900">{titulo}</h3>
        <div className="my-4 grid grid-cols-2 gap-x-3 gap-y-3 text-sm text-slate-600">
          {facts.map(({ icon: Icon, text }, index) => <div key={index} className="flex min-w-0 items-center gap-2"><span className="shrink-0 text-blue-600">{React.createElement(Icon, { size: 22, strokeWidth: 1.8 })}</span><span className="line-clamp-2">{text}</span></div>)}
        </div>
        <div className="mb-4 flex items-center gap-1.5 text-xs text-slate-500"><span className="text-amber-400 [&_svg]:fill-current"><Star size={18} strokeWidth={0} /></span>{Number(total_avaliacoes) > 0 ? <><span className="font-semibold text-slate-700">{rating.toFixed(1)}</span><span>({Number(total_avaliacoes)})</span></> : <span>{t('alojamento_card_sem_avaliacoes')}</span>}</div>
        <div className="mt-auto">
          {preco_rotulo === 'a_partir_de' && <p className="mb-0.5 text-xs text-slate-500">{t('a_partir_de', 'A partir de')}</p>}
          <p className="flex flex-wrap items-baseline gap-x-1.5 text-2xl font-extrabold tracking-tight text-slate-900">{price.toLocaleString('pt-PT')} CVE <span className="text-sm font-normal tracking-normal text-slate-500">{`/ ${t('noite', 'noite')}`}</span></p>
          <ConversaoPreco valorCve={price} valorUsd={props.preco_usd} />
          <span className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 text-sm font-semibold text-blue-600">{t('card_ver_disponibilidade', 'Ver disponibilidade')}<ArrowRight size={19} /></span>
        </div>
      </div>
      {shareStatus && <p role="status" className="absolute inset-x-3 top-14 z-20 rounded-lg bg-white/95 px-3 py-2 text-xs text-blue-700 shadow-sm">{t(shareStatus)}</p>}
      <Link to={link} className="absolute inset-0 z-10 rounded-[14px] focus-visible:outline-2 focus-visible:outline-blue-600" aria-label={`${t('ver_detalhes_de')} ${titulo}`} />
    </article>
  );
};

export default memo(CardAlojamento);
