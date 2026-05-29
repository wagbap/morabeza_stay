// src/services/experienciaApiService.js

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://welovepalop.com/api';

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

// ==================== EXPERIÊNCIAS ====================

export async function registrarExperiencia(dados) {
    return apiRequest('/experiencia/registrar.php', 'POST', dados);
}

export async function atualizarExperiencia(id, dados) {
    return apiRequest(`/experiencia/atualizar.php?id=${id}`, 'PUT', dados);
}

export async function listarExperiencias(usuarioId, categoria = null, status = null) {
    let url = `/experiencia/listar.php?usuario_id=${usuarioId}`;
    if (categoria) url += `&categoria=${categoria}`;
    if (status) url += `&status=${status}`;
    return apiRequest(url, 'GET');
}

export async function buscarExperiencia(id = null, slug = null) {
    let url = '/experiencia/buscar.php?';
    if (id) url += `id=${id}`;
    if (slug) url += `slug=${slug}`;
    return apiRequest(url, 'GET');
}

export async function excluirExperiencia(id) {
    return apiRequest(`/experiencia/excluir.php?id=${id}`, 'DELETE');
}

export async function buscarCategorias() {
    return apiRequest('/experiencia/categorias.php', 'GET');
}

// ==================== UPLOAD DE IMAGENS ====================

export async function uploadImagemExperiencia(file, experienciaId = null, ordem = 0) {
    const formData = new FormData();
    formData.append('imagem', file);
    if (experienciaId) formData.append('experiencia_id', experienciaId);
    formData.append('ordem', ordem);
    
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                if (typeof onProgress === 'function') onProgress(percent);
            }
        });
        
        xhr.onload = () => {
            if (xhr.status === 200) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    if (response.success) {
                        resolve(response.data);
                    } else {
                        reject(new Error(response.message));
                    }
                } catch (e) {
                    reject(new Error('Erro ao processar resposta do servidor'));
                }
            } else {
                reject(new Error(`Erro ${xhr.status}: ${xhr.statusText}`));
            }
        };
        
        xhr.onerror = () => reject(new Error('Erro de conexão com o servidor'));
        
        xhr.open('POST', `${API_BASE_URL}/experiencia/upload_imagem.php`);
        xhr.send(formData);
    });
}

export async function removerImagemExperiencia(imagemId) {
    return apiRequest(`/experiencia/remover_imagem.php?id=${imagemId}`, 'DELETE');
}

// ==================== SALVAR FLUXO COMPLETO ====================

export async function salvarFluxoExperiencia(dados, experienciaId = null) {
    const isEdicao = !!experienciaId;
    
    // Estruturar dados corretamente
    const payload = {
        usuario_id: dados.usuario_id || 1,
        titulo: dados.titulo || '',
        descricao_curta: dados.descricao_curta || '',
        descricao_longa: dados.descricao_longa || '',
        descricao_completa: dados.descricao_completa || '',
        categoria: dados.categoria || 'aventura',
        localizacao: dados.localizacao || dados.endereco?.cidade || '',
        endereco: dados.endereco?.morada || dados.endereco || '',
        latitude: dados.endereco?.lat || dados.latitude || null,
        longitude: dados.endereco?.lng || dados.longitude || null,
        ilha: dados.ilha || '',
        preco: parseFloat(dados.preco) || 0,
        preco_crianca: dados.preco_crianca ? parseFloat(dados.preco_crianca) : null,
        preco_bebe: dados.preco_bebe ? parseFloat(dados.preco_bebe) : null,
        duracao: dados.duracao || '2 horas',
        max_pessoas: parseInt(dados.max_pessoas) || 10,
        min_pessoas: parseInt(dados.min_pessoas) || 1,
        inclui_guia: dados.inclui_guia ? 1 : 0,
        inclui_transporte: dados.inclui_transporte ? 1 : 0,
        inclui_refeicao: dados.inclui_refeicao ? 1 : 0,
        ponto_encontro: dados.ponto_encontro || '',
        dias_disponiveis: dados.dias_disponiveis || [],
        horarios: dados.horarios || [],
        inclusoes: dados.inclusoes || [],
        requisitos: dados.requisitos || [],
        idiomas: dados.idiomas || [],
        imagens: dados.imagens || []
    };
    
    console.log(`📤 Salvando ${isEdicao ? 'edição' : 'nova'} experiência:`, payload);
    
    const result = isEdicao 
        ? await atualizarExperiencia(experienciaId, payload)
        : await registrarExperiencia(payload);
    
    if (result.success) {
        return {
            success: true,
            message: isEdicao ? 'Experiência atualizada com sucesso!' : 'Experiência registada com sucesso!',
            data: { experiencia_id: result.data?.experiencia_id || experienciaId }
        };
    }
    
    throw new Error(result.message || 'Falha ao processar requisição');
}

export async function buscarExperienciaParaEdicao(id) {
    return buscarExperiencia(id);
}

export default {
    registrarExperiencia,
    atualizarExperiencia,
    listarExperiencias,
    buscarExperiencia,
    excluirExperiencia,
    buscarCategorias,
    uploadImagemExperiencia,
    removerImagemExperiencia,
    salvarFluxoExperiencia,
    buscarExperienciaParaEdicao
};