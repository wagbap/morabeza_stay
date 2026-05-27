// src/components/InfoAlojamento.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, MapPin, Users, Bed, Bath, Wifi, Coffee, Tv, Utensils, 
  Snowflake, Wind, Dumbbell, Car, Waves, Volume2, Flame, 
  Refrigerator, Mic, Shirt, Baby, DoorOpen, Lock, ShoppingBag, 
  Sun, Calendar, Clock, Check, X, ArrowLeft, Heart, Share2,
  Printer, Download, AlertCircle, Loader, Home, Award, Shield,
  CreditCard, Smartphone, Globe, Phone, Mail, MessageCircle
} from 'lucide-react';

const InfoAlojamento = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [alojamento, setAlojamento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showAllComodidades, setShowAllComodidades] = useState(false);

  // Buscar dados do alojamento
  useEffect(() => {
    const fetchAlojamento = async () => {
      try {
        setLoading(true);
        const apiUrl = import.meta.env.DEV 
          ? `https://welovepalop.com/api/meus_alojamentos.php?id=${id}`
          : `https://welovepalop.com/api/alojamento/meus_alojamentos.php?id=${id}`;
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) throw new Error('Erro ao carregar alojamento');
        
        const data = await response.json();
        
        if (data.success) {
          setAlojamento(data.data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        console.error('Erro:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchAlojamento();
  }, [id]);

  // Formatar preço
  const formatarPreco = (preco) => {
    return new Intl.NumberFormat('pt-PT').format(preco) + ' CVE';
  };

  // Renderizar estrelas
  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            size={18} 
            className={i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Buscar ícone da comodidade
  const getIconeComodidade = (iconeNome) => {
    const icons = {
      wifi: <Wifi size={18} />,
      snowflake: <Snowflake size={18} />,
      tv: <Tv size={18} />,
      coffee: <Coffee size={18} />,
      utensils: <Utensils size={18} />,
      waves: <Waves size={18} />,
      car: <Car size={18} />,
      sun: <Sun size={18} />,
      baby: <Baby size={18} />,
      dumbbell: <Dumbbell size={18} />,
      wind: <Wind size={18} />,
      flame: <Flame size={18} />,
      refrigerator: <Refrigerator size={18} />,
      mic: <Mic size={18} />,
      shirt: <Shirt size={18} />,
      lock: <Lock size={18} />,
      doorOpen: <DoorOpen size={18} />,
      volume2: <Volume2 size={18} />,
      shoppingBag: <ShoppingBag size={18} />,
    };
    return icons[iconeNome] || <Check size={18} />;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader className="animate-spin text-[#006ce4]" size={48} />
        <p className="mt-4 text-gray-600">Carregando informações do alojamento...</p>
      </div>
    );
  }

  if (error || !alojamento) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-semibold mb-2">Erro ao carregar</p>
          <p className="text-sm text-gray-600 mb-4">{error || 'Alojamento não encontrado'}</p>
          <button onClick={() => navigate(-1)} className="px-4 py-2 bg-[#006ce4] text-white rounded-lg">
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // Dados para exibição
  const imagens = alojamento.imagens || [];
  const comodidades = alojamento.comodidades || [];
  const comodidadesVisiveis = showAllComodidades ? comodidades : comodidades.slice(0, 12);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com navegação */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} /> Voltar
            </button>
            <div className="flex gap-3">
              <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100">
                <Heart size={20} />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100">
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna esquerda - Imagens e informações */}
          <div className="lg:col-span-2 space-y-6">
            {/* Galeria de imagens */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="relative h-96 bg-gray-100">
                {imagens.length > 0 ? (
                  <img 
                    src={imagens[selectedImage]?.caminho_url || imagens[selectedImage]?.url} 
                    alt={alojamento.titulo}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://placehold.co/1200x800?text=Sem+Imagem'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Home size={64} className="text-gray-400" />
                  </div>
                )}
                
                {/* Badge de status */}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    alojamento.status === 'aprovado' ? 'bg-green-500 text-white' :
                    alojamento.status === 'pendente' ? 'bg-yellow-500 text-white' :
                    'bg-red-500 text-white'
                  }`}>
                    {alojamento.status === 'aprovado' ? 'Disponível' : 
                     alojamento.status === 'pendente' ? 'Em análise' : 'Indisponível'}
                  </span>
                </div>
              </div>
              
              {/* Miniaturas */}
              {imagens.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {imagens.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === idx ? 'border-[#006ce4]' : 'border-gray-200'
                      }`}
                    >
                      <img 
                        src={img.caminho_url || img.url} 
                        alt={`Foto ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Título e descrição */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{alojamento.titulo}</h1>
              <div className="flex items-center gap-4 mb-4">
                {renderStars(alojamento.estrelas || 4.5)}
                <span className="text-sm text-gray-500">
                  {alojamento.tipo_propriedade || alojamento.tipo}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-600 mb-6">
                <MapPin size={18} />
                <span>{alojamento.localizacao}</span>
              </div>
              
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{alojamento.descricao}</p>
                {alojamento.descricao_detalhada && (
                  <p className="text-gray-700 leading-relaxed mt-4">{alojamento.descricao_detalhada}</p>
                )}
              </div>
            </div>

            {/* Comodidades */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Comodidades</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {comodidadesVisiveis.map(com => (
                  <div key={com.id} className="flex items-center gap-2 text-gray-700">
                    {getIconeComodidade(com.icone)}
                    <span className="text-sm">{com.nome}</span>
                  </div>
                ))}
              </div>
              
              {comodidades.length > 12 && (
                <button
                  onClick={() => setShowAllComodidades(!showAllComodidades)}
                  className="mt-4 text-[#006ce4] hover:underline text-sm"
                >
                  {showAllComodidades ? 'Ver menos' : `Ver mais ${comodidades.length - 12} comodidades`}
                </button>
              )}
              
              {comodidades.length === 0 && (
                <p className="text-gray-400 text-sm">Nenhuma comodidade listada</p>
              )}
            </div>

            {/* Regras da casa */}
            {alojamento.regras && alojamento.regras.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Regras da casa</h2>
                <div className="space-y-2">
                  {alojamento.regras.map(regra => (
                    <div key={regra.id} className="flex items-start gap-2 text-gray-700">
                      <Check size={16} className="text-green-500 mt-0.5" />
                      <span className="text-sm">{regra.nome || regra.titulo}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Coluna direita - Reserva e informações */}
          <div className="space-y-6">
            {/* Card de preço */}
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <div className="border-b border-gray-200 pb-4 mb-4">
                <p className="text-3xl font-bold text-[#006ce4]">{formatarPreco(alojamento.preco_noite)}</p>
                <p className="text-gray-500 text-sm">por noite</p>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Capacidade máxima</span>
                  <span className="font-semibold">{alojamento.capacidade} pessoas</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Tipo de propriedade</span>
                  <span className="font-semibold">{alojamento.tipo_propriedade || alojamento.tipo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Tempo de resposta</span>
                  <span className="font-semibold">{alojamento.tempo_resposta || 'Dentro de 1 hora'}</span>
                </div>
              </div>
              
              <button className="w-full bg-[#006ce4] text-white py-3 rounded-lg font-semibold hover:bg-[#0053b3] transition-colors mb-3">
                Reservar agora
              </button>
              
              <button className="w-full border border-[#006ce4] text-[#006ce4] py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                Enviar mensagem
              </button>
              
              <p className="text-xs text-gray-400 text-center mt-4">
                Não será cobrado nada agora
              </p>
            </div>

            {/* Informações do anfitrião */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Informações do anfitrião</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#006ce4] rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {alojamento.proprietario_nome ? alojamento.proprietario_nome[0] : 'A'}
                </div>
                <div>
                  <p className="font-medium">{alojamento.proprietario_nome || 'Anfitrião'}</p>
                  <p className="text-sm text-gray-500">Membro desde 2024</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Check size={16} className="text-green-500" />
                  <span>Identidade verificada</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Check size={16} className="text-green-500" />
                  <span>Email verificado</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Check size={16} className="text-green-500" />
                  <span>Telefone verificado</span>
                </div>
              </div>
            </div>

            {/* Políticas */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Políticas</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Clock size={16} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium">Check-in: 15:00 - 22:00</p>
                    <p className="text-gray-500">Check-out: até às 11:00</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CreditCard size={16} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium">Política de cancelamento</p>
                    <p className="text-gray-500">Cancelamento gratuito até 5 dias antes</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Shield size={16} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium">Segurança</p>
                    <p className="text-gray-500">Extintor, Kit de primeiros socorros</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoAlojamento;