// src/services/apiService.js

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://welovepalop.com/api';

// ==================== HELPER ====================
async function apiRequest(endpoint, method, data = null) {
    const options = {
        method: method,
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
    };

    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }

    try {
        const url = `${API_BASE_URL}${endpoint}`;
        console.log(`📡 API ${method}: ${url}`);
        
        const response = await fetch(url, options);
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Erro na requisição');
            }
            return result;
        } else {
            const text = await response.text();
            throw new Error(`Resposta da API não é JSON: ${text.substring(0, 100)}...`);
        }
    } catch (error) {
        console.error('❌ API Error:', error);
        throw error;
    }
}

// ==================== QUARTOS ====================
// src/services/apiService.js - ADICIONAR ESTAS FUNÇÕES

// ==================== QUARTOS ====================

export async function buscarTiposQuarto() {
    try {
        const response = await fetch(`${API_BASE_URL}/alojamento/quartos.php?tipos=1`);
        const data = await response.json();
        if (data.success) {
            return { success: true, data: data.data || [] };
        }
        return { success: false, data: [], message: data.message || 'Erro ao buscar tipos de quarto' };
    } catch (error) {
        console.error('Erro ao buscar tipos de quarto:', error);
        return { success: false, data: [], message: error.message };
    }
}

export async function buscarQuartosDoAlojamento(alojamentoId) {
    if (!alojamentoId) {
        return { success: false, data: [], message: 'ID do alojamento não fornecido' };
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/alojamento/quartos.php?id=${alojamentoId}`);
        const data = await response.json();
        if (data.success) {
            return { success: true, data: data.data || [] };
        }
        return { success: false, data: [], message: data.message || 'Erro ao buscar quartos' };
    } catch (error) {
        console.error('Erro ao buscar quartos do alojamento:', error);
        return { success: false, data: [], message: error.message };
    }
}

export async function buscarQuartosComSelecao(alojamentoId) {
    // Mesma função que buscarQuartosDoAlojamento (para compatibilidade)
    return buscarQuartosDoAlojamento(alojamentoId);
}

export async function salvarQuartos(alojamentoId, quartos) {
    if (!alojamentoId) {
        throw new Error('ID do alojamento não fornecido');
    }
    
    const payload = {
        alojamento_id: alojamentoId,
        quartos: quartos.map(q => ({
            tipo_quarto_id: q.tipo_quarto_id,
            quantidade_disponivel: q.quantidade_disponivel || 1,
            preco_personalizado: q.preco_personalizado || null
        }))
    };
    
    console.log('📤 Salvando quartos:', payload);
    
    try {
        const response = await fetch(`${API_BASE_URL}/alojamento/quartos.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Erro ao salvar quartos:', error);
        return { success: false, message: error.message };
    }
}

