// src/hooks/useFotosDoQuarto.js
import { useState, useEffect } from 'react';

const ENDPOINT = 'https://welovepalop.com/api/alojamento/get_quarto_imagens.php';

// ============================================================
// BLOQUEIO DE IMAGENS INVENTADAS (Unsplash / placeholders)
// ============================================================
const DOMINIOS_PROIBIDOS = [
  'images.unsplash.com',
  'source.unsplash.com',
  'unsplash.com',
  'placeholder.com',
  'via.placeholder.com',
  'placehold.co',
  'placehold.it',
  'dummyimage.com',
  'lorempixel.com',
  'picsum.photos',
];

// Padrões de IDs Unsplash que já apareceram como seed no projeto
const IDS_PROIBIDOS = [
  'photo-1616594039964',
  'photo-1566665797739',
];

const ehImagemProibida = (url) => {
  if (!url || typeof url !== 'string') return false;
  const lower = url.toLowerCase();
  if (DOMINIOS_PROIBIDOS.some((d) => lower.includes(d))) return true;
  if (IDS_PROIBIDOS.some((id) => lower.includes(id))) return true;
  return false;
};

// ============================================================
// VALIDAÇÃO — só aceita URLs reais (Cloudinary / welovepalop / data:)
// ============================================================
const urlValida = (url) => {
  if (!url || typeof url !== 'string') return false;
  if (url.includes('blob:')) return false;
  if (url.includes('localhost')) return false;

  // Bloqueia Unsplash e outros placeholders genéricos
  if (ehImagemProibida(url)) return false;

  return (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:')
  );
};

const normalizarUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  return `https://welovepalop.com${url.startsWith('/') ? '' : '/'}${url}`;
};

// ============================================================
// SEM CACHE — SEMPRE FRESCO DA API
// ============================================================
const buscarImagensNaAPI = async (alojamentoId) => {
  try {
    let urlFinal = `${ENDPOINT}?t=${Date.now()}`;
    if (alojamentoId) urlFinal += `&alojamento_id=${alojamentoId}`;

    console.log('📡 [useFotosDoQuarto] A chamar:', urlFinal);

    const res = await fetch(urlFinal, { cache: 'no-store' });
    const textData = await res.text();
    let data = null;

    try {
      data = JSON.parse(textData);
    } catch (e) {
      const match = textData.match(/\{[\s\S]*\}/);
      if (match) {
        try { data = JSON.parse(match[0]); }
        catch (err) { console.error('❌ JSON inválido:', err); }
      }
    }

    if (!data || !data.success) {
      return { grouped: {}, lista: [] };
    }

    const groupedLimpo = {};
    Object.keys(data.grouped || {}).forEach((k) => {
      const urls = (data.grouped[k] || []).filter(urlValida);
      if (urls.length > 0) groupedLimpo[k] = urls;
    });

    const listaLimpa = (data.data || []).filter((img) =>
      urlValida(img.caminho_url || img.url)
    );

    console.log(`✅ [useFotosDoQuarto] Chaves para alojamento ${alojamentoId}:`, Object.keys(groupedLimpo));

    return { grouped: groupedLimpo, lista: listaLimpa };
  } catch (err) {
    console.error('❌ [useFotosDoQuarto] Erro:', err);
    return { grouped: {}, lista: [] };
  }
};

// ============================================================
// HOOK — SEM CACHE, SEM PLACEHOLDER, SEM IMAGENS INVENTADAS
// ============================================================
export function useFotosDoQuarto(quarto, alojamentoId = null) {
  const [fotoCapa, setFotoCapa] = useState(null);
  const [fotos, setFotos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const quartoKeys = [
    quarto?.id,
    quarto?.quarto_id,
    quarto?.alojamento_quarto_id,
    quarto?.tipo_quarto_id,
    alojamentoId,
  ]
    .filter(Boolean)
    .join('-');

  useEffect(() => {
    if (!quarto) {
      setFotoCapa(null);
      setFotos([]);
      setCarregando(false);
      return;
    }

    let montado = true;
    setCarregando(true);

    const carregar = async () => {
      const apiData = await buscarImagensNaAPI(alojamentoId);
      if (!montado) return;

      const ids = [
        quarto.id,
        quarto.quarto_id,
        quarto.alojamento_quarto_id,
        quarto.tipo_quarto_id,
        quarto.id_quarto,
        quarto.id_tipo_quarto,
      ]
        .filter((v) => v !== null && v !== undefined && v !== '')
        .map(String);

      const unicos = Array.from(new Set(ids));
      const fotosEncontradas = [];

      // 1. Chave composta (alojamentoId + tipoId)
      if (alojamentoId) {
        const tipoId = quarto.tipo_quarto_id || quarto.id;
        const chaveComposta = `${alojamentoId}_${tipoId}`;
        if (apiData.grouped[chaveComposta]?.length > 0) {
          fotosEncontradas.push(...apiData.grouped[chaveComposta]);
        }
      }

      // 2. Chave composta (alojamentoId + quartoId)
      if (fotosEncontradas.length === 0 && alojamentoId && quarto.id) {
        const chaveComposta2 = `${alojamentoId}_${quarto.id}`;
        if (apiData.grouped[chaveComposta2]?.length > 0) {
          fotosEncontradas.push(...apiData.grouped[chaveComposta2]);
        }
      }

      // 3. Chave simples por id do quarto (alojamento_quarto.id)
      if (fotosEncontradas.length === 0) {
        unicos.forEach((id) => {
          if (apiData.grouped[id]?.length > 0) {
            fotosEncontradas.push(...apiData.grouped[id]);
          }
        });
      }

      // 4. Fallback pela lista
      if (fotosEncontradas.length === 0) {
        apiData.lista.forEach((img) => {
          if (unicos.includes(String(img.quarto_id))) {
            const url = img.caminho_url || img.url;
            if (url) fotosEncontradas.push(url);
          }
        });
      }

      // 5. Fotos diretas no objeto
      const listaDireta = quarto.fotos || quarto.imagens || quarto.quarto_imagens || [];
      listaDireta.forEach((f) => {
        const u = typeof f === 'string' ? f : f.caminho_url || f.url;
        if (u) fotosEncontradas.push(u);
      });

      const capaDireta = quarto.caminho_url || quarto.imagem_url || quarto.foto_capa;
      if (capaDireta) fotosEncontradas.unshift(capaDireta);

      // 🔥 Filtro final: válidas + não proibidas + normalizadas + sem duplicados
      const limpas = Array.from(
        new Set(
          fotosEncontradas
            .filter(urlValida)                // rejeita Unsplash, blob, localhost, etc.
            .filter((u) => !ehImagemProibida(u)) // dupla proteção
            .map(normalizarUrl)
            .filter(Boolean)
        )
      );

      if (limpas.length > 0) {
        console.log(`🎯 Quarto "${quarto.nome || 's/ nome'}": ${limpas.length} fotos`);
        setFotos(limpas);
        setFotoCapa(limpas[0]);      // 🔥 só a primeira
      } else {
        console.log(`⚠️ Quarto "${quarto.nome || 's/ nome'}": sem fotos reais`);
        setFotos([]);
        setFotoCapa(null);            // 🔥 sem placeholder inventado
      }
      setCarregando(false);
    };

    carregar();

    return () => { montado = false; };
  }, [quartoKeys]);

  return {
    fotos,
    fotoCapa,      // 🔥 pode ser null
    carregando,
  };
}