// src/hooks/useDisponibilidadeExperiencia.js

import { useState, useEffect, useCallback } from 'react';

export const useDisponibilidadeExperiencia = (experienciaId, dataSelecionada, periodoSelecionado) => {
  const [disponibilidade, setDisponibilidade] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  const [statusVagas, setStatusVagas] = useState('Carregando...');
  const [precoVigente, setPrecoVigente] = useState(0);
  const [vagasRestantes, setVagasRestantes] = useState(0);

  const buscarDisponibilidade = useCallback(async (data, periodo) => {
    if (!experienciaId) return;

    setLoading(true);
    setError(null);

    try {
      const url = new URL('https://welovepalop.com/api/get_disponibilidade_experiencia.php');
      url.searchParams.append('experiencia_id', experienciaId);
      
      if (data) {
        url.searchParams.append('data', data);
      }
      if (periodo) {
        url.searchParams.append('periodo', periodo);
      }

      const response = await fetch(url.toString());
      const result = await response.json();

      if (result.success) {
        setDisponibilidade(result.data);
        
        // Atualizar horários disponíveis baseado no período selecionado
        if (periodo && result.data.periodos && result.data.periodos[periodo]) {
          const periodoInfo = result.data.periodos[periodo];
          setHorariosDisponiveis(periodoInfo.horarios || []);
          setStatusVagas(periodoInfo.status || 'Indisponível');
          setVagasRestantes(periodoInfo.vagas_restantes || 0);
          
          // Calcular preço (base + especial se houver)
          const precoBase = result.data.preco_base || 0;
          const precoEspecial = periodoInfo.preco_especial || null;
          setPrecoVigente(precoEspecial || precoBase);
        } else {
          // Se não tem período selecionado, mostrar dados gerais
          const primeiroPeriodo = Object.values(result.data.periodos || {})[0];
          if (primeiroPeriodo) {
            setHorariosDisponiveis(primeiroPeriodo.horarios || []);
            setStatusVagas(primeiroPeriodo.status || 'Indisponível');
            setVagasRestantes(primeiroPeriodo.vagas_restantes || 0);
          }
          setPrecoVigente(result.data.preco_base || 0);
        }

        return result.data;
      } else {
        setError(result.message || 'Erro ao buscar disponibilidade');
        return null;
      }
    } catch (err) {
      console.error('Erro ao buscar disponibilidade:', err);
      setError('Erro ao carregar disponibilidade');
      return null;
    } finally {
      setLoading(false);
    }
  }, [experienciaId]);

  // Buscar quando mudar data ou período
  useEffect(() => {
    if (experienciaId) {
      buscarDisponibilidade(dataSelecionada, periodoSelecionado);
    }
  }, [experienciaId, dataSelecionada, periodoSelecionado, buscarDisponibilidade]);

  // Função para verificar disponibilidade de uma data específica
  const verificarDataDisponivel = useCallback(async (data) => {
    if (!experienciaId) return false;

    try {
      const url = new URL('https://welovepalop.com/api/get_disponibilidade_experiencia.php');
      url.searchParams.append('experiencia_id', experienciaId);
      url.searchParams.append('data', data);

      const response = await fetch(url.toString());
      const result = await response.json();

      if (result.success && result.data.calendario) {
        const dataInfo = result.data.calendario.find(d => d.data === data);
        return dataInfo ? dataInfo.status === 'Disponível' : false;
      }
      return false;
    } catch (err) {
      console.error('Erro ao verificar data:', err);
      return false;
    }
  }, [experienciaId]);

  return {
    disponibilidade,
    loading,
    error,
    horariosDisponiveis,
    statusVagas,
    precoVigente,
    vagasRestantes,
    buscarDisponibilidade,
    verificarDataDisponivel
  };
};