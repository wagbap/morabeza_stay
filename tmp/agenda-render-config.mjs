import React, { useEffect, useId, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Box, Cake, CalendarDays, ChartNoAxesColumn, ChevronDown, ChevronRight, CircleAlert, CircleCheck, Clock, Coffee, Ellipsis, Info, List, Luggage, Minus, Pause, Pencil, Plus, RefreshCw, Search, Settings, Trash2, Users, Waves, Wrench, X } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region \0date
function DateField(props) {
	return React.createElement("input", {
		...props,
		type: "date"
	});
}
//#endregion
//#region \0service
async function pedirAgendaExperiencia() {
	throw new Error("SSR must not fetch");
}
//#endregion
//#region src/components/gest/guardarAgendaExperiencia.js
/** Save the initial working agenda before its first departure configuration. */
async function guardarAlteracaoAgenda(request, action, dados, agendaInicial, onAgendaSaved) {
	if (action === "guardar_configuracao" && agendaInicial) onAgendaSaved(await request("guardar_agenda", dados.ligar_sessoes_legadas ? {
		...agendaInicial,
		ligar_sessoes_legadas: dados.ligar_sessoes_legadas
	} : agendaInicial));
	return request(action, dados);
}
//#endregion
//#region src/components/gest/sessoesConfiguracao.js
const minutosHora = (value) => {
	if (!/^\d{2}:\d{2}$/.test(value || "")) return NaN;
	const [h, m] = value.split(":").map(Number);
	return h < 24 && m < 60 ? h * 60 + m : NaN;
};
const horaMinutos = (n) => `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
function gerarHorarios({ abertura, fecho, intervalo, duracao_minutos }) {
	const start = minutosHora(abertura), end = minutosHora(fecho), step = Number(intervalo), duration = Number(duracao_minutos);
	if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start || step < 1 || duration < 1) return [];
	const result = [];
	for (let n = start; n + duration <= end && n + duration < 1440; n += step) result.push(horaMinutos(n));
	return result;
}
function lerConfiguracao(value, defaults = {}) {
	const parse = (v, fallback) => {
		try {
			return typeof v === "string" ? JSON.parse(v) : v ?? fallback;
		} catch {
			return fallback;
		}
	};
	const starts = parse(value?.horarios_json, []).slice().sort();
	const duration = Number(value?.duracao_minutos || 15);
	const options = parse(value?.opcoes_json, {});
	return {
		nome: defaults.nome || "",
		duracao_minutos: duration,
		preco: defaults.preco || 0,
		capacidade: defaults.capacidade || 1,
		unidade: defaults.unidade || "participante",
		ativo: 1,
		...value,
		recursos: parse(value?.recursos_json, defaults.recursos || []),
		horarios: starts.length ? starts : ["08:00"],
		metodo: options.metodo || "intervalos",
		abertura: options.abertura || starts[0] || "08:00",
		fecho: options.fecho || (starts.length ? horaMinutos(minutosHora(starts.at(-1)) + duration) : "11:00"),
		intervalo: Number(options.intervalo || duration),
		preparacao: Number(options.preparacao || 0)
	};
}
function payloadConfiguracao(form) {
	return {
		...form,
		horarios: [...new Set(form.horarios)].sort(),
		opcoes: {
			metodo: form.metodo,
			abertura: form.abertura,
			fecho: form.fecho,
			intervalo: Number(form.intervalo),
			preparacao: Number(form.preparacao)
		}
	};
}
//#endregion
//#region src/components/gest/EditorConfiguracaoExperiencia.jsx
function EditorConfiguracaoExperiencia({ form, setForm, resources, daysText, agenda, first, busy, onSave, onClose, onAgenda, onResources }) {
	const { t } = useTranslation();
	const tr = (key, value, args = {}) => t(`agenda_experiencia_${key}`, {
		defaultValue: value,
		...args
	});
	const icon = (C, size = 18) => /* @__PURE__ */ jsx("span", {
		className: "inline-flex shrink-0",
		children: /* @__PURE__ */ jsx(C, { size })
	});
	const input = "mt-1 min-h-10 w-full rounded-md border border-[#d6deeb] bg-white px-3 py-2 text-sm outline-none focus:border-blue-500";
	const button = "inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border border-[#d6deeb] px-4 py-2 text-sm font-semibold text-[#07144d] hover:bg-blue-50 disabled:opacity-50";
	const notice = (text, warning = false) => /* @__PURE__ */ jsxs("div", {
		className: `flex items-center gap-3 rounded-md border px-3 py-2 text-sm ${warning ? "border-amber-200 bg-amber-50 text-orange-600" : "border-blue-200 bg-[#e8f4ff] text-blue-600"}`,
		children: [icon(warning ? CircleAlert : Info), text]
	});
	const field = (label, name, type = "number", props = {}) => /* @__PURE__ */ jsxs("label", {
		className: "block text-sm",
		children: [label, /* @__PURE__ */ jsx("input", {
			className: input,
			type,
			value: form[name],
			onChange: (e) => change({ [name]: e.target.value }),
			...props
		})]
	});
	const candidates = gerarHorarios(form);
	const offered = form.metodo === "saidas" ? [...new Set([...candidates, ...form.horarios])].sort() : candidates;
	const change = (patch) => setForm((old) => {
		const next = {
			...old,
			...patch
		};
		if ([
			"abertura",
			"fecho",
			"intervalo",
			"duracao_minutos"
		].some((k) => k in patch) && next.metodo === "intervalos") next.horarios = gerarHorarios(next);
		return next;
	});
	const minutesField = (text, name, choices) => /* @__PURE__ */ jsxs("label", {
		className: "block text-sm",
		children: [
			text,
			/* @__PURE__ */ jsxs("select", {
				className: input,
				value: choices.includes(Number(form[name])) && form[name] !== "" ? Number(form[name]) : "custom",
				onChange: (e) => change({ [name]: e.target.value === "custom" ? "" : Number(e.target.value) }),
				children: [choices.map((n) => /* @__PURE__ */ jsx("option", {
					value: n,
					children: n < 60 || n % 60 ? tr("duracao_minutos", "{{count}} minutos", { count: n }) : tr("duracao_horas", "{{count}} horas", { count: n / 60 })
				}, n)), /* @__PURE__ */ jsx("option", {
					value: "custom",
					children: tr("personalizar_minutos", "Personalizar minutos")
				})]
			}),
			(!choices.includes(Number(form[name])) || form[name] === "") && /* @__PURE__ */ jsx("input", {
				required: true,
				type: "number",
				min: name === "preparacao" ? 0 : 1,
				max: name === "preparacao" ? 720 : 1439,
				value: form[name],
				className: input,
				onChange: (e) => change({ [name]: e.target.value })
			})
		]
	});
	const pool = resources.find((r) => r.tipo === "equipamento" && form.recursos.includes(Number(r.id)));
	return /* @__PURE__ */ jsxs("form", {
		className: "space-y-2.5 text-[#070d49]",
		onSubmit: (e) => {
			e.preventDefault();
			onSave();
		},
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap items-center justify-between gap-2 rounded-md border border-blue-200 bg-[#e8f4ff] px-3 py-2 text-sm",
				children: [/* @__PURE__ */ jsxs("span", {
					className: "flex items-center gap-3",
					children: [
						icon(CalendarDays),
						daysText,
						" · ",
						tr("a_partir", "A partir de"),
						" ",
						agenda.inicio?.split("-").reverse().join("/"),
						" · ",
						agenda.fim ? agenda.fim.split("-").reverse().join("/") : tr("sem_fim", "Sem data de fim")
					]
				}), /* @__PURE__ */ jsxs("button", {
					type: "button",
					className: "flex cursor-pointer items-center gap-2 font-semibold text-blue-600",
					onClick: onAgenda,
					children: [icon(Pencil, 16), tr("alterar_agenda", "Alterar agenda")]
				})]
			}),
			first && notice(tr("guardar_primeira", "Ao guardar a primeira configuração, também será guardada a agenda com os dias e as datas que escolheu.")),
			/* @__PURE__ */ jsxs("fieldset", {
				className: "grid gap-3 sm:grid-cols-[170px_1fr_1fr]",
				children: [
					/* @__PURE__ */ jsx("legend", {
						className: "sr-only",
						children: tr("metodo", "Método de agendamento")
					}),
					/* @__PURE__ */ jsx("strong", {
						className: "self-center text-sm",
						children: tr("metodo", "Método de agendamento")
					}),
					[[
						"intervalos",
						tr("gerar_intervalos", "Gerar intervalos"),
						tr("gerar_ajuda", "Cria automaticamente os horários disponíveis.")
					], [
						"saidas",
						tr("definir_saidas", "Definir saídas"),
						tr("saidas_manual", "Define manualmente os horários de partida.")
					]].map(([value, name, help]) => /* @__PURE__ */ jsxs("label", {
						className: "flex cursor-pointer gap-3 rounded-md border border-slate-200 p-2 text-sm",
						children: [/* @__PURE__ */ jsx("input", {
							type: "radio",
							name: "metodo",
							checked: form.metodo === value,
							onChange: () => change({ metodo: value }),
							className: "h-5 w-5 accent-blue-600"
						}), /* @__PURE__ */ jsxs("span", { children: [name, /* @__PURE__ */ jsx("small", {
							className: "mt-1 block text-xs text-slate-500",
							children: help
						})] })]
					}, value))
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid gap-4 sm:grid-cols-3",
				children: [
					minutesField(tr("duracao_reserva_curta", "Duração de cada reserva"), "duracao_minutos", [
						5,
						10,
						15,
						20,
						30,
						45,
						60,
						90,
						120,
						180
					]),
					field(form.unidade === "unidade" ? tr("preco_mota", "Preço por mota (CVE)") : tr("preco_participante", "Preço por participante (CVE)"), "preco", "number", {
						required: true,
						min: 0,
						step: "0.01"
					}),
					/* @__PURE__ */ jsxs("label", {
						className: "block text-sm",
						children: [tr("modelo_reserva", "Modelo de reserva"), /* @__PURE__ */ jsxs("select", {
							className: input,
							value: form.unidade,
							onChange: (e) => {
								const unidade = e.target.value;
								const pool = resources.find((r) => r.tipo === "equipamento");
								setForm((old) => ({
									...old,
									unidade,
									...unidade === "unidade" && !old.recursos.length && pool ? {
										recursos: [Number(pool.id)],
										capacidade: Number(pool.quantidade)
									} : {}
								}));
							},
							children: [/* @__PURE__ */ jsx("option", {
								value: "participante",
								children: tr("por_participante", "Por participante")
							}), /* @__PURE__ */ jsx("option", {
								value: "unidade",
								children: tr("por_equipamento_duracao", "Por equipamento e duração")
							})]
						})]
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-2 gap-4 lg:grid-cols-4",
				children: [
					field(tr("abertura", "Abertura"), "abertura", "time", {
						required: true,
						step: 60
					}),
					field(tr("fecho_hora", "Fecho"), "fecho", "time", {
						required: true,
						step: 60
					}),
					minutesField(tr("intervalo_inicios_curto", "Intervalo entre inícios"), "intervalo", [
						5,
						10,
						15,
						20,
						30,
						45,
						60,
						90,
						120
					]),
					minutesField(tr("preparacao_curta", "Preparação após cada reserva"), "preparacao", [
						0,
						5,
						10,
						15,
						20,
						30,
						45,
						60
					])
				]
			}),
			notice(tr("duracao_intervalo", "Duração e intervalo entre inícios são configurações diferentes.")),
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 text-sm",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("strong", { children: tr("stock_label", "Stock partilhado") }), /* @__PURE__ */ jsx("span", {
					className: "ml-4 text-slate-500",
					children: pool ? tr("stock_pessoas", "{{count}} motas no total · até 2 pessoas por mota", { count: Number(pool.quantidade) }) : tr("associar_recurso", "Associe o equipamento utilizado nesta configuração.")
				})] }), /* @__PURE__ */ jsxs("button", {
					type: "button",
					className: "flex cursor-pointer items-center gap-2 font-semibold text-blue-600",
					onClick: onResources,
					children: [icon(Settings), tr("gerir_equipamentos", "Gerir equipamentos")]
				})]
			}),
			/* @__PURE__ */ jsxs("details", {
				className: "rounded-md border border-slate-200 px-3 py-2",
				children: [/* @__PURE__ */ jsx("summary", {
					className: "cursor-pointer text-sm",
					children: tr("dados_config", "Nome, capacidade e recursos associados")
				}), /* @__PURE__ */ jsxs("div", {
					className: "mt-3 grid gap-3 sm:grid-cols-2",
					children: [
						field(tr("nome", "Nome da configuração *"), "nome", "text", {
							required: true,
							maxLength: 150
						}),
						field(tr("capacidade_campo", "Capacidade por saída *"), "capacidade", "number", {
							required: true,
							min: 1,
							max: 1e4
						}),
						/* @__PURE__ */ jsxs("fieldset", { children: [/* @__PURE__ */ jsx("legend", {
							className: "text-sm",
							children: tr("recursos_associados", "Recursos associados")
						}), resources.map((r) => /* @__PURE__ */ jsxs("label", {
							className: "mt-2 flex items-center gap-2 text-sm",
							children: [
								/* @__PURE__ */ jsx("input", {
									type: "checkbox",
									checked: form.recursos.includes(Number(r.id)),
									onChange: (e) => setForm((old) => ({
										...old,
										recursos: e.target.checked ? [...old.recursos, Number(r.id)] : old.recursos.filter((id) => id !== Number(r.id))
									}))
								}),
								r.nome,
								" (",
								r.quantidade,
								")"
							]
						}, r.id))] })
					]
				})]
			}),
			form.metodo === "saidas" && /* @__PURE__ */ jsxs("label", {
				className: "block text-sm",
				children: [tr("adicionar_saida", "Adicionar hora de partida"), /* @__PURE__ */ jsx("input", {
					type: "time",
					step: "60",
					className: input,
					onChange: (e) => {
						const start = e.target.value;
						if (start && !form.horarios.includes(start)) setForm((old) => ({
							...old,
							horarios: [...old.horarios, start].sort()
						}));
					}
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ jsxs("h3", {
					className: "text-xl font-bold",
					children: [
						tr("oferecidos", "Horários oferecidos"),
						" ",
						/* @__PURE__ */ jsx("small", {
							className: "ml-3 text-sm font-normal text-slate-500",
							children: tr("selecionados_de", "{{count}} de {{total}} selecionados", {
								count: form.horarios.length,
								total: offered.length
							})
						})
					]
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex gap-4 text-xs text-blue-600 underline",
					children: [/* @__PURE__ */ jsx("button", {
						type: "button",
						className: "cursor-pointer",
						onClick: () => change({ horarios: offered }),
						children: tr("selecionar_todos", "Selecionar todos")
					}), /* @__PURE__ */ jsx("button", {
						type: "button",
						className: "cursor-pointer",
						onClick: () => change({ horarios: [] }),
						children: tr("limpar_selecao", "Limpar seleção")
					})]
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-2 gap-2 sm:grid-cols-3",
				children: offered.map((start) => /* @__PURE__ */ jsxs("label", {
					className: `flex cursor-pointer items-center gap-4 rounded-md border px-3 py-1.5 text-sm ${form.horarios.includes(start) ? "border-blue-200 bg-[#e5f2ff]" : "border-slate-200"}`,
					children: [
						/* @__PURE__ */ jsx("input", {
							type: "checkbox",
							checked: form.horarios.includes(start),
							onChange: (e) => change({ horarios: e.target.checked ? [...form.horarios, start].sort() : form.horarios.filter((v) => v !== start) }),
							className: "h-5 w-5 accent-blue-600"
						}),
						start,
						" – ",
						horaMinutos(minutosHora(start) + Number(form.duracao_minutos))
					]
				}, start))
			}),
			/* @__PURE__ */ jsxs("label", {
				className: "flex cursor-pointer items-center justify-between border-t border-slate-200 pt-3 text-sm",
				children: [
					/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("strong", { children: tr("config_ativa", "Configuração ativa") }), /* @__PURE__ */ jsx("small", {
						className: "mt-1 block text-slate-500",
						children: tr("config_ativa_ajuda", "Esta configuração gera os horários selecionados.")
					})] }),
					/* @__PURE__ */ jsx("input", {
						type: "checkbox",
						checked: Boolean(Number(form.ativo)),
						onChange: (e) => change({ ativo: e.target.checked ? 1 : 0 }),
						className: "peer sr-only"
					}),
					/* @__PURE__ */ jsx("span", {
						"aria-hidden": "true",
						className: "relative h-7 w-12 rounded-full bg-slate-300 after:absolute after:left-0.5 after:top-0.5 after:h-6 after:w-6 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-blue-600 peer-checked:after:translate-x-5"
					})
				]
			}),
			notice(tr("confirmadas_preservadas", "Reservas confirmadas mantêm preço e horário. Reveja o impacto antes de aplicar."), true),
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-4 text-sm",
				children: [/* @__PURE__ */ jsx("strong", { children: tr("aplicar_a", "Aplicar alterações a") }), /* @__PURE__ */ jsx("select", {
					className: `${input} flex-1`,
					value: "futuro",
					readOnly: true,
					children: /* @__PURE__ */ jsx("option", {
						value: "futuro",
						children: tr("proximos_dias", "Próximos dias desta configuração")
					})
				})]
			}),
			!form.horarios.length && notice(tr("selecione_horarios", "Selecione pelo menos um horário."), true),
			/* @__PURE__ */ jsxs("footer", {
				className: "flex justify-end gap-3 pt-1",
				children: [/* @__PURE__ */ jsx("button", {
					type: "button",
					className: button,
					onClick: onClose,
					children: tr("cancelar", "Cancelar")
				}), /* @__PURE__ */ jsx("button", {
					disabled: busy || !form.horarios.length,
					className: `${button} border-transparent! bg-[#123b9e] text-white!`,
					children: tr("rever", "Rever alterações")
				})]
			})
		]
	});
}
//#endregion
//#region src/components/gest/EquipamentosExperiencia.jsx
function EquipamentosExperiencia({ resources, day, DateField, busy, onEdit, onSave, onReview }) {
	const { t } = useTranslation();
	const tr = (k, text, args = {}) => t(`agenda_experiencia_${k}`, {
		defaultValue: text,
		...args
	});
	const [poolId, setPoolId] = useState(resources.find((r) => r.tipo === "equipamento")?.id || "");
	const pool = resources.find((r) => String(r.id) === String(poolId));
	const parse = (r) => {
		try {
			return JSON.parse(r?.manutencoes_json || "[]");
		} catch {
			return [];
		}
	};
	const [filter, setFilter] = useState(day), [editing, setEditing] = useState(null);
	const empty = () => ({
		inicio: day,
		fim: day,
		hora_inicio: "09:00",
		hora_fim: "11:00",
		quantidade: 1,
		motivo: "manutencao",
		nota: ""
	});
	const [block, setBlock] = useState(empty), [all, setAll] = useState(false), [impact, setImpact] = useState(null), [error, setError] = useState("");
	const revision = useRef(0);
	const [checking, setChecking] = useState(false);
	useEffect(() => {
		revision.current++;
		setImpact(null);
	}, [
		block,
		all,
		poolId
	]);
	const quantity = !pool ? 0 : all ? Number(pool.quantidade) : Number(block.quantidade);
	const items = parse(pool);
	const icon = (C, size = 20) => /* @__PURE__ */ jsx("span", {
		className: "inline-flex shrink-0",
		children: /* @__PURE__ */ jsx(C, { size })
	});
	const input = "mt-1 min-h-10 w-full rounded-md border border-[#d6deeb] bg-white px-3 py-2 text-sm outline-none focus:border-blue-500";
	const button = "inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border border-[#d6deeb] px-4 py-2 text-sm font-semibold hover:bg-blue-50 disabled:opacity-50";
	const info = (text, warning = false) => /* @__PURE__ */ jsxs("aside", {
		className: `flex items-center gap-3 rounded-md border px-3 py-2 text-sm ${warning ? "border-amber-200 bg-amber-50 text-orange-600" : "border-blue-200 bg-[#e8f4ff] text-blue-600"}`,
		children: [icon(warning ? CircleAlert : Info), /* @__PURE__ */ jsx("span", { children: text })]
	});
	const draft = (next) => ({
		...pool,
		manutencoes: next
	});
	const reset = () => {
		setBlock(empty());
		setAll(false);
		setEditing(null);
		setImpact(null);
		setError("");
	};
	const check = async (e) => {
		e.preventDefault();
		setError("");
		setImpact(null);
		setChecking(true);
		const currentRevision = ++revision.current;
		const next = {
			...block,
			quantidade: quantity
		};
		const maintenance = editing === null ? [...items, next] : items.map((m, i) => i === editing ? next : m);
		try {
			const result = await onReview({
				...draft(maintenance),
				impacto_alvo: next
			});
			if (currentRevision === revision.current) setImpact({
				resource: draft(maintenance),
				result
			});
		} catch (e) {
			if (currentRevision === revision.current) setError(e.response?.data?.error || e.message);
		} finally {
			setChecking(false);
		}
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-3.5 text-[#070d49]",
		children: [
			resources.filter((r) => r.tipo === "equipamento").length > 1 && /* @__PURE__ */ jsxs("label", {
				className: "block text-sm",
				children: [tr("equipamento", "Equipamento"), /* @__PURE__ */ jsx("select", {
					className: input,
					value: poolId,
					onChange: (e) => {
						setPoolId(e.target.value);
						reset();
					},
					children: resources.filter((r) => r.tipo === "equipamento").map((r) => /* @__PURE__ */ jsx("option", {
						value: r.id,
						children: r.nome
					}, r.id))
				})]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "rounded-lg border border-slate-200 p-3",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "grid items-center gap-3 sm:grid-cols-[1fr_1.5fr_auto]",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3",
							children: [icon(Box, 30), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
								className: "text-sm",
								children: tr("stock_total", "Stock total")
							}), /* @__PURE__ */ jsx("strong", {
								className: "text-3xl",
								children: pool?.quantidade || 0
							})] })]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3",
							children: [icon(Users, 30), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
								className: "text-sm",
								children: tr("pessoas_mota", "Pessoas por mota")
							}), /* @__PURE__ */ jsx("strong", {
								className: "text-3xl",
								children: "2"
							})] })]
						}),
						/* @__PURE__ */ jsxs("button", {
							className: button,
							onClick: () => onEdit(pool),
							children: [icon(Pencil, 17), tr("editar_equipamento", "Editar dados do equipamento")]
						})
					]
				}), /* @__PURE__ */ jsx("div", {
					className: "mt-3",
					children: info(tr("stock_alterar", "Alterar o total exige verificar reservas futuras."), true)
				})]
			}),
			!pool && info(tr("criar_equipamento", "Crie o equipamento e indique o stock total antes de registar bloqueios.")),
			/* @__PURE__ */ jsxs("section", {
				className: "rounded-lg border border-slate-200 p-3",
				children: [/* @__PURE__ */ jsxs("header", {
					className: "mb-3 flex flex-wrap items-center justify-between gap-3",
					children: [/* @__PURE__ */ jsxs("h3", {
						className: "flex items-center gap-3 text-lg font-bold",
						children: [icon(CalendarDays, 25), tr("bloqueios_registados", "Bloqueios registados")]
					}), /* @__PURE__ */ jsxs("label", {
						className: "flex items-center gap-3 text-sm text-slate-500",
						children: [tr("filtrar_data", "Filtrar por data"), /* @__PURE__ */ jsx("div", {
							className: "w-44",
							children: /* @__PURE__ */ jsx(DateField, {
								value: filter,
								onChange: (e) => setFilter(e.target.value),
								className: input
							})
						})]
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "overflow-x-auto",
					children: [/* @__PURE__ */ jsxs("table", {
						className: "w-full min-w-[670px] text-left text-sm",
						children: [/* @__PURE__ */ jsx("thead", {
							className: "bg-slate-50 text-xs",
							children: /* @__PURE__ */ jsx("tr", { children: [
								"Data",
								"Horário",
								"Quantidade",
								"Motivo",
								"Estado",
								"Ações"
							].map((v, i) => /* @__PURE__ */ jsx("th", {
								className: "px-3 py-2",
								children: tr([
									"data",
									"hora_tabela",
									"quantidade",
									"motivo_curto",
									"estado",
									"acoes"
								][i], v)
							}, v)) })
						}), /* @__PURE__ */ jsx("tbody", { children: items.map((m, index) => !filter || filter >= m.inicio && filter <= m.fim ? /* @__PURE__ */ jsxs("tr", {
							className: "border-b border-slate-100",
							children: [
								/* @__PURE__ */ jsxs("td", {
									className: "whitespace-nowrap px-3 py-1.5",
									children: [m.inicio.split("-").reverse().join("/"), m.fim !== m.inicio && ` – ${m.fim.split("-").reverse().join("/")}`]
								}),
								/* @__PURE__ */ jsxs("td", {
									className: "whitespace-nowrap px-3 py-1.5",
									children: [
										m.hora_inicio,
										" – ",
										m.hora_fim
									]
								}),
								/* @__PURE__ */ jsxs("td", {
									className: "px-3 py-1.5",
									children: [
										m.quantidade,
										" ",
										tr("unidades", "unidades")
									]
								}),
								/* @__PURE__ */ jsx("td", {
									className: "px-3 py-1.5",
									children: tr(`motivo_${m.motivo || "manutencao"}`, m.motivo || "Manutenção")
								}),
								/* @__PURE__ */ jsx("td", {
									className: "px-3 py-1.5",
									children: /* @__PURE__ */ jsx("span", {
										className: "rounded-md bg-amber-50 px-2 py-1 text-orange-600",
										children: (/* @__PURE__ */ new Date(`${m.fim}T${m.hora_fim}:00-01:00`)).getTime() < Date.now() ? tr("terminado", "Terminado") : tr("agendado", "Agendado")
									})
								}),
								/* @__PURE__ */ jsx("td", {
									className: "px-3 py-1.5",
									children: /* @__PURE__ */ jsxs("div", {
										className: "flex gap-2",
										children: [/* @__PURE__ */ jsxs("button", {
											disabled: busy,
											className: button,
											onClick: () => {
												setBlock({
													...empty(),
													...m
												});
												setEditing(index);
												setAll(false);
												setImpact(null);
											},
											children: [icon(Pencil, 16), tr("editar", "Editar")]
										}), /* @__PURE__ */ jsxs("button", {
											disabled: busy,
											className: `${button} border-red-200! text-red-600`,
											onClick: () => onSave(draft(items.filter((_, i) => i !== index))),
											children: [icon(Trash2, 16), tr("remover_curto", "Remover")]
										})]
									})
								})
							]
						}, index) : null) })]
					}), !items.some((m) => !filter || filter >= m.inicio && filter <= m.fim) && /* @__PURE__ */ jsx("p", {
						className: "p-4 text-sm text-slate-500",
						children: tr("sem_bloqueios", "Sem bloqueios nesta data.")
					})]
				})]
			}),
			/* @__PURE__ */ jsxs("form", {
				onSubmit: check,
				className: "space-y-3 rounded-lg border border-slate-200 p-4",
				children: [
					/* @__PURE__ */ jsxs("h3", {
						className: "flex items-center gap-3 text-lg font-bold",
						children: [icon(Plus, 24), editing === null ? tr("novo_bloqueio", "Novo bloqueio parcial") : tr("editar_bloqueio", "Editar bloqueio")]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-2 gap-3 lg:grid-cols-[1fr_1.1fr_.85fr_.85fr_1.2fr]",
						children: [
							/* @__PURE__ */ jsxs("label", {
								className: "text-sm",
								children: [
									tr("quantidade_retirar", "Quantidade a retirar"),
									/* @__PURE__ */ jsxs("span", {
										className: "mt-1 flex min-h-10 items-center rounded-md border border-slate-200",
										children: [
											/* @__PURE__ */ jsx("button", {
												disabled: quantity <= 1 || all,
												type: "button",
												className: "cursor-pointer px-3 disabled:opacity-30",
												onClick: () => setBlock((v) => ({
													...v,
													quantidade: Math.max(1, quantity - 1)
												})),
												children: icon(Minus, 17)
											}),
											/* @__PURE__ */ jsx("output", {
												className: "flex-1 text-center font-bold",
												children: quantity
											}),
											/* @__PURE__ */ jsx("button", {
												disabled: all || quantity >= Number(pool?.quantidade || 0),
												type: "button",
												className: "cursor-pointer px-3 disabled:opacity-30",
												onClick: () => setBlock((v) => ({
													...v,
													quantidade: quantity + 1
												})),
												children: icon(Plus, 17)
											})
										]
									}),
									/* @__PURE__ */ jsx("small", {
										className: "block text-center text-xs text-slate-500",
										children: tr("maximo_numero", "Máximo: {{count}}", { count: Number(pool?.quantidade || 0) })
									})
								]
							}),
							/* @__PURE__ */ jsxs("label", {
								className: "text-sm",
								children: [tr("data", "Data"), /* @__PURE__ */ jsx(DateField, {
									required: true,
									value: block.inicio,
									onChange: (e) => {
										setImpact(null);
										setBlock((v) => ({
											...v,
											inicio: e.target.value,
											fim: e.target.value
										}));
									},
									className: input
								})]
							}),
							[["hora_inicio", tr("inicio_curto", "Início")], ["hora_fim", tr("fim_curto", "Fim")]].map(([key, title]) => /* @__PURE__ */ jsxs("label", {
								className: "text-sm",
								children: [title, /* @__PURE__ */ jsx("input", {
									required: true,
									type: "time",
									step: "60",
									value: block[key],
									onChange: (e) => {
										setImpact(null);
										setBlock((v) => ({
											...v,
											[key]: e.target.value
										}));
									},
									className: input
								})]
							}, key)),
							/* @__PURE__ */ jsxs("label", {
								className: "text-sm",
								children: [tr("motivo", "Motivo *"), /* @__PURE__ */ jsx("select", {
									required: true,
									className: input,
									value: block.motivo,
									onChange: (e) => setBlock((v) => ({
										...v,
										motivo: e.target.value
									})),
									children: [
										"manutencao",
										"avaria",
										"indisponibilidade",
										"outro"
									].map((k) => /* @__PURE__ */ jsx("option", {
										value: k,
										children: tr(`motivo_${k}`, {
											manutencao: "Manutenção",
											avaria: "Avaria",
											indisponibilidade: "Indisponibilidade",
											outro: "Outro"
										}[k])
									}, k))
								})]
							})
						]
					}),
					/* @__PURE__ */ jsxs("label", {
						className: "block text-sm",
						children: [tr("nota_interna", "Nota interna (opcional)"), /* @__PURE__ */ jsx("textarea", {
							className: input,
							maxLength: 500,
							value: block.nota,
							onChange: (e) => setBlock((v) => ({
								...v,
								nota: e.target.value
							})),
							placeholder: tr("descreva_motivo", "Descreva o motivo")
						})]
					}),
					/* @__PURE__ */ jsxs("label", {
						className: "flex cursor-pointer items-start gap-3 text-sm",
						children: [/* @__PURE__ */ jsx("input", {
							type: "checkbox",
							className: "h-5 w-5 accent-blue-600",
							checked: all,
							onChange: (e) => {
								setAll(e.target.checked);
								setImpact(null);
							}
						}), /* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("strong", { children: tr("bloquear_todos", "Bloquear todos os equipamentos") }), /* @__PURE__ */ jsx("small", {
							className: "block text-xs text-slate-500",
							children: tr("bloquear_todos_ajuda", "Remove todo o stock neste período.")
						})] })]
					}),
					info(/* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("strong", { children: tr("saldo_manutencao", "Neste período: {{total}} no total − {{blocked}} em manutenção = {{free}} antes das reservas.", {
						total: Number(pool?.quantidade || 0),
						blocked: quantity,
						free: Math.max(0, Number(pool?.quantidade || 0) - quantity)
					}) }), /* @__PURE__ */ jsx("small", {
						className: "mt-1 block",
						children: tr("descontar_existentes", "Reservas e retenções existentes ainda serão descontadas.")
					})] })),
					error && /* @__PURE__ */ jsx("p", {
						role: "alert",
						className: "text-sm text-red-600",
						children: error
					}),
					impact && info(tr("impacto_resultado", "{{count}} saídas afetadas. {{confirmed}} unidades confirmadas e {{pending}} em pagamento nos horários afetados. As reservas existentes serão preservadas.", impact.result)),
					/* @__PURE__ */ jsxs("footer", {
						className: "flex flex-wrap items-center gap-3",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "min-w-[200px] flex-1",
								children: info(tr("verifique_impacto", "Antes de confirmar, verifique reservas afetadas. O bloqueio não cancela reservas."), true)
							}),
							/* @__PURE__ */ jsx("button", {
								type: "button",
								className: button,
								onClick: reset,
								children: tr("cancelar", "Cancelar")
							}),
							impact ? /* @__PURE__ */ jsx("button", {
								type: "button",
								disabled: busy,
								className: `${button} border-transparent! bg-[#123b9e] text-white!`,
								onClick: () => onSave(impact.resource),
								children: tr("confirmar_bloqueio", "Confirmar bloqueio")
							}) : /* @__PURE__ */ jsx("button", {
								disabled: busy || checking || !pool,
								className: `${button} border-transparent! bg-[#123b9e] text-white!`,
								children: tr("verificar_impacto", "Verificar impacto")
							})
						]
					}),
					info(tr("fim_bloqueio_ajuda", "Após o fim do bloqueio, as unidades regressam à disponibilidade se não existir outro impedimento."))
				]
			})
		]
	});
}
//#endregion
//#region src/components/gest/ConflitosSessoesLegadas.jsx
function ConflitosSessoesLegadas({ conflitos, busy, onLink, onEdit, onCancel }) {
	const { t } = useTranslation();
	const tr = (key, text, args = {}) => t(`agenda_experiencia_${key}`, {
		defaultValue: text,
		...args
	});
	const canLink = conflitos.length > 0 && conflitos.every((c) => c.pode_ligar);
	const button = "cursor-pointer rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50";
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ jsx("p", {
				className: "text-sm text-slate-600",
				children: tr("conflitos_explicacao", "Mesmo sem reservas, uma sessão antiga pode ocupar este horário. Reveja as sessões abaixo antes de continuar.")
			}),
			/* @__PURE__ */ jsx("div", {
				className: "max-h-[40dvh] overflow-auto rounded-md border border-slate-200",
				children: /* @__PURE__ */ jsxs("table", {
					className: "w-full min-w-[650px] text-left text-xs",
					children: [/* @__PURE__ */ jsx("thead", {
						className: "sticky top-0 bg-slate-50",
						children: /* @__PURE__ */ jsx("tr", { children: [
							tr("sessao_antiga", "Sessão antiga"),
							tr("data", "Data"),
							tr("horario_atual", "Horário atual"),
							tr("horario_proposto", "Horário proposto"),
							tr("confirmados", "Confirmados"),
							tr("pagamento", "Em pagamento"),
							tr("ligacao", "Ligação")
						].map((v) => /* @__PURE__ */ jsx("th", {
							className: "px-3 py-2",
							children: v
						}, v)) })
					}), /* @__PURE__ */ jsx("tbody", { children: conflitos.map((c) => /* @__PURE__ */ jsxs("tr", {
						className: "border-t border-slate-100",
						children: [
							/* @__PURE__ */ jsxs("td", {
								className: "px-3 py-2",
								children: [/* @__PURE__ */ jsxs("strong", { children: ["#", c.id] }), /* @__PURE__ */ jsx("small", {
									className: "block text-slate-500",
									children: c.configuracao_nome
								})]
							}),
							/* @__PURE__ */ jsx("td", {
								className: "whitespace-nowrap px-3 py-2",
								children: c.data.split("-").reverse().join("/")
							}),
							/* @__PURE__ */ jsxs("td", {
								className: "whitespace-nowrap px-3 py-2",
								children: [
									c.hora_inicio,
									" – ",
									c.hora_fim
								]
							}),
							/* @__PURE__ */ jsxs("td", {
								className: "whitespace-nowrap px-3 py-2",
								children: [
									c.hora_inicio,
									" – ",
									c.novo_fim
								]
							}),
							/* @__PURE__ */ jsx("td", {
								className: "px-3 py-2",
								children: c.confirmados
							}),
							/* @__PURE__ */ jsx("td", {
								className: "px-3 py-2",
								children: c.em_pagamento
							}),
							/* @__PURE__ */ jsx("td", {
								className: `px-3 py-2 ${c.pode_ligar ? "text-green-700" : "text-amber-700"}`,
								children: c.pode_ligar ? tr("compativel", "Compatível") : tr("ajuste_necessario", "Requer ajuste")
							})
						]
					}, `${c.id}-${c.configuracao_id}`)) })]
				})
			}),
			canLink ? /* @__PURE__ */ jsx("p", {
				className: "rounded-md bg-blue-50 p-3 text-sm text-blue-700",
				children: tr("ligar_legadas_ajuda", "A ligação reutiliza os mesmos IDs. Sessões com reservas mantêm horário, preço e capacidade. Nas sessões sem reservas serão aplicados os dados escolhidos. Nenhuma sessão será apagada.")
			}) : /* @__PURE__ */ jsx("p", {
				className: "rounded-md bg-amber-50 p-3 text-sm text-amber-800",
				children: tr("ligar_incompativeis", "Uma sessão com reservas por participante não pode ser convertida em stock de motas. Para a ligar, mantenha o modelo por participante, o horário original e preparação de zero minutos. Se várias configurações disputam a mesma sessão, ajuste os horários.")
			}),
			/* @__PURE__ */ jsxs("footer", {
				className: "flex flex-wrap justify-end gap-3",
				children: [
					/* @__PURE__ */ jsx("button", {
						disabled: busy,
						className: button,
						onClick: onCancel,
						children: tr("cancelar", "Cancelar")
					}),
					/* @__PURE__ */ jsx("button", {
						disabled: busy,
						className: button,
						onClick: onEdit,
						children: tr("ajustar_configuracao", "Ajustar configuração")
					}),
					canLink && /* @__PURE__ */ jsx("button", {
						disabled: busy,
						className: `${button} border-transparent! bg-blue-700 text-white hover:bg-blue-800!`,
						onClick: () => onLink([...new Set(conflitos.map((c) => c.id))]),
						children: tr("ligar_e_guardar", "Ligar sessões e guardar")
					})
				]
			})
		]
	});
}
//#endregion
//#region src/components/gest/MotivoFolgaLov.jsx
function MotivoFolgaLov({ value = "", onChange }) {
	const { t } = useTranslation();
	const tr = (key, text) => t(`agenda_experiencia_${key}`, text);
	const options = [
		{
			id: "ferias",
			label: tr("motivo_ferias", "Férias"),
			icon: Luggage,
			saved: "Férias"
		},
		{
			id: "manutencao",
			label: tr("motivo_manutencao", "Manutenção"),
			icon: Wrench,
			saved: "Manutenção"
		},
		{
			id: "aniversario",
			label: tr("motivo_aniversario", "Aniversário"),
			icon: Cake,
			saved: "Aniversário"
		},
		{
			id: "folga",
			label: tr("motivo_folga", "Folga"),
			icon: Coffee,
			saved: "Folga"
		},
		{
			id: "outro",
			label: tr("motivo_outro", "Outro"),
			icon: Ellipsis,
			saved: null
		}
	];
	const selected = options.find((o) => o.saved === value || o.label === value);
	const [open, setOpen] = useState(false), [query, setQuery] = useState(""), [active, setActive] = useState(-1);
	const [custom, setCustom] = useState(Boolean(value && !selected));
	const container = useRef(null), search = useRef(null), customInput = useRef(null);
	const id = useId();
	const normalize = (text) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
	const filtered = options.filter((o) => normalize(o.label).includes(normalize(query)));
	const pick = (option) => {
		setOpen(false);
		setQuery("");
		setActive(-1);
		setCustom(option.id === "outro");
		onChange(option.saved || "");
		if (option.id === "outro") requestAnimationFrame(() => customInput.current?.focus());
		else search.current?.focus();
	};
	useEffect(() => {
		const outside = (event) => {
			if (!container.current?.contains(event.target)) {
				setOpen(false);
				setQuery("");
			}
		};
		document.addEventListener("pointerdown", outside);
		return () => document.removeEventListener("pointerdown", outside);
	}, []);
	const display = open ? query : custom ? tr("motivo_outro", "Outro") : selected?.label || value;
	return /* @__PURE__ */ jsxs("div", {
		ref: container,
		onBlur: (event) => {
			if (!event.currentTarget.contains(event.relatedTarget)) {
				setOpen(false);
				setQuery("");
			}
		},
		children: [
			/* @__PURE__ */ jsx("label", {
				htmlFor: `${id}-search`,
				className: "mb-1.5 block text-base text-[#07104f]",
				children: tr("motivo", "Motivo *")
			}),
			/* @__PURE__ */ jsxs("div", {
				className: `flex h-12 items-center gap-4 rounded-md border bg-white px-5 text-[#070e50] transition ${open ? "border-[#0055ff] ring-1 ring-[#0055ff]" : "border-[#ccd8ee] focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600"}`,
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "inline-flex shrink-0",
						children: /* @__PURE__ */ jsx(Search, {
							size: 23,
							strokeWidth: 1.8,
							"aria-hidden": "true"
						})
					}),
					/* @__PURE__ */ jsx("input", {
						id: `${id}-search`,
						ref: search,
						role: "combobox",
						"aria-autocomplete": "list",
						"aria-expanded": open,
						"aria-controls": `${id}-options`,
						"aria-activedescendant": open && filtered[active] ? `${id}-${filtered[active].id}` : void 0,
						"aria-required": "true",
						required: !custom,
						value: display,
						placeholder: tr("motivo_pesquisar", "Pesquisar ou selecionar motivo..."),
						autoComplete: "off",
						className: "min-w-0 flex-1 bg-transparent py-2 text-base text-[#07104f] outline-none placeholder:text-[#6578ab]",
						onClick: () => setOpen(true),
						onChange: (event) => {
							setOpen(true);
							setQuery(event.target.value);
							setActive(0);
							setCustom(false);
							onChange("");
						},
						onKeyDown: (event) => {
							if (event.key === "Escape") {
								event.preventDefault();
								event.stopPropagation();
								setOpen(false);
								setQuery("");
							}
							if (event.key === "ArrowDown" || event.key === "ArrowUp") {
								event.preventDefault();
								setOpen(true);
								setActive((old) => filtered.length ? old < 0 ? event.key === "ArrowDown" ? 0 : filtered.length - 1 : (old + (event.key === "ArrowDown" ? 1 : -1) + filtered.length) % filtered.length : -1);
							}
							if (event.key === "Enter" && open) {
								event.preventDefault();
								if (filtered[active]) pick(filtered[active]);
							}
						}
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						tabIndex: -1,
						"aria-label": tr("motivo_abrir_lista", "Mostrar motivos"),
						"aria-expanded": open,
						className: "cursor-pointer p-1",
						onClick: () => {
							setOpen((old) => !old);
							search.current?.focus();
						},
						children: /* @__PURE__ */ jsx(ChevronDown, {
							size: 21,
							strokeWidth: 2.5,
							"aria-hidden": "true"
						})
					})
				]
			}),
			open && /* @__PURE__ */ jsxs("div", {
				id: `${id}-options`,
				role: "listbox",
				"aria-label": tr("motivo_lista", "Motivos disponíveis"),
				className: "rounded-b-lg border border-t-0 border-[#d7dfed] bg-white p-1.5 shadow-[0_5px_12px_rgba(17,32,65,0.12)]",
				children: [filtered.map((option, index) => {
					const Icon = option.icon;
					return /* @__PURE__ */ jsxs("button", {
						id: `${id}-${option.id}`,
						role: "option",
						"aria-selected": selected?.id === option.id || custom && option.id === "outro",
						type: "button",
						tabIndex: -1,
						onMouseDown: (event) => event.preventDefault(),
						onMouseEnter: () => setActive(index),
						onClick: () => pick(option),
						className: `flex min-h-11 w-full cursor-pointer items-center gap-7 rounded-md px-4 py-2 text-left text-base text-[#070e50] transition-colors hover:bg-[#eaf4ff] ${active === index ? "bg-[#eaf4ff]" : ""}`,
						children: [/* @__PURE__ */ jsx("span", {
							className: "inline-flex w-8 shrink-0 items-center justify-center",
							children: /* @__PURE__ */ jsx(Icon, {
								size: 27,
								strokeWidth: 1.8,
								"aria-hidden": "true"
							})
						}), /* @__PURE__ */ jsx("span", { children: option.label })]
					}, option.id);
				}), !filtered.length && /* @__PURE__ */ jsx("p", {
					role: "status",
					className: "px-4 py-3 text-sm text-[#6578ab]",
					children: tr("motivo_sem_resultados", "Nenhum motivo encontrado. Pesquise “Outro” para escrever um motivo personalizado.")
				})]
			}),
			custom && /* @__PURE__ */ jsxs("label", {
				className: "mt-3 block text-sm text-[#07104f]",
				children: [tr("motivo_personalizado", "Escreva o motivo *"), /* @__PURE__ */ jsx("input", {
					ref: customInput,
					required: true,
					maxLength: 255,
					value,
					onChange: (event) => onChange(event.target.value),
					className: "mt-1.5 h-11 w-full rounded-md border border-[#ccd8ee] px-4 text-base outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
				})]
			})
		]
	});
}
//#endregion
//#region src/components/gest/FormularioExcecaoExperiencia.jsx
function FormularioExcecaoExperiencia({ form, setForm, DateField, busy, onSubmit }) {
	const { t } = useTranslation();
	const tr = (key, text) => t(`agenda_experiencia_${key}`, text);
	const input = "mt-1.5 min-h-11 w-full rounded-md border border-[#ccd8ee] bg-white px-4 py-2 text-base text-[#07104f] outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600";
	return /* @__PURE__ */ jsxs("form", {
		className: "space-y-4",
		onSubmit: (event) => {
			event.preventDefault();
			if (form.motivo.trim()) onSubmit();
		},
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-2 gap-5",
				children: [["inicio", tr("inicio", "Início *")], ["fim", tr("fim", "Fim *")]].map(([key, label]) => /* @__PURE__ */ jsxs("label", {
					className: "block text-base text-[#07104f]",
					children: [label, /* @__PURE__ */ jsx(DateField, {
						required: true,
						value: form[key],
						min: key === "fim" ? form.inicio : void 0,
						onChange: (event) => setForm((old) => ({
							...old,
							[key]: event.target.value
						})),
						className: input
					})]
				}, key))
			}),
			/* @__PURE__ */ jsx(MotivoFolgaLov, {
				value: form.motivo,
				onChange: (motivo) => setForm((old) => ({
					...old,
					motivo
				}))
			}),
			/* @__PURE__ */ jsxs("label", {
				className: "block text-base text-[#07104f]",
				children: [tr("estado", "Estado"), /* @__PURE__ */ jsxs("select", {
					className: input,
					value: form.tipo,
					onChange: (event) => setForm((old) => ({
						...old,
						tipo: event.target.value
					})),
					children: [/* @__PURE__ */ jsx("option", {
						value: "fechado",
						children: tr("fechado", "Fechado")
					}), /* @__PURE__ */ jsx("option", {
						value: "aberto",
						children: tr("aberto", "Aberto")
					})]
				})]
			}),
			/* @__PURE__ */ jsxs("p", {
				className: "flex items-center gap-2 text-sm text-[#6578ab]",
				children: [/* @__PURE__ */ jsx("span", {
					className: "inline-flex shrink-0",
					children: /* @__PURE__ */ jsx(Info, {
						size: 18,
						strokeWidth: 1.8
					})
				}), tr("motivo_outro_ajuda", "Ao selecionar “Outro”, pode escrever o motivo.")]
			}),
			/* @__PURE__ */ jsx("button", {
				type: "submit",
				disabled: busy || !form.motivo?.trim(),
				className: "cursor-pointer rounded-md border border-blue-800 bg-[#123b9e] px-4 py-2.5 text-base font-semibold text-white shadow-sm transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50",
				children: tr("rever", "Rever alterações")
			})
		]
	});
}
//#endregion
//#region src/features/experiencias/eExperienciaJetSki.js
function eExperienciaJetSki(experiencia = {}) {
	return [
		"categoria",
		"categoria_slug",
		"categoria_nome",
		"tipo_experiencia",
		"titulo"
	].some((key) => {
		const value = String(experiencia[key] || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
		return /\bjet[\s_-]*skis?\b/.test(value);
	});
}
//#endregion
//#region src/components/gest/AgendaExperiencia.jsx
const money = (v) => `${new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 }).format(Number(v) || 0)} CVE`;
const date = (v) => v ? v.slice(0, 10).split("-").reverse().join("/") : "—";
const json = (value, fallback = []) => {
	try {
		return JSON.parse(value) || fallback;
	} catch {
		return fallback;
	}
};
const Icon = ({ icon: C, size = 18, className = "" }) => /* @__PURE__ */ jsx("span", {
	className: `inline-flex shrink-0 ${className}`,
	children: /* @__PURE__ */ jsx(C, {
		size,
		strokeWidth: 1.8,
		"aria-hidden": "true"
	})
});
const CampoDataMorabeza = (props) => /* @__PURE__ */ jsxs("span", {
	className: "relative block w-full min-w-0",
	children: [/* @__PURE__ */ jsx(DateField, {
		...props,
		className: `${props.className || ""} pr-10!`
	}), /* @__PURE__ */ jsx("span", {
		className: "pointer-events-none absolute right-3 top-1/2 mt-0.5 -translate-y-1/2 text-[#060e50]",
		children: /* @__PURE__ */ jsx(CalendarDays, {
			size: 17,
			"aria-hidden": "true"
		})
	})]
});
const input = "mt-1 min-h-9 w-full rounded-md border border-[#ccd8ec] bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50";
const btn = "inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border border-[#ccd8ec] bg-white px-3 py-2 text-sm font-semibold text-blue-900 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50";
const primary = `${btn} border-transparent! bg-[#123b9e]! text-white! hover:bg-blue-900!`;
const section = "rounded-lg border border-[#dfe7f3] bg-white p-4";
function AgendaExperiencia() {
	const { id } = useParams();
	const { t } = useTranslation();
	const tr = (key, text, values = {}) => t(`agenda_experiencia_${key}`, {
		defaultValue: text,
		...values
	});
	const [panel, setPanel] = useState({
		"experiencia": {
			"titulo": "Mergulho com tartarugas",
			"ilha": "Santiago"
		},
		"agenda": { "pausado": 0 },
		"configuracoes": [{
			"id": 1,
			"nome": "Jet ski Tarrafal",
			"duracao_minutos": 15,
			"preco": 100,
			"capacidade": 5,
			"unidade": "unidade",
			"ativo": 1,
			"horarios_json": "[\"08:00\",\"08:15\"]",
			"recursos_json": "[1]"
		}],
		"excecoes": [],
		"recursos": [{
			"id": 1,
			"nome": "Jet skis",
			"quantidade": 5,
			"tipo": "equipamento",
			"manutencoes_json": "[{\"inicio\":\"2026-11-03\",\"fim\":\"2026-11-03\",\"hora_inicio\":\"09:00\",\"hora_fim\":\"09:30\",\"quantidade\":1}]"
		}],
		"historico": [],
		"sessoes": [
			{
				"id": 1,
				"configuracao_id": 1,
				"hora_inicio": "08:00",
				"hora_fim": "08:15",
				"confirmados": 0,
				"em_pagamento": 0,
				"bloqueados": 0,
				"livres": 5
			},
			{
				"id": 2,
				"configuracao_id": 1,
				"hora_inicio": "08:15",
				"hora_fim": "08:30",
				"confirmados": 0,
				"em_pagamento": 0,
				"bloqueados": 0,
				"livres": 5
			},
			{
				"id": 3,
				"configuracao_id": 1,
				"hora_inicio": "08:30",
				"hora_fim": "08:45",
				"confirmados": 0,
				"em_pagamento": 0,
				"bloqueados": 0,
				"livres": 5
			},
			{
				"id": 4,
				"configuracao_id": 1,
				"hora_inicio": "08:45",
				"hora_fim": "09:00",
				"confirmados": 0,
				"em_pagamento": 0,
				"bloqueados": 0,
				"livres": 5
			},
			{
				"id": 5,
				"configuracao_id": 1,
				"hora_inicio": "09:00",
				"hora_fim": "09:15",
				"confirmados": 2,
				"em_pagamento": 1,
				"bloqueados": 1,
				"livres": 1
			},
			{
				"id": 6,
				"configuracao_id": 1,
				"hora_inicio": "09:15",
				"hora_fim": "09:30",
				"confirmados": 3,
				"em_pagamento": 1,
				"bloqueados": 1,
				"livres": 0
			},
			{
				"id": 7,
				"configuracao_id": 1,
				"hora_inicio": "09:30",
				"hora_fim": "09:45",
				"confirmados": 0,
				"em_pagamento": 0,
				"bloqueados": 0,
				"livres": 5
			},
			{
				"id": 8,
				"configuracao_id": 1,
				"hora_inicio": "09:45",
				"hora_fim": "10:00",
				"confirmados": 0,
				"em_pagamento": 0,
				"bloqueados": 0,
				"livres": 5
			}
		]
	}), [error, setError] = useState(""), [notice, setNotice] = useState(""), [busy, setBusy] = useState(false);
	const [day, setDay] = useState("2026-11-03"), [tableConfig, setTableConfig] = useState(1), [modal, setModal] = useState("config"), [review, setReview] = useState(null);
	const [agenda, setAgenda] = useState({
		dias: [
			2,
			3,
			4,
			5,
			6,
			7
		],
		inicio: "2026-11-03",
		fim: "",
		repeticao: "semanal",
		minima_horas: 24,
		maxima_dias: 180
	});
	const [form, setForm] = useState({
		"id": 1,
		"nome": "Jet ski Tarrafal",
		"duracao_minutos": 15,
		"preco": 100,
		"capacidade": 5,
		"unidade": "unidade",
		"ativo": 1,
		"horarios": [
			"08:00",
			"08:15",
			"08:30",
			"08:45",
			"09:00",
			"09:15",
			"09:30",
			"09:45"
		],
		"recursos": [1],
		"metodo": "intervalos",
		"abertura": "08:00",
		"fecho": "11:00",
		"intervalo": 15,
		"preparacao": 0
	}), [rules, setRules] = useState(false);
	const [conflicts, setConflicts] = useState([]);
	const [configDraft, setConfigDraft] = useState(null);
	const [bookings, setBookings] = useState([]);
	const week = [
		tr("segunda", "Segunda"),
		tr("terca", "Terça"),
		tr("quarta", "Quarta"),
		tr("quinta", "Quinta"),
		tr("sexta", "Sexta"),
		tr("sabado", "Sábado"),
		tr("domingo", "Domingo")
	];
	const request = (action, dados = {}, signal) => pedirAgendaExperiencia({
		action,
		dados,
		experiencia_id: Number(id),
		data: day
	}, signal);
	const applyPanel = (data) => {
		setPanel(data);
		setTableConfig((current) => current ?? data.configuracoes?.[0]?.id ?? null);
		if (data.agenda) setAgenda({
			...data.agenda,
			dias: json(data.agenda.dias_json),
			fim: data.agenda.fim || ""
		});
	};
	const reload = async (signal) => {
		setBusy(true);
		setError("");
		try {
			const data = await request("painel", {}, signal);
			if (!signal?.aborted) applyPanel(data);
		} catch (e) {
			if (!signal?.aborted) setError(e.response?.data?.error || e.response?.data?.mensagem || tr("erro", "Não foi possível carregar a agenda. Confirme a API e a migração 007."));
		} finally {
			if (!signal?.aborted) setBusy(false);
		}
	};
	useEffect(() => {
		const controller = new AbortController();
		setPanel(null);
		window.scrollTo(0, 0);
		reload(controller.signal);
		return () => controller.abort();
	}, [id, day]);
	const mutate = async (action, dados) => {
		setBusy(true);
		setError("");
		setNotice("");
		try {
			const saved = await guardarAlteracaoAgenda(request, action, dados, panel?.agenda ? null : agenda, applyPanel);
			applyPanel(saved);
			setConflicts([]);
			setModal(null);
			setReview(null);
			if (action === "guardar_recurso" && configDraft) {
				const pool = saved.recursos.find((r) => r.tipo === "equipamento");
				setForm(configDraft.unidade === "unidade" && !configDraft.recursos.length && pool ? {
					...configDraft,
					recursos: [Number(pool.id)],
					capacidade: pool.quantidade
				} : configDraft);
				setModal("config");
				setConfigDraft(null);
			}
			setNotice(tr("guardado", "Alterações guardadas. As reservas existentes foram preservadas."));
		} catch (e) {
			setError(e.response?.data?.error || e.message || tr("erro_guardar", "Não foi possível guardar."));
			if (e.response?.data?.code === "LEGACY_SESSION_CONFLICT") setConflicts(e.response.data.conflitos || []);
		} finally {
			setBusy(false);
		}
	};
	const prepare = async (action, dados) => {
		setError("");
		setConflicts([]);
		setBusy(true);
		try {
			setReview({
				action,
				dados,
				count: (await request("rever")).revisao.saidas_com_reservas
			});
		} catch (e) {
			setError(e.response?.data?.error || tr("erro_guardar", "Não foi possível guardar."));
		} finally {
			setBusy(false);
		}
	};
	const edit = (type, value) => {
		setError("");
		setConflicts([]);
		if (type === "config") {
			const pool = (panel?.recursos || []).find((r) => r.tipo === "equipamento");
			const equipment = eExperienciaJetSki(panel?.experiencia) || panel?.configuracoes.some((c) => c.unidade === "unidade");
			setForm(lerConfiguracao(value, {
				nome: panel?.experiencia.titulo,
				preco: panel?.experiencia.preco,
				capacidade: equipment ? pool?.quantidade || 1 : panel?.experiencia.max_pessoas || 1,
				unidade: equipment ? "unidade" : "participante",
				recursos: equipment && pool ? [Number(pool.id)] : []
			}));
		}
		if (type === "excecao") setForm(value || {
			inicio: day,
			fim: day,
			motivo: "",
			tipo: "fechado"
		});
		if (type === "aberto") setForm({
			inicio: day,
			fim: day,
			motivo: "",
			tipo: "aberto"
		});
		if (type === "recurso") setForm(value ? {
			...value,
			manutencoes: json(value.manutencoes_json)
		} : {
			nome: "",
			tipo: "equipamento",
			quantidade: 1,
			manutencoes: []
		});
		setModal(type);
	};
	const durationText = (minutes) => Number(minutes) % 60 === 0 ? tr("duracao_horas", "{{count}} horas", { count: Number(minutes) / 60 }) : tr("duracao_minutos", "{{count}} minutos", { count: Number(minutes) || 0 });
	const daysText = agenda.dias.length > 1 && agenda.dias.every((d, i) => !i || d === agenda.dias[i - 1] + 1) ? `${week[agenda.dias[0] - 1]} ${tr("a_dia", "a")} ${week[agenda.dias.at(-1) - 1].toLocaleLowerCase()}` : agenda.dias.map((d) => week[d - 1]).join(", ");
	const configs = panel?.configuracoes || [], resources = panel?.recursos || [];
	const equipmentMode = eExperienciaJetSki(panel?.experiencia) || configs.some((c) => c.unidade === "unidade");
	const totalStock = resources.filter((r) => r.tipo === "equipamento").reduce((sum, r) => sum + Number(r.quantidade), 0);
	const closeModal = () => {
		setConflicts([]);
		setError("");
		if (configDraft) {
			setForm(configDraft);
			setConfigDraft(null);
			setModal("config");
		} else setModal(null);
		setReview(null);
	};
	const chosen = configs.find((c) => c.id === tableConfig);
	const selectedPool = resources.find((r) => chosen?.unidade === "unidade" && r.tipo === "equipamento" && json(chosen.recursos_json).includes(Number(r.id)));
	const maintenance = resources.filter((r) => chosen && json(chosen.recursos_json).includes(Number(r.id))).flatMap((r) => json(r.manutencoes_json).filter((m) => day >= m.inicio && day <= m.fim));
	const rows = (panel?.sessoes || []).filter((s) => !tableConfig || Number(s.configuracao_id) === Number(tableConfig));
	const selectedSlots = (c) => json(c.horarios_json).map((start) => {
		const [h, m] = start.split(":").map(Number);
		const end = h * 60 + m + Number(c.duracao_minutos);
		return `${start} – ${String(Math.floor(end / 60)).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`;
	}).join(" · ");
	const banner = (text, orange = false) => /* @__PURE__ */ jsxs("aside", {
		className: `flex items-start gap-3 rounded-md border px-3 py-2 text-sm ${orange ? "border-amber-200 bg-[#fff5dc] text-[#e54500]" : "border-blue-200 bg-[#e8f4ff] text-[#004bff]"}`,
		children: [/* @__PURE__ */ jsx(Icon, { icon: orange ? CircleAlert : Info }), text]
	});
	const title = (text, subtitle) => /* @__PURE__ */ jsxs("div", {
		className: "min-w-0 flex-1 basis-[280px]",
		children: [/* @__PURE__ */ jsx("h2", {
			className: "text-xl font-bold leading-6 tracking-tight",
			children: text
		}), subtitle && /* @__PURE__ */ jsx("p", {
			className: "text-sm leading-5 text-[#6578a4]",
			children: subtitle
		})]
	});
	const label = (text, control) => /* @__PURE__ */ jsxs("label", {
		className: "block text-sm",
		children: [text, control]
	});
	const field = (name, type = "text", extra = {}) => /* @__PURE__ */ jsx("input", {
		type,
		name,
		value: form[name] ?? "",
		onChange: (e) => setForm((f) => ({
			...f,
			[name]: e.target.value
		})),
		className: input,
		...extra
	});
	const openBookings = async (sessao) => {
		setBusy(true);
		setError("");
		setBookings([]);
		setModal("reservas");
		try {
			setBookings((await request("reservas_saida", { sessao_id: sessao.id })).reservas);
		} catch (e) {
			setError(e.response?.data?.error || tr("erro_reservas", "Não foi possível carregar as reservas desta saída."));
		} finally {
			setBusy(false);
		}
	};
	const availabilityTable = (items, units = false) => /* @__PURE__ */ jsx("div", {
		className: "overflow-x-auto rounded-md border border-[#d7e2f3]",
		children: /* @__PURE__ */ jsxs("table", {
			className: `w-full border-collapse text-left text-sm text-[#050b48] ${units ? "min-w-[760px]" : "min-w-[440px]"}`,
			children: [/* @__PURE__ */ jsx("thead", {
				className: "bg-[#f3f5f9] text-[#050b48]",
				children: /* @__PURE__ */ jsx("tr", { children: [
					units ? tr("hora_tabela", "Horário") : tr("saida", "Saída"),
					units ? tr("reservadas", "Unidades reservadas") : tr("confirmados", "Confirmados"),
					units ? tr("unidades_pagamento", "Unidades em pagamento") : tr("pagamento", "Em pagamento"),
					...units ? [tr("unidades_bloqueadas", "Unidades bloqueadas")] : [],
					units ? tr("unidades_disponiveis", "Unidades disponíveis") : tr("livres", "Vagas livres"),
					...units ? [tr("acoes", "Ações")] : []
				].map((text) => /* @__PURE__ */ jsx("th", {
					className: `border-b border-r border-[#dfe7f3] px-3 py-2 text-center font-semibold last:border-r-0 first:text-left ${units ? "text-[11px] uppercase tracking-[0.07em] leading-tight" : ""}`,
					children: text
				}, text)) })
			}), /* @__PURE__ */ jsx("tbody", { children: items.length ? items.map((s) => /* @__PURE__ */ jsxs("tr", {
				className: "border-b border-[#e2e8f2] last:border-0",
				children: [
					/* @__PURE__ */ jsxs("td", {
						className: "whitespace-nowrap border-r border-[#e2e8f2] px-3 py-2",
						children: [
							s.hora_inicio,
							" – ",
							s.hora_fim
						]
					}),
					[
						s.confirmados,
						s.em_pagamento,
						...units ? [s.bloqueados] : []
					].map((v, i) => /* @__PURE__ */ jsx("td", {
						className: "border-r border-[#e2e8f2] px-3 py-2 text-center",
						children: v
					}, i)),
					/* @__PURE__ */ jsx("td", {
						className: "border-r border-[#e2e8f2] px-2 py-1.5 text-center last:border-r-0",
						children: units ? /* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-center gap-0.5 whitespace-nowrap",
							children: [/* @__PURE__ */ jsx("span", {
								className: `inline-block min-w-11 rounded-full px-3 py-1 ${s.livres ? "bg-[#dcf9e4] text-[#078423]" : "bg-[#ffdae0] text-red-600"}`,
								children: s.livres
							}), !s.livres && /* @__PURE__ */ jsx("span", {
								className: "rounded-full bg-[#fff0d1] px-2 py-1 text-[11px] text-[#e04b00]",
								children: tr("sem_disponibilidade", "Sem disponibilidade")
							})]
						}) : s.livres
					}),
					units && /* @__PURE__ */ jsx("td", {
						className: "px-3 py-1 text-center",
						children: /* @__PURE__ */ jsxs("button", {
							className: `${btn} w-full whitespace-nowrap py-1.5! text-[#004bff]!`,
							onClick: () => openBookings(s),
							children: [/* @__PURE__ */ jsx(Icon, {
								icon: List,
								size: 16
							}), tr("ver_reservas", "Ver reservas")]
						})
					})
				]
			}, s.id)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
				colSpan: units ? 6 : 4,
				className: "px-3 py-6 text-center text-slate-500",
				children: tr("sem_saidas", "Não existem saídas configuradas nesta data.")
			}) }) })]
		})
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-3 text-left text-[#050b48] [font-family:Arial,sans-serif]",
		children: [
			/* @__PURE__ */ jsxs("header", {
				className: "relative grid gap-4 lg:min-h-[136px] lg:grid-cols-[minmax(0,1fr)_315px]",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ jsx(Link, {
						to: "/gest/minhas-experiencias",
						"aria-label": tr("voltar", "Voltar"),
						className: `${btn} p-2!`,
						children: /* @__PURE__ */ jsx(Icon, { icon: ArrowLeft })
					}), /* @__PURE__ */ jsxs("div", { children: [
						/* @__PURE__ */ jsxs("h1", {
							className: "flex items-center gap-3 text-2xl font-bold tracking-tight",
							children: [/* @__PURE__ */ jsx(Icon, {
								icon: CalendarDays,
								size: 25,
								className: "text-blue-600"
							}), tr("titulo", "Configurar Sessões")]
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "mt-1 text-sm",
							children: [panel?.experiencia.titulo || tr("carregar", "A carregar…"), panel?.experiencia.ilha && ` — ${panel.experiencia.ilha}`]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-2 flex gap-3 text-xs lg:absolute lg:left-[304px] lg:top-11",
							children: [/* @__PURE__ */ jsxs("span", {
								className: `rounded-full px-3 py-1 ${Number(panel?.agenda?.pausado) ? "bg-amber-50 text-amber-800" : "bg-green-50 text-green-700"}`,
								children: ["● ", panel?.agenda ? Number(panel.agenda.pausado) ? tr("pausado", "Pausado") : tr("ativo", "Ativo") : tr("por_configurar", "Agenda por configurar")]
							}), /* @__PURE__ */ jsxs("span", {
								className: "rounded-full bg-slate-100 px-3 py-1",
								children: ["● ", configs.length && configs.every((c) => c.unidade === "unidade") ? tr("por_equipamento", "Por equipamento") : tr("por_participante", "Por participante")]
							})]
						})
					] })]
				}), /* @__PURE__ */ jsxs("div", {
					className: "space-y-2 text-right",
					children: [
						/* @__PURE__ */ jsxs("button", {
							title: !panel?.agenda ? tr("pausa_agenda_necessaria", "Guarde a agenda para poder pausar ou retomar a experiência.") : void 0,
							disabled: busy || !panel?.agenda,
							onClick: () => prepare("pausar", { pausado: !Number(panel.agenda.pausado) }),
							className: btn,
							children: [/* @__PURE__ */ jsx(Icon, { icon: Pause }), Number(panel?.agenda?.pausado) ? tr("retomar", "Retomar a experiência") : tr("pausar", "Pausar toda a experiência")]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-xs text-[#6578a4]",
							children: tr("preserva", "Preserva as reservas já feitas")
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex justify-end gap-2",
							children: [/* @__PURE__ */ jsxs("button", {
								onClick: () => setModal("historico"),
								disabled: !panel,
								className: btn,
								children: [/* @__PURE__ */ jsx(Icon, { icon: ChartNoAxesColumn }), tr("historico", "Histórico")]
							}), /* @__PURE__ */ jsxs("button", {
								disabled: !panel || busy,
								onClick: () => edit("config"),
								className: primary,
								children: [/* @__PURE__ */ jsx(Icon, { icon: Plus }), tr("nova", "Nova configuração")]
							})]
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "flex items-center justify-end gap-2 text-xs text-[#6578a4]",
							children: [/* @__PURE__ */ jsx(Icon, {
								icon: Clock,
								size: 14
							}), tr("cabo_verde", "Horários de Cabo Verde")]
						})
					]
				})]
			}),
			error && !modal && !review && /* @__PURE__ */ jsx("p", {
				role: "alert",
				className: "rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700",
				children: error
			}),
			notice && /* @__PURE__ */ jsx("p", {
				role: "status",
				className: "rounded-md bg-green-50 p-3 text-sm text-green-700",
				children: notice
			}),
			!modal && !review && panel?.resultado?.conflitos_pendentes?.length > 0 && /* @__PURE__ */ jsxs("aside", {
				className: "flex flex-wrap items-center justify-between gap-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800",
				children: [/* @__PURE__ */ jsx("span", { children: tr("legadas_pendentes", "Existem sessões anteriores por ligar. As sessões e reservas existentes foram mantidas.") }), /* @__PURE__ */ jsx("button", {
					className: btn,
					onClick: () => {
						setReview({
							action: "guardar_agenda",
							dados: agenda,
							count: 0
						});
						setConflicts(panel.resultado.conflitos_pendentes);
						setError("");
					},
					children: tr("rever_legadas", "Rever sessões anteriores")
				})]
			}),
			banner(tr("intro", "Configure os dias de trabalho e organize os horários por duração.")),
			/* @__PURE__ */ jsxs("section", {
				id: "agenda-funcionamento",
				className: section,
				children: [
					title(tr("agenda", "1. Agenda de funcionamento"), tr("agenda_ajuda", "Escolha os dias de trabalho e defina o período de aplicação.")),
					/* @__PURE__ */ jsx("div", {
						className: "mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7",
						children: week.map((name, i) => /* @__PURE__ */ jsxs("label", {
							className: "flex cursor-pointer items-center gap-2 rounded-md border border-[#dfe7f3] px-2 py-2 text-sm",
							children: [/* @__PURE__ */ jsx("input", {
								type: "checkbox",
								checked: agenda.dias.includes(i + 1),
								onChange: (e) => setAgenda((a) => ({
									...a,
									dias: e.target.checked ? [...a.dias, i + 1].sort() : a.dias.filter((d) => d !== i + 1)
								})),
								className: "h-[18px] w-[18px] accent-blue-600"
							}), name]
						}, name))
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-4 grid items-end gap-3 lg:grid-cols-[minmax(0,2.8fr)_1fr_1fr]",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-4",
								children: [/* @__PURE__ */ jsx("strong", {
									className: "text-sm",
									children: tr("repetir", "Repetir")
								}), /* @__PURE__ */ jsxs("fieldset", {
									className: "flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-md border border-[#dfe7f3] px-3 py-2 text-[11px]",
									children: [/* @__PURE__ */ jsx("legend", {
										className: "sr-only",
										children: tr("repetir", "Repetir")
									}), [["semanal", tr("semanal", "Repetir semanalmente")], ["personalizado", tr("personalizado", "Período personalizado")]].map(([value, name]) => /* @__PURE__ */ jsxs("label", {
										className: "flex cursor-pointer items-center gap-2 whitespace-nowrap",
										children: [/* @__PURE__ */ jsx("input", {
											type: "radio",
											name: "repeticao",
											checked: agenda.repeticao === value,
											onChange: () => setAgenda((a) => ({
												...a,
												repeticao: value
											})),
											className: "h-5 w-5 accent-blue-600"
										}), name]
									}, value))]
								})]
							}),
							label(tr("a_partir", "A partir de"), /* @__PURE__ */ jsx(CampoDataMorabeza, {
								required: true,
								value: agenda.inicio,
								onChange: (e) => setAgenda((a) => ({
									...a,
									inicio: e.target.value
								})),
								className: input
							})),
							label(tr("terminar", "Terminar em"), /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("select", {
								value: agenda.fim ? "data" : "sem",
								onChange: (e) => setAgenda((a) => ({
									...a,
									fim: e.target.value === "sem" ? "" : day
								})),
								className: input,
								children: [/* @__PURE__ */ jsx("option", {
									value: "sem",
									children: tr("sem_fim", "Sem data de fim")
								}), /* @__PURE__ */ jsx("option", {
									value: "data",
									children: tr("data_fim", "Definir data final")
								})]
							}), agenda.fim && /* @__PURE__ */ jsx(CampoDataMorabeza, {
								required: true,
								min: agenda.inicio,
								value: agenda.fim,
								onChange: (e) => setAgenda((a) => ({
									...a,
									fim: e.target.value
								})),
								className: input
							})] }))
						]
					}),
					/* @__PURE__ */ jsxs("button", {
						onClick: () => setRules((v) => !v),
						"aria-expanded": rules,
						className: "mt-4 flex w-full cursor-pointer items-center gap-3 rounded-md border border-[#dfe7f3] bg-slate-50 px-3 py-3 text-sm",
						children: [
							/* @__PURE__ */ jsx(Icon, {
								icon: ChevronRight,
								className: rules ? "rotate-90" : ""
							}),
							/* @__PURE__ */ jsx("strong", { children: tr("antecedencia", "Regras de antecedência") }),
							/* @__PURE__ */ jsxs("span", {
								className: "ml-auto text-right text-xs text-[#6578a4]",
								children: [
									tr("minima", "Mínima:"),
									" ",
									agenda.minima_horas,
									" h · ",
									tr("maxima", "Máxima:"),
									" ",
									agenda.maxima_dias,
									" ",
									tr("dias", "dias")
								]
							})
						]
					}),
					rules && /* @__PURE__ */ jsxs("div", {
						className: "mt-3 grid grid-cols-2 gap-3",
						children: [label(tr("min_horas", "Mínima (horas)"), /* @__PURE__ */ jsx("input", {
							type: "number",
							min: "0",
							max: "8760",
							value: agenda.minima_horas,
							onChange: (e) => setAgenda((a) => ({
								...a,
								minima_horas: e.target.value
							})),
							className: input
						})), label(tr("max_dias", "Máxima (dias)"), /* @__PURE__ */ jsx("input", {
							type: "number",
							min: "1",
							max: "365",
							value: agenda.maxima_dias,
							onChange: (e) => setAgenda((a) => ({
								...a,
								maxima_dias: e.target.value
							})),
							className: input
						}))]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-3 flex flex-wrap items-center gap-3",
						children: [/* @__PURE__ */ jsx("div", {
							className: "min-w-0 flex-1",
							children: banner(daysText || tr("escolha_dias", "Selecione pelo menos um dia."))
						}), /* @__PURE__ */ jsx("button", {
							disabled: !panel || busy || !agenda.dias.length,
							onClick: () => prepare("guardar_agenda", agenda),
							className: primary,
							children: tr("rever_agenda", "Rever e guardar agenda")
						})]
					})
				]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: section,
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex flex-wrap items-start justify-between gap-3",
						children: [title(tr("folgas", "2. Folgas, férias e exceções"), tr("folgas_ajuda", "Adicione períodos em que não haverá sessões ou crie datas excecionais.")), /* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap gap-2",
							children: [/* @__PURE__ */ jsxs("button", {
								disabled: !panel,
								onClick: () => edit("excecao"),
								className: btn,
								children: [/* @__PURE__ */ jsx(Icon, { icon: Plus }), tr("bloquear", "Bloquear datas")]
							}), /* @__PURE__ */ jsxs("button", {
								disabled: !panel,
								onClick: () => edit("aberto"),
								className: btn,
								children: [/* @__PURE__ */ jsx(Icon, { icon: Plus }), tr("abrir", "Abrir data excecional")]
							})]
						})]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "mt-3 space-y-2",
						children: panel?.excecoes.map((e) => /* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap items-center gap-3 rounded-md border border-[#dfe7f3] px-3 py-1.5 text-sm",
							children: [
								/* @__PURE__ */ jsx(Icon, {
									icon: CalendarDays,
									className: "text-blue-900"
								}),
								/* @__PURE__ */ jsxs("span", { children: [
									date(e.inicio),
									" – ",
									date(e.fim)
								] }),
								/* @__PURE__ */ jsx("span", {
									className: "flex-1",
									children: e.motivo
								}),
								/* @__PURE__ */ jsx("span", {
									className: `rounded px-2 py-1 ${e.tipo === "aberto" ? "bg-green-50 text-green-700" : "bg-[#fff5dc] text-[#e54500]"}`,
									children: e.tipo === "aberto" ? tr("aberto", "Aberto") : tr("fechado", "Fechado")
								}),
								/* @__PURE__ */ jsxs("button", {
									onClick: () => edit("excecao", e),
									className: btn,
									children: [/* @__PURE__ */ jsx(Icon, {
										icon: Pencil,
										size: 15
									}), tr("editar", "Editar")]
								}),
								/* @__PURE__ */ jsxs("button", {
									disabled: busy,
									onClick: () => prepare("remover_excecao", { id: e.id }),
									className: `${btn} border-red-200! text-red-600!`,
									children: [/* @__PURE__ */ jsx(Icon, {
										icon: Trash2,
										size: 15
									}), tr("remover", "Remover bloqueio")]
								})
							]
						}, e.id))
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-3 space-y-2",
						children: [banner(tr("abertura_curta", "A abertura excecional exige rever os bloqueios dessa data.")), banner(tr("reservas_aviso", "Antes de aplicar alterações, reveja as saídas com reservas. As reservas confirmadas são preservadas."), true)]
					})
				]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: section,
				children: [
					/* @__PURE__ */ jsxs("header", {
						className: "flex flex-wrap items-start justify-between gap-3",
						children: [title(tr("config_duracao", "3. Configurações por duração"), tr("config_quantidade_livre", "Crie as configurações de que precisar, incluindo várias com a mesma duração.")), /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3 text-sm",
							children: [/* @__PURE__ */ jsxs("label", {
								className: "flex items-center gap-3",
								children: [tr("consultar_dia", "Consultar dia"), /* @__PURE__ */ jsx("div", {
									className: "w-40",
									children: /* @__PURE__ */ jsx(CampoDataMorabeza, {
										required: true,
										value: day,
										onChange: (e) => {
											if (e.target.value) setDay(e.target.value);
										},
										className: input
									})
								})]
							}), /* @__PURE__ */ jsxs("button", {
								onClick: () => reload(),
								disabled: busy,
								className: btn,
								children: [/* @__PURE__ */ jsx(Icon, { icon: RefreshCw }), tr("atualizar", "Atualizar")]
							})]
						})]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "mt-3 grid gap-3 md:grid-cols-2",
						children: configs.map((c) => {
							const options = json(c.opcoes_json, {}), starts = json(c.horarios_json).sort();
							return /* @__PURE__ */ jsxs("article", {
								className: "rounded-lg border border-[#dfe7f3] p-3",
								children: [
									/* @__PURE__ */ jsxs("header", {
										className: "flex items-start justify-between gap-3",
										children: [/* @__PURE__ */ jsxs("h3", {
											className: "flex items-center gap-3 text-lg font-bold",
											children: [/* @__PURE__ */ jsx(Icon, {
												icon: Clock,
												className: "text-blue-600",
												size: 22
											}), durationText(c.duracao_minutos)]
										}), /* @__PURE__ */ jsxs("label", {
											className: "cursor-pointer text-sm",
											children: [/* @__PURE__ */ jsxs("span", {
												className: "flex items-center gap-2",
												children: [
													/* @__PURE__ */ jsx("input", {
														type: "checkbox",
														role: "switch",
														checked: Boolean(Number(c.ativo)),
														disabled: busy,
														onChange: (e) => prepare("alternar_configuracao", {
															id: c.id,
															ativo: e.target.checked
														}),
														className: "peer sr-only"
													}),
													/* @__PURE__ */ jsx("span", {
														"aria-hidden": "true",
														className: "relative h-5 w-9 rounded-full bg-slate-300 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-blue-600 peer-checked:after:translate-x-4"
													}),
													tr("ativa", "Ativa")
												]
											}), /* @__PURE__ */ jsx("small", {
												className: "mt-1 block text-xs text-[#6578a4]",
												children: tr("so_duracao", "Só esta duração")
											})]
										})]
									}),
									/* @__PURE__ */ jsx("p", {
										className: "mb-1 text-xs text-[#6578a4]",
										children: c.nome
									}),
									/* @__PURE__ */ jsxs("strong", {
										className: "block text-lg",
										children: [
											money(c.preco),
											" / ",
											c.unidade === "unidade" ? tr("mota", "mota") : tr("participante", "participante")
										]
									}),
									/* @__PURE__ */ jsxs("p", {
										className: "mt-1 flex items-center gap-2 text-sm",
										children: [/* @__PURE__ */ jsx(Icon, {
											icon: CalendarDays,
											size: 18
										}), daysText]
									}),
									/* @__PURE__ */ jsxs("p", {
										className: "mt-2 text-sm",
										children: [
											/* @__PURE__ */ jsxs("strong", { children: [
												options.abertura || starts[0] || "—",
												" – ",
												options.fecho || (starts.length ? selectedSlots(c).split(" · ").at(-1).split(" – ")[1] : "—")
											] }),
											" · ",
											tr("horarios_selecionados", "{{count}} horários selecionados", { count: starts.length })
										]
									}),
									/* @__PURE__ */ jsxs("p", {
										className: "mt-1 flex items-center gap-2 text-sm text-green-700",
										children: [/* @__PURE__ */ jsx(Icon, {
											icon: CircleCheck,
											size: 17
										}), options.metodo === "saidas" ? tr("saidas_definidas", "Saídas definidas manualmente") : tr("inicios_intervalo", "Inícios a cada {{count}} min", { count: Number(options.intervalo || c.duracao_minutos) })]
									}),
									/* @__PURE__ */ jsxs("footer", {
										className: "mt-2 grid grid-cols-2 gap-2",
										children: [/* @__PURE__ */ jsxs("button", {
											className: btn,
											onClick: () => {
												setTableConfig(c.id);
												setModal("vagas");
											},
											children: [/* @__PURE__ */ jsx(Icon, {
												icon: List,
												size: 16
											}), tr("ver_horarios", "Ver horários")]
										}), /* @__PURE__ */ jsxs("button", {
											className: `${btn} bg-blue-50! text-blue-600!`,
											onClick: () => edit("config", c),
											children: [/* @__PURE__ */ jsx(Icon, {
												icon: Pencil,
												size: 16
											}), tr("editar", "Editar")]
										})]
									})
								]
							}, c.id);
						})
					}),
					!configs.length && /* @__PURE__ */ jsx("p", {
						className: "my-4 text-sm text-slate-500",
						children: tr("sem_config_nova", "Ainda não existem configurações. Clique em Nova configuração para começar.")
					}),
					/* @__PURE__ */ jsx("div", {
						className: "mt-3",
						children: banner(tr("editar_ajuda", "Em Editar: duração, preço, intervalo entre inícios e tempo de preparação."))
					})
				]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: section,
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex flex-wrap items-start justify-between gap-3",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-start gap-3",
							children: [/* @__PURE__ */ jsx(Icon, {
								icon: equipmentMode ? Waves : Users,
								size: 30
							}), title(equipmentMode ? tr("equipamentos_titulo", "4. Equipamentos e disponibilidade") : tr("equipa", "4. Equipa e recursos da atividade"), equipmentMode ? tr("stock_pessoas", "{{count}} motas no total · até 2 pessoas por mota", { count: totalStock }) : tr("equipa_ajuda", "Guia e equipamento associados à saída."))]
						}), /* @__PURE__ */ jsxs("button", {
							disabled: !panel,
							onClick: () => setModal(equipmentMode ? "equipamentos" : "recursos"),
							className: btn,
							children: [/* @__PURE__ */ jsx(Icon, { icon: Settings }), equipmentMode ? tr("gerir_manutencao", "Gerir equipamentos e manutenção") : tr("gerir_equipa", "Gerir equipa e recursos")]
						})]
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-4 text-sm text-[#6578a4]",
						children: equipmentMode ? tr("stock_partilhado_ajuda", "Stock partilhado por todas as durações. Reservas, retenções e manutenção descontam disponibilidade no período ocupado.") : tr("verifique_recursos", "Verifique os recursos necessários para garantir a capacidade oferecida.")
					}),
					/* @__PURE__ */ jsxs(Link, {
						to: "/gest/reservas",
						className: "mt-3 inline-flex items-center gap-2 text-sm text-blue-600 underline",
						children: [/* @__PURE__ */ jsx(Icon, { icon: CalendarDays }), tr("consultar_reservas", "Consultar reservas")]
					}),
					/* @__PURE__ */ jsx(Link, {
						to: `/gest/experiencia/${id}/sessoes/anterior`,
						className: "ml-4 text-xs text-slate-500 underline",
						children: tr("anteriores", "Gerir sessões anteriores")
					})
				]
			}),
			(modal || review) && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-[100] flex items-center justify-center bg-[#182740]/65 p-4",
				children: /* @__PURE__ */ jsxs("section", {
					role: "dialog",
					"aria-modal": "true",
					"aria-labelledby": "agenda-modal-title",
					className: `max-h-[92dvh] w-full overflow-y-auto rounded-[14px] bg-white p-5 shadow-2xl sm:p-7 ${["vagas", "equipamentos"].includes(modal) ? "max-w-[988px]" : modal === "config" ? "max-w-[900px]" : "max-w-2xl"}`,
					children: [
						/* @__PURE__ */ jsxs("header", {
							className: "mb-4 flex items-start justify-between gap-3",
							children: [/* @__PURE__ */ jsx("h2", {
								id: "agenda-modal-title",
								className: "text-[26px] font-bold tracking-tight",
								children: review ? tr("rever", "Rever alterações") : modal === "config" ? `${form.id ? tr("editar_config", "Editar configuração") : tr("nova", "Nova configuração")} · ${durationText(form.duracao_minutos)}` : modal === "equipamentos" ? tr("equipamentos_modal", "Equipamentos e manutenção") : modal === "vagas" ? `${tr("horarios", "Horários")} · ${durationText(chosen?.duracao_minutos)}` : modal === "reservas" ? tr("reservas_saida", "Reservas da saída") : modal === "historico" ? tr("historico", "Histórico") : modal === "recursos" ? tr("equipa_recursos", "Equipa e recursos") : modal === "recurso" ? tr("recurso", "Recurso e manutenção") : tr("excecao", "Folga ou data excecional")
							}), /* @__PURE__ */ jsx("button", {
								onClick: closeModal,
								"aria-label": tr("fechar", "Fechar"),
								className: "cursor-pointer rounded-full p-1 hover:bg-slate-100",
								children: /* @__PURE__ */ jsx(Icon, {
									icon: X,
									size: 23
								})
							})]
						}),
						error && /* @__PURE__ */ jsx("p", {
							role: "alert",
							className: "mb-3 rounded bg-red-50 p-3 text-sm text-red-700",
							children: error
						}),
						!review && ["config", "equipamentos"].includes(modal) && /* @__PURE__ */ jsxs("p", {
							className: "-mt-2 mb-4 ml-0 text-sm text-[#6578a4]",
							children: [
								panel?.experiencia.titulo,
								" · ",
								modal === "equipamentos" ? tr("stock_todas_duracoes", "Stock partilhado por todas as durações") : form.unidade === "unidade" ? tr("por_equipamento", "Por equipamento") : tr("por_participante", "Por participante")
							]
						}),
						review && conflicts.length ? /* @__PURE__ */ jsx(ConflitosSessoesLegadas, {
							conflitos: conflicts,
							busy,
							onCancel: closeModal,
							onLink: (ids) => mutate(review.action, {
								...review.dados,
								ligar_sessoes_legadas: ids
							}),
							onEdit: () => {
								const existing = configs.find((c) => Number(c.id) === Number(conflicts[0]?.configuracao_id));
								setReview(null);
								setError("");
								setConflicts([]);
								if (review.action === "guardar_configuracao") setModal("config");
								else if (existing) edit("config", existing);
								else {
									setModal(null);
									document.getElementById("agenda-funcionamento")?.scrollIntoView({ behavior: "smooth" });
								}
							}
						}) : review ? /* @__PURE__ */ jsxs("div", {
							className: "space-y-4",
							children: [
								banner(tr("rever_preservadas", "{{count}} saídas futuras têm reservas ou retenções. Serão preservadas; horários fechados deixam de aceitar novas reservas.", { count: review.count }), true),
								/* @__PURE__ */ jsx("p", {
									className: "text-sm",
									children: tr("confirmar_ajuda", "Confirme para aplicar as alterações à agenda e gerar as saídas dentro da antecedência máxima configurada.")
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "flex justify-end gap-3",
									children: [/* @__PURE__ */ jsx("button", {
										onClick: () => setReview(null),
										className: btn,
										children: tr("cancelar", "Cancelar")
									}), /* @__PURE__ */ jsx("button", {
										disabled: busy,
										onClick: () => mutate(review.action, review.dados),
										className: primary,
										children: tr("aplicar", "Aplicar alterações")
									})]
								})
							]
						}) : modal === "config" ? /* @__PURE__ */ jsx(EditorConfiguracaoExperiencia, {
							form,
							setForm,
							resources,
							agenda,
							daysText,
							busy,
							first: !panel?.agenda,
							onClose: closeModal,
							onAgenda: () => {
								setModal(null);
								document.getElementById("agenda-funcionamento")?.scrollIntoView({ behavior: "smooth" });
							},
							onResources: () => {
								setConfigDraft(form);
								setModal("equipamentos");
							},
							onSave: () => prepare("guardar_configuracao", payloadConfiguracao(form))
						}) : modal === "equipamentos" ? /* @__PURE__ */ jsx(EquipamentosExperiencia, {
							resources,
							day,
							DateField: CampoDataMorabeza,
							busy,
							onEdit: (value) => edit("recurso", value),
							onSave: (value) => prepare("guardar_recurso", value),
							onReview: async (value) => {
								return (await request("rever_recurso", value)).impacto;
							}
						}) : ["excecao", "aberto"].includes(modal) ? /* @__PURE__ */ jsx(FormularioExcecaoExperiencia, {
							form,
							setForm,
							DateField: CampoDataMorabeza,
							busy,
							onSubmit: () => prepare("guardar_excecao", form)
						}) : modal === "vagas" ? /* @__PURE__ */ jsxs("div", {
							className: "space-y-4",
							children: [
								/* @__PURE__ */ jsxs("p", {
									className: "-mt-3 mb-6 text-lg text-[#465da2]",
									children: [
										chosen?.nome || panel?.experiencia.titulo,
										" · ",
										money(chosen?.preco),
										" / ",
										chosen?.unidade === "unidade" ? tr("mota", "mota") : tr("participante", "participante")
									]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "flex flex-wrap items-center justify-between gap-3",
									children: [
										/* @__PURE__ */ jsxs("label", {
											className: "flex items-center gap-4 text-base",
											children: [tr("data", "Data"), /* @__PURE__ */ jsx("div", {
												className: "w-[228px]",
												children: /* @__PURE__ */ jsx(CampoDataMorabeza, {
													required: true,
													value: day,
													onChange: (e) => {
														if (e.target.value) setDay(e.target.value);
													},
													className: input
												})
											})]
										}),
										/* @__PURE__ */ jsxs("span", {
											className: "flex items-center gap-2 text-sm text-[#6578a4]",
											children: [/* @__PURE__ */ jsx(Icon, { icon: Clock }), tr("cabo_verde", "Horários de Cabo Verde")]
										}),
										/* @__PURE__ */ jsxs("button", {
											disabled: busy,
											onClick: () => reload(),
											className: btn,
											children: [/* @__PURE__ */ jsx(Icon, { icon: RefreshCw }), tr("atualizar", "Atualizar")]
										})
									]
								}),
								banner(chosen?.unidade === "unidade" ? tr("stock_partilhado", "Stock total partilhado: {{count}} motas.", { count: selectedPool?.quantidade || chosen?.capacidade || 0 }) : tr("capacidade_total", "Capacidade configurada: {{count}} participantes por saída.", { count: chosen?.capacidade || 0 })),
								/* @__PURE__ */ jsxs("p", {
									className: "text-sm",
									children: [
										rows.length,
										" ",
										tr("horarios_dia", "horários oferecidos neste dia")
									]
								}),
								availabilityTable(rows, true),
								/* @__PURE__ */ jsx("div", {
									className: "text-[#465da2]",
									children: banner(tr("stock_ajuda", "Em pagamento: retenções temporárias. Bloqueadas: manutenção ou indisponibilidade."))
								}),
								maintenance.map((m, i) => /* @__PURE__ */ jsx(React.Fragment, { children: banner(tr("manutencao_resumo", "{{count}} em manutenção: {{inicio}} – {{fim}}.", {
									count: m.quantidade,
									inicio: m.hora_inicio,
									fim: m.hora_fim
								})) }, i)),
								/* @__PURE__ */ jsxs("div", {
									className: "flex flex-wrap items-center justify-end gap-3 pt-4",
									children: [
										/* @__PURE__ */ jsx("div", {
											className: "min-w-[200px] flex-1",
											children: banner(tr("horarios_nao_listados", "Horários não listados não são oferecidos nesta configuração."))
										}),
										/* @__PURE__ */ jsxs("button", {
											onClick: () => edit("config", chosen),
											className: btn,
											children: [/* @__PURE__ */ jsx(Icon, { icon: Pencil }), tr("editar_horarios", "Editar horários desta configuração")]
										}),
										/* @__PURE__ */ jsx("button", {
											onClick: () => setModal(null),
											className: primary,
											children: tr("fechar", "Fechar")
										})
									]
								})
							]
						}) : modal === "reservas" ? /* @__PURE__ */ jsxs("div", {
							className: "space-y-3",
							children: [/* @__PURE__ */ jsxs("button", {
								onClick: () => setModal("vagas"),
								className: btn,
								children: [/* @__PURE__ */ jsx(Icon, { icon: ArrowLeft }), tr("voltar", "Voltar")]
							}), busy ? /* @__PURE__ */ jsx("p", {
								className: "text-sm",
								children: tr("carregar", "A carregar…")
							}) : bookings.length ? bookings.map((b) => /* @__PURE__ */ jsxs(Link, {
								to: `/gest/reserva/${b.id}/experiencia`,
								className: "flex flex-wrap justify-between gap-3 rounded border border-slate-200 p-3 text-sm hover:bg-blue-50",
								children: [/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("strong", { children: b.codigo_reserva }), /* @__PURE__ */ jsx("span", {
									className: "mt-1 block",
									children: b.cliente
								})] }), /* @__PURE__ */ jsxs("span", { children: [
									b.quantidade_pessoas,
									" ",
									tr("participantes", "participantes"),
									" · ",
									money(b.preco_total),
									/* @__PURE__ */ jsx("span", {
										className: "mt-1 block",
										children: b.status
									})
								] })]
							}, b.id)) : /* @__PURE__ */ jsx("p", {
								className: "text-sm text-slate-500",
								children: tr("sem_reservas", "Sem reservas registadas para esta saída.")
							})]
						}) : modal === "historico" ? /* @__PURE__ */ jsxs("div", {
							className: "space-y-3",
							children: [panel?.historico.map((h) => /* @__PURE__ */ jsxs("article", {
								className: "rounded border border-slate-200 p-3 text-sm",
								children: [/* @__PURE__ */ jsxs("strong", { children: [
									h.criado_em,
									" · #",
									h.usuario_id
								] }), /* @__PURE__ */ jsx("p", {
									className: "mt-1",
									children: tr(`acao_${h.acao}`, h.acao.replaceAll("_", " "))
								})]
							}, h.id)), !panel?.historico.length && /* @__PURE__ */ jsx("p", {
								className: "text-sm",
								children: tr("sem_historico", "Sem alterações registadas nesta agenda.")
							})]
						}) : modal === "recursos" ? /* @__PURE__ */ jsxs("div", {
							className: "space-y-3",
							children: [resources.map((r) => /* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between rounded border border-slate-200 p-3 text-sm",
								children: [/* @__PURE__ */ jsxs("span", { children: [
									r.nome,
									" · ",
									r.quantidade
								] }), /* @__PURE__ */ jsxs("button", {
									className: btn,
									onClick: () => edit("recurso", r),
									children: [/* @__PURE__ */ jsx(Icon, { icon: Pencil }), tr("editar", "Editar")]
								})]
							}, r.id)), /* @__PURE__ */ jsxs("button", {
								onClick: () => edit("recurso"),
								className: primary,
								children: [/* @__PURE__ */ jsx(Icon, { icon: Plus }), tr("novo_recurso", "Adicionar recurso")]
							})]
						}) : modal === "recurso" ? /* @__PURE__ */ jsxs("form", {
							className: "space-y-3",
							onSubmit: (e) => {
								e.preventDefault();
								prepare("guardar_recurso", form);
							},
							children: [
								label(tr("nome_recurso", "Nome do recurso *"), field("nome", "text", {
									required: true,
									maxLength: 150
								})),
								/* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-2 gap-3",
									children: [label(tr("tipo", "Tipo"), /* @__PURE__ */ jsxs("select", {
										value: form.tipo,
										onChange: (e) => setForm((f) => ({
											...f,
											tipo: e.target.value
										})),
										className: input,
										children: [/* @__PURE__ */ jsx("option", {
											value: "equipamento",
											children: tr("equipamento", "Equipamento")
										}), /* @__PURE__ */ jsx("option", {
											value: "guia",
											children: tr("guia", "Guia")
										})]
									})), label(tr("quantidade", "Quantidade *"), field("quantidade", "number", {
										required: true,
										min: 1
									}))]
								}),
								/* @__PURE__ */ jsx("h3", {
									className: "text-sm font-bold",
									children: tr("manutencao", "Manutenção / indisponibilidade")
								}),
								form.manutencoes.map((m, index) => /* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-2 gap-2 rounded border border-slate-200 p-3",
									children: [
										["inicio", "fim"].map((k) => label(k === "inicio" ? tr("inicio", "Início *") : tr("fim", "Fim *"), /* @__PURE__ */ jsx(CampoDataMorabeza, {
											required: true,
											value: m[k],
											onChange: (e) => setForm((f) => ({
												...f,
												manutencoes: f.manutencoes.map((v, i) => i === index ? {
													...v,
													[k]: e.target.value
												} : v)
											})),
											className: input
										}, k))),
										[
											"hora_inicio",
											"hora_fim",
											"quantidade"
										].map((k) => label(k === "hora_inicio" ? tr("hora_inicio", "Hora início") : k === "hora_fim" ? tr("hora_fim", "Hora fim") : tr("quantidade", "Quantidade *"), /* @__PURE__ */ jsx("input", {
											type: k === "quantidade" ? "number" : "time",
											required: true,
											step: k === "quantidade" ? 1 : 60,
											min: k === "quantidade" ? 1 : void 0,
											value: m[k],
											onChange: (e) => setForm((f) => ({
												...f,
												manutencoes: f.manutencoes.map((v, i) => i === index ? {
													...v,
													[k]: e.target.value
												} : v)
											})),
											className: input
										}, k))),
										/* @__PURE__ */ jsx("button", {
											type: "button",
											onClick: () => setForm((f) => ({
												...f,
												manutencoes: f.manutencoes.filter((_, i) => i !== index)
											})),
											className: `${btn} text-red-600!`,
											children: tr("remover", "Remover bloqueio")
										})
									]
								}, index)),
								/* @__PURE__ */ jsxs("button", {
									type: "button",
									className: btn,
									onClick: () => setForm((f) => ({
										...f,
										manutencoes: [...f.manutencoes, {
											inicio: day,
											fim: day,
											hora_inicio: "09:00",
											hora_fim: "09:30",
											quantidade: 1
										}]
									})),
									children: [/* @__PURE__ */ jsx(Icon, { icon: Plus }), tr("adicionar_manutencao", "Adicionar indisponibilidade")]
								}),
								/* @__PURE__ */ jsx("button", {
									type: "submit",
									disabled: busy,
									className: `${primary} ml-3`,
									children: tr("rever", "Rever alterações")
								})
							]
						}) : null
					]
				})
			})
		]
	});
}
//#endregion
export { AgendaExperiencia as default };