export async function atualizarQuartos(alojamentoId, quartos) {
    if (!alojamentoId) {
        throw new Error('ID do alojamento não fornecido');
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/alojamento/quartos.php`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                alojamento_id: alojamentoId,
                quartos: quartos.map(q => ({
                    tipo_quarto_id: q.tipo_quarto_id,
                    quantidade_disponivel: q.quantidade_disponivel || 1,
                    preco_personalizado: q.preco_personalizado || null
                }))
            })
        });
        return await response.json();
    } catch (error) {
        console.error('Erro ao atualizar quartos:', error);
        return { success: false, message: error.message };
    }
}

export async function removerQuarto(alojamentoId, tipoQuartoId) {
    if (!alojamentoId || !tipoQuartoId) {
        throw new Error('ID do alojamento e tipo de quarto são obrigatórios');
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/alojamento/quartos.php?alojamento_id=${alojamentoId}&tipo_quarto_id=${tipoQuartoId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });
        return await response.json();
    } catch (error) {
        console.error('Erro ao remover quarto:', error);
        return { success: false, message: error.message };
    }
}

export async function removerQuartoPorId(id) {
    if (!id) {
        throw new Error('ID do quarto é obrigatório');
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/alojamento/quartos.php?id=${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });
        return await response.json();
    } catch (error) {
        console.error('Erro ao remover quarto:', error);
        return { success: false, message: error.message };
    }
}

// ==================== ENDPOINTS BASE DO ALOJAMENTO ====================

export async function registrarAlojamentoCompleto(dados) {
    return apiRequest('/alojamento/registrar.php', 'POST', dados);
}

export async function atualizarAlojamentoCompleto(id, dados) {
    return apiRequest(`/alojamento/atualizar.php?id=${id}`, 'PUT', dados);
}

export async function salvarInformacoesBasicas(dados) {
    return apiRequest('/alojamento/informacoes.php', 'POST', dados);
}

export async function buscarInformacoesBasicas(id) {
    return apiRequest(`/alojamento/informacoes.php?id=${id}`, 'GET');
}

export async function salvarLocalizacao(dados) {
    return apiRequest('/alojamento/localizacao.php', 'POST', dados);
}

export async function buscarLocalizacao(id) {
    return apiRequest(`/alojamento/localizacao.php?id=${id}`, 'GET');
}

export async function salvarComodidades(dados) {
    const { alojamento_id, comodidades } = dados;
    const comodidadesIds = comodidades.map(c => typeof c === 'number' ? c : c.id);
    return apiRequest('/alojamento/comodidades.php', 'POST', {
        alojamento_id: alojamento_id,
        comodidades: comodidadesIds
    });
}

export async function buscarComodidadesDoAlojamento(id) {
    return apiRequest(`/alojamento/comodidades.php?id=${id}`, 'GET');
}

export async function buscarComodidadesDisponiveis() {
    return apiRequest('/alojamento/comodidades.php', 'GET');
}

export async function salvarRegras(dados) {
    const { alojamento_id, regras } = dados;
    const regrasIds = regras.map(r => typeof r === 'number' ? r : r.id);
    return apiRequest('/alojamento/regras.php', 'POST', {
        alojamento_id: alojamento_id,
        regras: regrasIds
    });
}

export async function buscarRegrasDoAlojamento(id) {
    return apiRequest(`/alojamento/regras.php?id=${id}`, 'GET');
}

export async function buscarRegrasDisponiveis() {
    return apiRequest('/alojamento/regras.php', 'GET');
}

export async function salvarImagens(dados) {
    return apiRequest('/alojamento/imagens.php', 'POST', dados);
}

export async function buscarImagensDoAlojamento(id) {
    return apiRequest(`/alojamento/imagens.php?id=${id}`, 'GET');
}

export async function removerImagem(id) {
    return apiRequest(`/alojamento/imagens.php?id=${id}`, 'DELETE');
}

export async function salvarPrecos(dados) {
    return apiRequest('/alojamento/precos.php', 'POST', dados);
}

export async function buscarPrecos(id) {
    return apiRequest(`/alojamento/precos.php?id=${id}`, 'GET');
}

// ==================== LÓGICA DE INTEGRAÇÃO ====================

export async function buscarAlojamentoCompleto(id) {
    try {
        console.log(`🔍 Buscando dados para o alojamento #${id}`);
        
        const infoResponse = await buscarInformacoesBasicas(id);
        
        if (!infoResponse?.success || !infoResponse?.data) {
            return { success: false, message: 'Alojamento não encontrado.' };
        }

        const dadosCompletos = {
            id: parseInt(id),
            ...infoResponse.data,
            morada: null,
            comodidades: [],
            regras: null,
            fotos: [],
            quartos: []
        };

        const [loc, com, reg, img, quartos] = await Promise.all([
            buscarLocalizacao(id).catch(e => ({ success: false })),
            buscarComodidadesDoAlojamento(id).catch(e => ({ success: false })),
            buscarRegrasDoAlojamento(id).catch(e => ({ success: false })),
            buscarImagensDoAlojamento(id).catch(e => ({ success: false })),
            buscarQuartosDoAlojamento(id).catch(e => ({ success: false }))
        ]);

        if (loc.success) dadosCompletos.morada = loc.data;
        if (com.success) dadosCompletos.comodidades = com.data;
        if (reg.success) dadosCompletos.regras = reg.data;
        if (img.success) dadosCompletos.fotos = img.data;
        if (quartos.success) dadosCompletos.quartos = quartos.data;

        console.log('✅ Dados carregados com sucesso');
        return { success: true, data: dadosCompletos };
    } catch (error) {
        console.error('❌ Erro:', error);
        return { success: false, message: error.message };
    }
}

export async function buscarAlojamentoParaEdicao(id) {
    return buscarAlojamentoCompleto(id);
}
// Substitua a função salvarFluxoRegisto existente por esta versão melhorada

