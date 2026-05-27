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

// ==================== LOCALIZAÇÃO PERSISTENTE ====================

export async function buscarLocalizacaoPersistente(alojamentoId) {
    if (!alojamentoId) {
        return { success: false, message: 'ID do alojamento não fornecido', data: null };
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/alojamento/buscar_localizacao.php?id=${alojamentoId}`);
        const data = await response.json();
        
        if (data.success && data.data) {
            return { 
                success: true, 
                data: {
                    id: data.data.id,
                    alojamento_id: data.data.alojamento_id,
                    endereco: data.data.endereco,
                    apartamento: data.data.num_apartamento || '',
                    num_apartamento: data.data.num_apartamento || '',
                    coordenadas: data.data.coordenadas || { lat: null, lng: null },
                    morada: data.data.endereco?.split(',')[0] || '',
                    moradaCompleta: data.data.endereco || '',
                    cidade: '',
                    codigoPostal: '',
                    pais: 'Cabo Verde'
                }
            };
        }
        return { success: false, message: data.message || 'Localização não encontrada', data: null };
    } catch (error) {
        console.error('Erro ao buscar localização persistente:', error);
        return { success: false, message: error.message, data: null };
    }
}

// ==================== LÓGICA DE INTEGRAÇÃO COMPLETA ====================

export async function buscarAlojamentoCompleto(id) {
    try {
        console.log(`🔍 Buscando dados para o alojamento #${id}`);
        
        // 1. Buscar informações básicas do alojamento
        const infoResponse = await buscarInformacoesBasicas(id);
        
        if (!infoResponse?.success || !infoResponse?.data) {
            return { success: false, message: 'Alojamento não encontrado.' };
        }

        // 2. Buscar localização persistente (COM num_apartamento)
        const locPersistente = await buscarLocalizacaoPersistente(id);
        
        // 3. Preparar objeto base com os dados do alojamento
        const dadosCompletos = {
            id: parseInt(id),
            // Dados da tabela alojamentos
            titulo: infoResponse.data.titulo || '',
            tipo_propriedade: infoResponse.data.tipo_propriedade || 'Apartamento',
            capacidade: infoResponse.data.capacidade|| infoResponse.data.capacidade || 2,
            estrelas: infoResponse.data.estrelas || 4.5,
            descricao: infoResponse.data.descricao || '',
            descricao_detalhada: infoResponse.data.descricao_detalhada || '',
            preco_noite: infoResponse.data.preco_noite || '',
            tempo_resposta: infoResponse.data.tempo_resposta || 'Dentro de 1 hora',
            quartos: infoResponse.data.quartos || 1,
            camas: infoResponse.data.camas || 1,
            casas_banho: infoResponse.data.casas_banho || 1,
            localizacao: infoResponse.data.localizacao || '',
            latitude: infoResponse.data.latitude || null,
            longitude: infoResponse.data.longitude || null,
            regras_adicionais: infoResponse.data.regras_adicionais || '',
            status: infoResponse.data.status || 'pendente',
            created_at: infoResponse.data.created_at || null,
            updated_at: infoResponse.data.updated_at || null,
            
            // Dados da localização (com num_apartamento)
            morada: locPersistente.success ? {
                id: locPersistente.data.id,
                alojamento_id: locPersistente.data.alojamento_id,
                endereco: locPersistente.data.endereco,
                morada: locPersistente.data.morada,
                moradaCompleta: locPersistente.data.moradaCompleta,
                apartamento: locPersistente.data.apartamento,
                num_apartamento: locPersistente.data.num_apartamento,
                cidade: locPersistente.data.cidade,
                codigoPostal: locPersistente.data.codigoPostal,
                pais: locPersistente.data.pais,
                coordenadas: locPersistente.data.coordenadas
            } : null,
            
            // Arrays para dados relacionados
            comodidades: [],
            regras: null,
            fotos: [],
            quartos: []
        };

        // 4. Buscar dados relacionados em paralelo
        console.log('🔄 Buscando dados relacionados em paralelo...');
        
        const [comResponse, regResponse, imgResponse, quartosResponse] = await Promise.all([
            buscarComodidadesDoAlojamento(id).catch(e => {
                console.warn('Erro ao buscar comodidades:', e);
                return { success: false, data: [] };
            }),
            buscarRegrasDoAlojamento(id).catch(e => {
                console.warn('Erro ao buscar regras:', e);
                return { success: false, data: null };
            }),
            buscarImagensDoAlojamento(id).catch(e => {
                console.warn('Erro ao buscar imagens:', e);
                return { success: false, data: [] };
            }),
            buscarQuartosDoAlojamento(id).catch(e => {
                console.warn('Erro ao buscar quartos:', e);
                return { success: false, data: [] };
            })
        ]);

        // 5. Processar comodidades
        if (comResponse.success && comResponse.data) {
            dadosCompletos.comodidades = Array.isArray(comResponse.data) ? comResponse.data : [];
            console.log(`✅ ${dadosCompletos.comodidades.length} comodidades carregadas`);
        }

        // 6. Processar regras
        if (regResponse.success && regResponse.data) {
            let regrasList = [];
            let regrasIds = [];
            
            if (Array.isArray(regResponse.data)) {
                regrasList = regResponse.data;
                regrasIds = regrasList.map(r => r.id || r);
            } else if (regResponse.data.regras) {
                regrasList = regResponse.data.regras;
                regrasIds = regrasList.map(r => r.id || r);
            } else if (regResponse.data.regras_ids) {
                regrasIds = regResponse.data.regras_ids;
            }
            
            dadosCompletos.regras = {
                regras: regrasList,
                regras_ids: regrasIds,
                regras_adicionais: dadosCompletos.regras_adicionais || ''
            };
            console.log(`✅ ${regrasList.length} regras carregadas`);
        }

        // 7. Processar fotos
        if (imgResponse.success && imgResponse.data) {
            dadosCompletos.fotos = Array.isArray(imgResponse.data) ? imgResponse.data : [];
            console.log(`✅ ${dadosCompletos.fotos.length} fotos carregadas`);
        }

        // 8. Processar quartos
        if (quartosResponse.success && quartosResponse.data) {
            dadosCompletos.quartos = quartosResponse.data.map(q => ({
                id: q.id,
                alojamento_id: q.alojamento_id,
                tipo_quarto_id: q.tipo_quarto_id,
                tipo_nome: q.tipo_nome || q.nome,
                quantidade_disponivel: q.quantidade_disponivel || 1,
                preco_personalizado: q.preco_personalizado || null,
                capacidade: q.capacidade || 2,
                camas: q.camas || 1,
                icone: q.icone,
                imagem_url: q.imagem_url,
                multiplicador_preco: q.multiplicador_preco || 1,
                ativo: q.ativo !== undefined ? q.ativo : 1
            }));
            console.log(`✅ ${dadosCompletos.quartos.length} quartos carregados`);
        }

        // 9. Log final
        console.log('✅ Dados carregados com sucesso!', {
            id: dadosCompletos.id,
            titulo: dadosCompletos.titulo,
            temMorada: !!dadosCompletos.morada,
            numComodidades: dadosCompletos.comodidades.length,
            numRegras: dadosCompletos.regras?.regras?.length || 0,
            numFotos: dadosCompletos.fotos.length,
            numQuartos: dadosCompletos.quartos.length
        });
        
        return { success: true, data: dadosCompletos };
        
    } catch (error) {
        console.error('❌ Erro em buscarAlojamentoCompleto:', error);
        return { 
            success: false, 
            message: error.message || 'Erro ao carregar dados do alojamento',
            data: null 
        };
    }
}

