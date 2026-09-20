// src/components/AlojamentoRegisto/InformacoesBasicas.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Info, Home, Users, Star, Check, ChevronRight, Clock, AlertCircle,
  ChevronDown, ChevronUp, Building, BedDouble, Bed, Plus, Trash2,
  Minus, DoorOpen, Loader, Camera, X, Upload, Lightbulb, CheckCircle2,
  Eye, Sparkles,
} from 'lucide-react';
import {
  buscarTiposQuarto,
  buscarQuartosDoAlojamento,
  salvarQuartos,
  removerQuarto as removerQuartoApi,
} from '../../services/apiService';
import ConfiguracaoHorarios from './ConfiguracaoHorarios';

const UPLOAD_URL = 'https://welovepalop.com/api/alojamento/upload_foto.php';

// Filtro para bloquear URLs inválidas ou externas indesejadas (como Wix)
const filtrarUrlValida = (url) => {
  if (!url || typeof url !== 'string') return false;
  const limpa = url.trim();
  if (limpa === '') return false;
  if (limpa.includes('wixstatic.com')) return false;
  return true;
};

const TIPOS_PROPRIEDADE = [
  { id: 'Apartamento', nome: 'Apartamento', icone: <Building size={18} />, descricao: 'Espaço privado num edifício' },
  { id: 'Villa', nome: 'Villa', icone: <Home size={18} />, descricao: 'Casa inteira com privacidade total' },
  { id: 'Guesthouse', nome: 'Guesthouse', icone: <BedDouble size={18} />, descricao: 'Alojamento local partilhado' },
  { id: 'Hotel', nome: 'Hotel', icone: <Building size={18} />, descricao: 'Serviços completos de hotel' },
  { id: 'Casa', nome: 'Casa', icone: <Home size={18} />, descricao: 'Casa tradicional' },
  { id: 'Estúdio', nome: 'Estúdio', icone: <Building size={18} />, descricao: 'Espaço integrado e compacto' },
  { id: 'Resort', nome: 'Resort', icone: <Home size={18} />, descricao: 'Complexo turístico com lazer' },
];

const TEMPO_RESPOSTA = [
  'Dentro de 1 hora',
  'Dentro de 2 horas',
  'Dentro de 6 horas',
  'Dentro de 12 horas',
  'Dentro de 24 horas',
  'Dentro de 48 horas',
];

const CAPACIDADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20];

const formatarCVE = (valor) => {
  const n = Number(valor || 0);
  if (!n && n !== 0) return '0';
  return n.toLocaleString('pt-PT') + ' CVE';
};

// ============================================================
// DICAS PARA UM ANÚNCIO DE SUCESSO (item 21 + 22)
// Orientação sem prometer reservas nem destaque garantido
// ============================================================
const DICAS_ANUNCIO = [
  {
    id: 'titulo',
    emoji: '✏️',
    titulo: 'Título claro e específico',
    descricao:
      'Use um nome curto que diga exatamente o que é. Ex: "Apartamento T2 vista mar — Mindelo" em vez de "Casa bonita".',
  },
  {
    id: 'fotos',
    emoji: '📸',
    titulo: 'Fotografias reais e completas',
    descricao:
      'Fotos bem iluminadas do espaço verdadeiro, de vários ângulos, incluindo quartos, casa de banho e vista. Evite imagens de banco de imagens.',
  },
  {
    id: 'preco',
    emoji: '💰',
    titulo: 'Preço competitivo para começar',
    descricao:
      'Compare com alojamentos semelhantes na mesma ilha antes de publicar. Um preço inicial ajustado ajuda a conseguir as primeiras reservas e avaliações.',
  },
  {
    id: 'comodidades',
    emoji: '🛎️',
    titulo: 'Comodidades corretas',
    descricao:
      'Marque apenas o que o espaço realmente oferece. Comodidades erradas geram cancelamentos e más avaliações.',
  },
  {
    id: 'localizacao',
    emoji: '📍',
    titulo: 'Descrição da localização',
    descricao:
      'Explique onde fica, o que há por perto (praia, mercado, transportes) e como chegar. Ajuda o hóspede a decidir.',
  },
  {
    id: 'calendario',
    emoji: '📅',
    titulo: 'Calendário sempre atualizado',
    descricao:
      'Bloqueie datas indisponíveis e mantenha o calendário em dia. Isto evita pedidos para datas que já não pode receber.',
  },
  {
    id: 'resposta',
    emoji: '⚡',
    titulo: 'Resposta rápida aos hóspedes',
    descricao:
      'Responder às mensagens em poucas horas transmite confiança e melhora a experiência de quem reserva.',
  },
  {
    id: 'visibilidade',
    emoji: '📈',
    titulo: 'Visibilidade na plataforma',
    descricao:
      'A Morabeza Stay pode dar maior destaque a anúncios com melhor qualidade, preço ajustado, disponibilidade atualizada, boas avaliações e histórico de reservas. Não é um destaque garantido — depende do desempenho real de cada anúncio.',
  },
];

