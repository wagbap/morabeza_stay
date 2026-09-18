// src/components/AlojamentoRegisto/EditarAlojamento.jsx
import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, HelpCircle, ChevronRight, Loader, CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import PropMenu from './PropMenu';
import Comodidades from './Comodidades';
import InformacoesBasicas from './InformacoesBasicas';
import Regras from './Regras';
import ImagensUpload from './ImagensUpload';
import RegistarLocalizacao from './RegistarLocalizacao';
import {
  salvarFluxoRegisto,
  buscarAlojamentoParaEdicao,
  buscarQuartosDoAlojamento,
  buscarImagensDoAlojamento,
} from '../../services/apiService';
import 'mapbox-gl/dist/mapbox-gl.css';
import { modeloVendaPorTipo } from '../../utils/tipoAlojamento';

const API_BASE = 'https://welovepalop.com';

// ==================== TOAST INTERNO ====================
const ToastContext = createContext(null);

const ToastProviderInterno = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white bg-gray-900 border border-gray-800 transition-all">
          {toast.type === 'success' && <CheckCircle size={20} className="text-green-400 shrink-0" />}
          {toast.type === 'error' && <AlertCircle size={20} className="text-red-400 shrink-0" />}
          {toast.type === 'info' && <Info size={20} className="text-blue-400 shrink-0" />}
          <span className="text-sm font-medium tracking-wide">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-gray-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de um ToastProvider');
  }
  return context;
};

// ============================================================
// CARREGAR IMAGENS DOS QUARTOS FILTRADAS POR ALOJAMENTO
// ============================================================
const carregarImagensPorAlojamento = async (alojamentoId) => {
  try {
    const res = await fetch(`${API_BASE}/api/alojamento/get_quarto_imagens.php?t=${Date.now()}`, {
      cache: 'no-store',
    });
    const textData = await res.text();
    let data = null;

    try {
      data = JSON.parse(textData);
    } catch (e) {
      const match = textData.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          data = JSON.parse(match[0]);
        } catch (err) {
          console.error('❌ JSON inválido:', err);
        }
      }
    }

    if (!data || !data.success) return {};

    const imagensPorQuarto = {};

    (data.data || []).forEach((img) => {
      if (Number(img.alojamento_id) !== Number(alojamentoId)) return;
      const quartoId = String(img.quarto_id);
      if (!imagensPorQuarto[quartoId]) imagensPorQuarto[quartoId] = [];
      imagensPorQuarto[quartoId].push(img.caminho_url);
    });

    console.log(`📸 [EditarAlojamento] Imagens do alojamento ${alojamentoId}:`, imagensPorQuarto);
    return imagensPorQuarto;
  } catch (err) {
    console.error('Erro ao carregar imagens:', err);
    return {};
  }
};