export async function buscarAlojamentoParaEdicao(id) {
    return buscarAlojamentoCompleto(id);
}

export async function buscarLocalizacaoDoAlojamento(id) {
    try {
        const result = await buscarLocalizacao(id);
        if (result.success && result.data) {
            return {
                success: true,
                data: {
                    endereco: result.data.endereco || '',
                    apartamento: result.data.num_apartamento || result.data.apartamento || '',
                    num_apartamento: result.data.num_apartamento || '',
                    coordenadas: {
                        lat: result.data.latitude || result.data.coordenadas_lat || null,
                        lng: result.data.longitude || result.data.coordenadas_lng || null
                    },
                    cidade: result.data.cidade || '',
                    codigoPostal: result.data.codigo_postal || '',
                    pais: result.data.pais || 'Cabo Verde'
                }
            };
        }
        return { success: false, data: null, message: result.message };
    } catch (error) {
        console.error('Erro ao buscar localização:', error);
        return { success: false, data: null, message: error.message };
    }
}

// ==================== SALVAR FLUXO REGISTO ====================

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
        
        // 4. Extrair Quartos
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
        
        // 6. Payload completo
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
            num_apartamento: morada?.apartamento || dados.num_apartamento || '',
            
            comodidades: comodidadesIds,
            
            regras: {
                regras_ids: regrasIds,
                regras_adicionais: regrasAdicionais
            },
            
            imagens: imagens,
            
            quartos: quartosFormatados,
            
            morada: morada ? {
                endereco: morada.morada || morada.endereco || '',
                apartamento: morada.apartamento || '',
                num_apartamento: morada.apartamento || '',
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

// ==================== EXPORT DEFAULT ====================

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
    buscarAlojamentoCompleto,
    buscarLocalizacaoPersistente,
    buscarLocalizacaoDoAlojamento
};