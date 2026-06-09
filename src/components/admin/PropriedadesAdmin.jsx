import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, MapPin, Eye, Check, X, Loader2, Search, 
  AlertCircle, Home, Building, Hotel, Trash2,
  User, Mail, Calendar, DollarSign, Users, 
  Car, Compass, Clock, Fuel, Settings, Star,
  Phone, Bed, Bath, Wifi, Coffee, Tv, Snowflake, Utensils
} from 'lucide-react';

const PropriedadesAdmin = () => {
  const navigate = useNavigate(); // <-- ADICIONAR ESTA LINHA
  
  const [activeTab, setActiveTab] = useState('alojamentos');
  const [alojamentos, setAlojamentos] = useState([]);
  const [experiencias, setExperiencias] = useState([]);
  const [carros, setCarros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [stats, setStats] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [rejectItem, setRejectItem] = useState(null);

  // Carregar estatísticas
  const carregarStats = async () => {
    try {
      const response = await fetch('/api/admin/admin_all_content.php?action=dashboard');
      const data = await response.json();
      if (data.status === 'success') {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  // Carregar conteúdo por tipo
  const carregarConteudo = async () => {
    setLoading(true);
    try {
      const url = `/api/admin/admin_all_content.php?action=${activeTab}&status=${filterStatus}&search=${encodeURIComponent(search)}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'success') {
        if (activeTab === 'alojamentos') setAlojamentos(data.data);
        if (activeTab === 'experiencias') setExperiencias(data.data);
        if (activeTab === 'carros') setCarros(data.data);
      }
    } catch (err) {
      console.error('Erro:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    carregarStats();
  }, []);

  useEffect(() => {
    carregarConteudo();
  }, [activeTab, filterStatus, search]);

  // Atualizar status
  const atualizarStatus = async (tipo, id, novoStatus, motivo = null) => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/admin_all_content.php?action=aprovar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, id, status: novoStatus, motivo })
      });
      const data = await response.json();
      
      if (data.success) {
        carregarConteudo();
        carregarStats();
        setShowModal(false);
        setShowRejectModal(false);
        setSelectedItem(null);
        setRejectItem(null);
        setMotivoRejeicao('');
        alert(data.message);
      } else {
        alert('Erro: ' + data.message);
      }
    } catch (err) {
      console.error('Erro:', err);
      alert('Erro de conexão');
    }
    setActionLoading(false);
  };

  // Status badge
  const StatusBadge = ({ status }) => {
    const config = {
      aprovado: { bg: 'bg-green-100', text: 'text-green-700', label: '✓ Aprovado', icon: <Check size={12} /> },
      pendente: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '⏳ Pendente', icon: <Clock size={12} /> },
      rejeitado: { bg: 'bg-red-100', text: 'text-red-700', label: '✗ Rejeitado', icon: <X size={12} /> }
    };
    const style = config[status?.toLowerCase()] || config.pendente;
    return (
      <span className={`inline-flex items-center gap-1 ${style.bg} ${style.text} px-2 py-1 rounded-md text-xs font-semibold`}>
        {style.icon} {style.label}
      </span>
    );
  };

  // Formatar preço
  const formatarPreco = (preco) => `${Number(preco || 0).toLocaleString()} CVE`;

  // Ícone do tipo
  const getTipoIcon = (tipo) => {
    switch(tipo?.toLowerCase()) {
      case 'villa': return <Building size={18} />;
      case 'guesthouse': return <Hotel size={18} />;
      default: return <Home size={18} />;
    }
  };

  // Contagens
  const getCurrentItems = () => {
    if (activeTab === 'alojamentos') return alojamentos;
    if (activeTab === 'experiencias') return experiencias;
    return carros;
  };

  const currentItems = getCurrentItems();
  const totalPendentes = currentItems.filter(i => i.status === 'pendente').length;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#003580]">Gestão de Conteúdo</h1>
          <p className="text-gray-600 mt-1">
            Gerencie alojamentos, experiências e viaturas do sistema.
            {totalPendentes > 0 && (
              <span className="ml-2 text-yellow-600 font-medium">
                ({totalPendentes} aguardam aprovação)
              </span>
            )}
          </p>
        </div>
        <button className="flex items-center gap-2 bg-[#003580] hover:bg-[#002860] text-white px-5 py-2.5 rounded-xl transition shadow-md">
          <Plus size={20} /> Novo Conteúdo
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('alojamentos')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all rounded-t-lg ${
            activeTab === 'alojamentos' ? 'bg-[#003580] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Home size={18} /> Alojamentos
          {stats?.alojamentos?.pendentes > 0 && (
            <span className="ml-1 bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-xs">
              {stats.alojamentos.pendentes}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('experiencias')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all rounded-t-lg ${
            activeTab === 'experiencias' ? 'bg-[#003580] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Compass size={18} /> Experiências
          {stats?.experiencias?.pendentes > 0 && (
            <span className="ml-1 bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-xs">
              {stats.experiencias.pendentes}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('carros')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all rounded-t-lg ${
            activeTab === 'carros' ? 'bg-[#003580] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Car size={18} /> Viaturas
          {stats?.carros?.pendentes > 0 && (
            <span className="ml-1 bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-xs">
              {stats.carros.pendentes}
            </span>
          )}
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          {['todos', 'pendente', 'aprovado', 'rejeitado'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filterStatus === status 
                  ? status === 'pendente' ? 'bg-yellow-500 text-white'
                    : status === 'aprovado' ? 'bg-green-600 text-white'
                    : status === 'rejeitado' ? 'bg-red-600 text-white'
                    : 'bg-[#003580] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {status === 'todos' ? 'Todos' : status === 'pendente' ? '⏳ Pendentes' : status === 'aprovado' ? '✓ Aprovados' : '✗ Rejeitados'}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Procurar por título ou localização..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003580]/20" 
          />
        </div>
      </div>

      {/* Lista de Conteúdo */}
      {loading ? (
        <div className="py-20 flex justify-center items-center gap-2">
          <Loader2 className="animate-spin text-[#003580]" size={24} />
          <span>A carregar...</span>
        </div>
      ) : currentItems.length === 0 ? (
        <div className="py-20 text-center text-gray-500">
          {activeTab === 'alojamentos' && <Home size={48} className="mx-auto mb-4 text-gray-300" />}
          {activeTab === 'experiencias' && <Compass size={48} className="mx-auto mb-4 text-gray-300" />}
          {activeTab === 'carros' && <Car size={48} className="mx-auto mb-4 text-gray-300" />}
          <p>Nenhum {activeTab === 'alojamentos' ? 'alojamento' : activeTab === 'experiencias' ? 'experiência' : 'veículo'} encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {currentItems.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition">
              {/* Imagem */}
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={item.imagem_url || item.imagem_principal || 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=500'} 
                  alt={item.titulo} 
                  className="w-full h-full object-cover hover:scale-105 transition duration-300" 
                />
                <div className="absolute top-3 right-3"><StatusBadge status={item.status} /></div>
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 text-white text-xs flex items-center gap-1">
                  {activeTab === 'carros' ? <Car size={14} /> : activeTab === 'experiencias' ? <Compass size={14} /> : getTipoIcon(item.tipo)}
                  <span>{activeTab === 'carros' ? 'Viatura' : activeTab === 'experiencias' ? 'Experiência' : (item.tipo || 'Apartamento')}</span>
                </div>
              </div>

              {/* Conteúdo */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-800 line-clamp-1">{item.titulo}</h3>
                <div className="flex items-center text-gray-500 mt-1 text-sm">
                  <MapPin size={14} className="mr-1" />
                  <span className="line-clamp-1">{item.localizacao || item.ilha || 'Localização não informada'}</span>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="text-[#003580] font-bold">
                    {activeTab === 'carros' ? formatarPreco(item.preco_dia) + '/dia' : formatarPreco(item.preco_noite || item.preco)}
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    {activeTab === 'alojamentos' && <><Users size={14} /> {item.capacidade || 2} hóspedes</>}
                    {activeTab === 'carros' && <><Users size={14} /> {item.passageiros || 5} lugares</>}
                    {activeTab === 'experiencias' && <><Clock size={14} /> {item.duracao || '2h'}</>}
                  </div>
                </div>

                {/* Proprietário */}
                {(item.proprietario_nome || item.proprietario_email) && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                    <User size={12} /> <span className="truncate">{item.proprietario_nome || 'Anónimo'}</span>
                    <Mail size={12} /> <span className="truncate">{item.proprietario_email || 'Email não disponível'}</span>
                  </div>
                )}

                {/* Ações */}
                <div className="mt-4 flex gap-2">
                  <button 
                    onClick={() => navigate(`/admin/propriedades/${activeTab}/${item.id}`)} 
                    className="flex-1 flex items-center justify-center gap-1 text-sm font-medium text-[#6b82c6] hover:text-[#003580] bg-gray-50 hover:bg-gray-100 py-2 rounded-lg transition"
                  >
                    <Eye size={16} /> Detalhes
                  </button>
                  {item.status === 'pendente' && (
                    <>
                      <button onClick={() => atualizarStatus(activeTab.slice(0, -1), item.id, 'aprovado')} className="flex-1 flex items-center justify-center gap-1 text-green-600 bg-green-50 hover:bg-green-100 py-2 rounded-lg transition">
                        <Check size={16} /> Aprovar
                      </button>
                      <button onClick={() => { setRejectItem(item); setShowRejectModal(true); }} className="flex-1 flex items-center justify-center gap-1 text-red-600 bg-red-50 hover:bg-red-100 py-2 rounded-lg transition">
                        <X size={16} /> Rejeitar
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Detalhes - Removido pois agora usa página separada */}
      {/* O modal foi removido pois os detalhes agora são numa página separada */}

      {/* Modal de Rejeição */}
      {showRejectModal && rejectItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-2">Rejeitar {activeTab.slice(0, -1)}</h3>
            <textarea 
              value={motivoRejeicao} 
              onChange={(e) => setMotivoRejeicao(e.target.value)} 
              rows={4} 
              placeholder="Motivo da rejeição..." 
              className="w-full border rounded-xl p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-red-500/20" 
              autoFocus 
            />
            <div className="flex gap-3">
              <button 
                onClick={() => atualizarStatus(activeTab.slice(0, -1), rejectItem.id, 'rejeitado', motivoRejeicao)} 
                disabled={!motivoRejeicao.trim() || actionLoading} 
                className="flex-1 bg-red-600 text-white py-2.5 rounded-xl hover:bg-red-700 transition disabled:opacity-50"
              >
                {actionLoading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Confirmar'}
              </button>
              <button 
                onClick={() => { setShowRejectModal(false); setMotivoRejeicao(''); setRejectItem(null); }} 
                className="flex-1 bg-gray-200 py-2.5 rounded-xl hover:bg-gray-300 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropriedadesAdmin;