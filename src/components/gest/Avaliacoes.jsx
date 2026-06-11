import React, { useState, useEffect } from 'react';
import { Star, Loader2, Home, Car, Compass, Award } from 'lucide-react';

export default function Avaliacoes() {
  const [loading, setLoading] = useState(true);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [estatisticas, setEstatisticas] = useState([]);
  const [mediaGeral, setMediaGeral] = useState(0);
  const [totalAvaliacoes, setTotalAvaliacoes] = useState(0);
  const [filtro, setFiltro] = useState('todos');
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [userRoles, setUserRoles] = useState({
    anfitrion: false,
    guia: false,
    proprietarioVeiculos: false
  });
  const [tiposDisponiveis, setTiposDisponiveis] = useState([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setUsuarioLogado(user);
        fetchUserRoles(user.id);
      } catch (e) {
        console.error('Erro ao carregar usuário:', e);
      }
    }
  }, []);

  const fetchUserRoles = async (userId) => {
    try {
      const response = await fetch(`https://welovepalop.com/api/usuarios/listar_roles.php?usuario_id=${userId}`);
      const data = await response.json();
      
      if (data.success && data.roles) {
        const isAnfitrion = data.roles.some(r => r.name === 'anfitrion' && r.status === 'approved');
        const isGuia = data.roles.some(r => r.name === 'guia_experiencias' && r.status === 'approved');
        const isProprietarioVeiculos = data.roles.some(r => r.name === 'proprietario_veiculos' && r.status === 'approved');
        
        const tipos = [];
        if (isAnfitrion) tipos.push('alojamentos');
        if (isProprietarioVeiculos) tipos.push('carros');
        if (isGuia) tipos.push('experiencias');
        
        setTiposDisponiveis(tipos);
        setUserRoles({
          anfitrion: isAnfitrion,
          guia: isGuia,
          proprietarioVeiculos: isProprietarioVeiculos
        });
        
        // Se o filtro atual não está disponível, mudar para 'todos' ou o primeiro disponível
        if (filtro !== 'todos' && !tipos.includes(filtro)) {
          setFiltro('todos');
        }
      }
    } catch (error) {
      console.error('Erro ao buscar roles:', error);
    }
  };

  useEffect(() => {
    if (usuarioLogado && tiposDisponiveis.length > 0) {
      fetchAvaliacoes();
    }
  }, [filtro, usuarioLogado, tiposDisponiveis]);

  const fetchAvaliacoes = async () => {
    setLoading(true);
    try {
      // Buscar avaliações de todos os tipos que o usuário tem permissão
      let todasAvaliacoes = [];
      let todasEstatisticas = [];
      
      // Buscar por tipo específico ou todos
      if (filtro === 'todos') {
        // Buscar cada tipo separadamente
        for (const tipo of tiposDisponiveis) {
          const response = await fetch(`https://welovepalop.com/api/avaliacoes/listar.php?usuario_id=${usuarioLogado.id}&tipo=${tipo}`);
          const data = await response.json();
          
          if (data.success && data.data) {
            todasAvaliacoes = [...todasAvaliacoes, ...(data.data.avaliacoes || [])];
            if (data.data.estatisticas) {
              todasEstatisticas = [...todasEstatisticas, ...data.data.estatisticas];
            }
          }
        }
      } else {
        // Buscar apenas o tipo selecionado
        const response = await fetch(`https://welovepalop.com/api/avaliacoes/listar.php?usuario_id=${usuarioLogado.id}&tipo=${filtro}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          todasAvaliacoes = data.data.avaliacoes || [];
          todasEstatisticas = data.data.estatisticas || [];
        }
      }
      
      setAvaliacoes(todasAvaliacoes);
      setEstatisticas(todasEstatisticas);
      
      // Calcular média geral
      if (todasAvaliacoes.length > 0) {
        const soma = todasAvaliacoes.reduce((acc, curr) => acc + curr.rating, 0);
        setMediaGeral((soma / todasAvaliacoes.length).toFixed(1));
      } else {
        setMediaGeral(0);
      }
      setTotalAvaliacoes(todasAvaliacoes.length);
      
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (data) => {
    if (!data) return '';
    const date = new Date(data);
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(ontem.getDate() - 1);
    
    if (date.toDateString() === hoje.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === ontem.toDateString()) {
      return 'Ontem';
    } else {
      return date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
    }
  };

  const getTipoIcone = (tipo) => {
    switch(tipo) {
      case 'alojamento': return <Home size={14} className="text-blue-500" />;
      case 'carro': return <Car size={14} className="text-green-500" />;
      case 'experiencia': return <Compass size={14} className="text-purple-500" />;
      default: return null;
    }
  };

  const getTipoLabel = (tipo) => {
    switch(tipo) {
      case 'alojamento': return 'Alojamento';
      case 'carro': return 'Carro';
      case 'experiencia': return 'Experiência';
      default: return tipo;
    }
  };

  const RenderStars = ({ count }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`w-[14px] h-[14px] ${star <= count ? 'fill-[#fbbf24] text-[#fbbf24]' : 'fill-[#e2e8f0] text-[#e2e8f0]'}`} 
          />
        ))}
      </div>
    );
  };

  const RenderStarsLarge = ({ count }) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`w-[18px] h-[18px] ${star <= Math.floor(count) ? 'fill-[#fbbf24] text-[#fbbf24]' : 'fill-[#e2e8f0] text-[#e2e8f0]'}`} 
          />
        ))}
      </div>
    );
  };

  // Verificar se tem pelo menos uma role aprovada
  const hasAnyRole = userRoles.anfitrion || userRoles.guia || userRoles.proprietarioVeiculos;

  if (loading) {
    return (
      <div className="max-w-6xl w-full text-[#0f172a] px-4 py-6 md:px-0 flex justify-center items-center h-96">
        <Loader2 size={48} className="animate-spin text-blue-900" />
      </div>
    );
  }

  // Se não tem nenhuma role aprovada
  if (!hasAnyRole) {
    return (
      <div className="max-w-6xl w-full text-[#0f172a] px-4 py-6 md:px-0">
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award size={40} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Acesso Restrito</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Você não tem permissão para aceder às avaliações.
            É necessário ter uma das seguintes funções aprovadas:
            Anfitrião, Guia de Experiências ou Proprietário de Veículos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl w-full text-[#0f172a] px-4 py-6 md:px-0">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-[22px] font-bold">Avaliações dos Clientes</h1>
        
        <div className="flex flex-wrap gap-2">
          {/* Sempre mostrar o botão "Todos" se houver mais de um tipo disponível */}
          {tiposDisponiveis.length > 1 && (
            <button
              onClick={() => setFiltro('todos')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filtro === 'todos' ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
          )}
          
          {userRoles.anfitrion && (
            <button
              onClick={() => setFiltro('alojamentos')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                filtro === 'alojamentos' ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Home size={14} /> Alojamentos
            </button>
          )}
          
          {userRoles.proprietarioVeiculos && (
            <button
              onClick={() => setFiltro('carros')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                filtro === 'carros' ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Car size={14} /> Carros
            </button>
          )}
          
          {userRoles.guia && (
            <button
              onClick={() => setFiltro('experiencias')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                filtro === 'experiencias' ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Compass size={14} /> Experiências
            </button>
          )}
        </div>
      </div>

      {/* Resumo das Avaliações - sempre mostrar mesmo que seja 0 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 md:p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-16">
        
        <div className="flex flex-col items-center justify-center flex-shrink-0">
          <h3 className="text-[14px] font-bold text-[#0f172a] mb-2">Avaliação Média</h3>
          <span className="text-[48px] font-bold leading-none mb-2">{mediaGeral > 0 ? mediaGeral : '0.0'}</span>
          <RenderStarsLarge count={mediaGeral} />
          <span className="text-[13px] font-medium text-[#64748b] mt-2">({totalAvaliacoes} avaliações)</span>
        </div>

        <div className="flex-1 w-full max-w-md flex flex-col gap-3 pt-2">
          {estatisticas.length > 0 ? (
            estatisticas.map((item) => (
              <div key={item.estrelas} className="flex items-center gap-4">
                <span className="text-[13px] font-semibold text-[#475569] w-20 whitespace-nowrap">
                  {item.estrelas} {item.estrelas === 1 ? 'estrela' : 'estrelas'}
                </span>
                
                <div className="flex-1 h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#fbbf24] rounded-full"
                    style={{ width: `${item.percentagem || 0}%` }}
                  ></div>
                </div>
                
                <span className="text-[13px] font-semibold text-[#475569] w-8 text-right">
                  {item.quantidade || 0}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400 py-4">
              Sem estatísticas disponíveis
            </div>
          )}
        </div>
      </div>

      {/* Lista de Comentários */}
      <div className="space-y-4">
        {avaliacoes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-400">Nenhuma avaliação encontrada</p>
            <p className="text-sm text-gray-300 mt-2">
              {filtro !== 'todos' && tiposDisponiveis.length > 1
                ? `Nenhuma avaliação para ${filtro === 'alojamentos' ? 'alojamentos' : filtro === 'carros' ? 'carros' : 'experiências'} ainda`
                : 'As avaliações dos clientes aparecerão aqui assim que receber feedback'}
            </p>
          </div>
        ) : (
          avaliacoes.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-5 md:p-6 transition-all hover:shadow-md">
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3 md:gap-4">
                  <img 
                    src={review.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.nome_usuario || 'User')}&background=0D8ABC&color=fff&size=100`} 
                    alt={review.nome_usuario} 
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border border-gray-200 flex-shrink-0"
                  />
                  <div className="flex flex-col">
                    <span className="text-[14px] md:text-[15px] font-bold text-[#0f172a]">{review.nome_usuario}</span>
                    <div className="flex items-center gap-2">
                      {getTipoIcone(review.tipo)}
                      <span className="text-[12px] md:text-[13px] font-medium text-[#2563eb]">
                        {review.item_titulo}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-[12px] md:text-[13px] font-medium text-[#64748b] whitespace-nowrap">
                  {formatarData(review.created_at)}
                </span>
              </div>

              <div className="mb-3">
                <RenderStars count={review.rating} />
              </div>

              <p className="text-[14px] text-[#334155] leading-relaxed">
                {review.comentario}
              </p>

            </div>
          ))
        )}
      </div>

    </div>
  );
}