export async function salvarFluxoRegisto(dados, alojamentoId = null) {
    try {
        const isEdicao = !!alojamentoId;
        const informacoes = dados.informacoes || dados;
        
        // 1. Extrair Comodidades
        let comodidadesIds = [];
        if (dados.comodidades?.length) {
            comodidadesIds = dados.comodidades
                .map(c => typeof c === 'number' ? c : c.id)
                .filter(id => id != null);
        }
        
        // 2. Extrair Regras corretamente
        let regrasIds = [];
        let regrasAdicionais = '';

        if (dados.regras) {
            if (dados.regras.regras_ids) {
                regrasIds = dados.regras.regras_ids;
            } else if (Array.isArray(dados.regras)) {
                regrasIds = dados.regras.map(r => typeof r === 'number' ? r : r.id);
            }
            regrasAdicionais = dados.regras.regras_adicionais || '';
        }
        
        // 3. Extrair Imagens
        const imagens = (dados.fotos || [])
            .filter(foto => foto.url)
            .map((foto, index) => ({
                url: foto.url,
                principal: index === 0 ? 1 : 0
            }));
        
        // 4. Extrair Quartos (FORMATO CORRETO)
        let quartosFormatados = [];
        if (dados.quartos && Array.isArray(dados.quartos)) {
            quartosFormatados = dados.quartos.map(q => ({
                tipo_quarto_id: q.tipo_quarto_id,
                quantidade_disponivel: q.quantidade_disponivel || 1,
                preco_personalizado: q.preco_personalizado || null
            }));
        }
        
        // 5. Extrair morada
        let morada = null;
        if (dados.morada) {
            morada = dados.morada;
        } else if (informacoes.morada) {
            morada = informacoes.morada;
        }
        
        // Payload completo
        const payload = {
            proprietario_id: dados.proprietario_id || 1,
            titulo: informacoes.titulo || 'Propriedade Sem Título',
            localizacao: morada?.cidade || informacoes.localizacao || '',
            latitude: morada?.coordenadas?.lat || null,
            longitude: morada?.coordenadas?.lng || null,
            preco_noite: parseFloat(informacoes.preco_noite) || 0,
            capacidade: parseInt(informacoes.capacidade) || 2,
            estrelas: parseFloat(informacoes.estrelas) || 4.0,
            tipo: informacoes.tipo_propriedade || 'Apartamento',
            status: 'pendente',
            descricao: informacoes.descricao || '',
            descricao_detalhada: informacoes.descricao_detalhada || '',
            tipo_propriedade: informacoes.tipo_propriedade || 'Apartamento',
            tempo_resposta: informacoes.tempo_resposta || 'Dentro de 1 hora',
            num_quartos: parseInt(informacoes.quartos) || 1,
            camas: parseInt(informacoes.camas) || 1,
            casas_banho: parseInt(informacoes.casas_banho) || 1,
            
            comodidades: comodidadesIds,
            
            regras: {
                regras_ids: regrasIds,
                regras_adicionais: regrasAdicionais
            },
            
            imagens: imagens,
            
            // Quartos no formato correto
            quartos: quartosFormatados,
            
            morada: morada ? {
                endereco: morada.morada || morada.endereco || '',
                apartamento: morada.apartamento || '',
                cidade: morada.cidade || '',
                codigo_postal: morada.codigoPostal || morada.codigo_postal || '',
                pais: morada.pais || 'Cabo Verde',
                lat: morada.coordenadas?.lat || null,
                lng: morada.coordenadas?.lng || null
            } : null
        };
        
        console.log(`📤 Enviando payload para ${isEdicao ? 'edição' : 'criação'}:`, payload);
        
        const result = isEdicao 
            ? await atualizarAlojamentoCompleto(alojamentoId, payload)
            : await registrarAlojamentoCompleto(payload);
        
        if (result.success) {
            // Se tiver quartos e for criação, salvar quartos separadamente
            if (!isEdicao && quartosFormatados.length > 0 && result.data?.alojamento_id) {
                console.log('📦 Salvando quartos após criação do alojamento...');
                const quartosResult = await salvarQuartos(result.data.alojamento_id, quartosFormatados);
                if (!quartosResult.success) {
                    console.warn('⚠️ Quartos salvos parcialmente:', quartosResult.message);
                }
            }
            
            return {
                success: true,
                message: isEdicao ? 'Alojamento atualizado com sucesso!' : 'Alojamento registado com sucesso!',
                data: { alojamento_id: alojamentoId || result.data?.alojamento_id }
            };
        }
        
        throw new Error(result.message || 'Falha ao processar requisição');
    } catch (error) {
        console.error('❌ Erro ao salvar fluxo:', error);
        return { success: false, message: error.message, data: null };
    }
}

export default {
    registrarAlojamentoCompleto,
    atualizarAlojamentoCompleto,
    salvarInformacoesBasicas,
    buscarInformacoesBasicas,
    salvarLocalizacao,
    buscarLocalizacao,
    salvarComodidades,
    buscarComodidadesDoAlojamento,
    buscarComodidadesDisponiveis,
    salvarRegras,
    buscarRegrasDoAlojamento,
    buscarRegrasDisponiveis,
    salvarImagens,
    buscarImagensDoAlojamento,
    removerImagem,
    salvarPrecos,
    buscarPrecos,
    buscarTiposQuarto,
    buscarQuartosDoAlojamento,
    buscarQuartosComSelecao,
    salvarQuartos,
    atualizarQuartos,
    removerQuarto,
    removerQuartoPorId,
    salvarFluxoRegisto,
    buscarAlojamentoParaEdicao,
    buscarAlojamentoCompleto
};