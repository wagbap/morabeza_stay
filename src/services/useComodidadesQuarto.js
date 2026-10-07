// src/hooks/useComodidadesQuarto.js
// ============================================================
// HOOK DEDICADO: Comodidades por Quarto
// Isola toda a lógica: catálogo, seleção, guardar, carregar.
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import comodidadesService from '../services/comodidadesQuartoService';

/**
 * Hook para gerir comodidades de um quarto específico.
 *
 * @param {object} options
 * @param {number|null} options.quartoId      - ID real em alojamento_quartos (ex: 9101)
 * @param {number|null} options.alojamentoId  - ID do alojamento (fallback quando não há quartoId)
 * @param {number|null} options.tipoQuartoId  - tipo_quarto_id (fallback)
 * @param {Array}       options.comodidadesIniciais - Array inicial de comodidades
 * @param {Function}    options.onChange      - Callback chamado quando as comodidades mudam
 *
 * @returns {object} API do hook
 */
export default function useComodidadesQuarto({
  quartoId = null,
  alojamentoId = null,
  tipoQuartoId = null,
  comodidadesIniciais = [],
  onChange = null,
} = {}) {
  // Catálogo global (vem da BD)
  const [catalogo, setCatalogo] = useState([]);
  const [loadingCatalogo, setLoadingCatalogo] = useState(false);

  // Comodidades selecionadas neste quarto
  const [selecionadas, setSelecionadas] = useState(
    Array.isArray(comodidadesIniciais) ? comodidadesIniciais : []
  );

  // Estado de gravação
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  // ============================================================
  // 1) Carregar catálogo global (uma vez)
  // ============================================================
  useEffect(() => {
    let cancelado = false;

    const carregar = async () => {
      setLoadingCatalogo(true);
      const res = await comodidadesService.buscarCatalogoComodidades();
      if (cancelado) return;

      if (res.success) {
        setCatalogo(res.data);
      } else {
        setErro(res.message || 'Erro ao carregar catálogo');
      }
      setLoadingCatalogo(false);
    };

    carregar();
    return () => {
      cancelado = true;
    };
  }, []);

  // ============================================================
  // 2) Sincronizar com comodidades iniciais (quando o quarto muda)
  // ============================================================
  useEffect(() => {
    setSelecionadas(
      Array.isArray(comodidadesIniciais) ? comodidadesIniciais : []
    );
  }, [quartoId, tipoQuartoId, alojamentoId, comodidadesIniciais]);

  // ============================================================
  // 3) IDs normalizados das comodidades selecionadas
  // ============================================================
  const idsSelecionados = useMemo(() => {
    return (selecionadas || [])
      .map((c) => (typeof c === 'object' ? c.id : c))
      .filter((v) => v != null && v > 0);
  }, [selecionadas]);

  // ============================================================
  // 4) Toggle de uma comodidade
  // ============================================================
  const toggleComodidade = useCallback(
    (comodidadeId) => {
      setSelecionadas((prev) => {
        const atual = (prev || []).map((c) => (typeof c === 'object' ? c.id : c));

        let novo;
        if (atual.includes(comodidadeId)) {
          novo = (prev || []).filter((c) => {
            const id = typeof c === 'object' ? c.id : c;
            return id !== comodidadeId;
          });
        } else {
          const obj = catalogo.find((c) => c.id === comodidadeId);
          if (obj) novo = [...(prev || []), obj];
          else novo = prev;
        }

        if (onChange) onChange(novo);
        return novo;
      });
    },
    [catalogo, onChange]
  );

  // ============================================================
  // 5) Verificar se uma comodidade está selecionada
  // ============================================================
  const estaSelecionada = useCallback(
    (comodidadeId) => idsSelecionados.includes(comodidadeId),
    [idsSelecionados]
  );

  // ============================================================
  // 6) Guardar no servidor
  // ============================================================
  const guardar = useCallback(async () => {
    setSalvando(true);
    setErro(null);

    try {
      let res;

      if (quartoId) {
        // Caminho principal: temos o ID real do quarto
        res = await comodidadesService.salvarComodidadesDoQuarto(quartoId, selecionadas);
      } else if (alojamentoId && tipoQuartoId) {
        // Fallback: ainda não temos quartoId → resolve por alojamento + tipo
        res = await comodidadesService.salvarComodidadesPorTipo(
          alojamentoId,
          tipoQuartoId,
          selecionadas
        );
      } else {
        // Novo registo sem IDs → devolve sucesso local (será guardado no fim)
        return { success: true, local: true };
      }

      if (!res.success) {
        setErro(res.message || 'Erro ao guardar comodidades');
      }
      return res;
    } catch (err) {
      setErro(err.message);
      return { success: false, message: err.message };
    } finally {
      setSalvando(false);
    }
  }, [quartoId, alojamentoId, tipoQuartoId, selecionadas]);

  // ============================================================
  // 7) Reset
  // ============================================================
  const reset = useCallback(() => {
    setSelecionadas(
      Array.isArray(comodidadesIniciais) ? comodidadesIniciais : []
    );
    setErro(null);
  }, [comodidadesIniciais]);

  return {
    // Dados
    catalogo,
    selecionadas,
    idsSelecionados,

    // Estado
    loadingCatalogo,
    salvando,
    erro,

    // Ações
    toggleComodidade,
    estaSelecionada,
    guardar,
    reset,
  };
}