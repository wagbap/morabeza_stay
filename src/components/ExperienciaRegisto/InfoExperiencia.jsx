// src/components/ExperienciaRegisto/InfoExperiencia.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, MapPin, Calendar, Clock, Users, DollarSign, 
  ArrowLeft, Heart, Share2, Check, X, Loader, AlertCircle,
  Camera, Wifi, Coffee, Car, Utensils, Shield, Gift, Globe
} from 'lucide-react';
import { buscarExperiencia } from '../../services/experienciaApiService';

const API_URL = 'https://welovepalop.com';

const InfoExperiencia = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [experiencia, setExperiencia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  
  useEffect(() => {
    const carregar = async () => {
      try {
        setLoading(true);
        const result = await buscarExperiencia(id);
        
        if (result.success && result.data) {
          setExperiencia(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        console.error('Erro:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) carregar();
  }, [id]);
  
  const formatarPreco = (preco) => {
    if (!preco) return '0 CVE';
    return new Intl.NumberFormat('pt-PT').format(preco) + ' CVE';
  };
  
  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={16} className={i < Math.floor(rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
        ))}
        <span className="ml-2 text-sm text-gray-600">({experiencia?.total_reviews || 0} avaliações)</span>
      </div>
    );
  };
  
  const getIconeInclusao = (iconeNome) => {
    const icons = {
      coffee: <Coffee size={16} />,
      wifi: <Wifi size={16} />,
      car: <Car size={16} />,
      utensils: <Utensils size={16} />,
      camera: <Camera size={16} />,
      shield: <Shield size={16} />,
      gift: <Gift size={16} />,
      globe: <Globe size={16} />
    };
    return icons[iconeNome?.toLowerCase()] || <Check size={16} />;
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader className="animate-spin text-[#006ce4]" size={48} />
        <p className="mt-4 text-gray-600">Carregando experiência...</p>
      </div>
    );
  }
  
  if (error || !experiencia) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-semibold mb-2">Erro ao carregar</p>
          <p className="text-sm text-gray-600 mb-4">{error || 'Experiência não encontrada'}</p>
          <button onClick={() => navigate(-1)} className="px-4 py-2 bg-[#006ce4] text-white rounded-lg">
            Voltar
          </button>
        </div>
      </div>
    );
  }
  
  const imagens = experiencia.imagens || [];
  const inclusoes = experiencia.inclusoes || [];
  const requisitos = experiencia.requisitos || [];
  const idiomas = experiencia.idiomas || [];
  const diasDisponiveis = experiencia.dias_disponiveis || [];
  const horarios = experiencia.horarios || [];
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna esquerda */}
          <div className="lg:col-span-2 space-y-6">
            {/* Galeria */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="relative h-96 bg-gray-100">
                {imagens.length > 0 ? (
                  <img 
                    src={imagens[selectedImage]?.caminho_url || imagens[selectedImage]?.url}
                    alt={experiencia.titulo}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera size={64} className="text-gray-400" />
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    experiencia.status === 'aprovado' ? 'bg-green-500 text-white' :
                    experiencia.status === 'pendente' ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {experiencia.status === 'aprovado' ? 'Disponível' : 
                     experiencia.status === 'pendente' ? 'Em análise' : 'Indisponível'}
                  </span>
                </div>
              </div>
              {imagens.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {imagens.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImage === idx ? 'border-[#006ce4]' : 'border-gray-200'
                      }`}
                    >
                      <img src={img.caminho_url || img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Título e descrição */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{experiencia.titulo}</h1>
              <div className="flex items-center gap-4 mb-4">
                {renderStars(experiencia.rating)}
                <span className="text-sm text-gray-500 capitalize">{experiencia.categoria}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <MapPin size={18} />
                <span>{experiencia.localizacao} - Ilha {experiencia.ilha}</span>
              </div>
              <p className="text-gray-700 leading-relaxed">{experiencia.descricao_completa || experiencia.descricao_longa || experiencia.descricao_curta}</p>
            </div>
            
            {/* Inclusões */}
            {inclusoes.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">O que está incluído</h2>
                <div className="grid grid-cols-2 gap-3">
                  {inclusoes.filter(i => i.incluido === 1).map((inc, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-gray-700">
                      {getIconeInclusao(inc.icone)}
                      <span className="text-sm">{inc.item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Requisitos */}
            {requisitos.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Requisitos</h2>
                <div className="space-y-2">
                  {requisitos.map((req, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-gray-700">
                      <AlertCircle size={16} className="text-orange-500 mt-0.5" />
                      <span className="text-sm">{req.requisito}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Idiomas */}
            {idiomas.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Idiomas</h2>
                <div className="flex flex-wrap gap-2">
                  {idiomas.map((idioma, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                      {idioma.idioma} ({idioma.nivel})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Coluna direita - Card de reserva */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <div className="border-b border-gray-200 pb-4 mb-4">
                <p className="text-3xl font-bold text-[#006ce4]">{formatarPreco(experiencia.preco)}</p>
                <p className="text-gray-500 text-sm">por pessoa</p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Duração</span>
                  <span className="font-semibold">{experiencia.duracao}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Capacidade</span>
                  <span className="font-semibold">até {experiencia.max_pessoas} pessoas</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Localização</span>
                  <span className="font-semibold">{experiencia.localizacao}</span>
                </div>
                {experiencia.ponto_encontro && (
                  <div className="flex items-start justify-between">
                    <span className="text-gray-600">Ponto de encontro</span>
                    <span className="font-semibold text-right text-sm">{experiencia.ponto_encontro}</span>
                  </div>
                )}
              </div>
              
              <button className="w-full bg-[#006ce4] text-white py-3 rounded-lg font-semibold hover:bg-[#0053b3] transition-colors mb-3">
                Reservar agora
              </button>
              
              <p className="text-xs text-gray-400 text-center">
                Não será cobrado nada agora
              </p>
            </div>
            
            {/* Disponibilidade resumo */}
            {(diasDisponiveis.length > 0 || horarios.length > 0) && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3">Disponibilidade</h3>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {diasDisponiveis.map(dia => (
                                           <span key={dia} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {dia.substring(0, 3)}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {horarios.map(horario => (
                      <span key={horario} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {horario}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoExperiencia;