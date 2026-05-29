// src/components/CarroRegisto/InfoCarro.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, MapPin, Calendar, Users, Car, DollarSign, Gauge, Fuel, 
  ArrowLeft, Heart, Share2, Check, AlertCircle, Loader,
  Settings, Palette, Route, Navigation, Award, Shield, Clock
} from 'lucide-react';
import { buscarCarro } from '../../services/carroApiService';

const API_URL = 'https://welovepalop.com';

const InfoCarro = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [carro, setCarro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  
  useEffect(() => {
    const carregar = async () => {
      try {
        setLoading(true);
        const result = await buscarCarro(id);
        
        if (result.success && result.data) {
          setCarro(result.data);
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
    return new Intl.NumberFormat('pt-PT').format(preco) + ' CVE/dia';
  };
  
  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={16} className={i < Math.floor(rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
        ))}
        <span className="ml-2 text-sm text-gray-600">({carro?.total_reviews || 0} avaliações)</span>
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader className="animate-spin text-[#006ce4]" size={48} />
        <p className="mt-4 text-gray-600">Carregando veículo...</p>
      </div>
    );
  }
  
  if (error || !carro) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-semibold mb-2">Erro ao carregar</p>
          <p className="text-sm text-gray-600 mb-4">{error || 'Veículo não encontrado'}</p>
          <button onClick={() => navigate(-1)} className="px-4 py-2 bg-[#006ce4] text-white rounded-lg">
            Voltar
          </button>
        </div>
      </div>
    );
  }
  
  const imagens = carro.imagens || [];
  const statusColors = {
    disponivel: 'bg-green-500',
    indisponivel: 'bg-red-500',
    manutencao: 'bg-yellow-500'
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
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
          <div className="lg:col-span-2 space-y-6">
            {/* Galeria */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="relative h-96 bg-gray-100">
                {imagens.length > 0 ? (
                  <img 
                    src={imagens[selectedImage]?.caminho_url || imagens[selectedImage]?.url}
                    alt={carro.titulo}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Car size={64} className="text-gray-400" />
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${statusColors[carro.status] || 'bg-gray-500'}`}>
                    {carro.status === 'disponivel' ? 'Disponível' : 
                     carro.status === 'indisponivel' ? 'Indisponível' : 'Manutenção'}
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{carro.titulo}</h1>
              <div className="flex items-center gap-4 mb-4">
                {renderStars(carro.estrelas)}
                <span className="text-sm text-gray-500 capitalize">{carro.categoria_nome || carro.tipo}</span>
              </div>
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={18} />
                  <span>{carro.ano || 'Ano não informado'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users size={18} />
                  <span>{carro.passageiros || 5} passageiros</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Gauge size={18} />
                  <span>{carro.transmissao || 'Manual'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Fuel size={18} />
                  <span>{carro.combustivel || 'Gasolina'}</span>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">{carro.descricao_detalhada || carro.descricao}</p>
            </div>
            
            {/* Características */}
            {carro.caracteristicas && carro.caracteristicas.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Equipamentos</h2>
                <div className="grid grid-cols-2 gap-3">
                  {carro.caracteristicas.map((carac, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-gray-700">
                      <Check size={16} className="text-green-500" />
                      <span className="text-sm">{carac}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Card de reserva */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <div className="border-b border-gray-200 pb-4 mb-4">
                <p className="text-3xl font-bold text-[#006ce4]">{formatarPreco(carro.preco_dia)}</p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Marca/Modelo</span>
                  <span className="font-semibold">{carro.marca} {carro.modelo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Ano</span>
                  <span className="font-semibold">{carro.ano || '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Transmissão</span>
                  <span className="font-semibold">{carro.transmissao || 'Manual'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Combustível</span>
                  <span className="font-semibold">{carro.combustivel || 'Gasolina'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Localização</span>
                  <span className="font-semibold">{carro.ilha}, {carro.localizacao}</span>
                </div>
              </div>
              
              <button className="w-full bg-[#006ce4] text-white py-3 rounded-lg font-semibold hover:bg-[#0053b3] transition-colors mb-3">
                Reservar agora
              </button>
              
              <p className="text-xs text-gray-400 text-center">
                Não será cobrado nada agora
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoCarro;