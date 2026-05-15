import React, { useState, useEffect } from 'react';
import { Star, X, ChevronLeft, ChevronRight } from 'lucide-react';

const AvaliacoesSeccao = ({ experienciaId = 1, usuarioLogado = null, onOpenLoginModal }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [rating, setRating] = useState(0);
  const [comentario, setComentario] = useState('');
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [jaAvaliou, setJaAvaliou] = useState(false);
  
  const [categoriasNotas] = useState([
    { label: "Limpeza", nota: 4.9 },
    { label: "Conforto", nota: 4.7 },
    { label: "Consumo", nota: 4.8 },
    { label: "Atendimento", nota: 4.8 },
    { label: "Levantamento", nota: 4.9 },
    { label: "Custo-benefício", nota: 4.7 },
  ]);

  const formatarData = (dataString) => {
    if (!dataString) return 'Data não informada';
    try {
      const data = new Date(dataString);
      if (isNaN(data.getTime())) return 'Data inválida';
      return data.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
    } catch {
      return 'Data inválida';
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
  useEffect(() => {
    const fetchAvaliacoes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const apiUrl = `/api/api_experiencia_reviews.php?experiencia_id=${experienciaId}&aprovado=1`;
        console.log('Buscando avaliações da API:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Resposta da API:', data);
        
        if (data.success && Array.isArray(data.data)) {
          // Filtra apenas avaliações aprovadas
          const reviewsAprovadas = data.data.filter(review => review.aprovado === 1);
          console.log('Avaliações aprovadas:', reviewsAprovadas);
          
          if (reviewsAprovadas.length > 0) {
            setAvaliacoes(reviewsAprovadas);
          } else {
            // Se não há avaliações no banco, não mostrar mock
            setAvaliacoes([]);
            setError('Ainda não há avaliações para esta experiência. Seja o primeiro a avaliar!');
          }
        } else {
          setAvaliacoes([]);
          setError('Ainda não há avaliações para esta experiência.');
        }
      } catch (err) {
        console.error('Erro ao buscar avaliações:', err);
        setAvaliacoes([]);
        setError('Não foi possível carregar as avaliações. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAvaliacoes();
  }, [experienciaId]);

  // Calcular média geral baseada nas avaliações reais
  const mediaGeral = avaliacoes.length > 0
    ? (avaliacoes.reduce((sum, av) => sum + (av.rating || 0), 0) / avaliacoes.length).toFixed(1)
    : 0;

  // Função para lidar com o clique no botão de avaliar
  const handleAvaliarClick = () => {
    if (!usuarioLogado) {
      if (onOpenLoginModal) {
        onOpenLoginModal();
      } else {
        alert('Por favor, faça login com o Google para avaliar!');
      }
      return;
    }
    
    if (jaAvaliou) {
      alert('Você já avaliou esta experiência! Obrigado pelo seu feedback.');
      return;
    }
    
    setIsModalOpen(true);
  };

  // Enviar avaliação com usuário logado
  const enviarAvaliacao = async () => {
    if (!usuarioLogado) {
      alert('Por favor, faça login com o Google para avaliar!');
      return;
    }
    
    if (rating === 0) {
      alert('Por favor, selecione uma nota!');
      return;
    }
    
    if (!comentario.trim()) {
      alert('Por favor, escreva um comentário!');
      return;
    }
    
    if (jaAvaliou) {
      alert('Você já avaliou esta experiência! Obrigado pelo seu feedback.');
      return;
    }
    
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
        aprovado: 1 // Aprovado automaticamente para teste
      };
      
      console.log('Enviando avaliação:', novaAvaliacao);
      
      const apiUrl = `/api/api_experiencia_reviews.php`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaAvaliacao)
      });
      
      const data = await response.json();
      console.log('Resposta do servidor:', data);
      
      if (response.ok && data.success) {
        alert(data.message || 'Obrigado! Sua avaliação foi publicada com sucesso.');
        
        // Recarregar as avaliações para mostrar a nova
        const fetchResponse = await fetch(`/api/api_experiencia_reviews.php?experiencia_id=${experienciaId}&aprovado=1`);
        const fetchData = await fetchResponse.json();
        
        if (fetchData.success && Array.isArray(fetchData.data)) {
          setAvaliacoes(fetchData.data.filter(review => review.aprovado === 1));
        }
        
        setJaAvaliou(true);
        setIsModalOpen(false);
        setRating(0);
        setComentario('');
      } else {
        throw new Error(data.error || 'Erro ao enviar avaliação');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao enviar avaliação. Tente novamente.');
    }
  };

  // Depoimentos a partir das avaliações do banco
  const depoimentos = avaliacoes.map(av => ({
    id: av.id,
    nome: av.nome_usuario || 'Anônimo',
    data: formatarData(av.data_experiencia),
    nota: `${av.rating || 0}/5`,
    texto: av.comentario || 'Sem comentário',
    img: av.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(av.nome_usuario || 'User')}&background=1a2b6d&color=fff&rounded=true&size=40`
  }));

  const nextSlide = () => {
    if (depoimentos.length === 0) return;
    setCurrentSlide((prev) => (prev === depoimentos.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    if (depoimentos.length === 0) return;
    setCurrentSlide((prev) => (prev === 0 ? depoimentos.length - 1 : prev - 1));
  };

  useEffect(() => {
    let interval;
    if (!isPaused && depoimentos.length > 1) {
      interval = setInterval(nextSlide, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPaused, depoimentos.length]);

  if (loading) {
    return (
      <div className="w-full bg-[#fcfcfc] py-6 font-sans">
        <div className="max-w-[1200px] mx-auto bg-white rounded-3xl border border-slate-100 p-10 shadow-sm text-center">
          <div className="animate-pulse text-slate-400">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            Carregando avaliações...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#fcfcfc] py-6 font-sans">
      <div className="max-w-[1200px] mx-auto bg-white rounded-3xl border border-slate-100 p-10 shadow-sm">
        {error && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-xs">
            ⚠️ {error}
          </div>
        )}
        
        <h2 className="text-[18px] font-bold text-[#1a2b6d] mb-10">Avaliações de clientes</h2>

        <div className="flex flex-col lg:flex-row items-start gap-0">
          
          {/* SEÇÃO 1: MÉDIA GERAL */}
          <div className="w-full lg:w-[220px] pr-8">
            <div className="flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[64px] font-bold text-[#1a2b6d] leading-none">
                  {mediaGeral > 0 ? mediaGeral : '—'}
                </span>
                <div className="flex flex-col">
                  <div className="flex text-orange-400 gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={18} 
                        fill={i < Math.round(parseFloat(mediaGeral)) ? "currentColor" : "none"} 
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium mt-1">
                    Baseado em {avaliacoes.length} avaliação{avaliacoes.length !== 1 ? 'ões' : ''}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={handleAvaliarClick}
                className={`w-full py-3.5 rounded-xl font-bold text-[13px] transition-all active:scale-[0.98] ${
                  !usuarioLogado 
                    ? 'border border-blue-600 text-blue-600 hover:bg-blue-50' 
                    : jaAvaliou
                      ? 'border border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed'
                      : 'border border-blue-600 text-blue-600 hover:bg-blue-50'
                }`}
              >
                {!usuarioLogado 
                  ? '🔑 Entrar para avaliar' 
                  : jaAvaliou 
                    ? '✓ Você já avaliou' 
                    : '⭐ Escrever avaliação'}
              </button>
            </div>
          </div>

          {/* SEÇÃO 2: BARRAS DE CATEGORIAS */}
          <div className="w-full lg:w-[280px] px-10 border-l border-slate-100 space-y-3.5">
            {categoriasNotas.map((cat, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">{cat.label}</span>
                <div className="flex items-center gap-3 flex-1 justify-end">
                  <div className="w-[80px] h-[3px] bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600" 
                      style={{ width: `${(cat.nota / 5) * 100}%` }} 
                    />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 w-6 text-right">{cat.nota}</span>
                </div>
              </div>
            ))}
          </div>

          {/* SEÇÃO 3: CARROSSEL DE DEPOIMENTOS */}
          {depoimentos.length > 0 ? (
            <div 
              className="w-full lg:flex-1 pl-10 border-l border-slate-100 relative group"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="overflow-hidden mb-6 relative">
                <div 
                  className="flex transition-transform duration-500 ease-out gap-4"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {depoimentos.map((dep) => (
                    <div key={dep.id} className="min-w-full lg:min-w-[48%] bg-white border border-slate-50 rounded-2xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)]">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-3">
                          <img 
                            src={dep.img} 
                            className="w-10 h-10 rounded-full object-cover" 
                            alt={dep.nome}
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(dep.nome)}&background=1a2b6d&color=fff&rounded=true&size=40`;
                            }}
                          />
                          <div>
                            <h4 className="text-[13px] font-bold text-[#1a2b6d]">{dep.nome}</h4>
                            <p className="text-[11px] text-slate-400">{dep.data}</p>
                          </div>
                        </div>
                        <span className="text-[12px] font-bold text-green-500 bg-green-50/50 px-2 py-0.5 rounded">
                          {dep.nota}
                        </span>
                      </div>
                      <p className="text-[12px] text-slate-500 leading-relaxed font-normal italic">
                        "{dep.texto}"
                      </p>
                    </div>
                  ))}
                </div>

                {depoimentos.length > 2 && (
                  <>
                    <button 
                      onClick={prevSlide}
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-md text-slate-400 hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100 z-10"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button 
                      onClick={nextSlide}
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-md text-slate-400 hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100 z-10"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}
              </div>

              <button className="text-blue-600 text-[13px] font-bold hover:underline transition-all">
                Ver todas as avaliações ({avaliacoes.length})
              </button>
            </div>
          ) : (
            <div className="w-full lg:flex-1 pl-10 border-l border-slate-100">
              <div className="text-center py-8">
                <div className="text-slate-300 mb-2">
                  <Star size={48} strokeWidth={1} />
                </div>
                <p className="text-slate-500 text-sm">
                  Ainda não há avaliações para esta experiência.
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  Seja o primeiro a avaliar!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE AVALIAÇÃO */}
      {isModalOpen && usuarioLogado && !jaAvaliou && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[#1a2b6d]/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />
          
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="p-10">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-[#1a2b6d]">Avaliar experiência</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-8">
                {/* Informações do usuário logado */}
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl">
                  <img 
                    src={usuarioLogado.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(usuarioLogado.name)}&background=1a2b6d&color=fff`} 
                    className="w-12 h-12 rounded-full object-cover"
                    alt="Profile"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(usuarioLogado.name)}&background=1a2b6d&color=fff&rounded=true&size=48`;
                    }}
                  />
                  <div>
                    <p className="text-sm font-bold text-[#1a2b6d]">{usuarioLogado.name}</p>
                    <p className="text-xs text-slate-500">{usuarioLogado.email}</p>
                  </div>
                </div>

                {/* Seleção de Estrelas */}
                <div className="text-center py-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Sua nota geral</p>
                  <div className="flex justify-center gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="transition-transform active:scale-90"
                        type="button"
                      >
                        <Star 
                          size={32} 
                          className={`transition-colors ${(hoverRating || rating) >= star ? 'text-orange-400 fill-orange-400' : 'text-slate-200'}`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comentário */}
                <div>
                  <label className="text-[10px] font-black text-[#1a2b6d] uppercase tracking-widest block mb-3">
                    Seu comentário
                  </label>
                  <textarea 
                    rows="4"
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    placeholder="Conte-nos como foi a sua experiência..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/10 resize-none"
                  />
                </div>

                {/* Botão de Enviar */}
                <button 
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-[0.98]"
                  onClick={enviarAvaliacao}
                >
                  Publicar avaliação
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvaliacoesSeccao;