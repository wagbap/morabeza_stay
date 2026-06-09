// pages/admin/DetalhesConteudo.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  X, Check, Eye, MapPin, User, Mail, Calendar, 
  DollarSign, Users, Car, Compass, Clock, Star, 
  Home, Building, Hotel, Loader2, ArrowLeft,
  Phone, Fuel, Gauge, CalendarDays, AlertCircle, CheckCircle,
  Printer, Download, Share2, Settings, Info, Heart, Flag,
  Wifi, Coffee, Bath, Bed, Utensils, Wind, Tv, Zap, Shield,
  Award, Globe, Languages, Package, ListChecks, TrendingUp
} from 'lucide-react';
import useDetalhes from '../../hooks/useDetalhes';

const DetalhesConteudo = () => {
  const { tipo, id } = useParams();
  const navigate = useNavigate();
  const { data: item, loading, error } = useDetalhes(tipo, id);
  const [activeInfoTab, setActiveInfoTab] = useState('geral');
  const [imageLoaded, setImageLoaded] = useState(false);

  const formatarPreco = (preco) => {
    if (!preco) return '0 CVE';
    return `${Number(preco).toLocaleString()} CVE`;
  };

  const formatarData = (data) => {
    if (!data) return 'N/A';
    return new Date(data).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getTipoIcon = () => {
    switch(tipo) {
      case 'alojamento':
      case 'alojamentos': return <Home size={24} className="text-blue-600" />;
      case 'carro':
      case 'carros': return <Car size={24} className="text-green-600" />;
      case 'experiencia':
      case 'experiencias': return <Compass size={24} className="text-purple-600" />;
      default: return <Home size={24} className="text-gray-600" />;
    }
  };

  const getTipoLabel = () => {
    switch(tipo) {
      case 'alojamento':
      case 'alojamentos': return 'Alojamento';
      case 'carro':
      case 'carros': return 'Viatura';
      case 'experiencia':
      case 'experiencias': return 'Experiência';
      default: return 'Conteúdo';
    }
  };

  const getTipoCor = () => {
    switch(tipo) {
      case 'alojamento':
      case 'alojamentos': return 'bg-blue-600';
      case 'carro':
      case 'carros': return 'bg-green-600';
      case 'experiencia':
      case 'experiencias': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  const StatusBadge = ({ status }) => {
    const config = {
      aprovado: { bg: 'bg-green-100', text: 'text-green-700', label: 'Aprovado', icon: <CheckCircle size={14} /> },
      pendente: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pendente', icon: <AlertCircle size={14} /> },
      rejeitado: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejeitado', icon: <X size={14} /> }
    };
    const style = config[status?.toLowerCase()] || config.pendente;
    return (
      <span className={`inline-flex items-center gap-1.5 ${style.bg} ${style.text} px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm`}>
        {style.icon} {style.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-[#003580] rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-500">A carregar detalhes do {getTipoLabel().toLowerCase()}...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-500" size={40} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Erro ao carregar</h2>
          <p className="text-gray-500 mb-6">{error || `${getTipoLabel()} não encontrado`}</p>
          <button 
            onClick={() => navigate('/admin/propriedades')}
            className="inline-flex items-center gap-2 bg-[#003580] text-white px-6 py-2.5 rounded-lg hover:bg-[#002860] transition"
          >
            <ArrowLeft size={18} /> Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Superior */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/admin/propriedades')}
                className="p-2 hover:bg-gray-100 rounded-lg transition flex items-center gap-2 text-gray-600"
              >
                <ArrowLeft size={20} />
                <span className="hidden sm:inline">Voltar</span>
              </button>
              <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${getTipoCor()} text-white`}>
                  {getTipoIcon()}
                </div>
                <div>
                  <h1 className="font-semibold text-gray-900 line-clamp-1 max-w-md">{item.titulo}</h1>
                  <p className="text-xs text-gray-500">ID: #{item.id}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                <Printer size={18} className="text-gray-500" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                <Download size={18} className="text-gray-500" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                <Share2 size={18} className="text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Esquerda - Conteúdo Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Imagem Principal */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {!imageLoaded && (
                <div className="h-96 bg-gray-200 animate-pulse flex items-center justify-center">
                  <Loader2 className="animate-spin text-gray-400" size={32} />
                </div>
              )}
              <img 
                src={item.imagem_url || item.imagem_principal || (item.imagens && item.imagens[0]?.caminho_url) || 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200'} 
                alt={item.titulo} 
                className={`w-full h-auto max-h-[500px] object-cover ${!imageLoaded ? 'hidden' : ''}`}
                onLoad={() => setImageLoaded(true)}
              />
            </div>

            {/* Tabs de Informação */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="border-b border-gray-200 px-6">
                <div className="flex gap-6 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'geral', label: 'Visão Geral', icon: <Info size={16} /> },
                    { id: 'detalhes', label: 'Detalhes', icon: <Settings size={16} /> },
                    { id: 'estatisticas', label: 'Estatísticas', icon: <TrendingUp size={16} /> },
                    { id: 'proprietario', label: 'Proprietário', icon: <User size={16} /> }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveInfoTab(tab.id)}
                      className={`flex items-center gap-2 px-1 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
                        activeInfoTab === tab.id
                          ? 'text-[#003580] border-[#003580]'
                          : 'text-gray-500 border-transparent hover:text-gray-700'
                      }`}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {/* Tab: Visão Geral */}
                {activeInfoTab === 'geral' && (
                  <div className="space-y-5">
                    <div className="flex flex-wrap gap-3">
                      <div className={`px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700`}>
                        {getTipoLabel()}
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <DollarSign size={20} className="mx-auto text-blue-500 mb-1" />
                        <p className="text-xs text-gray-500">Preço</p>
                        <p className="font-bold text-sm">
                          {tipo === 'carro' || tipo === 'carros' 
                            ? `${formatarPreco(item.preco_dia)}/dia`
                            : formatarPreco(item.preco_noite || item.preco)}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <MapPin size={20} className="mx-auto text-green-500 mb-1" />
                        <p className="text-xs text-gray-500">Localização</p>
                        <p className="font-medium text-sm truncate">{item.localizacao || item.ilha || 'N/A'}</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Star size={20} className="mx-auto text-yellow-500 mb-1" />
                        <p className="text-xs text-gray-500">Avaliação</p>
                        <p className="font-bold text-sm">{item.estrelas || item.media_avaliacoes || 4.5} ★</p>
                        {item.total_avaliacoes > 0 && (
                          <p className="text-xs text-gray-400">({item.total_avaliacoes} avaliações)</p>
                        )}
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Calendar size={20} className="mx-auto text-purple-500 mb-1" />
                        <p className="text-xs text-gray-500">Registo</p>
                        <p className="text-xs font-medium">{formatarData(item.created_at)}</p>
                      </div>
                    </div>

                    {(item.descricao || item.descricao_curta || item.descricao_longa) && (
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-2">Descrição</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {item.descricao || item.descricao_curta || item.descricao_longa}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: Detalhes Específicos */}
                {activeInfoTab === 'detalhes' && (
                  <div>
                    {tipo === 'alojamento' || tipo === 'alojamentos' ? (
                      <div className="space-y-6">
                        {/* Comodidades */}
                        {item.comodidades && item.comodidades.length > 0 && (
                          <div>
                            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                              <Package size={18} /> Comodidades
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {item.comodidades.map((com, idx) => (
                                <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                  <CheckCircle size={14} className="text-green-500" />
                                  <span className="text-sm">{com.nome}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Regras */}
                        {item.regras && item.regras.length > 0 && (
                          <div>
                            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                              <ListChecks size={18} /> Regras da Casa
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {item.regras.map((regra, idx) => (
                                <div key={idx} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                                  <Shield size={16} className="text-blue-500 mt-0.5" />
                                  <div>
                                    <p className="font-medium text-sm">{regra.titulo}</p>
                                    <p className="text-xs text-gray-500">{regra.descricao}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tipos de Quarto */}
                        {item.tipos_quarto && item.tipos_quarto.length > 0 && (
                          <div>
                            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                              <Bed size={18} /> Tipos de Quarto
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {item.tipos_quarto.map((quarto, idx) => (
                                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                                  <p className="font-medium text-sm">{quarto.nome}</p>
                                  <p className="text-xs text-gray-500">Capacidade: {quarto.capacidade} pessoas</p>
                                  {quarto.camas && <p className="text-xs text-gray-500">{quarto.camas}</p>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : tipo === 'carro' || tipo === 'carros' ? (
                      <div className="space-y-6">
                        {/* Especificações Técnicas */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500">Marca</p>
                            <p className="font-medium">{item.marca || 'N/A'}</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500">Modelo</p>
                            <p className="font-medium">{item.modelo || 'N/A'}</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500">Ano</p>
                            <p className="font-medium">{item.ano || '2024'}</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500">Passageiros</p>
                            <p className="font-medium">{item.passageiros || 5}</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500">Combustível</p>
                            <p className="font-medium">{item.combustivel || 'Gasolina'}</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500">Transmissão</p>
                            <p className="font-medium">{item.transmissao || 'Manual'}</p>
                          </div>
                        </div>

                        {/* Características */}
                        {item.caracteristicas && item.caracteristicas.length > 0 && (
                          <div>
                            <h3 className="font-semibold text-gray-800 mb-3">Características</h3>
                            <div className="flex flex-wrap gap-2">
                              {item.caracteristicas.map((carac, idx) => (
                                <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-sm">{carac.nome}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Inclusões */}
                        {item.inclusoes && item.inclusoes.length > 0 && (
                          <div>
                            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                              <Package size={18} /> Inclusões
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {item.inclusoes.filter(i => i.incluido).map((inc, idx) => (
                                <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                  <CheckCircle size={14} className="text-green-500" />
                                  <span className="text-sm">{inc.item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Requisitos */}
                        {item.requisitos && item.requisitos.length > 0 && (
                          <div>
                            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                              <AlertCircle size={18} /> Requisitos
                            </h3>
                            <div className="space-y-2">
                              {item.requisitos.map((req, idx) => (
                                <div key={idx} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                                  <Shield size={16} className="text-orange-500 mt-0.5" />
                                  <span className="text-sm">{req.requisito}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Idiomas */}
                        {item.idiomas && item.idiomas.length > 0 && (
                          <div>
                            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                              <Languages size={18} /> Idiomas Disponíveis
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {item.idiomas.map((lang, idx) => (
                                <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                                  {lang.idioma} ({lang.nivel})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: Estatísticas */}
                {activeInfoTab === 'estatisticas' && item.estatisticas && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Eye size={24} className="mx-auto text-blue-500 mb-2" />
                        <p className="text-2xl font-bold text-gray-800">{item.estatisticas.total_visualizacoes || 0}</p>
                        <p className="text-xs text-gray-500">Visualizações</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <CheckCircle size={24} className="mx-auto text-green-500 mb-2" />
                        <p className="text-2xl font-bold text-gray-800">{item.estatisticas.total_cliques_reserva || 0}</p>
                        <p className="text-xs text-gray-500">Cliques em Reserva</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Clock size={24} className="mx-auto text-orange-500 mb-2" />
                        <p className="text-2xl font-bold text-gray-800">{item.estatisticas.tempo_medio || 0}s</p>
                        <p className="text-xs text-gray-500">Tempo Médio</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Proprietário */}
                {activeInfoTab === 'proprietario' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#003580] to-[#6b82c6] flex items-center justify-center text-white text-xl font-bold">
                        {(item.proprietario_nome || 'A').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{item.proprietario_nome || 'Anónimo'}</h3>
                        <p className="text-sm text-gray-500">Proprietário</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Mail size={16} className="text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="text-sm truncate">{item.proprietario_email || 'Não informado'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Phone size={16} className="text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Telefone</p>
                          <p className="text-sm">{item.proprietario_telefone || 'Não informado'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Coluna Direita - Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-20">
              <h3 className="font-semibold text-gray-800 mb-4">Informações Rápidas</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">ID</span>
                  <span className="font-mono text-gray-700">#{item.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tipo</span>
                  <span className="font-medium">{getTipoLabel()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <StatusBadge status={item.status} />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Data Registo</span>
                  <span className="text-gray-700">{formatarData(item.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default DetalhesConteudo;