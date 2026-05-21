// AvaliacoesSeccaoAlojamento.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, User, Calendar, ThumbsUp, Flag, X, Loader2, CheckCircle } from 'lucide-react';

const AvaliacoesSeccaoAlojamento = ({ alojamentoId, usuarioLogado, onOpenLoginModal, isEmbedded = false }) => {
  const { t } = useTranslation();
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

  const fetchAvaliacoes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://welovepalop.com/api/get_alojamento_avaliacoes.php?id=${alojamentoId}`);
      const data = await response.json();
      
      if (data.success) {
        setAvaliacoes(data.avaliacoes || []);
        setMediaRating(Number(data.media_rating) || 0);
        setTotalReviews(Number(data.total_reviews) || 0);
      } else {
        setError(data.message || t('erro_carregar_avaliacoes'));
      }
    } catch (err) {
      console.error('Erro ao buscar avaliações:', err);
      setError(t('erro_carregar_avaliacoes'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (alojamentoId) {
      fetchAvaliacoes();
    }
  }, [alojamentoId]);

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
      alert(t('informe_data_estadia'));
      return;
    }

    setSubmitting(true);
    
    try {
      const response = await fetch('https://welovepalop.com/api/save_alojamento_avaliacao.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alojamento_id: alojamentoId,
          usuario_id: usuarioLogado.id,
          nome_usuario: usuarioLogado.name || usuarioLogado.full_name || usuarioLogado.nome,
          foto: usuarioLogado.foto || usuarioLogado.picture,
          email_usuario: usuarioLogado.email,
          rating: formData.rating,
          comentario: formData.comentario,
          data_estadia: formData.data_estadia
        })
      });
      
      const result = await response.json();
      
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

  const formatarData = (data) => {
    if (!data) return '';
    const d = new Date(data);
    return d.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const renderStars = (rating, size = 16) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={`${star <= rating ? 'fill-orange-400 text-orange-400' : 'fill-slate-200 text-slate-200'}`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 size={32} className="animate-spin text-[#003580]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 text-sm">{error}</p>
        <button onClick={fetchAvaliacoes} className="mt-2 text-[#003580] text-sm underline">
          {t('tentar_novamente')}
        </button>
      </div>
    );
  }

  const primeiroNomeDisplay = avaliacoes[0] ? (avaliacoes[0].nome_usuario || avaliacoes[0].nome || avaliacoes[0].autor || t('anonimo')) : t('anonimo');
  const primeiroComentario = avaliacoes[0] ? (avaliacoes[0].comentario || avaliacoes[0].texto || '') : '';
  const primeiroRating = avaliacoes[0] ? (Number(avaliacoes[0].rating) || 5) : 5;

  // Categorias de avaliação traduzidas
  const categoriasAvaliacao = [
    { label: t('limpeza'), val: 4.9 },
    { label: t('conforto'), val: 4.7 },
    { label: t('consumo'), val: 4.8 },
    { label: t('atendimento'), val: 4.8 },
    { label: t('levantamento'), val: 4.9 },
    { label: t('custo_beneficio'), val: 4.7 }
  ];

  return (
    <div className={isEmbedded ? '' : 'bg-white rounded-2xl'}>
      {/* 1. TOPO DA SECÇÃO */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t('avaliacoes_hospedes')}</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            {t('baseado_em')} {totalReviews} {totalReviews === 1 ? t('avaliacao') : t('avaliacoes')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-slate-900">{mediaRating.toFixed(1)}</span>
            <div className="flex flex-col justify-center">
              {renderStars(Math.round(mediaRating), 14)}
            </div>
          </div>
          <button
            onClick={() => {
              if (!usuarioLogado && onOpenLoginModal) {
                onOpenLoginModal();
              } else {
                setShowForm(!showForm);
              }
            }}
            className="px-4 py-2 bg-[#003580] text-white text-xs font-bold rounded-lg hover:bg-blue-900 transition-all shadow-sm"
          >
            {showForm ? t('cancelar') : t('avaliar_estadia')}
          </button>
        </div>
      </div>

      {/* 2. LINHA DE SUBTÍTULO */}
      <div className="flex justify-between items-center mb-4 px-1">
        <span className="text-sm font-bold text-slate-800">
          {t('avaliacoes_participantes')} <span className="text-slate-400 font-normal text-xs">({totalReviews} {t('avaliacoes')})</span>
        </span>
        <div className="flex items-center gap-1 text-sm font-bold text-slate-800">
          <span className="text-orange-500 text-base">★</span> {mediaRating.toFixed(1)}
        </div>
      </div>

      {/* 3. PAINEL DE NOTAS PROFISSIONAL */}
      <div className="border border-slate-200 rounded-3xl p-8 bg-white shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-8">
        
        <div className="lg:col-span-3 text-center lg:text-left flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-slate-100 pb-6 lg:pb-0 lg:pr-6">
          <h4 className="text-sm font-bold text-slate-900 mb-4">{t('avaliacoes_clientes')}</h4>
          <div className="text-6xl font-black text-[#1a2b6d] tracking-tighter mb-2">{mediaRating.toFixed(1)}</div>
          <div className="flex justify-center lg:justify-start mb-1">
            {renderStars(Math.round(mediaRating), 16)}
          </div>
          <p className="text-[10px] font-semibold text-slate-400 mt-1">
            {t('baseado_em')} {totalReviews} {totalReviews === 1 ? t('avaliacao') : t('avaliacoes')}
          </p>
        </div>

        <div className="lg:col-span-5 space-y-3.5 px-2">
          {categoriasAvaliacao.map((cat, i) => (
            <div key={i} className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span className="w-24 text-slate-400 text-left font-medium">{cat.label}</span>
              <div className="flex-1 mx-4 bg-slate-100 h-1 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${(cat.val / 5) * 100}%` }}
                />
              </div>
              <span className="w-6 text-right text-slate-900 font-bold">{cat.val.toFixed(1)}</span>
            </div>
          ))}
        </div>

        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-full min-h-[190px]">
          {avaliacoes.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={avaliacoes[0].foto || "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=100&h=100&fit=crop"} 
                    className="w-10 h-10 rounded-full object-cover border border-slate-100"
                    alt={primeiroNomeDisplay} 
                  />
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{primeiroNomeDisplay}</h5>
                    <p className="text-[10px] text-slate-400 font-medium">{t('maio_2026')}</p>
                  </div>
                </div>
                <div className="bg-emerald-50 text-emerald-600 text-xs font-bold px-2 py-1 rounded-lg">
                  {primeiroRating}/5
                </div>
              </div>
              <p className="text-xs text-slate-500 italic line-clamp-3 mb-4">
                "{primeiroComentario}"
              </p>
              <button 
                onClick={() => {
                  const el = document.getElementById('reviews-anchor-list');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-blue-600 text-xs font-bold hover:underline flex items-center text-left"
              >
                {t('ver_todas_avaliacoes')} ({totalReviews})
              </button>
            </>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs my-auto">
              {t('nenhuma_avaliacao_disponivel')}
            </div>
          )}
        </div>
      </div>

      {/* Formulário de Avaliação */}
      {showForm && (
        <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-slate-900">{t('como_foi_estadia')}</h4>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-sm font-bold text-slate-700 mb-2">{t('sua_nota')}</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingClick(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      size={32}
                      className={`${star <= formData.rating ? 'fill-orange-400 text-orange-400' : 'fill-slate-300 text-slate-300'} transition-colors`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-bold text-slate-700 mb-2">{t('data_estadia')}</label>
              <input
                type="date"
                name="data_estadia"
                value={formData.data_estadia}
                onChange={handleInputChange}
                max={new Date().toISOString().split('T')[0]}
                className="w-full max-w-xs border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003580]/20"
                required
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-bold text-slate-700 mb-2">{t('seu_comentario')}</label>
              <textarea
                name="comentario"
                value={formData.comentario}
                onChange={handleInputChange}
                rows={4}
                placeholder={t('compartilhe_experiencia')}
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003580]/20 resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-[#003580] text-white font-bold rounded-xl hover:bg-blue-900 transition-all disabled:opacity-50"
            >
              {submitting ? <Loader2 size={18} className="animate-spin inline mr-2" /> : null}
              {submitting ? t('enviando') : t('enviar_avaliacao')}
            </button>
          </form>
        </div>
      )}

      {/* Mensagem de sucesso */}
      {formSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <CheckCircle className="text-green-500" size={20} />
          <p className="text-green-700 text-sm">{t('avaliacao_enviada_sucesso')}</p>
        </div>
      )}

      {/* 4. LISTA DE COMENTÁRIOS */}
      <div id="reviews-anchor-list" className="space-y-6 mt-10">
        {avaliacoes.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl">
            <Star size={48} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">{t('sem_avaliacoes_ainda')}</p>
          </div>
        ) : (
          avaliacoes.map((avaliacao, index) => {
            const nomeDisplay = avaliacao.nome_usuario || avaliacao.nome || avaliacao.autor || t('anonimo');
            const textoComentario = avaliacao.comentario || avaliacao.texto || '';
            const notaRating = Number(avaliacao.rating) || 5;

            return (
              <div key={avaliacao.id || index} className={`pb-6 ${index !== avaliacoes.length - 1 ? 'border-b border-slate-100' : ''}`}>
                <div className="flex items-start gap-4">
                  <div className="shrink-0 mt-0.5">
                    {avaliacao.foto ? (
                      <img src={avaliacao.foto} alt={nomeDisplay} className="w-9 h-9 rounded-full object-cover border border-slate-100" />
                    ) : (
                      <div className="w-9 h-9 bg-gradient-to-br from-[#003580] to-blue-600 rounded-full flex items-center justify-center">
                        <User size={16} className="text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-col md:flex-row md:items-center gap-x-3 gap-y-0.5">
                        <h4 className="text-sm font-bold text-slate-900">{nomeDisplay}</h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                          <Calendar size={11} className="text-slate-400" />
                          <span>{t('estadia')}: {formatarData(avaliacao.data_estadia)}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">{formatarData(avaliacao.created_at)}</span>
                    </div>

                    <div className="mt-1">
                      {renderStars(notaRating, 12)}
                    </div>

                    <p className="text-sm text-slate-600 mt-2 leading-relaxed font-normal">{textoComentario}</p>
                    
                    <div className="flex items-center gap-4 mt-3">
                      <button className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-600 font-semibold transition">
                        <ThumbsUp size={11} />
                        <span>{t('util')}</span>
                      </button>
                      <button className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-600 font-semibold transition">
                        <Flag size={11} />
                        <span>{t('reportar')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AvaliacoesSeccaoAlojamento;