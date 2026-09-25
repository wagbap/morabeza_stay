// src/services/carroApiService.js

const API_URL = import.meta.env.VITE_API_URL || 'https://welovepalop.com/api'

// ==================== FUNÇÃO AUXILIAR DE AUTENTICAÇÃO ====================
function getUserIdSeguro() {
    try {
        const token = localStorage.getItem('token') || localStorage.getItem('morabeza_token');
        if (token) {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const parsed = JSON.parse(jsonPayload);
            const userData = parsed.data || parsed;
            if (userData?.id) return userData.id;
        }

        const chaves = ['user', 'morabeza_user', 'morabeza_admin'];
        for (const chave of chaves) {
            const raw = localStorage.getItem(chave);
            if (raw) {
                const user = JSON.parse(raw);
                const uid = user?.id || user?.sub || user?.user_id;
                if (uid) return uid;
            }
        }
    } catch (e) {
        console.error('Erro ao extrair ID do utilizador no service:', e);
    }
    return null;
}

async function apiRequest(endpoint, method, data = null) {
    const options = {
        method,
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

/** Helper — constrói query string só com valores válidos */
function buildQuery(params) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '' && v !== 'undefined' && v !== 'null') {
            search.append(k, v);
        }
    });
    const qs = search.toString();
    return qs ? `?${qs}` : '';
}

// ==================== CARROS ====================

export async function registrarCarro(dados) {
    return apiRequest('/carro/registrar.php', 'POST', dados);
}

export async function atualizarCarro(id, dados) {
    return apiRequest(`/carro/atualizar.php?id=${id}`, 'PUT', dados);
}

/**
 * Lista carros do painel (por utilizador).
 * Se o usuarioId não for passado, tenta obtê-lo automaticamente do JWT/LocalStorage.
 */
export async function listarCarros(usuarioId = null, categoria = null, status = null) {
    const uidFinal = usuarioId || getUserIdSeguro();
    const qs = buildQuery({
        usuario_id: uidFinal,
        categoria,
        status
    });
    return apiRequest(`/carro/listar.php${qs}`, 'GET');
}

/**
 * ⭐ Lista pública (catálogo, homepage, destaques).
 * NUNCA envia usuario_id. Só devolve carros disponíveis.
 */
export async function listarCarrosPublicos(opcoes = {}) {
    const { categoria, search, limit, offset, status = 'disponivel' } = opcoes;
    const qs = buildQuery({
        categoria,
        search,
        limit,
        offset,
        status
    });
    return apiRequest(`/carro/listar.php${qs}`, 'GET');
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
    const uidFinal = dados.usuario_id || getUserIdSeguro();

    const payload = {
        usuario_id: uidFinal,
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
    listarCarrosPublicos,
    buscarCarro,
    excluirCarro,
    buscarTiposCarro,
    buscarCaracteristicas,
    uploadImagemCarro,
    removerImagemCarro,
    salvarFluxoCarro
};