const InformacoesBasicas = ({
  dados = {},
  onDadosChange,
  readOnly = false,
  onNext,
  alojamentoId = null,
  onQuartosChange,
  quartosIniciais = [],
  mostraQuartos = false,
}) => {
  const [erros, setErros] = useState({});
  const [expandirDicas, setExpandirDicas] = useState(false);
  const [tiposQuarto, setTiposQuarto] = useState([]);
  const [quartosSelecionados, setQuartosSelecionados] = useState([]);
  const [loadingQuartos, setLoadingQuartos] = useState(false);
  const [savingQuartos, setSavingQuartos] = useState(false);
  const [uploadingFotos, setUploadingFotos] = useState(false);
  const [toast, setToast] = useState(null);

  const [modalFotoQuarto, setModalFotoQuarto] = useState({
    aberto: false,
    tipoQuartoId: null,
    fotos: [],
  });

  const fileInputRef = useRef(null);
  const activeQuartoIdRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ==================== CARREGAR CATÁLOGO DE QUARTOS ====================
  useEffect(() => {
    if (!mostraQuartos) {
      setTiposQuarto([]);
      return;
    }
    const carregarTipos = async () => {
      setLoadingQuartos(true);
      const result = await buscarTiposQuarto();
      if (result.success) {
        // Aplica o filtro de URLs válidas na imagem do catálogo
        const tiposTratados = (result.data || []).map((t) => ({
          ...t,
          imagem_url: filtrarUrlValida(t.imagem_url) ? t.imagem_url : null,
        }));
        setTiposQuarto(tiposTratados);
      }
      setLoadingQuartos(false);
    };
    carregarTipos();
  }, [mostraQuartos]);

  // ==================== CARREGAR QUARTOS DO STORAGE (NOVO REGISTO) ====================
  useEffect(() => {
    if (!mostraQuartos) return;
    if (!alojamentoId) {
      const quartosGuardados = localStorage.getItem('propertyQuartos');
      if (quartosGuardados) {
        try {
          const parsedQuartos = JSON.parse(quartosGuardados);
          if (Array.isArray(parsedQuartos) && parsedQuartos.length > 0) {
            setQuartosSelecionados(parsedQuartos);
            if (onQuartosChange) onQuartosChange(parsedQuartos);
          }
        } catch (e) {
          console.error('Erro ao ler quartos do localStorage:', e);
        }
      }
    }
  }, [alojamentoId, onQuartosChange, mostraQuartos]);

  // ==================== CARREGAR QUARTOS DO BACKEND (EDIÇÃO) ====================
  useEffect(() => {
    const carregarQuartosBackend = async () => {
      if (!alojamentoId || !mostraQuartos) return;
      try {
        const result = await buscarQuartosDoAlojamento(alojamentoId);
        if (result.success && result.data) {
          const ativos = result.data.filter(
            (q) => q.ativo === 1 || q.ativo === true || q.activo === 1 || q.activo === true
          );

          let imagensAgrupadas = {};
          try {
            const resImgs = await fetch(
              `https://welovepalop.com/api/alojamento/get_quarto_imagens.php?t=${Date.now()}`
            );
            const dataImgs = await resImgs.json();
            if (dataImgs.success && dataImgs.grouped) {
              imagensAgrupadas = dataImgs.grouped;
            }
          } catch (imgError) {
            console.error('Não foi possível carregar as imagens:', imgError);
          }

          const quartosNormalizados = ativos.map((q) => {
            let fotosReais = [];
            const idQuarto = q.id;
            const chaveComposta = `${alojamentoId}_${q.tipo_quarto_id || q.tipo_catalogo_id}`;

            if (imagensAgrupadas[chaveComposta]?.length > 0) {
              fotosReais = imagensAgrupadas[chaveComposta];
            } else if (imagensAgrupadas[idQuarto]?.length > 0) {
              fotosReais = imagensAgrupadas[idQuarto];
            } else if (imagensAgrupadas[`tipo_${q.tipo_quarto_id || q.tipo_catalogo_id}`]?.length > 0) {
              fotosReais = imagensAgrupadas[`tipo_${q.tipo_quarto_id || q.tipo_catalogo_id}`];
            } else if (Array.isArray(q.fotos) && q.fotos.length > 0) {
              fotosReais = q.fotos;
            } else if (Array.isArray(q.imagens) && q.imagens.length > 0) {
              fotosReais = q.imagens;
            }

            // Filtra fotos inválidas ou indesejadas
            const fotosLimpas = fotosReais
              .map(f => (typeof f === 'string' ? f : f.caminho_url || f.url || f.path))
              .filter(filtrarUrlValida);

            return {
              ...q,
              tipo_quarto_id: q.tipo_catalogo_id || q.tipo_quarto_id,
              tipo_nome: q.tipo_nome || q.nome,
              quantidade_disponivel: q.quantidade ?? q.quantidade_disponivel ?? 1,
              preco_personalizado: q.preco_noite ?? q.preco_personalizado ?? null,
              fotos: fotosLimpas,
              imagens: fotosLimpas,
            };
          });

          setQuartosSelecionados(quartosNormalizados);
          if (onQuartosChange) onQuartosChange(quartosNormalizados);
        }
      } catch (e) {
        console.error('Erro ao carregar quartos do backend', e);
      }
    };
    carregarQuartosBackend();
  }, [alojamentoId, onQuartosChange, mostraQuartos]);

  useEffect(() => {
    if (quartosIniciais?.length > 0 && quartosSelecionados.length === 0) {
      setQuartosSelecionados(quartosIniciais);
    } else if (dados?.quartos?.length > 0 && quartosSelecionados.length === 0 && !alojamentoId) {
      setQuartosSelecionados(dados.quartos);
    }
  }, [dados?.quartos, quartosIniciais, quartosSelecionados.length, alojamentoId]);

  // ==================== SINCRONIZAÇÃO COM O PAI ====================
  const sincronizarComPai = (novosQuartos) => {
    if (onQuartosChange) onQuartosChange(novosQuartos);
    if (onDadosChange) onDadosChange({ ...dados, quartos: novosQuartos });
  };

  const persistirQuartosNaApiOuStorage = async (novosQuartos) => {
    setQuartosSelecionados(novosQuartos);
    sincronizarComPai(novosQuartos);

    if (alojamentoId) {
      setSavingQuartos(true);
      try {
        const payload = novosQuartos.map((q) => {
          const listaFotos = q.fotos || q.imagens || [];
          const fotosLimpas = listaFotos.filter(filtrarUrlValida);
          return {
            tipo_catalogo_id: q.tipo_quarto_id,
            tipo_quarto_id: q.tipo_quarto_id,
            quantidade: q.quantidade_disponivel || 1,
            quantidade_disponivel: q.quantidade_disponivel || 1,
            preco_noite: q.preco_personalizado ?? null,
            preco_personalizado: q.preco_personalizado ?? null,
            fotos: fotosLimpas,
            imagens: fotosLimpas,
          };
        });

        const result = await salvarQuartos(alojamentoId, payload);
        if (!result.success) {
          showToast(result.message || 'Erro ao salvar dados dos quartos', 'error');
        }
      } catch (err) {
        showToast('Erro de conexão com o servidor', 'error');
      } finally {
        setSavingQuartos(false);
      }
    } else {
      localStorage.setItem('propertyQuartos', JSON.stringify(novosQuartos));
    }
  };

  const adicionarQuarto = async (tipoQuarto) => {
    if (!tipoQuarto) return;
    if (quartosSelecionados.some((q) => q.tipo_quarto_id === tipoQuarto.id)) return;

    const precoBase = parseFloat(dados?.preco_noite) || 0;
    const multiplicador = parseFloat(tipoQuarto.multiplicador_preco) || 1;
    const precoSugerido = precoBase > 0 ? Math.round(precoBase * multiplicador) : null;

    // Filtra imagem do tipo de quarto se for inválida
    const fotoInicialValida = filtrarUrlValida(tipoQuarto.imagem_url) ? [tipoQuarto.imagem_url] : [];

    const novoQuarto = {
      id: Date.now(),
      tipo_quarto_id: tipoQuarto.id,
      tipo_nome: tipoQuarto.nome,
      quantidade_disponivel: 1,
      preco_personalizado: precoSugerido,
      capacidade: tipoQuarto.capacidade || 2,
      camas: tipoQuarto.camas || 1,
      icone: tipoQuarto.icone,
      multiplicador_preco: multiplicador,
      fotos: fotoInicialValida,
      imagens: fotoInicialValida,
    };

    const novosQuartos = [...quartosSelecionados, novoQuarto];
    await persistirQuartosNaApiOuStorage(novosQuartos);
    showToast(
      precoSugerido
        ? `${tipoQuarto.nome} adicionado — preço sugerido: ${formatarCVE(precoSugerido)}`
        : `${tipoQuarto.nome} adicionado!`,
      'success'
    );
  };

  const atualizarQuartoPropriedade = async (tipo_quarto_id, campo, valor) => {
    const novosQuartos = quartosSelecionados.map((q) => {
      if (q.tipo_quarto_id === tipo_quarto_id) {
        const atualizado = { ...q, [campo]: valor };
        if (campo === 'fotos') atualizado.imagens = valor;
        return atualizado;
      }
      return q;
    });

    await persistirQuartosNaApiOuStorage(novosQuartos);
  };

  const atualizarQuantidade = (tipo_quarto_id, delta) => {
    const quarto = quartosSelecionados.find((q) => q.tipo_quarto_id === tipo_quarto_id);
    if (quarto) {
      const novaQuantidade = Math.max(1, (quarto.quantidade_disponivel || 1) + delta);
      atualizarQuartoPropriedade(tipo_quarto_id, 'quantidade_disponivel', novaQuantidade);
    }
  };

  const atualizarPrecoPersonalizado = (tipo_quarto_id, preco) => {
    const valor = preco === '' ? null : parseFloat(preco);
    const precoFinal = isNaN(valor) ? null : valor;
    atualizarQuartoPropriedade(tipo_quarto_id, 'preco_personalizado', precoFinal);
  };

  const removerQuartoEspecifico = async (tipo_quarto_id) => {
    const novosQuartos = quartosSelecionados.filter((q) => q.tipo_quarto_id !== tipo_quarto_id);

    setQuartosSelecionados(novosQuartos);
    sincronizarComPai(novosQuartos);

    if (alojamentoId) {
      setSavingQuartos(true);
      try {
        const result = await removerQuartoApi(alojamentoId, tipo_quarto_id);
        if (result.success) {
          showToast('Quarto removido', 'success');
        } else {
          showToast(result.message || 'Erro ao remover', 'error');
        }
      } catch (err) {
        showToast('Erro de conexão', 'error');
      } finally {
        setSavingQuartos(false);
      }
    } else {
      localStorage.setItem('propertyQuartos', JSON.stringify(novosQuartos));
      showToast('Quarto removido', 'success');
    }
  };

  const dispararSeletorFicheiros = (tipoQuartoId) => {
    activeQuartoIdRef.current = tipoQuartoId;
    if (fileInputRef.current) fileInputRef.current.click();
  };

  // ==================== UPLOAD DE FOTOS DO QUARTO ====================
  const handleFicheirosSelecionados = async (e) => {
    const files = Array.from(e.target.files);
    const tipoQuartoId = activeQuartoIdRef.current;
    if (!files.length || !tipoQuartoId) return;

    const quartoAtual = quartosSelecionados.find((q) => q.tipo_quarto_id === tipoQuartoId);
    if (!quartoAtual) return;

    setUploadingFotos(true);
    showToast(`A enviar ${files.length} foto(s)...`, 'info');

    try {
      const urlsEnviados = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append('foto', file);
        formData.append('tipo', 'quartos');

        const res = await fetch(UPLOAD_URL, { method: 'POST', body: formData });
        const data = await res.json();

        if (data.success && data.url && filtrarUrlValida(data.url)) {
          urlsEnviados.push(data.url);
        } else {
          console.error('Erro no upload ou URL inválida:', data.message);
        }
      }

      if (urlsEnviados.length === 0) {
        showToast('Nenhuma foto válida foi enviada.', 'error');
        setUploadingFotos(false);
        e.target.value = '';
        return;
      }

      const fotosAtuais = (quartoAtual.fotos || quartoAtual.imagens || []).filter(filtrarUrlValida);
      const fotosAtualizadas = [...fotosAtuais, ...urlsEnviados];

      await atualizarQuartoPropriedade(tipoQuartoId, 'fotos', fotosAtualizadas);

      if (modalFotoQuarto.aberto && modalFotoQuarto.tipoQuartoId === tipoQuartoId) {
        setModalFotoQuarto((prev) => ({ ...prev, fotos: fotosAtualizadas }));
      }

      showToast(`${urlsEnviados.length} foto(s) enviada(s) com sucesso!`, 'success');
    } catch (err) {
      console.error('Erro no upload:', err);
      showToast('Erro ao enviar fotos. Tenta novamente.', 'error');
    } finally {
      setUploadingFotos(false);
      e.target.value = '';
    }
  };

  const abrirModalFotos = (quarto) => {
    const fotosReais = Array.isArray(quarto.fotos) ? quarto.fotos.filter(filtrarUrlValida) : [];
    setModalFotoQuarto({
      aberto: true,
      tipoQuartoId: quarto.tipo_quarto_id,
      fotos: fotosReais,
    });
  };

  const removerFotoDoQuarto = (tipoQuartoId, index) => {
    const quarto = quartosSelecionados.find((q) => q.tipo_quarto_id === tipoQuartoId);
    if (!quarto) return;

    const fotosAtuais = (quarto.fotos || quarto.imagens || []).filter(filtrarUrlValida);
    const novasFotos = fotosAtuais.filter((_, i) => i !== index);

    atualizarQuartoPropriedade(tipoQuartoId, 'fotos', novasFotos);
    if (modalFotoQuarto.aberto) {
      setModalFotoQuarto((prev) => ({ ...prev, fotos: novasFotos }));
    }
  };

  // ==================== VALIDAÇÃO ====================
  const handleChange = (campo, valor) => {
    if (onDadosChange) onDadosChange({ ...dados, [campo]: valor });
    if (erros[campo]) setErros((prev) => ({ ...prev, [campo]: null }));
  };

  const validarFormulario = () => {
    const novosErros = {};
    if (!dados?.titulo?.trim()) novosErros.titulo = 'O título da propriedade é obrigatório';
    else if (dados.titulo.length < 5) novosErros.titulo = 'O título deve ter pelo menos 5 caracteres';
    else if (dados.titulo.length > 100) novosErros.titulo = 'O título não pode ter mais de 100 caracteres';

    if (!dados?.descricao?.trim()) novosErros.descricao = 'A descrição curta é obrigatória';
    else if (dados.descricao.length < 20) novosErros.descricao = 'A descrição deve ter pelo menos 20 caracteres';

    if (!dados?.capacidade || dados.capacidade < 1) novosErros.capacidade = 'A capacidade é obrigatória';
    if (!dados?.preco_noite || dados.preco_noite <= 0) novosErros.preco_noite = 'O preço por noite é obrigatório';

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = () => {
    if (validarFormulario() && onNext) onNext();
  };

  const renderEstrelas = () => {
    const estrelasAtuais = dados?.estrelas || 0;
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !readOnly && handleChange('estrelas', star)}
            disabled={readOnly}
            className={`text-2xl transition-colors ${
              estrelasAtuais >= star ? 'text-yellow-400' : 'text-gray-300'
            } ${!readOnly && 'hover:scale-110'} ${readOnly && 'cursor-default'}`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  const capacidadeTotalQuartos = Array.isArray(quartosSelecionados)
    ? quartosSelecionados.reduce(
        (total, q) => total + (q.capacidade || 2) * (q.quantidade_disponivel || 1),
        0
      )
    : 0;

  return (
    <div className="space-y-6">
      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white ${
            toast.type === 'success' ? 'bg-green-500' : toast.type === 'info' ? 'bg-blue-500' : 'bg-red-500'
          }`}
        >
          {toast.message}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFicheirosSelecionados}
        multiple
        accept="image/*"
        className="hidden"
      />

      {uploadingFotos && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 flex items-center gap-3 shadow-2xl">
            <Loader size={24} className="animate-spin text-[#006ce4]" />
            <span className="text-sm font-semibold text-gray-700">A enviar fotos para o servidor...</span>
          </div>
        </div>
      )}

      {/* TÍTULO */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Título da propriedade <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={dados?.titulo || ''}
          onChange={(e) => handleChange('titulo', e.target.value)}
          placeholder="Ex: Villa Maravilha - Vista deslumbrante para o mar"
          className={`w-full px-4 py-3 border ${
            erros.titulo ? 'border-red-500' : 'border-gray-300'
          } rounded-lg focus:outline-none focus:border-[#006ce4]`}
          disabled={readOnly}
          maxLength={100}
        />
        <div className="flex justify-between mt-1">
          {erros.titulo && <p className="text-sm text-red-500">{erros.titulo}</p>}
          <p className="text-xs text-gray-400 ml-auto">{(dados?.titulo?.length || 0)}/100 caracteres</p>
        </div>
      </div>

      {/* TIPO DE PROPRIEDADE */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Tipo de propriedade <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {TIPOS_PROPRIEDADE.map((tipo) => (
            <button
              key={tipo.id}
              type="button"
              onClick={() => !readOnly && handleChange('tipo_propriedade', tipo.id)}
              disabled={readOnly}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                dados?.tipo_propriedade === tipo.id
                  ? 'border-[#006ce4] bg-blue-50 text-[#006ce4]'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              } ${readOnly && 'cursor-default'}`}
            >
              <span className={dados?.tipo_propriedade === tipo.id ? 'text-[#006ce4]' : 'text-gray-500'}>
                {tipo.icone}
              </span>
              <div className="text-left">
                <p className="text-sm font-medium">{tipo.nome}</p>
                <p className="text-xs text-gray-400 hidden md:block">{tipo.descricao}</p>
              </div>
              {dados?.tipo_propriedade === tipo.id && <Check size={16} className="ml-auto" />}
            </button>
          ))}
        </div>

        {!mostraQuartos ? (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800 flex items-start gap-2">
            <Info size={14} className="shrink-0 mt-0.5" />
            <span>
              <strong>Alojamento inteiro</strong> — Apartamentos, casas e estúdios usam um preço único e uma
              capacidade única. Para vender quartos separados, escolha <strong>Hotel</strong>,{' '}
              <strong>Guesthouse</strong> ou <strong>Resort</strong>.
            </span>
          </div>
        ) : (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-800 flex items-start gap-2">
            <Bed size={14} className="shrink-0 mt-0.5" />
            <span>
              <strong>Venda por quartos</strong> — a capacidade total será calculada automaticamente a partir
              dos quartos que configurar abaixo.
            </span>
          </div>
        )}
      </div>

      {/* CAPACIDADE */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Capacidade máxima (pessoas) <span className="text-red-500">*</span>
        </label>

        {!mostraQuartos ? (
          <div className="flex items-center gap-2">
            <Users size={20} className="text-gray-400" />
            <select
              value={dados?.capacidade || 2}
              onChange={(e) => handleChange('capacidade', parseInt(e.target.value))}
              className={`flex-1 px-4 py-3 border ${
                erros.capacidade ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:border-[#006ce4] bg-white`}
              disabled={readOnly}
            >
              {CAPACIDADES.map((cap) => (
                <option key={cap} value={cap}>
                  {cap} {cap === 1 ? 'pessoa' : 'pessoas'}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg">
            <Users size={20} className="text-gray-500" />
            <span className="text-sm font-semibold text-gray-800">
              {capacidadeTotalQuartos} {capacidadeTotalQuartos === 1 ? 'pessoa' : 'pessoas'}
            </span>
            <span className="text-xs text-gray-500 ml-auto italic">
              Calculada a partir dos quartos configurados
            </span>
          </div>
        )}
        {erros.capacidade && !mostraQuartos && <p className="text-sm text-red-500 mt-1">{erros.capacidade}</p>}
      </div>

      {/* ESTRELAS */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Classificação (estrelas)</label>
        <div className="flex items-center gap-3">
          <Star size={20} className="text-yellow-400" />
          {renderEstrelas()}
        </div>
      </div>

      {/* ==================== HORÁRIOS DE CHECK-IN / CHECK-OUT ==================== */}
      <ConfiguracaoHorarios dados={dados} onChange={onDadosChange} readOnly={readOnly} />

      {/* SEÇÃO DE QUARTOS */}
      {mostraQuartos && (
        <div className="border-2 border-[#006ce4] rounded-lg overflow-hidden shadow-sm">
          <div className="bg-[#006ce4] text-white p-4">
            <div className="flex items-center gap-2">
              <Bed size={20} />
              <span className="font-semibold">🏠 Configure os quartos da propriedade</span>
            </div>
            <p className="text-sm text-blue-100 mt-1">
              Adicione os tipos de quarto disponíveis. As alterações são salvas automaticamente!
            </p>
            {savingQuartos && (
              <div className="mt-2 text-xs text-blue-200 flex items-center gap-1">
                <Loader size={12} className="animate-spin" />A sincronizar com a base de dados...
              </div>
            )}
          </div>

          <div className="p-4 bg-white">
            {loadingQuartos && (
              <div className="text-center py-8">
                <Loader className="animate-spin mx-auto text-[#006ce4]" size={32} />
                <p className="mt-2 text-sm text-gray-500">Carregando tipos de quarto...</p>
              </div>
            )}

            {!loadingQuartos && tiposQuarto.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <DoorOpen size={16} className="text-[#006ce4]" />Tipos de quarto disponíveis:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {tiposQuarto.map((tipo) => {
                    const jaAdicionado = quartosSelecionados.some((q) => q.tipo_quarto_id === tipo.id);
                    const imagemValidaCatalogo = filtrarUrlValida(tipo.imagem_url) ? tipo.imagem_url : null;
                    return (
                      <button
                        key={tipo.id}
                        type="button"
                        onClick={() => adicionarQuarto(tipo)}
                        disabled={jaAdicionado || savingQuartos}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                          jaAdicionado
                            ? 'border-green-300 bg-green-50 opacity-70 cursor-not-allowed'
                            : 'border-gray-200 hover:border-[#006ce4] hover:bg-blue-50 cursor-pointer'
                        }`}
                      >
                        {imagemValidaCatalogo ? (
                          <img
                            src={imagemValidaCatalogo}
                            alt={tipo.nome}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                            Sem foto
                          </div>
                        )}
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium">{tipo.nome}</p>
                          <p className="text-xs text-gray-500">
                            👥 {tipo.capacidade} pessoas | 🛏️ {tipo.camas}
                          </p>
                        </div>
                        {jaAdicionado ? (
                          <Check size={16} className="text-green-500" />
                        ) : (
                          <Plus size={16} className="text-[#006ce4]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {quartosSelecionados.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Check size={16} className="text-green-500" />Quartos adicionados (
                  {quartosSelecionados.length}):
                </h4>
                <div className="space-y-3">
                  {quartosSelecionados.map((quarto) => {
                    const fotosReais = Array.isArray(quarto.fotos) ? quarto.fotos.filter(filtrarUrlValida) : [];
                    const qtdFotosReais = fotosReais.length;
                    const imagemPrincipalCard = qtdFotosReais > 0 ? fotosReais[0] : null;

                    return (
                      <div
                        key={quarto.id || quarto.tipo_quarto_id}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            {imagemPrincipalCard ? (
                              <img
                                src={imagemPrincipalCard}
                                alt={quarto.tipo_nome}
                                className="w-14 h-14 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-14 h-14 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-[10px] text-center p-1">
                                Sem foto
                              </div>
                            )}
                            <div>
                              <h5 className="font-semibold text-gray-900">{quarto.tipo_nome}</h5>
                              <p className="text-xs text-gray-500">
                                Capacidade: {quarto.capacidade || 2} pessoas
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2 py-1">
                              <button
                                type="button"
                                onClick={() => atualizarQuantidade(quarto.tipo_quarto_id, -1)}
                                disabled={savingQuartos}
                                className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-6 text-center font-semibold text-sm text-[#006ce4]">
                                {quarto.quantidade_disponivel || 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => atualizarQuantidade(quarto.tipo_quarto_id, 1)}
                                disabled={savingQuartos}
                                className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
                              >
                                <Plus size={14} />
                              </button>
                            </div>

                            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1">
                              <input
                                type="number"
                                value={quarto.preco_personalizado || ''}
                                onChange={(e) =>
                                  atualizarPrecoPersonalizado(quarto.tipo_quarto_id, e.target.value)
                                }
                                className="w-24 px-1 py-0.5 text-sm focus:outline-none bg-transparent text-right"
                                placeholder="Preço"
                                step="100"
                                disabled={savingQuartos}
                              />
                              <span className="text-xs text-gray-500 font-bold pr-1">CVE</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => removerQuartoEspecifico(quarto.tipo_quarto_id)}
                              disabled={savingQuartos}
                              className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-xs font-semibold text-gray-700">
                              <Camera size={14} className="text-[#006ce4]" /> Fotos deste quarto (
                              {qtdFotosReais})
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {qtdFotosReais > 0 && (
                              <button
                                type="button"
                                onClick={() => abrirModalFotos(quarto)}
                                className="text-xs font-semibold text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 transition-colors"
                              >
                                Ver / Gerir Fotos
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => dispararSeletorFicheiros(quarto.tipo_quarto_id)}
                              disabled={uploadingFotos}
                              className="flex items-center gap-1 text-xs font-semibold text-[#006ce4] hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-colors disabled:opacity-50"
                            >
                              <Upload size={14} /> + Adicionar Fotos
                            </button>
                          </div>
                        </div>

                        {qtdFotosReais === 0 ? (
                          <p className="text-[11px] text-gray-400 italic mt-1">
                            Nenhuma foto adicionada para este quarto ainda.
                          </p>
                        ) : (
                          <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                            {fotosReais.map((fUrl, fIdx) => (
                              <div
                                key={fIdx}
                                className="relative w-16 h-12 rounded-md overflow-hidden border border-gray-200 shrink-0 group"
                              >
                                <img
                                  src={fUrl}
                                  alt="Miniatura"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.opacity = '0.3';
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => removerFotoDoQuarto(quarto.tipo_quarto_id, fIdx)}
                                  className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    📊 <strong>Resumo:</strong> Capacidade total dos quartos ={' '}
                    <strong>{capacidadeTotalQuartos} pessoas</strong>
                  </p>
                </div>
              </div>
            )}

            {!loadingQuartos && quartosSelecionados.length === 0 && (
              <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                <Bed size={48} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">Nenhum quarto adicionado</p>
                <p className="text-xs mt-1">
                  Clique nos tipos de quarto acima para adicionar à sua propriedade
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL FOTOS DE QUARTO */}
      {mostraQuartos && modalFotoQuarto.aberto && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 relative shadow-xl">
            <button
              onClick={() => setModalFotoQuarto({ aberto: false, tipoQuartoId: null, fotos: [] })}
              className="absolute top-3 right-3 p-1 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Camera size={18} className="text-[#006ce4]" /> Gerir Fotos do Quarto
            </h3>

            <div className="flex justify-between items-center mb-4">
              <p className="text-xs text-gray-500">Total de fotos: {modalFotoQuarto.fotos.length}</p>
              <button
                type="button"
                disabled={uploadingFotos}
                onClick={() => {
                  setModalFotoQuarto((prev) => ({ ...prev, aberto: false }));
                  dispararSeletorFicheiros(modalFotoQuarto.tipoQuartoId);
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#006ce4] text-white rounded-lg text-xs font-semibold hover:bg-[#0053b3] disabled:opacity-50"
              >
                <Upload size={14} /> Carregar Mais do Computador
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
              {modalFotoQuarto.fotos.map((url, idx) => (
                <div
                  key={idx}
                  className="relative h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
                >
                  <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removerFotoDoQuarto(modalFotoQuarto.tipoQuartoId, idx)}
                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 shadow-md"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>

            {modalFotoQuarto.fotos.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-6">
                Nenhuma foto adicionada a este quarto ainda.
              </p>
            )}

            <div className="mt-5 text-right">
              <button
                type="button"
                onClick={() => setModalFotoQuarto({ aberto: false, tipoQuartoId: null, fotos: [] })}
                className="px-5 py-2 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-800"
              >
                Concluído
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DESCRIÇÃO CURTA */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Descrição curta <span className="text-red-500">*</span>
        </label>
        <textarea
          value={dados?.descricao || ''}
          onChange={(e) => handleChange('descricao', e.target.value)}
          rows={3}
          placeholder="Descreva brevemente a sua propriedade. Destaque os principais atrativos..."
          className={`w-full px-4 py-3 border ${
            erros.descricao ? 'border-red-500' : 'border-gray-300'
          } rounded-lg focus:outline-none focus:border-[#006ce4] resize-none`}
          disabled={readOnly}
          maxLength={500}
        />
        <div className="flex justify-between mt-1">
          {erros.descricao && <p className="text-sm text-red-500">{erros.descricao}</p>}
          <p className="text-xs text-gray-400 ml-auto">{(dados?.descricao?.length || 0)}/500 caracteres</p>
        </div>
      </div>

      {/* DESCRIÇÃO DETALHADA */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição detalhada</label>
        <textarea
          value={dados?.descricao_detalhada || ''}
          onChange={(e) => handleChange('descricao_detalhada', e.target.value)}
          rows={5}
          placeholder="Descreva detalhadamente a sua propriedade: localização, decoração, comodidades especiais, pontos turísticos próximos, etc."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4] resize-none"
          disabled={readOnly}
          maxLength={2000}
        />
        <p className="text-xs text-gray-400 mt-1 text-right">
          {(dados?.descricao_detalhada?.length || 0)}/2000 caracteres
        </p>
      </div>

      {/* PREÇO + TEMPO DE RESPOSTA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {mostraQuartos ? 'Preço base de referência (CVE)' : 'Preço por noite (CVE)'}{' '}
            <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={dados?.preco_noite || ''}
              onChange={(e) => handleChange('preco_noite', parseFloat(e.target.value))}
              placeholder="Ex: 5000"
              className={`w-full pl-4 pr-16 py-3 border ${
                erros.preco_noite ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:border-[#006ce4]`}
              disabled={readOnly}
              min={0}
              step={100}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-bold text-gray-500">
              CVE
            </span>
          </div>
          {mostraQuartos && (
            <p className="text-xs text-gray-500 mt-1">
              Usado como sugestão inicial ao adicionar quartos (base × multiplicador do tipo).
            </p>
          )}
          {erros.preco_noite && <p className="text-sm text-red-500 mt-1">{erros.preco_noite}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Tempo de resposta</label>
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-gray-400" />
            <select
              value={dados?.tempo_resposta || 'Dentro de 1 hora'}
              onChange={(e) => handleChange('tempo_resposta', e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4] bg-white"
              disabled={readOnly}
            >
              {TEMPO_RESPOSTA.map((opcao) => (
                <option key={opcao} value={opcao}>
                  {opcao}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* DICAS PARA UM ANÚNCIO DE SUCESSO (item 21)                   */}
      {/* 8 orientações curtas + nota honesta (sem prometer reservas)  */}
      {/* ============================================================ */}
      <div className="border border-blue-200 rounded-2xl overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => setExpandirDicas(!expandirDicas)}
          className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 transition-colors"
          aria-expanded={expandirDicas}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-sm shadow-blue-200">
              <Lightbulb className="text-white" size={18} />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-blue-900 leading-tight">
                Dicas para um anúncio de sucesso
              </h3>
              <p className="text-[10px] text-blue-700 font-medium mt-0.5">
                Orientações curtas para melhorar o seu anúncio
              </p>
            </div>
          </div>
          {expandirDicas ? (
            <ChevronUp size={18} className="text-blue-700" />
          ) : (
            <ChevronDown size={18} className="text-blue-700" />
          )}
        </button>

        {expandirDicas && (
          <div className="px-4 pt-4 pb-5 bg-white">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DICAS_ANUNCIO.map((dica) => (
                <li
                  key={dica.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-100 hover:border-blue-200 transition-colors"
                >
                  <div className="text-lg shrink-0 leading-none mt-0.5">
                    {dica.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 leading-tight">
                      {dica.titulo}
                    </p>
                    <p className="text-[11px] text-slate-600 leading-snug mt-1">
                      {dica.descricao}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Nota honesta — critério de aceitação do item 21 + 22 */}
            <div className="mt-4 pt-3 border-t border-blue-100 flex items-start gap-2">
              <CheckCircle2 className="text-blue-600 shrink-0 mt-0.5" size={14} />
              <p className="text-[10px] text-blue-800 leading-snug font-medium">
                Estas dicas ajudam a melhorar o anúncio. A Morabeza Stay não garante reservas
                nem destaque automático — o desempenho depende da qualidade real, do preço e do
                histórico de cada anúncio.
              </p>
            </div>

            {/* Nota de transparência (não é promessa, é explicação) */}
            <div className="mt-3 flex items-start gap-2">
              <Eye className="text-slate-400 shrink-0 mt-0.5" size={14} />
              <p className="text-[10px] text-slate-500 leading-snug">
                Alguns anúncios podem receber maior visibilidade conforme a qualidade, o preço,
                a disponibilidade, as avaliações e o histórico de reservas. Estes fatores são
                avaliados pela plataforma de forma contínua.
              </p>
            </div>
          </div>
        )}
      </div>

      {!readOnly && onNext && (
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSubmit}
            className="bg-[#006ce4] text-white px-8 py-3 rounded-lg hover:bg-[#0053b3] font-medium flex items-center gap-2"
          >
            Continuar <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default InformacoesBasicas;