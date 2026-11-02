//#region \0api
var _api_default = { post: async () => ({ data: {
	success: false,
	error: "Legacy conflict",
	code: "LEGACY_SESSION_CONFLICT",
	conflitos: [{
		id: 99,
		pode_ligar: true
	}]
} }) };
//#endregion
//#region \0token
const obterTokenValidacao = () => null;
//#endregion
//#region src/services/agendaExperiencias.js
async function pedirAgendaExperiencia(payload, signal) {
	const token = obterTokenValidacao(localStorage, "host");
	const { data } = await _api_default.post("/agenda_experiencias.php", payload, {
		signal,
		timeout: 6e4,
		headers: token ? { Authorization: `Bearer ${token}` } : {}
	});
	if (!data.success) throw Object.assign(new Error(data.error || "AGENDA_FAILED"), {
		response: { data },
		code: data.code
	});
	return data;
}
//#endregion
export { pedirAgendaExperiencia };
