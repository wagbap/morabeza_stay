//#region \0api
const send = async (config) => {
	globalThis.__authRequests.push(config);
	if (globalThis.__authError) throw globalThis.__authError;
	return { data: {
		success: true,
		data: { id: 20 },
		configuracoes: []
	} };
};
var _api_default = {
	post: (url, data, config) => send({
		...config,
		url,
		data
	}),
	request: send
};
//#endregion
//#region node_modules/jwt-decode/build/esm/index.js
var InvalidTokenError = class extends Error {};
InvalidTokenError.prototype.name = "InvalidTokenError";
function b64DecodeUnicode(str) {
	return decodeURIComponent(atob(str).replace(/(.)/g, (m, p) => {
		let code = p.charCodeAt(0).toString(16).toUpperCase();
		if (code.length < 2) code = "0" + code;
		return "%" + code;
	}));
}
function base64UrlDecode(str) {
	let output = str.replace(/-/g, "+").replace(/_/g, "/");
	switch (output.length % 4) {
		case 0: break;
		case 2:
			output += "==";
			break;
		case 3:
			output += "=";
			break;
		default: throw new Error("base64 string is not of the correct length");
	}
	try {
		return b64DecodeUnicode(output);
	} catch (err) {
		return atob(output);
	}
}
function jwtDecode(token, options) {
	if (typeof token !== "string") throw new InvalidTokenError("Invalid token specified: must be a string");
	options || (options = {});
	const pos = options.header === true ? 0 : 1;
	const part = token.split(".")[pos];
	if (typeof part !== "string") throw new InvalidTokenError(`Invalid token specified: missing part #${pos + 1}`);
	let decoded;
	try {
		decoded = base64UrlDecode(part);
	} catch (e) {
		throw new InvalidTokenError(`Invalid token specified: invalid base64 for part #${pos + 1} (${e.message})`);
	}
	try {
		return JSON.parse(decoded);
	} catch (e) {
		throw new InvalidTokenError(`Invalid token specified: invalid json for part #${pos + 1} (${e.message})`);
	}
}
//#endregion
//#region src/utils/tokenValidacaoReserva.js
function obterTokenValidacao(storage, contexto, apenasSessao = false) {
	const read = (key) => {
		try {
			return storage.getItem(key);
		} catch {
			return null;
		}
	};
	if (contexto === "host") return (apenasSessao ? [
		"token",
		"morabeza_token",
		"access_token",
		"jwt"
	] : [
		"reserva_validation_token",
		"token",
		"morabeza_token",
		"access_token",
		"jwt"
	]).map(read).map((value) => typeof value === "string" ? value.trim() : "").find((value) => {
		if (!value) return false;
		if (value.split(".").length !== 3) return true;
		try {
			const claims = jwtDecode(value);
			return typeof claims.exp === "number" && claims.exp > Date.now() / 1e3;
		} catch {
			return false;
		}
	}) || null;
	if (contexto !== "admin") throw new Error("Unknown validation context");
	let admin;
	try {
		admin = JSON.parse(read("morabeza_admin") || "{}");
	} catch {
		admin = {};
	}
	return admin?.token || read("admin_token") || null;
}
//#endregion
//#region src/services/agendaExperiencias.js
async function pedirAgendaExperiencia(payload, signal) {
	const token = obterTokenValidacao(localStorage, "host", true) || obterTokenValidacao(localStorage, "host");
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
