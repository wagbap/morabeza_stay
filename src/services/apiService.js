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
        quartos: quartos.map(q => {
            const listaFotos = q.fotos || q.imagens || [];
            const fotosLimpas = listaFotos
                .map(f => (typeof f === 'string' ? f : f.caminho_url || f.url || f.path))
                .filter(Boolean);

            return {
                tipo_quarto_id: q.tipo_quarto_id,
                quantidade_disponivel: q.quantidade_disponivel || 1,
                preco_personalizado: q.preco_personalizado || null,
                fotos: fotosLimpas,
                imagens: fotosLimpas
            };
        })
    };
    
    console.log('📤 Salvando quartos com fotos para a tabela quarto_imagens:', payload);
    
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
    
    const payload = {
        alojamento_id: alojamentoId,
        quartos: quartos.map(q => {
            const listaFotos = q.fotos || q.imagens || [];
            const fotosLimpas = listaFotos
                .map(f => (typeof f === 'string' ? f : f.caminho_url || f.url || f.path))
                .filter(Boolean);

            return {
                tipo_quarto_id: q.tipo_quarto_id,
                quantidade_disponivel: q.quantidade_disponivel || 1,
                preco_personalizado: q.preco_personalizado || null,
                fotos: fotosLimpas,
                imagens: fotosLimpas
            };
        })
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/alojamento/quartos.php`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
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
                    cidade: data.data.cidade || '',
                    ilha: data.data.ilha || '',
                    codigoPostal: data.data.codigo_postal || '',
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
        
        const infoResponse = await buscarInformacoesBasicas(id);
        
        if (!infoResponse?.success || !infoResponse?.data) {
            return { success: false, message: 'Alojamento não encontrado.' };
        }

        const locPersistente = await buscarLocalizacaoPersistente(id);
        
        const dadosCompletos = {
            id: parseInt(id),
            titulo: infoResponse.data.titulo || '',
            tipo_propriedade: infoResponse.data.tipo_propriedade || 'Apartamento',
            capacidade: infoResponse.data.capacidade || 2,
            estrelas: infoResponse.data.estrelas || 4.5,
            descricao: infoResponse.data.descricao || '',
            descricao_detalhada: infoResponse.data.descricao_detalhada || '',
            preco_noite: infoResponse.data.preco_noite || '',
            tempo_resposta: infoResponse.data.tempo_resposta || 'Dentro de 1 hora',
            quartos: infoResponse.data.quartos || 1,
            camas: infoResponse.data.camas || 1,
            casas_banho: infoResponse.data.casas_banho || 1,
            localizacao: infoResponse.data.localizacao || '',
            cidade: infoResponse.data.cidade || '',
            ilha: infoResponse.data.ilha || '',
            codigo_postal: infoResponse.data.codigo_postal || '',
            num_apartamento: infoResponse.data.num_apartamento || '',
            latitude: infoResponse.data.latitude || null,
            longitude: infoResponse.data.longitude || null,
            regras_adicionais: infoResponse.data.regras_adicionais || '',
            status: infoResponse.data.status || 'pendente',
            created_at: infoResponse.data.created_at || null,
            updated_at: infoResponse.data.updated_at || null,
            
            morada: locPersistente.success ? {
                id: locPersistente.data.id,
                alojamento_id: locPersistente.data.alojamento_id,
                endereco: locPersistente.data.endereco,
                morada: locPersistente.data.morada,
                moradaCompleta: locPersistente.data.moradaCompleta,
                apartamento: locPersistente.data.apartamento,
                num_apartamento: locPersistente.data.num_apartamento,
                cidade: locPersistente.data.cidade,
                ilha: locPersistente.data.ilha,
                codigoPostal: locPersistente.data.codigoPostal,
                pais: locPersistente.data.pais,
                coordenadas: locPersistente.data.coordenadas
            } : null,
            
            comodidades: [],
            regras: null,
            fotos: [],
            quartos: []
        };

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

        if (comResponse.success && comResponse.data) {
            dadosCompletos.comodidades = Array.isArray(comResponse.data) ? comResponse.data : [];
        }

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
        }

        if (imgResponse.success && imgResponse.data) {
            dadosCompletos.fotos = Array.isArray(imgResponse.data) ? imgResponse.data : [];
        }

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
                ativo: q.ativo !== undefined ? q.ativo : 1,
                fotos: q.fotos || q.imagens || q.quarto_imagens || []
            }));
        }
        
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
                    ilha: result.data.ilha || '',
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
        
        let comodidadesIds = [];
        if (dados.comodidades?.length) {
            comodidadesIds = dados.comodidades
                .map(c => typeof c === 'number' ? c : c.id)
                .filter(id => id != null);
        }
        
        let regrasIds = [];
        let regrasAdicionais = '';

        if (dados.regras) {
            if (dados.regras.regras_ids) {
                regrasIds = dados.regras.regras_ids;
            } else if (Array.isArray(dados.regras)) {
                regrasIds = dados.regras.map(r => typeof r === 'number' ? r : r.id);
            }
            regrasAdicionais = dados.regras.regras_adicionais || '';
        } else if (dados.regras_ids) {
            regrasIds = dados.regras_ids;
            regrasAdicionais = dados.regras_adicionais || '';
        }
        
        const urlsVistas = new Set();
        const imagens = (dados.imagens || dados.fotos || [])
            .filter(foto => {
                const url = foto.url || foto.path || foto.caminho_url || foto.src || foto.caminho || '';
                if (!url || urlsVistas.has(url)) return false;
                urlsVistas.add(url);
                return true;
            })
            .map((foto, index) => {
                const url = foto.url || foto.path || foto.caminho_url || foto.src || foto.caminho || '';
                return {
                    url: url,
                    caminho_url: url,
                    principal: foto.principal !== undefined ? foto.principal : (index === 0 ? 1 : 0),
                    ordem: foto.ordem !== undefined ? foto.ordem : index
                };
            });
        
        // Mapear quartos e respetivas fotos para a tabela quarto_imagens
        let quartosFormatados = [];
        if (dados.quartos && Array.isArray(dados.quartos)) {
            quartosFormatados = dados.quartos.map(q => {
                const listaFotos = q.fotos || q.imagens || [];
                const fotosLimpas = listaFotos
                    .map(f => (typeof f === 'string' ? f : f.caminho_url || f.url || f.path))
                    .filter(Boolean);

                return {
                    tipo_quarto_id: q.tipo_quarto_id,
                    quantidade_disponivel: q.quantidade_disponivel || 1,
                    preco_personalizado: q.preco_personalizado || null,
                    fotos: fotosLimpas,
                    imagens: fotosLimpas
                };
            });
        }
        
        let morada = dados.morada || null;
        let cidade = dados.cidade || morada?.cidade || dados.localizacaoDados?.cidade || '';
        let ilha = dados.ilha || morada?.ilha || dados.localizacaoDados?.ilha || '';
        
        const endereco = dados.endereco || morada?.endereco || morada?.morada || '';
        const num_apartamento = dados.num_apartamento || morada?.num_apartamento || morada?.apartamento || '';
        const codigo_postal = dados.codigo_postal || morada?.codigo_postal || morada?.codigoPostal || '';
        const morada_completa = dados.morada_completa || morada?.morada_completa || '';
        const latitude = dados.latitude || morada?.coordenadas?.lat || morada?.lat || null;
        const longitude = dados.longitude || morada?.coordenadas?.lng || morada?.lng || null;
        
        const payload = {
            proprietario_id: dados.proprietario_id || 1,
            titulo: informacoes.titulo || dados.titulo || 'Propriedade Sem Título',
            cidade: cidade,
            ilha: ilha,
            endereco: endereco,
            localizacao: endereco || cidade,
            codigo_postal: codigo_postal,
            num_apartamento: num_apartamento,
            morada_completa: morada_completa,
            latitude: latitude,
            longitude: longitude,
            preco_noite: parseFloat(informacoes.preco_noite || dados.preco_noite) || 0,
            capacidade: parseInt(informacoes.capacidade || dados.capacidade) || 2,
            estrelas: parseFloat(informacoes.estrelas || dados.estrelas) || 4.0,
            tipo: informacoes.tipo_propriedade || dados.tipo_propriedade || dados.tipo || 'Apartamento',
            tipo_propriedade: informacoes.tipo_propriedade || dados.tipo_propriedade || 'Apartamento',
            status: dados.status || 'pendente',
            descricao: informacoes.descricao || dados.descricao || '',
            descricao_detalhada: informacoes.descricao_detalhada || dados.descricao_detalhada || '',
            tempo_resposta: informacoes.tempo_resposta || dados.tempo_resposta || 'Dentro de 1 hora',
            num_quartos: parseInt(informacoes.quartos || dados.quartos) || 1,
            camas: parseInt(informacoes.camas || dados.camas) || 1,
            casas_banho: parseInt(informacoes.casas_banho || dados.casas_banho) || 1,
            comodidades: comodidadesIds,
            regras_ids: regrasIds,
            regras_adicionais: regrasAdicionais,
            morada: {
                endereco: endereco,
                apartamento: num_apartamento,
                cidade: cidade,
                ilha: ilha,
                codigo_postal: codigo_postal,
                pais: morada?.pais || 'Cabo Verde',
                morada_completa: morada_completa,
                lat: latitude,
                lng: longitude,
                coordenadas: { lat: latitude, lng: longitude }
            },
            quartos: quartosFormatados,
            imagens: imagens
        };

        Object.keys(payload).forEach(key => {
            if (payload[key] === undefined || payload[key] === null) {
                payload[key] = '';
            }
        });

        console.log(`📤 Enviando payload para ${isEdicao ? 'edição' : 'criação'}:`, payload);
        
        const result = isEdicao 
            ? await atualizarAlojamentoCompleto(alojamentoId, payload)
            : await registrarAlojamentoCompleto(payload);
        
        if (result.success) {
            const finalId = alojamentoId || result.data?.alojamento_id;
            
            if (quartosFormatados.length > 0 && finalId) {
                console.log('📦 Salvando quartos e respetivas fotos na tabela quarto_imagens...');
                const quartosResult = await salvarQuartos(finalId, quartosFormatados);
                if (!quartosResult.success) {
                    console.warn('⚠️ Quartos salvos parcialmente:', quartosResult.message);
                }
            }
            
            return {
                success: true,
                message: isEdicao ? 'Alojamento atualizado com sucesso!' : 'Alojamento registado com sucesso!',
                data: { alojamento_id: finalId }
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