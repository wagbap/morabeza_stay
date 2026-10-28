import React, { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Star, House, Building2, Users, BedDouble, Bath, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import BotaoFavorito from '../../../components/BotaoFavorito';
import { IMAGEM_INDISPONIVEL, substituirImagemIndisponivel } from '../../../utils/imagemIndisponivel';
import { obterCasasBanho } from '../utils/casasBanho';

const imageUrl = value => {
  const url = typeof value === 'string' ? value : value?.caminho_url || value?.url || value?.imagem_url;
  if (!url) return null;
  if (/^https?:\/\//.test(url)) return url;
  return `https://welovepalop.com${url.startsWith('/') ? '' : '/api/uploads/'}${url}`;
};

const CardAlojamento = (props) => {
  const { id, slug, titulo, localizacao, tipo_propriedade, tipo, estrelas, total_avaliacoes,
    preco_mostrar, preco_noite, preco_rotulo, imagem_url, imagens_extra, isList } = props;
  const { t } = useTranslation();
  const location = useLocation();
  const [slide, setSlide] = useState(0);
  const [shareStatus, setShareStatus] = useState(null);
  const price = Number(preco_mostrar ?? preco_noite ?? 0);
  const eur = (price / 110.265).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const photos = [...new Set([imagem_url, ...(Array.isArray(imagens_extra) ? imagens_extra : [])].map(imageUrl).filter(Boolean))];
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
        <img key={photos[active] || 'empty'} src={photos[active] || IMAGEM_INDISPONIVEL} alt={titulo} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover object-center" onError={substituirImagemIndisponivel} />
        <span className="absolute left-2.5 top-2.5 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">{type}</span>
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
      <div className="flex h-[220px] min-w-0 shrink-0 flex-col px-3 pb-3 pt-2.5 md:flex-1">
        <h3 className="truncate text-base font-bold leading-tight tracking-tight text-[#080e3b]">{titulo}</h3>
        <div className="mt-1.5 flex items-center gap-1 text-xs text-[#64739e]"><span className="text-blue-600"><MapPin size={14} className="shrink-0" /></span><span className="truncate">{localizacao || props.ilha}</span></div>
        <div className="mb-3 mt-3.5 grid min-h-[50px] grid-cols-4 gap-1 text-[#64739e]">
          {facts.map(({ icon: Icon, text }, index) => <div key={index} className="flex min-w-0 flex-col items-center gap-1.5 text-center"><span className="text-gray-400">{React.createElement(Icon, { size: 21, strokeWidth: 2 })}</span><span className="line-clamp-2 h-[26px] text-[10px] leading-[13px]">{text}</span></div>)}
        </div>
        <div className="mt-auto grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2">
          <div className="flex items-center gap-1 text-xs text-slate-600"><span className="text-amber-400 [&_svg]:fill-current"><Star size={16} strokeWidth={0} /></span>{Number(total_avaliacoes) > 0 ? <><span className="font-semibold">{rating.toFixed(1)}</span><span className="text-slate-500">({Number(total_avaliacoes)})</span></> : <span className="text-xs text-[#64739e]">{t('alojamento_card_sem_avaliacoes')}</span>}</div>
          <div className="text-right leading-tight">
            {preco_rotulo === 'a_partir_de' && <p className="text-xs text-[#64739e]">{t('a_partir_de', 'A partir de')}</p>}
            <p className="text-[22px] font-semibold tracking-tight text-[#080e3b]">{price.toLocaleString('pt-PT')}<span className="ml-1 text-xs font-medium">CVE</span></p>
            <p className="mt-0.5 text-[10px] text-[#64739e]">&asymp; {eur} EUR{Number(props.preco_usd) > 0 ? ` \u00b7 ${Number(props.preco_usd).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD` : ''}</p>
            <p className="text-sm text-[#64739e]">/ {t('noite', 'noite')}</p>
          </div>
        </div>
      </div>
      {shareStatus && <p role="status" className="absolute inset-x-3 top-14 z-20 rounded-lg bg-white/95 px-3 py-2 text-xs text-blue-700 shadow-sm">{t(shareStatus)}</p>}
      <Link to={link} className="absolute inset-0 z-10 rounded-[14px] focus-visible:outline-2 focus-visible:outline-blue-600" aria-label={`${t('ver_detalhes_de')} ${titulo}`} />
    </article>
  );
};

export default memo(CardAlojamento);
