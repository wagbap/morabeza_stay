// src/services/comodidadesQuartoService.js
// ============================================================
// Serviço dedicado: Comodidades por Quarto
// ============================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://welovepalop.com/api';

function obterTokenSeguro() {
  return localStorage.getItem('token') || localStorage.getItem('morabeza_token');
}

// ============================================================
// GUARDAR COMODIDADES DE TODOS OS QUARTOS DE UMA VEZ
// ============================================================
async function salvarComodidadesDosQuartos(alojamentoId, quartos) {
  if (!alojamentoId) {
    return { success: false, message: 'alojamento_id obrigatório' };
  }

  const token = obterTokenSeguro();

  let payload;

  if (Array.isArray(quartos)) {
    // 🛡️ Filtrar entradas SEM quarto_id válido (o backend rejeita com 400)
    const quartosValidos = quartos
      .filter((q) => q && q.quarto_id && Number(q.quarto_id) > 0)
      .map((q) => {
        const lista = (q.comodidades || [])
          .map((c) => (typeof c === 'object' ? c.id : c))
          .filter((v) => v != null && v > 0);

        const entry = { quarto_id: Number(q.quarto_id), comodidades: lista };
        if (q.tipo_quarto_id) entry.tipo_quarto_id = Number(q.tipo_quarto_id);
        return entry;
      });

    if (quartosValidos.length === 0) {
      return {
        success: false,
        message: 'Nenhum quarto com quarto_id válido para guardar comodidades',
      };
    }

    payload = {
      alojamento_id: Number(alojamentoId),
      quartos: quartosValidos,
    };
  } else if (quartos && typeof quartos === 'object') {
    // Formato mapa { "9101": [1,2], "9102": [3] }
    const mapaLimpo = {};
    Object.entries(quartos).forEach(([qId, lista]) => {
      const id = Number(qId);
      if (id > 0) {
        mapaLimpo[id] = (lista || [])
          .map((c) => (typeof c === 'object' ? c.id : c))
          .filter((v) => v != null && v > 0);
      }
    });
    payload = {
      alojamento_id: Number(alojamentoId),
      quarto_comodidades: mapaLimpo,
    };
  } else {
    return { success: false, message: 'Formato inválido de quartos' };
  }

  try {
    console.log('📡 POST salvar_comodidades_quartos:', payload);

    const res = await fetch(
      `${API_BASE_URL}/alojamento/salvar_comodidades_quartos.php`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error('❌ HTTP', res.status, data);
      return {
        success: false,
        message: data.message || `Erro HTTP ${res.status}`,
        data: data.data || null,
      };
    }

    return {
      success: !!data.success,
      message: data.message || '',
      data: data.data || null,
    };
  } catch (err) {
    console.error('❌ salvarComodidadesDosQuartos:', err);
    return { success: false, message: err.message };
  }
}

// ============================================================
// BUSCAR CATÁLOGO DE COMODIDADES DE QUARTO
// (agora aponta para a tabela comodidades_quarto, não comodidades)
// ============================================================
async function buscarCatalogoComodidades() {
  try {
    const res = await fetch(
      `${API_BASE_URL}/alojamento/get_comodidades_quarto.php?t=${Date.now()}`
    );
    const data = await res.json();

    if (data.success && Array.isArray(data.data)) {
      return { success: true, data: data.data };
    }
    if (Array.isArray(data)) {
      return { success: true, data };
    }
    return { success: false, data: [], message: data.message };
  } catch (err) {
    return { success: false, data: [], message: err.message };
  }
}

// ============================================================
// GUARDAR COMODIDADES DE UM QUARTO ESPECÍFICO (com quarto_id)
// ============================================================
async function salvarComodidadesDoQuarto(quartoId, alojamentoId, comodidades) {
  return salvarComodidadesDosQuartos(alojamentoId, [
    { quarto_id: quartoId, comodidades },
  ]);
}

// ============================================================
// GUARDAR COMODIDADES USANDO TIPO (fallback, sem quarto_id)
// ============================================================
async function salvarComodidadesPorTipo(alojamentoId, tipoQuartoId, comodidades) {
  return salvarComodidadesDosQuartos(alojamentoId, [
    { tipo_quarto_id: tipoQuartoId, comodidades },
  ]);
}

// ============================================================
// BUSCAR COMODIDADES DOS QUARTOS DE UM ALOJAMENTO
// ============================================================
async function buscarComodidadesDosQuartos(alojamentoId) {
  if (!alojamentoId) return { success: false, data: {}, message: 'ID obrigatório' };
  try {
    const res = await fetch(
      `${API_BASE_URL}/alojamento/get_comodidades_quartos.php?alojamento_id=${alojamentoId}`
    );
    const data = await res.json();
    return {
      success: !!data.success,
      data: data.data || {},
      message: data.message || '',
    };
  } catch (err) {
    return { success: false, data: {}, message: err.message };
  }
}

// ============================================================
// EXPORT
// ============================================================
export default {
  salvarComodidadesDosQuartos,
  salvarComodidadesDoQuarto,
  salvarComodidadesPorTipo,
  buscarCatalogoComodidades,
  buscarComodidadesDosQuartos,
};

export {
  salvarComodidadesDosQuartos,
  salvarComodidadesDoQuarto,
  salvarComodidadesPorTipo,
  buscarCatalogoComodidades,
  buscarComodidadesDosQuartos,
};