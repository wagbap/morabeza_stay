// pages/DetalhesReservaPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, User, Phone, Mail, Download, Share2,
  CheckCircle, XCircle, Clock, AlertCircle, ChevronRight, Home
} from 'lucide-react';

export default function DetalhesReservaPage() {
  const { id, tipo } = useParams();
  const navigate = useNavigate();
  const [detalhes, setDetalhes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    if (id && tipo) {
      fetchDetalhes();
    }
  }, [id, tipo]);

  const fetchDetalhes = async () => {
    setLoading(true);
    setError(null);
    try {
      const savedUser = localStorage.getItem('user');
      if (!savedUser) {
        setError('Usuário não autenticado');
        setLoading(false);
        return;
      }
      
      const user = JSON.parse(savedUser);
      
      const response = await fetch(
        `https://welovepalop.com/api/dashboard/detalhes_reserva.php?reserva_id=${id}&usuario_id=${user.id}&tipo=${tipo}`
      );
      const data = await response.json();
      
      if (data.success) {
        setDetalhes(data.data);
      } else {
        setError(data.message || 'Erro ao carregar detalhes');
      }
    } catch (err) {
      setError('Erro ao carregar detalhes da reserva');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async () => {
    const confirmCancel = window.confirm('Tem certeza que deseja cancelar esta reserva?');
    if (!confirmCancel) return;

    setCanceling(true);
    try {
      const savedUser = localStorage.getItem('user');
      if (!savedUser) {
        alert('Usuário não autenticado');
        return;
      }
      
      const user = JSON.parse(savedUser);
      
      const response = await fetch('https://welovepalop.com/api/dashboard/minhas_reservas.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reserva_id: parseInt(id),
          tipo: tipo,
          usuario_id: user.id
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Reserva cancelada com sucesso!');
        navigate('/dashboard/reservas');
      } else {
        alert(data.message || 'Erro ao cancelar reserva');
      }
    } catch (error) {
      console.error('Erro ao cancelar reserva:', error);
      alert('Erro ao cancelar reserva. Tente novamente.');
    } finally {
      setCanceling(false);
    }
  };

  const getStatusConfig = (status) => {
    const statusMap = {
      'Confirmada': { 
        bg: 'bg-green-50', 
        text: 'text-green-700', 
        border: 'border-green-200',
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        label: 'Confirmada'
      },
      'Pendente': { 
        bg: 'bg-yellow-50', 
        text: 'text-yellow-700', 
        border: 'border-yellow-200',
        icon: <Clock className="w-5 h-5 text-yellow-500" />,
        label: 'Pendente'
      },
      'Cancelada': { 
        bg: 'bg-red-50', 
        text: 'text-red-700', 
        border: 'border-red-200',
        icon: <XCircle className="w-5 h-5 text-red-500" />,
        label: 'Cancelada'
      },
      'Concluída': { 
        bg: 'bg-teal-50', 
        text: 'text-teal-700', 
        border: 'border-teal-200',
        icon: <CheckCircle className="w-5 h-5 text-teal-500" />,
        label: 'Concluída'
      }
    };
    const statusKey = Object.keys(statusMap).find(key => 
      key.toLowerCase() === status?.toLowerCase()
    );
    return statusMap[statusKey] || { 
      bg: 'bg-gray-50', 
      text: 'text-gray-700', 
      border: 'border-gray-200',
      icon: <AlertCircle className="w-5 h-5 text-gray-500" />,
      label: status
    };
  };

  const getTipoIcon = (tipo) => {
    const tipos = {
      'alojamento': '🏠',
      'carro': '🚗',
      'experiencia': '🏄'
    };
    return tipos[tipo] || '📦';
  };

  const downloadQRCode = () => {
    if (!detalhes?.qr_code) return;
    const link = document.createElement('a');
    link.download = `qr-code-${detalhes.codigo_reserva}.png`;
    link.href = detalhes.qr_code;
    link.target = '_blank';
    link.click();
  };

  const shareReserva = () => {
    if (!detalhes) return;
    const text = `Reserva ${detalhes.codigo_reserva} - ${detalhes.item_nome}\nPeríodo: ${detalhes.periodo}\nStatus: ${detalhes.status}\nValor: ${detalhes.valor} CVE`;
    if (navigator.share) {
      navigator.share({
        title: `Reserva ${detalhes.codigo_reserva}`,
        text: text,
      });
    } else {
      navigator.clipboard.writeText(text);
      alert('Detalhes copiados!');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Carregando detalhes da reserva...</p>
        </div>
      </div>
    );
  }

  if (error || !detalhes) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Erro ao carregar</h3>
          <p className="text-gray-600">{error || 'Reserva não encontrada'}</p>
          <button
            onClick={() => navigate('/dashboard/reservas')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Voltar para Reservas
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(detalhes.status);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* Navegação */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/gest" className="hover:text-blue-600 flex items-center gap-1">
          <Home className="w-4 h-4" />
          Dashboard
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/gest/minhas-reservas" className="hover:text-blue-600">
          Minhas Reservas
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">{detalhes.codigo_reserva}</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/gest/minhas-reservas')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getTipoIcon(detalhes.tipo)}</span>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {detalhes.item_nome}
                  </h1>
                  <p className="text-sm text-gray-500">
                    Código: {detalhes.codigo_reserva}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={shareReserva}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Compartilhar"
            >
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={downloadQRCode}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Baixar QR Code"
            >
              <Download className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className={`${statusConfig.bg} border ${statusConfig.border} rounded-xl p-4 mb-6 flex flex-wrap items-center gap-4`}>
        <div className="flex items-center gap-2">
          {statusConfig.icon}
          <span className={`font-semibold ${statusConfig.text}`}>
            Status: {statusConfig.label}
          </span>
        </div>
        <span className="text-sm text-gray-500">
          Criado em {detalhes.data_criacao}
        </span>
        <div className="ml-auto">
          <span className="text-sm text-gray-500">Valor Total</span>
          <p className="text-xl font-bold text-blue-600">{detalhes.valor} CVE</p>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna Esquerda */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Item */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <img 
                src={detalhes.item_imagem || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=100&h=100&fit=crop'}
                alt={detalhes.item_nome}
                className="w-20 h-20 rounded-lg object-cover border border-gray-200"
              />
              <div className="flex-1">
                <h4 className="font-bold text-gray-900">{detalhes.item_nome}</h4>
                {detalhes.item_descricao && (
                  <p className="text-gray-600 text-sm mt-1">{detalhes.item_descricao}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {detalhes.periodo}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Detalhes Específicos */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="font-bold text-gray-900 mb-4">📋 Detalhes da Reserva</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {detalhes.especifico && Object.entries(detalhes.especifico).map(([key, value]) => {
                if (!value) return null;
                const labels = {
                  'checkin': 'Check-in',
                  'checkout': 'Check-out',
                  'noites': 'Noites',
                  'hospedes': 'Hóspedes',
                  'endereco': 'Endereço',
                  'cidade': 'Cidade',
                  'levantamento': 'Levantamento',
                  'devolucao': 'Devolução',
                  'dias': 'Dias',
                  'modelo': 'Modelo',
                  'marca': 'Marca',
                  'ano': 'Ano',
                  'data_participacao': 'Data',
                  'horario': 'Horário',
                  'pessoas': 'Pessoas',
                  'localizacao': 'Localização',
                  'duracao': 'Duração'
                };
                return (
                  <div key={key} className="flex flex-col p-2 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500">{labels[key] || key}</span>
                    <span className="font-medium text-gray-900">{value}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Histórico */}
          {detalhes.historico && detalhes.historico.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="font-bold text-gray-900 mb-4">📋 Histórico</h4>
              <div className="space-y-4">
                {detalhes.historico.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div 
                        className="w-3 h-3 rounded-full border-2 border-white shadow"
                        style={{ backgroundColor: item.cor || '#3b82f6' }}
                      ></div>
                      {index < detalhes.historico.length - 1 && (
                        <div className="w-0.5 h-8 bg-gray-300"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between">
                        <span className="font-medium text-gray-900">{item.status}</span>
                        <span className="text-sm text-gray-500">{item.data}</span>
                      </div>
                      {item.descricao && (
                        <p className="text-sm text-gray-600">{item.descricao}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Coluna Direita */}
        <div className="space-y-6">
          
          {/* QR Code */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <h4 className="font-bold text-gray-900 mb-3">📱 QR Code</h4>
            <div className="bg-white p-3 rounded-lg border border-gray-200 inline-block">
              <img 
                src={detalhes.qr_code} 
                alt="QR Code"
                className="w-40 h-40 object-contain"
              />
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Apresente no check-in
            </p>
            <button
              onClick={downloadQRCode}
              className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Baixar QR Code
            </button>
          </div>

          {/* Anfitrião */}
          {detalhes.proprietario && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="font-bold text-gray-900 mb-3">👤 Anfitrião</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{detalhes.proprietario.nome}</span>
                </div>
                {detalhes.proprietario.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <a href={`mailto:${detalhes.proprietario.email}`} className="text-blue-600 hover:underline">
                      {detalhes.proprietario.email}
                    </a>
                  </div>
                )}
                {detalhes.proprietario.telefone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <a href={`tel:${detalhes.proprietario.telefone}`} className="text-blue-600 hover:underline">
                      {detalhes.proprietario.telefone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="font-bold text-gray-900 mb-3">⚡ Ações</h4>
            <div className="space-y-2">
              <button
                onClick={() => window.print()}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                🖨️ Imprimir
              </button>
              <Link
                to="/dashboard/reservas"
                className="w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors block text-center"
              >
                📋 Ver Todas
              </Link>
              {detalhes.status !== 'Cancelada' && detalhes.status !== 'Concluída' && (
                <button
                  onClick={handleCancelar}
                  disabled={canceling}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {canceling ? 'Cancelando...' : '❌ Cancelar Reserva'}
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}