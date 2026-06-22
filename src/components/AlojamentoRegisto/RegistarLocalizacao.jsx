// src/components/AlojamentoRegisto/RegistarLocalizacao.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { MapPin, Search, Home, AlertCircle, Loader, Navigation, Building } from 'lucide-react';

const API_URL = 'https://welovepalop.com';

const ILHAS_CABO_VERDE = [
  'Santiago', 'São Vicente', 'Sal', 'Boa Vista', 'Fogo', 
  'Santo Antão', 'Maio', 'São Nicolau', 'Brava', 'Santa Luzia'
];

const LOCALIZACOES_SUGESTAO = [
  // Santiago
  { nome: 'Platô - Praia Centro', cidade: 'Praia', ilha: 'Santiago', codigoPostal: '7110', lat: 14.9176, lng: -23.5091 },
  { nome: 'Achada Santo António', cidade: 'Praia', ilha: 'Santiago', codigoPostal: '7110', lat: 14.9213, lng: -23.5065 },
  { nome: 'Palmarejo', cidade: 'Praia', ilha: 'Santiago', codigoPostal: '7110', lat: 14.9312, lng: -23.5156 },
  { nome: 'Quebra Canela', cidade: 'Praia', ilha: 'Santiago', codigoPostal: '7110', lat: 14.9083, lng: -23.5161 },
  { nome: 'Tarrafal - Praia', cidade: 'Tarrafal', ilha: 'Santiago', codigoPostal: '7310', lat: 15.2769, lng: -23.7519 },
  { nome: 'Cidade Velha - Centro Histórico', cidade: 'Cidade Velha', ilha: 'Santiago', codigoPostal: '7120', lat: 14.9153, lng: -23.6056 },
  { nome: 'Assomada - Mercado', cidade: 'Assomada', ilha: 'Santiago', codigoPostal: '7310', lat: 15.0872, lng: -23.6833 },
  
  // São Vicente
  { nome: 'Avenida Marginal - Mindelo', cidade: 'Mindelo', ilha: 'São Vicente', codigoPostal: '2110', lat: 16.8901, lng: -24.9884 },
  { nome: 'Praça Nova - Mindelo Centro', cidade: 'Mindelo', ilha: 'São Vicente', codigoPostal: '2110', lat: 16.8865, lng: -24.9865 },
  { nome: 'Lazareto', cidade: 'Mindelo', ilha: 'São Vicente', codigoPostal: '2110', lat: 16.8833, lng: -24.9667 },
  
  // Sal
  { nome: 'Santa Maria - Zona Turística', cidade: 'Santa Maria', ilha: 'Sal', codigoPostal: '4111', lat: 16.6000, lng: -22.9000 },
  { nome: 'Rua Pedonal de Santa Maria', cidade: 'Santa Maria', ilha: 'Sal', codigoPostal: '4111', lat: 16.5983, lng: -22.9054 },
  { nome: 'Espargos - Centro', cidade: 'Espargos', ilha: 'Sal', codigoPostal: '4110', lat: 16.7553, lng: -22.9447 },
  
  // Boa Vista
  { nome: 'Sal Rei - Beira Mar', cidade: 'Sal Rei', ilha: 'Boa Vista', codigoPostal: '5110', lat: 16.1761, lng: -22.9181 },
  { nome: 'Praia de Chaves', cidade: 'Sal Rei', ilha: 'Boa Vista', codigoPostal: '5110', lat: 16.1833, lng: -22.9333 },
  
  // Fogo
  { nome: 'São Filipe - Centro', cidade: 'São Filipe', ilha: 'Fogo', codigoPostal: '8110', lat: 14.8958, lng: -24.4958 },
  { nome: 'Chã das Caldeiras - Vulcão', cidade: 'Chã das Caldeiras', ilha: 'Fogo', codigoPostal: '8110', lat: 14.9500, lng: -24.3500 },
  
  // Santo Antão
  { nome: 'Ribeira Grande - Vale', cidade: 'Ribeira Grande', ilha: 'Santo Antão', codigoPostal: '1110', lat: 17.1833, lng: -25.0667 },
  { nome: 'Porto Novo - Cais', cidade: 'Porto Novo', ilha: 'Santo Antão', codigoPostal: '1120', lat: 17.0194, lng: -25.0647 },
  { nome: 'Ponta do Sol - Mirante', cidade: 'Ponta do Sol', ilha: 'Santo Antão', codigoPostal: '1110', lat: 17.2000, lng: -25.1000 },
  { nome: 'Paul - Vale', cidade: 'Paul', ilha: 'Santo Antão', codigoPostal: '1110', lat: 17.1167, lng: -25.0167 }
];