// ==================== COMPONENTE PRINCIPAL ====================
const EditarAlojamentoContent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useToast();

  const [fase, setFase] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alojamentoId, setAlojamentoId] = useState(id ? parseInt(id) : null);
  const [isLoading, setIsLoading] = useState(id ? true : false);
  const [quartosSelecionados, setQuartosSelecionados] = useState([]);

  // FASE 1 - Informações Básicas
  const [informacoesBasicas, setInformacoesBasicas] = useState({
    titulo: '',
    tipo_propriedade: 'Apartamento',
    capacidade: 2,
    estrelas: 4.5,
    descricao: '',
    descricao_detalhada: '',
    preco_noite: '',
    tempo_resposta: 'Dentro de 1 hora',
    quartos: 1,
    camas: 1,
    casas_banho: 1,
    checkin_inicio: '14:00',
    checkin_fim: '22:00',
    checkout_limite: '11:00',
    checkin_flexivel: 0,
    checkin_flexivel_nota: '',
  });

  // FASE 2 - Localização
  const [localizacaoDados, setLocalizacaoDados] = useState({
    endereco: '',
    cidade: '',
    ilha: '',
    codigo_postal: '',
    num_apartamento: '',
    morada_completa: '',
    latitude: null,
    longitude: null,
    coordenadas: { lat: null, lng: null },
  });

  // FASE 3 - Comodidades
  const [comodidadesSelecionadas, setComodidadesSelecionadas] = useState([]);

  // FASE 4 - Regras
  const [regras, setRegras] = useState([]);
  const [regrasAdicionais, setRegrasAdicionais] = useState('');

  // FASE 5 - Fotos Principais
  const [fotos, setFotos] = useState([]);

  // ==================== MODELO DE VENDA ====================
  const modeloVenda = modeloVendaPorTipo(informacoesBasicas.tipo_propriedade);
  const mostraQuartos = modeloVenda === 'por_quarto';

  // ==================== CARREGAR DADOS ====================
  const carregarDadosAlojamento = async (alojamentoIdParam) => {
    if (!alojamentoIdParam) return;

    setIsLoading(true);
    try {
      console.log(`📥 Carregando alojamento ID: ${alojamentoIdParam} para edição`);

      const resultado = await buscarAlojamentoParaEdicao(alojamentoIdParam);

      if (resultado.success && resultado.data) {
        const dados = resultado.data;

        setInformacoesBasicas({
          titulo: dados.titulo || '',
          tipo_propriedade: dados.tipo_propriedade || 'Apartamento',
          capacidade: dados.capacidade || 2,
          estrelas: dados.estrelas || 4.5,
          descricao: dados.descricao || '',
          descricao_detalhada: dados.descricao_detalhada || '',
          preco_noite: dados.preco_noite || '',
          tempo_resposta: dados.tempo_resposta || 'Dentro de 1 hora',
          quartos: dados.quartos || 1,
          camas: dados.camas || 1,
          casas_banho: dados.casas_banho || 1,
          checkin_inicio: dados.checkin_inicio ? String(dados.checkin_inicio).substring(0, 5) : '14:00',
          checkin_fim: dados.checkin_fim ? String(dados.checkin_fim).substring(0, 5) : '22:00',
          checkout_limite: dados.checkout_limite ? String(dados.checkout_limite).substring(0, 5) : '11:00',
          checkin_flexivel: dados.checkin_flexivel ? 1 : 0,
          checkin_flexivel_nota: dados.checkin_flexivel_nota || '',
        });

        // 🔥 CARREGAR QUARTOS DESTE ALOJAMENTO
        let quartosDaBd = [];
        if (dados.quartos && Array.isArray(dados.quartos) && dados.quartos.length > 0) {
          quartosDaBd = dados.quartos;
        } else {
          const quartosResult = await buscarQuartosDoAlojamento(alojamentoIdParam);
          if (quartosResult.success && quartosResult.data) {
            quartosDaBd = quartosResult.data;
          }
        }

        // 🔥 CARREGAR IMAGENS SÓ DESTE ALOJAMENTO
        const imagensPorQuarto = await carregarImagensPorAlojamento(alojamentoIdParam);

        // 🔥 CRUZAR: cada quarto recebe APENAS as suas imagens
        const quartosMapeados = quartosDaBd.map((q) => {
          const quartoId = String(q.id);
          const tipoQuartoId = q.tipo_catalogo_id || q.tipo_quarto_id || q.tipo_id;

          let fotosDesteQuarto = imagensPorQuarto[quartoId] || [];

          return {
            ...q,
            tipo_quarto_id: tipoQuartoId,
            quantidade_disponivel: q.quantidade ?? q.quantidade_disponivel ?? 1,
            preco_personalizado: q.preco_noite ?? q.preco_personalizado ?? null,
            fotos: fotosDesteQuarto,
            imagens: fotosDesteQuarto,
          };
        });

        console.log(
          '✅ Quartos com fotos cruzadas:',
          quartosMapeados.map((q) => ({
            id: q.id,
            tipo_quarto_id: q.tipo_quarto_id,
            totalFotos: q.fotos.length,
          }))
        );

        setQuartosSelecionados(quartosMapeados);

        const endereco = dados.localizacao || dados.endereco || '';
        const cidade = dados.cidade || '';
        const ilha = dados.ilha || '';
        const codigo_postal = dados.codigo_postal || '';
        const num_apartamento = dados.num_apartamento || '';
        const latitude = dados.latitude ? parseFloat(dados.latitude) : null;
        const longitude = dados.longitude ? parseFloat(dados.longitude) : null;

        const partes = [];
        if (endereco) partes.push(endereco);
        if (num_apartamento) partes.push(num_apartamento);
        if (cidade) partes.push(cidade);
        if (codigo_postal) partes.push(codigo_postal);
        if (ilha) partes.push(ilha);
        if (partes.length > 0) partes.push('Cabo Verde');
        const morada_completa = partes.join(', ');

        const localizacao = {
          endereco: endereco,
          cidade: cidade,
          ilha: ilha,
          codigo_postal: codigo_postal,
          num_apartamento: num_apartamento,
          morada_completa: morada_completa,
          latitude: latitude,
          longitude: longitude,
          coordenadas: { lat: latitude, lng: longitude },
        };
        setLocalizacaoDados(localizacao);

        const comodidadesList = Array.isArray(dados.comodidades) ? dados.comodidades : [];
        setComodidadesSelecionadas(comodidadesList);

        const regrasList = dados.regras?.regras || [];
        const regrasAdd = dados.regras?.regrasAdicionais || dados.regras?.regras_adicionais || '';
        setRegras(regrasList);
        setRegrasAdicionais(regrasAdd);

        try {
          const imagensResult = await buscarImagensDoAlojamento(alojamentoIdParam);
          if (imagensResult.success && imagensResult.data) {
            let fotosList = Array.isArray(imagensResult.data)
              ? imagensResult.data
              : imagensResult.data.imagens || [];
            const fotosMapeadas = fotosList.map((foto, index) => ({
              id: foto.id || index,
              url: foto.caminho_url || foto.url || foto.path || '',
              caminho_url: foto.caminho_url || foto.url || foto.path || '',
              principal: foto.principal || (index === 0 ? 1 : 0),
              ordem: foto.ordem || index,
            }));
            setFotos(fotosMapeadas);
          }
        } catch (imgError) {
          console.error('Erro ao carregar imagens:', imgError);
        }

        setAlojamentoId(dados.id);
      } else {
        showToast(`Erro ao carregar dados do alojamento: ${resultado.message}`, 'error');
        setTimeout(() => navigate('/alojamento-registro/meus'), 2000);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showToast('Erro ao carregar dados do alojamento.', 'error');
      setTimeout(() => navigate('/alojamento-registro/meus'), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) carregarDadosAlojamento(id);
  }, [id]);

  // ==================== HANDLERS ====================
  const handleLocalizacaoChange = (dados) => {
    setLocalizacaoDados(dados);
  };

  const handleComodidadesChange = (comodidades) => {
    setComodidadesSelecionadas(comodidades);
  };

  const handleRegrasChange = (dadosRegras) => {
    setRegras(dadosRegras.regras || []);
    setRegrasAdicionais(dadosRegras.regrasAdicionais || '');
  };

  const handleQuartosChange = (quartos) => {
    setQuartosSelecionados(quartos);
  };

  // ==================== NAVEGAÇÃO ====================
  const handleSaveInformacoes = () => {
    if (!informacoesBasicas.titulo.trim()) {
      showToast('O título é obrigatório', 'error');
      return;
    }
    if (!informacoesBasicas.descricao.trim()) {
      showToast('A descrição é obrigatória', 'error');
      return;
    }
    if (!informacoesBasicas.preco_noite) {
      showToast('O preço por noite é obrigatório', 'error');
      return;
    }

    // Validação check-in / check-out
    if (informacoesBasicas.checkin_flexivel && !informacoesBasicas.checkin_flexivel_nota?.trim()) {
      showToast('Explique como o hóspede faz o check-in.', 'error');
      return;
    }
    if (!informacoesBasicas.checkin_flexivel) {
      if (!informacoesBasicas.checkin_inicio || !informacoesBasicas.checkin_fim) {
        showToast('Defina o intervalo de check-in.', 'error');
        return;
      }
      if (informacoesBasicas.checkin_inicio >= informacoesBasicas.checkin_fim) {
        showToast('A hora final do check-in deve ser depois do início.', 'error');
        return;
      }
    }
    if (!informacoesBasicas.checkout_limite) {
      showToast('Defina a hora limite de check-out.', 'error');
      return;
    }

    setFase(2);
  };

  const handleSaveLocalizacao = () => {
    if (!localizacaoDados.endereco?.trim()) {
      showToast('Insira o endereço', 'error');
      return;
    }
    if (!localizacaoDados.cidade?.trim()) {
      showToast('Insira a cidade', 'error');
      return;
    }
    if (!localizacaoDados.ilha?.trim()) {
      showToast('Selecione a ilha', 'error');
      return;
    }
    setFase(3);
  };

  const handleSaveComodidades = () => setFase(4);
  const handleSaveRegras = () => setFase(5);

  // ==================== FINALIZAR ====================
  const handleFinalizar = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (fotos.length === 0) {
        showToast('⚠️ Adicione pelo menos uma foto do seu alojamento', 'error');
        setIsSubmitting(false);
        return;
      }

      const quartosFormatados = quartosSelecionados.map((q) => {
        const fotosValidas = (q.fotos || [])
          .map((f) => (typeof f === 'string' ? f : f.url || f.caminho_url || f.path || ''))
          .filter((url) => url && !url.startsWith('blob:'));

        return {
          id: q.id || null,
          tipo_catalogo_id: q.tipo_catalogo_id || q.tipo_quarto_id || q.tipo_id || q.id,
          tipo_quarto_id: q.tipo_quarto_id || q.tipo_catalogo_id || q.tipo_id || q.id,
          quantidade: q.quantidade ?? q.quantidade_disponivel ?? 1,
          quantidade_disponivel: q.quantidade_disponivel || q.quantidade || 1,
          preco_noite: q.preco_noite ?? q.preco_personalizado ?? null,
          preco_personalizado: q.preco_personalizado ?? q.preco_noite ?? null,
          fotos: fotosValidas,
          imagens: fotosValidas,
        };
      });

      const comodidadesIds = comodidadesSelecionadas.map((c) => c.id || c);
      const regrasIds = regras.map((r) => r.id || r);

      const imagensFormatadas = fotos
        .filter((foto) => !!(foto.url || foto.caminho_url || foto.path))
        .map((foto, index) => {
          const url = foto.url || foto.caminho_url || foto.path || '';
          return {
            url: url,
            caminho_url: url,
            principal: index === 0 ? 1 : 0,
            ordem: index,
            id: foto.id || null,
          };
        });

      // Capacidade derivada dos quartos
      const capacidadeQuartos = quartosFormatados.reduce(
        (total, q) => total + ((q.capacidade_efetiva || q.capacidade || 2) * (q.quantidade || 1)),
        0
      );

      const capacidadeFinal = mostraQuartos
        ? capacidadeQuartos || informacoesBasicas.capacidade || 2
        : parseInt(informacoesBasicas.capacidade) || 2;

      const dadosParaAPI = {
        proprietario_id: 1,
        titulo: informacoesBasicas.titulo,
        tipo_propriedade: informacoesBasicas.tipo_propriedade,
        tipo: informacoesBasicas.tipo_propriedade,
        descricao: informacoesBasicas.descricao,
        descricao_detalhada: informacoesBasicas.descricao_detalhada || '',
        capacidade: capacidadeFinal,
        preco_noite: parseFloat(informacoesBasicas.preco_noite) || 0,
        estrelas: parseFloat(informacoesBasicas.estrelas) || 4.5,
        tempo_resposta: informacoesBasicas.tempo_resposta || 'Dentro de 1 hora',
        cidade: localizacaoDados.cidade,
        ilha: localizacaoDados.ilha,
        endereco: localizacaoDados.endereco,
        latitude: localizacaoDados.latitude,
        longitude: localizacaoDados.longitude,
        comodidades: comodidadesIds,
        regras_ids: regrasIds,
        regras_adicionais: regrasAdicionais,

        // 🔑 MODELO DE VENDA
        modelo_venda: modeloVenda,

        // 🔑 Quartos
        quartos: mostraQuartos ? quartosFormatados : [],

        // 🔑 CHECK-IN / CHECK-OUT
        checkin_inicio: informacoesBasicas.checkin_flexivel
          ? null
          : informacoesBasicas.checkin_inicio || '14:00',
        checkin_fim: informacoesBasicas.checkin_flexivel
          ? null
          : informacoesBasicas.checkin_fim || '22:00',
        checkout_limite: informacoesBasicas.checkout_limite || '11:00',
        checkin_flexivel: informacoesBasicas.checkin_flexivel ? 1 : 0,
        checkin_flexivel_nota: informacoesBasicas.checkin_flexivel
          ? informacoesBasicas.checkin_flexivel_nota || ''
          : null,

        imagens: imagensFormatadas,
      };

      console.log('📤 Payload enviado para atualizar:', dadosParaAPI);

      const result = await salvarFluxoRegisto(dadosParaAPI, alojamentoId);

      if (result.success) {
        showToast(`✅ ${result.message || 'Alojamento atualizado com sucesso!'}`, 'success');
        setTimeout(() => navigate('/alojamento-registro/meus'), 1500);
      } else {
        showToast(`⚠️ Erro: ${result.message || 'Falha ao atualizar'}`, 'error');
      }
    } catch (error) {
      console.error('Erro ao finalizar:', error);
      showToast('Erro ao atualizar alojamento.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (fase > 1) setFase(fase - 1);
    else navigate('/alojamento-registro/meus');
  };

  const renderProgressBar = () => {
    const fasesLista = ['Informações', 'Localização', 'Comodidades', 'Regras', 'Fotos'];
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          {fasesLista.map((nome, index) => (
            <div key={index} className="flex-1 text-center">
              <div className={`text-xs font-bold ${fase === index + 1 ? 'text-[#006ce4]' : 'text-gray-400'}`}>
                {nome}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-1">
          {fasesLista.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 flex-1 rounded-full ${fase >= index + 1 ? 'bg-[#006ce4]' : 'bg-gray-200'}`}
            />
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader size={36} className="animate-spin text-[#006ce4] mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-600">A carregar dados do alojamento...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="bg-[#003580] text-white h-[60px] flex items-center justify-between px-6 shadow-sm">
        <div className="font-bold text-lg tracking-tight">MorabezaStay</div>
        <div className="flex items-center gap-6 text-sm">
          <PropMenu
            nomePropriedade={informacoesBasicas.titulo || 'Nova Propriedade'}
            alojamentoId={alojamentoId}
            onEditName={() => setFase(1)}
            onEditLocation={() => setFase(2)}
            onEditComodidades={() => setFase(3)}
            onEditRegras={() => setFase(4)}
          />
          <div className="flex items-center gap-2 cursor-pointer hover:underline">
            <span>Ajuda</span> <HelpCircle size={18} />
          </div>
        </div>
      </header>

      {fase === 1 && (
        <div className="min-h-screen bg-gray-50 py-10">
          <div className="max-w-4xl mx-auto px-4">
            <button onClick={handleBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
              <ArrowLeft size={20} /><span>Voltar</span>
            </button>
            {renderProgressBar()}

            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Editar informações da propriedade</h1>
              <p className="text-sm text-gray-500 mb-8">Atualize os dados e a configuração dos quartos.</p>

              <InformacoesBasicas
                dados={informacoesBasicas}
                onDadosChange={setInformacoesBasicas}
                onQuartosChange={handleQuartosChange}
                quartosIniciais={quartosSelecionados}
                alojamentoId={alojamentoId}
                readOnly={false}
                mostraQuartos={mostraQuartos}
              />

              <div className="flex justify-between gap-4 mt-8 pt-6 border-t border-gray-100">
                <button onClick={handleBack} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl">
                  Voltar
                </button>
                <button
                  onClick={handleSaveInformacoes}
                  className="px-6 py-2.5 bg-[#006ce4] text-white font-bold rounded-xl flex items-center gap-2"
                >
                  Continuar <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {fase === 2 && (
        <div className="min-h-screen bg-gray-50 py-10">
          <div className="max-w-2xl mx-auto px-4">
            <button onClick={handleBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
              <ArrowLeft size={20} /><span>Voltar</span>
            </button>
            {renderProgressBar()}

            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
              <h2 className="text-xl font-bold mb-4">📍 Localização do Alojamento</h2>

              <RegistarLocalizacao
                dados={localizacaoDados}
                onChange={handleLocalizacaoChange}
                alojamentoId={alojamentoId}
                readOnly={false}
              />

              <div className="flex justify-between gap-4 mt-8">
                <button onClick={handleBack} className="px-6 py-2.5 border rounded-xl">Voltar</button>
                <button
                  onClick={handleSaveLocalizacao}
                  className="px-6 py-2.5 bg-[#006ce4] text-white font-bold rounded-xl"
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {fase === 3 && (
        <div className="min-h-screen bg-gray-50 py-10">
          <div className="max-w-4xl mx-auto px-4">
            <button onClick={handleBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
              <ArrowLeft size={20} /><span>Voltar</span>
            </button>
            {renderProgressBar()}

            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Comodidades da propriedade</h1>

              <Comodidades
                alojamentoId={alojamentoId}
                onChange={handleComodidadesChange}
                initialComodidades={comodidadesSelecionadas}
                readOnly={false}
              />

              <div className="flex justify-between gap-4 mt-8 pt-6 border-t border-gray-100">
                <button onClick={handleBack} className="px-6 py-2.5 border rounded-xl">Voltar</button>
                <button
                  onClick={handleSaveComodidades}
                  className="px-6 py-2.5 bg-[#006ce4] text-white font-bold rounded-xl flex items-center gap-2"
                >
                  Continuar <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {fase === 4 && (
        <div className="min-h-screen bg-gray-50 py-10">
          <div className="max-w-3xl mx-auto px-4">
            <button onClick={handleBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
              <ArrowLeft size={20} /><span>Voltar</span>
            </button>
            {renderProgressBar()}

            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Regras da casa</h1>

              <Regras
                alojamentoId={alojamentoId}
                onChange={handleRegrasChange}
                initialRegras={regras}
                initialRegrasAdicionais={regrasAdicionais}
                readOnly={false}
              />

              <div className="flex justify-between gap-4 mt-8 pt-6 border-t border-gray-100">
                <button onClick={handleBack} className="px-6 py-2.5 border rounded-xl">Voltar</button>
                <button
                  onClick={handleSaveRegras}
                  className="px-6 py-2.5 bg-[#006ce4] text-white font-bold rounded-xl flex items-center gap-2"
                >
                  Continuar <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {fase === 5 && (
        <div className="min-h-screen bg-gray-50 py-10">
          <div className="max-w-4xl mx-auto px-4">
            <button onClick={handleBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
              <ArrowLeft size={20} /><span>Voltar</span>
            </button>
            {renderProgressBar()}

            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Fotos da sua propriedade</h1>
              <p className="text-sm text-gray-500 mb-8">Adicione fotos de alta qualidade da propriedade.</p>

              <ImagensUpload
                fotos={fotos}
                onFotosChange={setFotos}
                quartos={quartosSelecionados}
                onQuartosChange={handleQuartosChange}
                maxFotos={20}
                alojamentoId={alojamentoId}
                mostraQuartos={mostraQuartos}
              />

              <div className="flex justify-between gap-4 mt-8 pt-6 border-t border-gray-100">
                <button onClick={handleBack} className="px-6 py-2.5 border rounded-xl">Voltar</button>
                <button
                  onClick={handleFinalizar}
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-2.5 rounded-xl flex items-center gap-2 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? <Loader size={18} className="animate-spin" /> : <Check size={18} />}
                  Atualizar Registo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Wrapper com Provider
const EditarAlojamento = () => (
  <ToastProviderInterno>
    <EditarAlojamentoContent />
  </ToastProviderInterno>
);

export default EditarAlojamento;