import axios from "axios";
//#region \0api
const api = axios.create({
	baseURL: "https://api.example.test/api",
	headers: { "Content-Type": "application/json" }
});
globalThis.__uploadApi = api;
//#endregion
//#region \0i18n
var _i18n_default = { t: (k, fallback) => fallback };
//#endregion
//#region \0token
const obterTokenValidacao = () => "host-token";
//#endregion
//#region src/services/experienciaApiService.js
async function apiRequest(endpoint, method, data = null) {
	const token = obterTokenValidacao(localStorage, "host");
	try {
		const response = await api.request({
			url: endpoint,
			method,
			data: data ?? void 0,
			headers: token ? { Authorization: `Bearer ${token}` } : {}
		});
		if (!response.data || typeof response.data !== "object") throw new Error("API_INVALID_JSON");
		return response.data;
	} catch (error) {
		throw new Error(error.response?.data?.message || error.response?.data?.error || error.message);
	}
}
async function registrarExperiencia(dados) {
	return apiRequest("/experiencia/registrar.php", "POST", dados);
}
async function atualizarExperiencia(id, dados) {
	return apiRequest(`/experiencia/atualizar.php?id=${id}`, "PUT", dados);
}
async function listarExperiencias(usuarioId, categoria = null, status = null) {
	let url = `/experiencia/listar.php?usuario_id=${usuarioId}`;
	if (categoria) url += `&categoria=${categoria}`;
	if (status) url += `&status=${status}`;
	return apiRequest(url, "GET");
}
async function buscarExperiencia(id = null, slug = null) {
	let url = "/experiencia/buscar.php?";
	if (id) url += `id=${id}`;
	if (slug) url += `slug=${slug}`;
	return apiRequest(url, "GET");
}
async function excluirExperiencia(id) {
	return apiRequest(`/experiencia/excluir.php?id=${id}`, "DELETE");
}
async function buscarCategorias() {
	return apiRequest("/experiencia/categorias.php", "GET");
}
async function uploadImagemExperiencia(file, experienciaId = null, ordem = 0, onProgress) {
	const formData = new FormData();
	formData.append("imagem", file);
	if (experienciaId) formData.append("experiencia_id", experienciaId);
	formData.append("ordem", ordem);
	try {
		const { data } = await api.post("/experiencia/upload_imagem.php", formData, {
			headers: { "Content-Type": void 0 },
			onUploadProgress: (event) => {
				if (typeof onProgress === "function" && event.total > 0) onProgress(Math.round(event.loaded / event.total * 100));
			}
		});
		if (!data?.success || !data.data || typeof data.data !== "object") throw new Error(data?.message || data?.error || _i18n_default.t("experiencia_upload_resposta_invalida", "Não foi possível interpretar a resposta do upload."));
		return data.data;
	} catch (error) {
		throw new Error(error.response?.data?.message || error.response?.data?.error || error.message);
	}
}
async function removerImagemExperiencia(imagemId) {
	return apiRequest(`/experiencia/remover_imagem.php?id=${imagemId}`, "DELETE");
}
async function salvarFluxoExperiencia(dados, experienciaId = null) {
	const isEdicao = !!experienciaId;
	const payload = {
		usuario_id: dados.usuario_id || 1,
		modelo_reserva: dados.modelo_reserva || "por_pessoa",
		equipamento_nome: dados.modelo_reserva === "por_equipamento" ? dados.equipamento_nome?.trim() || "" : null,
		quantidade_equipamentos: dados.modelo_reserva === "por_equipamento" ? Number(dados.quantidade_equipamentos) : null,
		pessoas_por_equipamento: dados.modelo_reserva === "por_equipamento" ? Number(dados.pessoas_por_equipamento) : null,
		titulo: dados.titulo || "",
		descricao_curta: dados.descricao_curta || "",
		descricao_longa: dados.descricao_longa || "",
		descricao_completa: dados.descricao_completa || "",
		categoria: dados.categoria || "aventura",
		localizacao: dados.localizacao || dados.endereco?.cidade || "",
		endereco: dados.endereco?.morada || dados.endereco || "",
		latitude: dados.endereco?.lat || dados.latitude || null,
		longitude: dados.endereco?.lng || dados.longitude || null,
		cidade: dados.endereco?.cidade?.trim() || dados.cidade?.trim() || "",
		ilha: dados.endereco?.ilha?.trim() || dados.ilha?.trim() || "",
		preco: dados.modelo_reserva === "por_equipamento" ? 0 : parseFloat(dados.preco) || 0,
		preco_crianca: dados.preco_crianca ? parseFloat(dados.preco_crianca) : null,
		preco_bebe: dados.preco_bebe ? parseFloat(dados.preco_bebe) : null,
		duracao: dados.duracao || "2 horas",
		max_pessoas: dados.modelo_reserva === "por_equipamento" ? Number(dados.quantidade_equipamentos) * Number(dados.pessoas_por_equipamento) : parseInt(dados.max_pessoas) || 10,
		min_pessoas: parseInt(dados.min_pessoas) || 1,
		inclui_guia: dados.inclui_guia ? 1 : 0,
		inclui_transporte: dados.inclui_transporte ? 1 : 0,
		inclui_refeicao: dados.inclui_refeicao ? 1 : 0,
		ponto_encontro: dados.ponto_encontro || "",
		dias_disponiveis: dados.dias_disponiveis || [],
		horarios: dados.horarios || [],
		inclusoes: dados.inclusoes || [],
		requisitos: dados.requisitos || [],
		idiomas: dados.idiomas || [],
		imagens: dados.imagens || []
	};
	console.log(`📤 Salvando ${isEdicao ? "edição" : "nova"} experiência:`, payload);
	const result = isEdicao ? await atualizarExperiencia(experienciaId, payload) : await registrarExperiencia(payload);
	if (result.success) return {
		success: true,
		message: isEdicao ? "Experiência atualizada com sucesso!" : "Experiência registada com sucesso!",
		data: { experiencia_id: result.data?.experiencia_id || result.data?.id || result.experiencia_id || result.id || experienciaId }
	};
	throw new Error(result.message || "Falha ao processar requisição");
}
async function buscarExperienciaParaEdicao(id) {
	return apiRequest(`/experiencia/buscar.php?id=${encodeURIComponent(id)}&edicao=1`, "GET");
}
var experienciaApiService_default = {
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
//#endregion
export { atualizarExperiencia, buscarCategorias, buscarExperiencia, buscarExperienciaParaEdicao, experienciaApiService_default as default, excluirExperiencia, listarExperiencias, registrarExperiencia, removerImagemExperiencia, salvarFluxoExperiencia, uploadImagemExperiencia };
