import CampoDataMorabeza from './Calendario/CampoDataMorabeza';
// AvaliacoesSeccaoAlojamento.jsx
import React, { useState, useEffect, useCallback, useRef, useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Calendar, ThumbsUp, Flag, X, Loader2, CheckCircle, ChevronDown } from 'lucide-react';

import { createPortal } from 'react-dom';
import { requestApiJson } from '../services/apiJson';

const SERVICOS = {
  alojamento: { get: '/get_alojamento_avaliacoes.php', save: '/save_alojamento_avaliacao.php', id: 'alojamento_id', date: 'data_estadia', title: 'avaliacoes_hospedes', button: 'avaliar_estadia', question: 'aloj_avaliacoes_como_foi', dateLabel: 'aloj_avaliacoes_data', placeholder: 'aloj_avaliacoes_placeholder', period: 'estadia', empty: 'sem_avaliacoes_ainda', missingDate: 'informe_data_estadia' },
  carro: { get: '/get_carro_avaliacoes.php', save: '/save_carro_avaliacao.php', id: 'carro_id', date: 'data_aluguer', title: 'carro_avaliacoes_titulo', button: 'carro_avaliacoes_avaliar', question: 'carro_avaliacoes_pergunta', dateLabel: 'carro_avaliacoes_data', placeholder: 'carro_avaliacoes_placeholder', period: 'carro_avaliacoes_periodo', empty: 'carro_avaliacoes_vazio', missingDate: 'informe_data_aluguer' },
  experiencia: { get: '/api_experiencia_reviews.php', save: '/api_experiencia_reviews.php', id: 'experiencia_id', date: 'data_experiencia', title: 'exp_avaliacoes_titulo', button: 'exp_avaliacoes_avaliar', question: 'exp_avaliacoes_pergunta', dateLabel: 'exp_avaliacoes_data', placeholder: 'exp_avaliacoes_placeholder', period: 'experiencia', empty: 'sem_avaliacoes_ainda_experiencia', missingDate: 'exp_avaliacoes_informe_data' },
};

