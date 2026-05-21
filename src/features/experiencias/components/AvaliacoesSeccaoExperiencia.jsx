// AvaliacoesSeccao.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, X, Loader2, User, Calendar, ThumbsUp, Flag, CheckCircle } from 'lucide-react';

const AvaliacoesSeccao = ({ experienciaId = 1, usuarioLogado = null, onOpenLoginModal }) => {
  const { t } = useTranslation();
  const [hoverRating, setHoverRating] = useState(0);
  const [rating, setRating] = useState(5);
  const [comentario, setComentario] = useState('');
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jaAvaliou, setJaAvaliou] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  
  const [categoriasNotas] = useState([
    { label: t('limpeza'), nota: 4.9 },
    { label: t('conforto'), nota: 4.7 },
    { label: t('consumo'), nota: 4.8 },
    { label: t('atendimento'), nota: 4.8 },
    { label: t('levantamento'), nota: 4.9 },
    { label: t('custo_beneficio'), nota: 4.7 },
  ]);

  const formatarData = (dataString) => {
    if (!dataString) return '';
    try {
      const data = new Date(dataString);
      if (isNaN(data.getTime())) return '';
      return data.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return '';
    }
  };

  // Verificar se usuário já avaliou
  useEffect(() => {
    if (usuarioLogado && avaliacoes.length > 0) {
      const userEmail = usuarioLogado.email;
      const jaExiste = avaliacoes.some(av => av.email_usuario === userEmail);
      setJaAvaliou(jaExiste);
    }
  }, [usuarioLogado, avaliacoes]);

  // Buscar avaliações do backend
  const fetchAvaliacoes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiUrl = `/api/api_experiencia_reviews.php?experiencia_id=${experienciaId}&aprovado=1`;
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        const reviewsAprovadas = data.data.filter(review => review.aprovado === 1);
        setAvaliacoes(reviewsAprovadas);
        if (reviewsAprovadas.length === 0) {
          setError(t('sem_avaliacoes_ainda_experiencia'));
        }
      } else {
        setAvaliacoes([]);
        setError(t('sem_avaliacoes_ainda_experiencia'));
      }
    } catch (err) {
      console.error('Erro ao buscar avaliações:', err);
      setAvaliacoes([]);
      setError(t('erro_carregar_avaliacoes'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvaliacoes();
  }, [experienciaId]);

  // Calcular média geral baseada nas avaliações reais
  const mediaGeral = avaliacoes.length > 0
    ? (avaliacoes.reduce((sum, av) => sum + (av.rating || 0), 0) / avaliacoes.length).toFixed(1)
    : 0;

  // Enviar avaliação com usuário logado
  const enviarAvaliacao = async (e) => {
    e.preventDefault();

    if (!usuarioLogado) {
      if (onOpenLoginModal) {
        onOpenLoginModal();
      } else {
        alert(t('login_para_avaliar'));
      }
      return;
    }
    
    if (rating === 0) {
      alert(t('selecione_nota'));
      return;
    }
    
    if (!comentario.trim()) {
      alert(t('escreva_comentario'));
      return;
    }
    
    if (jaAvaliou) {
      alert(t('ja_avaliou_experiencia'));
      return;
    }

    setSubmitting(true);
    
    try {
      const novaAvaliacao = {
        experiencia_id: experienciaId,
        usuario_id: usuarioLogado.sub || usuarioLogado.id || null,
        nome_usuario: usuarioLogado.name || usuarioLogado.nome,
        email_usuario: usuarioLogado.email,
        foto: usuarioLogado.picture || null,
        rating: rating,
        comentario: comentario,
        data_experiencia: new Date().toISOString().split('T')[0],
        aprovado: 1
      };
      
      const response = await fetch(`/api/api_experiencia_reviews.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaAvaliacao)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setFormSuccess(true);
        setRating(5);
        setComentario('');
        setShowForm(false);
        fetchAvaliacoes();
        setTimeout(() => setFormSuccess(false), 3000);
      } else {
        throw new Error(data.error || t('erro_enviar_avaliacao'));
      }
    } catch (error) {
      console.error('Erro:', error);
      alert(t('erro_enviar_avaliacao'));
    } finally {
      setSubmitting(false);
    }
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

  // Fallbacks de segurança para mapeamento dinâmico
  const primeiroNomeDisplay = avaliacoes[0] ? (avaliacoes[0].nome_usuario || avaliacoes[0].nome || t('anonimo')) : t('anonimo');
  const primeiroComentario = avaliacoes[0] ? (avaliacoes[0].comentario || '') : '';
  const primeiroRating = avaliacoes[0] ? (Number(avaliacoes[0].rating) || 5) : 5;

  return (
    <div className="w-full bg-white rounded-2xl">
      {/* 1. TOPO DA SECÇÃO */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t('avaliacoes_hospedes')}</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            {t('baseado_em')} {avaliacoes.length} {avaliacoes.length === 1 ? t('avaliacao') : t('avaliacoes')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-slate-900">{Number(mediaGeral).toFixed(1)}</span>
            <div className="flex flex-col justify-center">
              {renderStars(Math.round(parseFloat(mediaGeral)), 14)}
            </div>
          </div>
          <button
            onClick={() => {
              if (!usuarioLogado && onOpenLoginModal) {
                onOpenLoginModal();
              } else if (!jaAvaliou) {
                setShowForm(!showForm);
              }
            }}
            disabled={jaAvaliou}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all shadow-sm ${
              jaAvaliou 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none' 
                : 'bg-[#003580] text-white hover:bg-blue-900'
            }`}
          >
            {showForm ? t('cancelar') : jaAvaliou ? t('ja_avaliado') : t('avaliar_estadia')}
          </button>
        </div>
      </div>

      {/* 2. LINHA DE SUBTÍTULO */}
      <div className="flex justify-between items-center mb-4 px-1">
        <span className="text-sm font-bold text-slate-800">
          {t('avaliacoes_participantes')} <span className="text-slate-400 font-normal text-xs">({avaliacoes.length} {t('avaliacoes')})</span>
        </span>
        <div className="flex items-center gap-1 text-sm font-bold text-slate-800">
          <span className="text-orange-500 text-base">★</span> {Number(mediaGeral).toFixed(1)}
        </div>
      </div>

      {/* 3. PAINEL DE NOTAS PROFISSIONAL */}
      <div className="border border-slate-200 rounded-3xl p-8 bg-white shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-8">
        
        {/* Bloco Média de Clientes */}
        <div className="lg:col-span-3 text-center lg:text-left flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-slate-100 pb-6 lg:pb-0 lg:pr-6">
          <h4 className="text-sm font-bold text-slate-900 mb-4">{t('avaliacoes_clientes')}</h4>
          <div className="text-6xl font-black text-[#1a2b6d] tracking-tighter mb-2">{Number(mediaGeral).toFixed(1)}</div>
          <div className="flex justify-center lg:justify-start mb-1">
            {renderStars(Math.round(parseFloat(mediaGeral)), 16)}
          </div>
          <p className="text-[10px] font-semibold text-slate-400 mt-1">
            {t('baseado_em')} {avaliacoes.length} {avaliacoes.length === 1 ? t('avaliacao') : t('avaliacoes')}
          </p>
        </div>

        {/* Bloco de Critérios Horizontais */}
        <div className="lg:col-span-5 space-y-3.5 px-2">
          {categoriasNotas.map((cat, i) => (
            <div key={i} className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span className="w-24 text-slate-400 text-left font-medium">{cat.label}</span>
              <div className="flex-1 mx-4 bg-slate-100 h-1 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${(cat.nota / 5) * 100}%` }}
                />
              </div>
              <span className="w-6 text-right text-slate-900 font-bold">{cat.nota.toFixed(1)}</span>
            </div>
          ))}
        </div>

        {/* Card Lateral do Último Comentário em Destaque */}
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
                  const el = document.getElementById('reviews-anchor-list-exp');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-blue-600 text-xs font-bold hover:underline flex items-center text-left"
              >
                {t('ver_todas_avaliacoes')} ({avaliacoes.length})
              </button>
            </>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs my-auto">
              {t('nenhuma_avaliacao_disponivel')}
            </div>
          )}
        </div>
      </div>

      {/* Formulário de Avaliação Ocultável */}
      {showForm && !jaAvaliou && (
        <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-slate-900">{t('como_foi_experiencia')}</h4>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={enviarAvaliacao}>
            <div className="mb-5">
              <label className="block text-sm font-bold text-slate-700 mb-2">{t('sua_nota_geral')}</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      size={32}
                      className={`${
                        (hoverRating || rating) >= star 
                          ? 'fill-orange-400 text-orange-400' 
                          : 'fill-slate-300 text-slate-300'
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-bold text-slate-700 mb-2">{t('seu_comentario')}</label>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows={4}
                placeholder={t('compartilhe_experiencia_detalhes')}
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003580]/20 resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-[#003580] text-white font-bold rounded-xl hover:bg-blue-900 transition-all disabled:opacity-50 flex items-center"
            >
              {submitting && <Loader2 size={18} className="animate-spin mr-2" />}
              {submitting ? t('enviando') : t('publicar_avaliacao')}
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

      {/* 4. LISTA CORRIDA DE COMENTÁRIOS */}
      <div id="reviews-anchor-list-exp" className="space-y-6 mt-10">
        {avaliacoes.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
            <Star size={48} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">{t('sem_avaliacoes_ainda_experiencia')}</p>
          </div>
        ) : (
          avaliacoes.map((avaliacao, index) => {
            const nomeDisplay = avaliacao.nome_usuario || avaliacao.nome || t('anonimo');
            const textoComentario = avaliacao.comentario || '';
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
                          <span>{t('experiencia')}: {formatarData(avaliacao.data_experiencia)}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">{formatarData(avaliacao.data_experiencia)}</span>
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

export default AvaliacoesSeccao;