const RegistarLocalizacao = ({ dados = {}, onChange, readOnly = false, alojamentoId = null }) => {
  // ESTADOS
  const [endereco, setEndereco] = useState('');
  const [cidade, setCidade] = useState('');
  const [ilha, setIlha] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [numApartamento, setNumApartamento] = useState('');
  const [moradaCompleta, setMoradaCompleta] = useState('');
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [carregado, setCarregado] = useState(false);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  // CARREGAR DADOS DA API
  useEffect(() => {
    const carregarLocalizacao = async () => {
      if (!alojamentoId || carregado) return;
      
      setLoading(true);
      try {
        console.log(`📍 Buscando localização para alojamento ID: ${alojamentoId}`);
        
        const response = await fetch(`${API_URL}/api/alojamento/buscar_localizacao.php?id=${alojamentoId}`);
        const result = await response.json();
        
        console.log('📦 Resposta da API:', result);
        
        if (result.success && result.data) {
          const data = result.data;
          
          // Mapear dados
          const enderecoValue = data.endereco || data.localizacao || '';
          const cidadeValue = data.cidade || '';
          const ilhaValue = data.ilha || '';
          const codigoPostalValue = data.codigo_postal || '';
          const numApartamentoValue = data.num_apartamento || '';
          const moradaCompletaValue = data.morada_completa || '';
          const latValue = data.latitude ? parseFloat(data.latitude) : null;
          const lngValue = data.longitude ? parseFloat(data.longitude) : null;
          
          setEndereco(enderecoValue);
          setCidade(cidadeValue);
          setIlha(ilhaValue);
          setCodigoPostal(codigoPostalValue);
          setNumApartamento(numApartamentoValue);
          setMoradaCompleta(moradaCompletaValue);
          setLatitude(latValue);
          setLongitude(lngValue);
          
          console.log(`✅ Localização carregada: ${enderecoValue}, ${cidadeValue}, ${ilhaValue}`);
          
          // Notificar pai
          if (onChange) {
            onChange({
              endereco: enderecoValue,
              cidade: cidadeValue,
              ilha: ilhaValue,
              codigo_postal: codigoPostalValue,
              num_apartamento: numApartamentoValue,
              morada_completa: moradaCompletaValue,
              latitude: latValue,
              longitude: lngValue,
              coordenadas: { lat: latValue, lng: lngValue }
            });
          }
          
          setCarregado(true);
        }
      } catch (error) {
        console.error('❌ Erro ao carregar localização:', error);
      } finally {
        setLoading(false);
      }
    };
    
    carregarLocalizacao();
  }, [alojamentoId, onChange, carregado]);

  // Atualizar quando dados prop mudar
  useEffect(() => {
    if (dados && Object.keys(dados).length > 0 && !carregado) {
      console.log('📥 Dados recebidos via props:', dados);
      
      setEndereco(dados.endereco || dados.morada || '');
      setCidade(dados.cidade || '');
      setIlha(dados.ilha || '');
      setCodigoPostal(dados.codigo_postal || dados.codigoPostal || '');
      setNumApartamento(dados.num_apartamento || dados.apartamento || '');
      setMoradaCompleta(dados.morada_completa || dados.moradaCompleta || '');
      
      const lat = dados.latitude || dados.coordenadas?.lat || null;
      const lng = dados.longitude || dados.coordenadas?.lng || null;
      setLatitude(lat);
      setLongitude(lng);
    }
  }, [dados, carregado]);

  // Função para buscar coordenadas
  const buscarCoordenadas = async (endereco, cidade, ilha) => {
    try {
      // Tenta encontrar nas sugestões
      const sugestaoEncontrada = LOCALIZACOES_SUGESTAO.find(
        s => s.nome.toLowerCase() === endereco.toLowerCase() && 
             s.cidade.toLowerCase() === cidade.toLowerCase() &&
             s.ilha.toLowerCase() === ilha.toLowerCase()
      );
      
      if (sugestaoEncontrada && sugestaoEncontrada.lat && sugestaoEncontrada.lng) {
        return { lat: sugestaoEncontrada.lat, lng: sugestaoEncontrada.lng };
      }
      
      // API Nominatim
      const query = encodeURIComponent(`${endereco}, ${cidade}, ${ilha}, Cabo Verde`);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
      
      return { lat: null, lng: null };
    } catch (error) {
      console.error('❌ Erro ao buscar coordenadas:', error);
      return { lat: null, lng: null };
    }
  };

  // Construir morada completa
  const construirMoradaCompleta = (endereco, apartamento, cidade, codigo, ilha) => {
    const partes = [];
    if (endereco) partes.push(endereco);
    if (apartamento) partes.push(apartamento);
    if (cidade) partes.push(cidade);
    if (codigo) partes.push(codigo);
    if (ilha) partes.push(ilha);
    if (partes.length > 0) partes.push('Cabo Verde');
    return partes.join(', ');
  };

  // NOTIFICAR MUDANÇA
  const notificarMudanca = (atualizacoes = {}) => {
    const dadosCompletos = {
      endereco: endereco,
      cidade: cidade,
      ilha: ilha,
      codigo_postal: codigoPostal,
      num_apartamento: numApartamento,
      morada_completa: moradaCompleta,
      latitude: latitude,
      longitude: longitude,
      coordenadas: { lat: latitude, lng: longitude },
      ...atualizacoes
    };
    
    console.log('📤 RegistarLocalizacao enviando:', dadosCompletos);
    
    if (onChange) {
      onChange(dadosCompletos);
    }
  };

  // HANDLERS
  const handleEnderecoChange = async (valor) => {
    setEndereco(valor);
    const novaMorada = construirMoradaCompleta(valor, numApartamento, cidade, codigoPostal, ilha);
    setMoradaCompleta(novaMorada);
    
    // Buscar coordenadas
    if (valor && cidade && ilha) {
      const coords = await buscarCoordenadas(valor, cidade, ilha);
      if (coords.lat && coords.lng) {
        setLatitude(coords.lat);
        setLongitude(coords.lng);
        notificarMudanca({ 
          endereco: valor, 
          morada_completa: novaMorada,
          latitude: coords.lat,
          longitude: coords.lng,
          coordenadas: coords
        });
        return;
      }
    }
    
    notificarMudanca({ endereco: valor, morada_completa: novaMorada });
  };

  const handleNumApartamentoChange = (valor) => {
    setNumApartamento(valor);
    const novaMorada = construirMoradaCompleta(endereco, valor, cidade, codigoPostal, ilha);
    setMoradaCompleta(novaMorada);
    notificarMudanca({ num_apartamento: valor, morada_completa: novaMorada });
  };

  const handleCidadeChange = async (valor) => {
    console.log('🏙️ Cidade selecionada:', valor);
    setCidade(valor);
    
    const novaMorada = construirMoradaCompleta(endereco, numApartamento, valor, codigoPostal, ilha);
    setMoradaCompleta(novaMorada);
    
    // Buscar coordenadas
    if (endereco && valor && ilha) {
      const coords = await buscarCoordenadas(endereco, valor, ilha);
      if (coords.lat && coords.lng) {
        setLatitude(coords.lat);
        setLongitude(coords.lng);
        notificarMudanca({ 
          cidade: valor, 
          morada_completa: novaMorada,
          latitude: coords.lat,
          longitude: coords.lng,
          coordenadas: coords
        });
        return;
      }
    }
    
    notificarMudanca({ 
      cidade: valor, 
      morada_completa: novaMorada,
      latitude: latitude,
      longitude: longitude
    });
  };

  const handleIlhaChange = async (valor) => {
    console.log('🏝️ Ilha selecionada:', valor);
    setIlha(valor);
    
    const novaMorada = construirMoradaCompleta(endereco, numApartamento, cidade, codigoPostal, valor);
    setMoradaCompleta(novaMorada);
    
    // Buscar coordenadas
    if (endereco && cidade && valor) {
      const coords = await buscarCoordenadas(endereco, cidade, valor);
      if (coords.lat && coords.lng) {
        setLatitude(coords.lat);
        setLongitude(coords.lng);
        notificarMudanca({ 
          ilha: valor, 
          morada_completa: novaMorada,
          latitude: coords.lat,
          longitude: coords.lng,
          coordenadas: coords
        });
        return;
      }
    }
    
    notificarMudanca({ 
      ilha: valor, 
      morada_completa: novaMorada,
      latitude: latitude,
      longitude: longitude
    });
  };

  const handleCodigoPostalChange = (valor) => {
    setCodigoPostal(valor);
    const novaMorada = construirMoradaCompleta(endereco, numApartamento, cidade, valor, ilha);
    setMoradaCompleta(novaMorada);
    notificarMudanca({ codigo_postal: valor, morada_completa: novaMorada });
  };

  const handleSelecionarSugestao = (sugestao) => {
    setEndereco(sugestao.nome);
    setCidade(sugestao.cidade);
    setIlha(sugestao.ilha);
    setCodigoPostal(sugestao.codigoPostal || '');
    
    const lat = sugestao.lat || null;
    const lng = sugestao.lng || null;
    setLatitude(lat);
    setLongitude(lng);
    
    const novaMorada = construirMoradaCompleta(
      sugestao.nome, 
      numApartamento, 
      sugestao.cidade, 
      sugestao.codigoPostal || '', 
      sugestao.ilha
    );
    setMoradaCompleta(novaMorada);
    
    notificarMudanca({
      endereco: sugestao.nome,
      cidade: sugestao.cidade,
      ilha: sugestao.ilha,
      codigo_postal: sugestao.codigoPostal || '',
      morada_completa: novaMorada,
      latitude: lat,
      longitude: lng,
      coordenadas: { lat, lng }
    });
    
    setMostrarSugestoes(false);
    console.log(`📍 Sugestão selecionada: ${sugestao.nome}`);
  };

  const sugestoesFiltradas = useMemo(() => {
    if (!endereco || typeof endereco !== 'string' || endereco.trim() === '') {
      return LOCALIZACOES_SUGESTAO.slice(0, 10);
    }
    const termo = endereco.toLowerCase().trim();
    return LOCALIZACOES_SUGESTAO.filter(s => 
      s.nome.toLowerCase().includes(termo) ||
      s.cidade.toLowerCase().includes(termo) ||
      s.ilha.toLowerCase().includes(termo)
    ).slice(0, 10);
  }, [endereco]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader className="animate-spin mx-auto text-[#006ce4]" size={32} />
        <p className="mt-2 text-sm text-gray-500">Carregando localização salva...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ENDEREÇO */}
      <div className="relative">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Endereço <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={endereco}
            onChange={(e) => handleEnderecoChange(e.target.value)}
            onFocus={() => setMostrarSugestoes(true)}
            onBlur={() => setTimeout(() => setMostrarSugestoes(false), 200)}
            placeholder="Ex: Avenida Marginal, Praia de Santa Maria..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4]"
            disabled={readOnly}
          />
        </div>
        
        {mostrarSugestoes && sugestoesFiltradas.length > 0 && !readOnly && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {sugestoesFiltradas.map((sug, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelecionarSugestao(sug)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100 last:border-0"
              >
                <MapPin size={16} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-800">{sug.nome}</p>
                  <p className="text-xs text-gray-500">{sug.cidade}, {sug.ilha}</p>
                  {sug.codigoPostal && <p className="text-xs text-gray-400">CP: {sug.codigoPostal}</p>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* NÚMERO APARTAMENTO */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Nº Apartamento/Piso <span className="text-gray-400 text-xs">(opcional)</span>
        </label>
        <div className="relative">
          <Building size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={numApartamento}
            onChange={(e) => handleNumApartamentoChange(e.target.value)}
            placeholder="Ex: 2º Esquerdo, Apt 12"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4]"
            disabled={readOnly}
          />
        </div>
      </div>

      {/* CIDADE */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Cidade <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Home size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={cidade}
            onChange={(e) => handleCidadeChange(e.target.value)}
            placeholder="Ex: Santa Maria, Mindelo, Praia..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4]"
            disabled={readOnly}
          />
        </div>
      </div>

      {/* ILHA */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Ilha <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Navigation size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <select
            value={ilha}
            onChange={(e) => handleIlhaChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4] bg-white"
            disabled={readOnly}
          >
            <option value="">Selecione a ilha</option>
            {ILHAS_CABO_VERDE.map(i => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>
      </div>

      {/* CÓDIGO POSTAL */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Código Postal <span className="text-gray-400 text-xs">(opcional)</span>
        </label>
        <div className="relative">
          <MapPin size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={codigoPostal}
            onChange={(e) => handleCodigoPostalChange(e.target.value)}
            placeholder="Ex: 7110, 2110, 4111..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4]"
            disabled={readOnly}
          />
        </div>
      </div>

      {/* MORADA COMPLETA */}
      {moradaCompleta && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-gray-500 mb-1">📋 Morada Completa:</p>
          <p className="text-sm text-gray-800">{moradaCompleta}</p>
        </div>
      )}

      {/* COORDENADAS */}
      {latitude && longitude && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-2">
          <p className="text-xs text-green-700">
            ✅ Coordenadas: {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </p>
        </div>
      )}

      {/* STATUS */}
      {carregado && !loading && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
          <p className="text-xs text-green-700">✅ Localização carregada</p>
        </div>
      )}
    </div>
  );
};

export default RegistarLocalizacao;