const AvaliacoesServico = ({ itemId, tipo = 'alojamento', usuarioLogado, onOpenLoginModal, isEmbedded = false }) => {
  const config = SERVICOS[tipo];
  const experiencia = tipo === 'experiencia';
  const { t, i18n } = useTranslation();
  const [visibleCount, setVisibleCount] = useState(2);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const modalRef = useRef(null);
  const titleId = useId();
  const detailsId = useId();
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mediaRating, setMediaRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    rating: 5,
    comentario: '',
    data_estadia: ''
  });

  const [retryVersion, setRetryVersion] = useState(0);
  const fetchAvaliacoes = useCallback(() => setRetryVersion(value => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setError(null);
    setAvaliacoes([]);
    setMediaRating(0);
    setTotalReviews(0);
    if (!itemId) {
      setLoading(false);
      return () => controller.abort();
    }
    setLoading(true);
    requestApiJson(config.get, {
      params: experiencia ? { experiencia_id: itemId, aprovado: 1 } : { id: itemId },
      signal: controller.signal,
    }).then(data => {
      if (controller.signal.aborted) return;
      const rows = experiencia ? data.data : data.avaliacoes;
      if (!data.success || !Array.isArray(rows)) {
        throw new Error('Invalid reviews response');
      }
      const reviews = (experiencia ? rows.filter(review => Number(review.aprovado) === 1) : rows).map(review => ({ ...review, data_estadia: review[config.date], created_at: review.created_at || review[config.date] }));
      setAvaliacoes(reviews);
      setVisibleCount(2);
      setMediaRating(experiencia ? (reviews.length ? reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0) / reviews.length : 0) : Number(data.media_rating) || 0);
      setTotalReviews(experiencia ? reviews.length : Number(data.total_reviews) || 0);
      setError(null);
    }).catch(() => {
      if (!controller.signal.aborted) setError(true);
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [itemId, retryVersion, config, experiencia]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!usuarioLogado) {
      if (onOpenLoginModal) {
        onOpenLoginModal();
      } else {
        alert(t('login_para_avaliar'));
      }
      return;
    }

    if (!formData.comentario.trim()) {
      alert(t('escreva_comentario'));
      return;
    }

    if (!formData.data_estadia) {
      alert(t(config.missingDate));
      return;
    }

    if (experiencia && avaliacoes.some(review => usuarioLogado.email && review.email_usuario === usuarioLogado.email)) { alert(t('ja_avaliou_experiencia')); return; }
    setSubmitting(true);
    
    try {
      const result = await requestApiJson(config.save, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          [config.id]: itemId,
          usuario_id: experiencia ? (usuarioLogado.sub || usuarioLogado.id) : usuarioLogado.id,
          nome_usuario: usuarioLogado.name || usuarioLogado.full_name || usuarioLogado.nome,
          foto: usuarioLogado.foto || usuarioLogado.picture,
          email_usuario: usuarioLogado.email,
          rating: formData.rating,
          comentario: formData.comentario,
          [config.date]: formData.data_estadia,
          ...(experiencia ? { aprovado: 1 } : {})
        }
      });
      

      
      if (result.success) {
        setFormSuccess(true);
        setFormData({ rating: 5, comentario: '', data_estadia: '' });
        setShowForm(false);
        fetchAvaliacoes();
        setTimeout(() => setFormSuccess(false), 3000);
      } else {
        alert(result.message || t('erro_enviar_avaliacao'));
      }
    } catch (err) {
      console.error('Erro ao enviar avaliação:', err);
      alert(t('erro_enviar_avaliacao'));
    } finally {
      setSubmitting(false);
    }
  };

  const formatarData = (value) => {
    if (!value) return '';
    const date = new Date(String(value).slice(0, 10) + 'T12:00:00');
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString(i18n.language === 'cv' ? 'pt' : i18n.language);
  };

  useEffect(() => {
    if (!showForm) return;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    modalRef.current?.querySelector('button')?.focus();
    const handleKey = event => {
      if (event.key === 'Escape' && !submitting) setShowForm(false);
      if (event.key !== 'Tab') return;
      const nodes = [...document.querySelectorAll('[data-review-modal] button:not(:disabled), [data-review-modal] input:not(:disabled), [data-review-modal] textarea, #morabeza-date-popovers button:not(:disabled)')].filter(el => el.getClientRects().length);
      const first = nodes[0], last = nodes.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', handleKey);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', handleKey); previous?.focus(); };
  }, [showForm, submitting]);

  const stars = (rating, size = 20) => <div className="flex items-center gap-0.5" aria-label={t('aloj_avaliacoes_nota', { rating, defaultValue: '{{rating}} de 5 estrelas' })}>
    {[1, 2, 3, 4, 5].map(star => <span key={star} className={star <= rating ? 'text-[#ee8b31]' : 'text-slate-200'}><Star size={size} fill="currentColor" strokeWidth={1.5} aria-hidden="true" /></span>)}
  </div>;
  const primary = 'min-h-11 w-full rounded-lg bg-[#153b7e] px-4 py-3 text-base font-semibold text-white transition hover:bg-[#102f66] disabled:opacity-50';
  const close = () => { if (!submitting) setShowForm(false); };

  if (loading) return <div role="status" className="flex justify-center py-12 text-blue-800"><Loader2 size={32} className="animate-spin" aria-label={t('calendario_a_carregar')} /></div>;
  if (error) return <div className="py-8 text-center"><p role="alert" className="text-sm text-red-600">{t('erro_carregar_avaliacoes')}</p><button type="button" onClick={fetchAvaliacoes} className="mt-2 text-blue-800 underline">{t('tentar_novamente')}</button></div>;

  return <section data-reviews-service={tipo} className={`mr-auto w-full max-w-[440px] text-[#101828] ${isEmbedded ? '' : 'rounded-2xl bg-white'}`} style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif'}}>
    <h2 className="text-[24px] font-bold leading-tight tracking-[-0.6px] sm:text-[28px]">{t(config.title)}</h2>
    <div className="mb-3 mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
      <strong className="text-[34px] font-bold leading-none tracking-[-1px]">{mediaRating.toLocaleString(i18n.language === 'cv' ? 'pt' : i18n.language, {minimumFractionDigits: 1, maximumFractionDigits: 1})}</strong>
      {stars(Math.round(mediaRating), 22)}
      <span className="text-base text-[#8992a2]">{totalReviews} {t(totalReviews === 1 ? 'avaliacao' : 'avaliacoes')}</span>
    </div>
    <button type="button" className={primary} onClick={event => { event.currentTarget.focus(); if (!usuarioLogado && onOpenLoginModal) onOpenLoginModal(); else setShowForm(true); }}>{t(config.button)}</button>
    <button type="button" aria-expanded={detailsOpen} aria-controls={detailsId} onClick={() => setDetailsOpen(v => !v)} className="mb-5 mt-5 flex min-h-[50px] w-full items-center justify-between gap-3 rounded-lg border border-[#d1d5dc] px-4 py-3 text-left text-base font-semibold">
      {t('aloj_avaliacoes_detalhes')}<ChevronDown size={22} className={detailsOpen ? 'rotate-180 transition' : 'transition'} />
    </button>
    {detailsOpen && <div id={detailsId} className="mb-5 space-y-2 rounded-lg border border-slate-200 p-4">
      {[5,4,3,2,1].map(nota => {
        const count = avaliacoes.filter(a => Math.round(Number(a.rating)) === nota).length;
        return <div key={nota} className="flex items-center gap-3 text-sm"><span className="flex w-8 items-center gap-1 text-[#ee8b31]">{nota}<Star size={14} fill="currentColor" /></span><div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#ee8b31]" style={{width: `${avaliacoes.length ? count / avaliacoes.length * 100 : 0}%`}} /></div><span className="w-6 text-right">{count}</span></div>;
      })}
    </div>}
    {formSuccess && <p role="status" className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-green-700"><CheckCircle size={20}/>{t('avaliacao_enviada_sucesso')}</p>}
    <div id="reviews-anchor-list" className="border-t border-[#e1e4e9]">
      {avaliacoes.length === 0 && <p className="py-8 text-slate-500">{t(config.empty)}</p>}
      {avaliacoes.slice(0,visibleCount).map((review,index) => {
        const name = review.nome_usuario || review.nome || review.autor || t('anonimo');
        return <article key={review.id || index} className="border-b border-[#e1e4e9] py-4">
          <div className="mb-1 flex items-center gap-4">
            {review.foto ? <img src={review.foto} alt="" className="h-11 w-11 rounded-full object-cover" /> : <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[25px] font-normal text-white ${index % 2 ? 'bg-[#3266b8]' : 'bg-[#b52663]'}`}>{name.charAt(0).toUpperCase()}</span>}
            <div><h3 className="text-base font-semibold">{name}</h3><p className="text-sm text-[#8992a2]">{formatarData(review.created_at)}</p></div>
          </div>
          {stars(Number(review.rating) || 0,20)}
          <p className="mt-1 text-sm text-[#8992a2]">{t(config.period)}: {formatarData(review.data_estadia)}</p>
          <p className="mt-1 whitespace-pre-wrap break-words text-base leading-relaxed">{review.comentario || review.texto || ''}</p>
          <div className="mt-2 flex items-center gap-6 text-sm text-[#8992a2]">
            <button type="button" className="flex min-h-9 items-center gap-2"><ThumbsUp size={18}/>{t('util')}</button><span className="h-5 w-px bg-[#d1d5dc]"/><button type="button" className="flex min-h-9 items-center gap-2"><Flag size={18}/>{t('reportar')}</button>
          </div>
        </article>;
      })}
    </div>
    {avaliacoes.length > 0 && <div className="pt-5 text-sm"><p className="text-[#8992a2]">{t('aloj_avaliacoes_contagem', { visible: Math.min(visibleCount,avaliacoes.length), total: totalReviews })}</p>{visibleCount < avaliacoes.length && <button type="button" onClick={() => setVisibleCount(v => v+2)} className="flex min-h-9 items-center gap-2 text-base text-[#153b7e]">{t('aloj_avaliacoes_ver_mais')}<ChevronDown size={20}/></button>}</div>}
    {showForm && createPortal(<div className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto bg-[#101828]/65 p-4" onMouseDown={e => { if(e.target === e.currentTarget) close(); }}>
      <div ref={modalRef} data-review-modal role="dialog" aria-modal="true" aria-labelledby={titleId} style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif'}} className="relative my-auto max-h-[calc(100dvh-2rem)] w-full max-w-[356px] overflow-y-auto rounded-xl bg-white px-[26px] pb-3 pt-9 text-[#101828] shadow-xl sm:max-w-[428px] sm:px-8">
        <button type="button" disabled={submitting} aria-label={t('fechar')} onClick={close} className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center"><X size={22} strokeWidth={1.6}/></button>
        <h2 id={titleId} className="mb-5 text-[23px] font-bold leading-tight tracking-[-0.5px] sm:text-[27px]">{t(config.question)}</h2>
        <form onSubmit={handleSubmit}>
          <fieldset disabled={submitting}>
            <legend className="mb-1 text-base font-semibold">{t('aloj_avaliacoes_sua_nota')}</legend>
            <div className="mb-5 flex gap-2" role="group" aria-label={t('aloj_avaliacoes_sua_nota')}>
              {[1,2,3,4,5].map(star => <button key={star} type="button" aria-label={t('aloj_avaliacoes_nota',{rating:star})} aria-pressed={formData.rating === star} onClick={() => handleRatingClick(star)} className={`flex h-10 w-9 items-center justify-center ${star <= formData.rating ? 'text-[#ee8b31]' : 'text-slate-200'}`}><Star size={32} fill="currentColor" strokeWidth={1.5}/></button>)}
            </div>
            <label className="mb-5 block"><span className="mb-1 block text-base font-semibold">{t(config.dateLabel)}</span><span className="relative block"><CampoDataMorabeza name="data_estadia" value={formData.data_estadia} onChange={handleInputChange} max={new Date().toLocaleDateString('en-CA')} placeholder={t('aloj_avaliacoes_data_placeholder')} className="min-h-11 w-full rounded-lg border border-[#c9cdd4] py-3 pl-4 pr-10 text-base" required /><span className="pointer-events-none absolute right-3 top-3 text-[#101828]"><Calendar size={20}/></span></span></label>
            <label className="mb-3 block"><span className="mb-1 block text-base font-semibold">{t('aloj_avaliacoes_comentario')}</span><textarea name="comentario" value={formData.comentario} onChange={handleInputChange} rows={3} placeholder={t(config.placeholder)} className="block min-h-[84px] w-full rounded-lg border border-[#c9cdd4] px-4 py-2 text-base placeholder:text-[#8992a2]" required /></label>
            <button type="submit" disabled={submitting} className={primary}>{submitting ? t('enviando') : t('enviar_avaliacao')}</button>
          </fieldset>
          <button type="button" disabled={submitting} onClick={close} className="min-h-8 w-full pt-1 text-center text-base text-[#153b7e]">{t('cancelar')}</button>
        </form>
      </div>
    </div>,document.body)}
  </section>;
};

export default AvaliacoesServico;
