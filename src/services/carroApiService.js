// src/services/carroApiService.js

const API_URL = import.meta.env.VITE_API_URL || 'https://welovepalop.com/api';

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
        const url = `${API_URL}${endpoint}`;
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

// ==================== CARROS ====================

export async function registrarCarro(dados) {
    return apiRequest('/carro/registrar.php', 'POST', dados);
}

export async function atualizarCarro(id, dados) {
    return apiRequest(`/carro/atualizar.php?id=${id}`, 'PUT', dados);
}

export async function listarCarros(usuarioId, categoria = null, status = null) {
    let url = `/carro/listar.php?usuario_id=${usuarioId}`;
    if (categoria) url += `&categoria=${categoria}`;
    if (status) url += `&status=${status}`;
    return apiRequest(url, 'GET');
}

export async function buscarCarro(id) {
    return apiRequest(`/carro/buscar.php?id=${id}`, 'GET');
}

export async function excluirCarro(id) {
    return apiRequest(`/carro/excluir.php?id=${id}`, 'DELETE');
}

export async function buscarTiposCarro() {
    return apiRequest('/carro/buscar_tipos.php', 'GET');
}

export async function buscarCaracteristicas() {
    return apiRequest('/carro/buscar_caracteristicas.php', 'GET');
}

// ==================== UPLOAD DE IMAGENS ====================

export async function uploadImagemCarro(file, carroId = null, ordem = 0) {
    const formData = new FormData();
    formData.append('imagem', file);
    if (carroId) formData.append('carro_id', carroId);
    formData.append('ordem', ordem);
    
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
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
                    reject(new Error('Erro ao processar resposta'));
                }
            } else {
                reject(new Error(`Erro ${xhr.status}`));
            }
        };
        
        xhr.onerror = () => reject(new Error('Erro de conexão'));
        
        xhr.open('POST', `${API_URL}/carro/upload_imagem.php`);
        xhr.send(formData);
    });
}

export async function removerImagemCarro(imagemId) {
    return apiRequest(`/carro/remover_imagem.php?id=${imagemId}`, 'DELETE');
}

// ==================== SALVAR FLUXO COMPLETO ====================

export async function salvarFluxoCarro(dados, carroId = null) {
    const isEdicao = !!carroId;
    
    const payload = {
        usuario_id: dados.usuario_id || 1,
        titulo: dados.titulo || '',
        marca: dados.marca || '',
        modelo: dados.modelo || '',
        categoria_id: dados.categoria_id || null,
        preco_dia: parseFloat(dados.preco_dia) || 0,
        descricao: dados.descricao || '',
        descricao_detalhada: dados.descricao_detalhada || '',
        ano: dados.ano || null,
        passageiros: dados.passageiros || 5,
        portas: dados.portas || 4,
        transmissao: dados.transmissao || 'Manual',
        combustivel: dados.combustivel || 'Gasolina',
        consumo: dados.consumo || null,
        cor: dados.cor || null,
        quilometragem: dados.quilometragem || 0,
        localizacao: dados.localizacao || '',
        ilha: dados.ilha || '',
        caracteristicas: dados.caracteristicas || [],
        imagens: dados.imagens || []
    };
    
    const result = isEdicao 
        ? await atualizarCarro(carroId, payload)
        : await registrarCarro(payload);
    
    if (result.success) {
        return {
            success: true,
            message: isEdicao ? 'Carro atualizado com sucesso!' : 'Carro registado com sucesso!',
            data: { carro_id: result.data?.carro_id || carroId }
        };
    }
    
    throw new Error(result.message || 'Falha ao processar requisição');
}

export default {
    registrarCarro,
    atualizarCarro,
    listarCarros,
    buscarCarro,
    excluirCarro,
    buscarTiposCarro,
    buscarCaracteristicas,
    uploadImagemCarro,
    removerImagemCarro,
    salvarFluxoCarro
};