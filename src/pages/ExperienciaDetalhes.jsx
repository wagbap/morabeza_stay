import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, MapPin, Calendar, Clock, Users, ChevronLeft, 
  Check, X, ChevronRight
} from 'lucide-react';

const ExperienciaDetalhes = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [experiencia, setExperiencia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [quantidadePessoas, setQuantidadePessoas] = useState(2);
  const [dataSelecionada, setDataSelecionada] = useState('');

  useEffect(() => {
    const buscarDetalhes = async () => {
      try {
        setLoading(true);
        setErro(null);
        
        // URL da API - ajuste para o caminho correto
        const apiUrl = `https://welovepalop.com/api/get_experiencia_by_slug.php?slug=${slug}`;
        console.log('Buscando:', apiUrl); // Debug
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const texto = await response.text(); // Primeiro pega como texto
        console.log('Resposta bruta:', texto); // Debug para ver o que está retornando
        
        // Tenta fazer o parse do JSON
        let resultado;
        try {
          resultado = JSON.parse(texto);
        } catch (e) {
          console.error('Erro ao fazer parse do JSON:', e);
          throw new Error('Resposta da API não é um JSON válido');
        }
        
        if (resultado.success && resultado.data) {
          setExperiencia(resultado.data);
        } else {
          setErro(resultado.error || 'Experiência não encontrada');
        }
      } catch (err) {
        console.error("Erro na busca:", err);
        setErro(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      buscarDetalhes();
    }
  }, [slug]);

  const handleReservar = () => {
    console.log('Reservar:', {
      experiencia: experiencia?.id,
      pessoas: quantidadePessoas,
      data: dataSelecionada
    });
  };

  if (loading) {
    return (
      <div className="bg-[#f8f9fc] min-h-screen">
        <div className="max-w-7xl mx-auto py-16 px-6">
          <div className="animate-pulse">
            <div className="h-[500px] bg-gray-200 rounded-3xl mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (erro || !experiencia) {
    return (
      <div className="bg-[#f8f9fc] min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <p className="text-red-500 mb-4">{erro || 'Experiência não encontrada'}</p>
          <button 
            onClick={() => navigate('/experiencias')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-xl transition-all"
          >
            Voltar para Experiências
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fc] min-h-screen">
      {/* Header com navegação */}<br></br>
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button 
            onClick={() => navigate('/experiencias')}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-sm uppercase tracking-wider">Voltar para experiências</span>
          </button>
        </div>
      </div>

      {/* Hero Section com Imagem Principal */}
      <div className="relative h-[60vh] min-h-[500px] w-full overflow-hidden">
        <img 
          src={experiencia.imagem_principal} 
          alt={experiencia.titulo}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/1200x800?text=Imagem+Indisponível';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        
        {/* Badges flutuantes */}
        <div className="absolute top-8 left-8 flex gap-3 z-10 flex-wrap">
          <span className="bg-blue-600 text-white text-xs font-black uppercase tracking-wider px-4 py-2 rounded-full shadow-lg">
            {experiencia.categoria_nome || 'Experiência'}
          </span>
          <span className="bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-black uppercase tracking-wider px-4 py-2 rounded-full shadow-lg flex items-center gap-1">
            <Star size={14} className="fill-orange-400 text-orange-400" />
            {experiencia.rating_formatado || '0.0'} • {experiencia.total_reviews || 0} reviews
          </span>
        </div>

        {/* Título e info na imagem */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-black mb-4 uppercase italic tracking-tighter">
              {experiencia.titulo}
            </h1>
            <div className="flex flex-wrap gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <MapPin size={20} />
                <span>{experiencia.localizacao}, {experiencia.ilha}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={20} />
                <span>{experiencia.duracao || 'Flexível'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={20} />
                <span>Máx. {experiencia.max_pessoas || 'N/A'} pessoas</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto py-12 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Coluna Esquerda - Detalhes */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Descrição */}
            <section>
              <h2 className="text-2xl font-black text-gray-900 mb-4 italic uppercase tracking-tighter">
                Sobre esta experiência
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {experiencia.descricao_completa || experiencia.descricao_curta || 'Sem descrição disponível'}
              </p>
            </section>

            {/* O que está incluído */}
            {experiencia.inclusoes && experiencia.inclusoes.length > 0 && (
              <section>
                <h2 className="text-2xl font-black text-gray-900 mb-4 italic uppercase tracking-tighter">
                  O que está incluído
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {experiencia.inclusoes.map((incl, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm">
                      {incl.incluido == 1 ? (
                        <Check size={18} className="text-green-500" />
                      ) : (
                        <X size={18} className="text-red-400" />
                      )}
                      <span className={`text-sm font-medium ${incl.incluido == 1 ? 'text-gray-700' : 'text-gray-400 line-through'}`}>
                        {incl.item}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Requisitos */}
            {experiencia.requisitos && experiencia.requisitos.length > 0 && (
              <section>
                <h2 className="text-2xl font-black text-gray-900 mb-4 italic uppercase tracking-tighter">
                  Requisitos
                </h2>
                <ul className="space-y-2">
                  {experiencia.requisitos.map((req, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-gray-600">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                      <span>{req.requisito}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Ponto de encontro */}
            {experiencia.ponto_encontro && (
              <section>
                <h2 className="text-2xl font-black text-gray-900 mb-4 italic uppercase tracking-tighter">
                  Ponto de encontro
                </h2>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <p className="text-gray-700 font-medium">{experiencia.ponto_encontro}</p>
                </div>
              </section>
            )}
          </div>

          {/* Coluna Direita - Card de Reserva */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
                <div className="mb-6">
                  <div className="text-3xl font-black text-gray-900">
                    {experiencia.preco} CVE
                  </div>
                  <p className="text-gray-400 text-sm font-medium">por pessoa</p>
                </div>

                {/* Selecionar data */}
                <div className="mb-4">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-400 block mb-2">
                    Selecionar data
                  </label>
                  <input 
                    type="date"
                    value={dataSelecionada}
                    onChange={(e) => setDataSelecionada(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-blue-600"
                  />
                </div>

                {/* Número de pessoas */}
                <div className="mb-6">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-400 block mb-2">
                    Número de pessoas
                  </label>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setQuantidadePessoas(Math.max(1, quantidadePessoas - 1))}
                      className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:border-blue-600 transition-colors"
                    >
                      -
                    </button>
                    <span className="text-lg font-bold w-12 text-center">{quantidadePessoas}</span>
                    <button 
                      onClick={() => setQuantidadePessoas(Math.min(experiencia.max_pessoas || 10, quantidadePessoas + 1))}
                      className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:border-blue-600 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Máx. {experiencia.max_pessoas || 'N/A'} pessoas
                  </p>
                </div>

                {/* Preço total */}
                <div className="border-t border-gray-100 pt-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">{experiencia.preco} CVE x {quantidadePessoas} pessoa(s)</span>
                    <span className="font-bold">{parseFloat(experiencia.preco) * quantidadePessoas} CVE</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-black text-blue-600">
                      {parseFloat(experiencia.preco) * quantidadePessoas} CVE
                    </span>
                  </div>
                </div>

                {/* Botão reservar */}
                <button 
                  onClick={handleReservar}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl transition-all uppercase tracking-wider text-sm shadow-lg shadow-blue-200 active:scale-95"
                >
                  Reservar agora
                </button>

                <p className="text-xs text-center text-gray-400 mt-4">
                  Pagamento seguro • Cancelamento gratuito até 24h antes
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExperienciaDetalhes;