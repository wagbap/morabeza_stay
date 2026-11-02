import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarDays, ChevronDown, ClipboardList, Clock, Minus, Plus, Star, Sun, Sunset, Tag, UsersRound } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/features/experiencias/components/CartaoReservaExperiencia.jsx
const money = (value) => `${new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 }).format(Number(value) || 0)} CVE`;
const size = (px, minimum = Math.round(px * .6)) => `clamp(${minimum}px, ${px / 6.3}cqw, ${px}px)`;
const Icon = ({ icon, className = "", large = false }) => /* @__PURE__ */ jsx("span", {
	className: `inline-flex shrink-0 ${className}`,
	style: {
		width: size(large ? 30 : 25, 18),
		height: size(large ? 30 : 25, 18)
	},
	children: React.createElement(icon, {
		width: "100%",
		height: "100%",
		strokeWidth: 1.8,
		"aria-hidden": true
	})
});
function CartaoReservaExperiencia({ preco, total, rating, avaliacoes, especial, grupo, jetski, vendaPorUnidade = false, pessoasPorUnidade = 2, nomeEquipamento, unidades = 1, setUnidades, duracao, duracoes = [], precosDuracoes = {}, duracaoSelecionada, selecionarDuracao, minimoRealizacao = 1, data, calendario, abrirCalendario, periodos = [], periodo, selecionarPeriodo, sessoes = [], sessaoIdSelecionada, selecionarHorario, vagas, participantes, setParticipantes, minParticipantes = 1, maxParticipantes, loading, bloqueado, reservar }) {
	const { t } = useTranslation();
	const tr = (key, text, values = {}) => t(`experiencia_cartao_${key}`, {
		defaultValue: text,
		...values
	});
	const pageKey = `${data}|${duracaoSelecionada}|${periodo}`;
	const [expanded, setExpanded] = useState({
		key: "",
		limit: 8
	});
	const limit = expanded.key === pageKey ? expanded.limit : 8;
	const selected = sessoes.find((s) => sessaoIdSelecionada != null && String(s.id) === String(sessaoIdSelecionada));
	const maxUnits = vendaPorUnidade ? Number(vagas) : Math.ceil(Number(vagas) / pessoasPorUnidade);
	const isJetSki = /jet[\s_-]*ski|mota/i.test(nomeEquipamento || "");
	const equipmentName = isJetSki ? tr("jetskis", "Jet skis") : nomeEquipamento || tr("equipamentos", "Equipamentos");
	const unitName = grupo ? tr("grupo", "grupo") : vendaPorUnidade ? isJetSki ? tr("mota", "mota") : tr("unidade", "unidade") : tr("pessoa", "pessoa");
	const ready = !loading && !bloqueado && selected && (vendaPorUnidade ? vagas >= unidades : vagas >= participantes) && participantes >= minParticipantes && participantes <= maxParticipantes && (!(jetski || vendaPorUnidade) || unidades <= maxUnits && participantes <= unidades * pessoasPorUnidade);
	const sessionText = selected ? `${selected.hora_inicio} - ${selected.hora_fim || "—"}` : "—";
	const durationName = (n) => n === 60 ? tr("uma_hora", "1 hora") : n % 60 === 0 ? tr("horas", "{{count}} horas", { count: n / 60 }) : tr("duracao_minutos", "{{count}} min", { count: n });
	const durationText = duracaoSelecionada ? durationName(Number(duracaoSelecionada)) : duracao;
	const heading = (icon, text) => /* @__PURE__ */ jsxs("h3", {
		className: "flex items-center font-semibold",
		style: {
			gap: size(10),
			fontSize: size(20, 13),
			lineHeight: 1.35
		},
		children: [/* @__PURE__ */ jsx(Icon, { icon }), text]
	});
	const sectionStyle = { marginTop: size(22, 16) };
	const optionStyle = {
		borderRadius: size(13, 9),
		borderWidth: 1,
		transition: "border-color 120ms, background-color 120ms"
	};
	const optionClass = (active) => `cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#3453bb] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 ${active ? "border-[#3453bb] bg-[#f8faff] text-[#2e4cb4]" : "border-[#d9dce3] bg-transparent text-[#253044] hover:border-[#8b9acb]"}`;
	const step = (icon, label, disabled, onClick) => /* @__PURE__ */ jsx("button", {
		type: "button",
		"aria-label": label,
		disabled: disabled || loading,
		onClick,
		className: "flex shrink-0 cursor-pointer items-center justify-center rounded-[10px] border border-[#d9dce3] text-[#52617c] transition hover:border-[#3453bb] hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-[#3453bb] disabled:cursor-not-allowed disabled:text-[#c0c5cf]",
		style: {
			width: size(46, 40),
			height: size(46, 40)
		},
		children: /* @__PURE__ */ jsx(Icon, { icon })
	});
	const controls = (value, min, max, onChange) => /* @__PURE__ */ jsxs("div", {
		className: "flex items-center",
		style: { gap: size(17, 10) },
		children: [
			step(Minus, tr("diminuir", "Diminuir"), value <= min, () => onChange(value - 1)),
			/* @__PURE__ */ jsx("output", {
				"aria-live": "polite",
				className: "min-w-4 text-center font-semibold",
				style: { fontSize: size(20, 14) },
				children: value
			}),
			step(Plus, tr("aumentar", "Aumentar"), value >= max, () => onChange(value + 1))
		]
	});
	const summary = [
		[tr("data_resumo", "Data"), data],
		[tr("periodo", "Período"), periodo || "—"],
		[tr("duracao", "Duração"), durationText || "—"],
		[tr("sessao", "Sessão"), sessionText],
		...vendaPorUnidade ? [[equipmentName, unidades]] : [],
		[tr("participantes", "Participantes"), participantes],
		[tr("subtotal", "Subtotal"), grupo ? money(preco) : `${money(preco)} × ${vendaPorUnidade ? unidades : participantes}`]
	];
	return /* @__PURE__ */ jsx("section", {
		className: "w-full rounded-[14px] border border-[#d9dce3] bg-white text-[#202b3e] shadow-[0_1px_6px_#172b4d06]",
		style: {
			containerType: "inline-size",
			fontFamily: "\"Inter Variable\", Inter, sans-serif"
		},
		children: /* @__PURE__ */ jsxs("div", {
			style: {
				padding: `${size(24, 16)} ${size(28, 16)} ${size(16, 14)}`,
				fontSize: size(18, 12)
			},
			children: [
				/* @__PURE__ */ jsxs("header", {
					className: "flex flex-wrap items-center justify-between",
					style: {
						gap: size(12, 8),
						minHeight: size(50, 36)
					},
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-baseline whitespace-nowrap",
						style: { gap: size(7, 5) },
						children: [/* @__PURE__ */ jsx("strong", {
							className: "font-extrabold tracking-[-0.035em]",
							style: {
								fontSize: size(42, 25),
								lineHeight: 1.15
							},
							children: money(preco)
						}), /* @__PURE__ */ jsxs("span", {
							className: "font-semibold",
							style: { fontSize: size(22, 13) },
							children: ["/ ", unitName]
						})]
					}), /* @__PURE__ */ jsxs("p", {
						className: "flex items-center text-[#6c7487]",
						style: {
							gap: size(10, 6),
							fontSize: size(18, 11)
						},
						children: [/* @__PURE__ */ jsx(Icon, {
							icon: Star,
							large: true,
							className: "text-[#df765e] [&_svg]:fill-current"
						}), Number(avaliacoes) > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("strong", {
							className: "font-semibold text-[#26334b]",
							children: rating
						}), /* @__PURE__ */ jsxs("span", { children: [
							"(",
							tr("avaliacoes", "{{count}} avaliações", { count: Number(avaliacoes) }),
							")"
						] })] }) : tr("sem_avaliacoes", "Sem avaliações")]
					})]
				}),
				especial && /* @__PURE__ */ jsxs("p", {
					className: "mt-3 flex items-center gap-2 rounded-lg border border-orange-100 bg-orange-50 p-3 text-xs font-semibold text-orange-700",
					children: [/* @__PURE__ */ jsx(Icon, { icon: Tag }), tr("especial", "PREÇO ESPECIAL!")]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "relative",
					style: { marginTop: size(18, 14) },
					children: [/* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: abrirCalendario,
						className: "flex w-full cursor-pointer items-center rounded-[15px] border border-[#d9dce3] text-left transition hover:border-[#3453bb] focus-visible:outline-2 focus-visible:outline-[#3453bb]",
						style: {
							gap: size(20, 10),
							minHeight: size(92, 66),
							padding: `${size(14, 10)} ${size(24, 12)}`
						},
						children: [
							/* @__PURE__ */ jsx(Icon, {
								icon: CalendarDays,
								large: true,
								className: "text-[#626d83]"
							}),
							/* @__PURE__ */ jsxs("span", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ jsx("span", {
									className: "block font-bold uppercase text-[#687184]",
									style: {
										fontSize: size(14, 10),
										lineHeight: 1.4
									},
									children: tr("data", "Data do passeio")
								}), /* @__PURE__ */ jsx("strong", {
									className: "block font-bold",
									style: {
										marginTop: size(3, 2),
										fontSize: size(27, 17),
										lineHeight: 1.25
									},
									children: data
								})]
							}),
							/* @__PURE__ */ jsxs("span", {
								className: "flex items-center font-semibold text-[#2e4db5]",
								style: {
									gap: size(12, 5),
									fontSize: size(21, 13)
								},
								children: [/* @__PURE__ */ jsx(Icon, {
									icon: CalendarDays,
									large: true
								}), tr("alterar", "Alterar")]
							})
						]
					}), calendario]
				}),
				periodos.length > 0 && /* @__PURE__ */ jsxs("div", {
					style: sectionStyle,
					children: [heading(Sun, tr("periodo", "Período")), /* @__PURE__ */ jsx("div", {
						className: "mt-2 grid grid-cols-3",
						style: { gap: size(8, 6) },
						children: periodos.map((p) => /* @__PURE__ */ jsxs("button", {
							type: "button",
							"aria-pressed": p.label === periodo,
							onClick: () => selecionarPeriodo(p.label),
							className: `flex flex-col items-center justify-center ${optionClass(p.label === periodo)}`,
							style: {
								...optionStyle,
								minHeight: size(110, 76),
								gap: size(4, 3),
								padding: size(9, 6)
							},
							children: [
								/* @__PURE__ */ jsx(Icon, {
									icon: p.label === "Tarde" ? Sunset : Sun,
									large: true,
									className: "text-[#d9a329]"
								}),
								/* @__PURE__ */ jsx("strong", {
									className: "font-semibold text-[#222c40]",
									style: { fontSize: size(18, 12) },
									children: p.label
								}),
								/* @__PURE__ */ jsx("span", {
									className: "whitespace-nowrap text-[#6d7486]",
									style: { fontSize: size(17, 10) },
									children: p.timeRange
								})
							]
						}, p.label))
					})]
				}),
				(duracoes.length > 0 || duracao) && /* @__PURE__ */ jsxs("div", {
					style: sectionStyle,
					children: [heading(Clock, tr("duracao", "Duração")), /* @__PURE__ */ jsx("div", {
						className: "mt-2 grid grid-cols-4",
						style: { gap: size(8, 5) },
						children: (duracoes.length ? duracoes : [null]).map((n) => {
							const active = n === null || Number(duracaoSelecionada) === n;
							const rate = n !== null && precosDuracoes[n] != null ? precosDuracoes[n] : duracoes.length <= 1 || active ? preco : null;
							const content = /* @__PURE__ */ jsxs(Fragment, { children: [
								/* @__PURE__ */ jsx(Icon, { icon: Clock }),
								/* @__PURE__ */ jsx("strong", {
									className: "whitespace-nowrap font-semibold",
									style: { fontSize: size(18, 11) },
									children: n === null ? duracao : durationName(n)
								}),
								rate !== null && /* @__PURE__ */ jsxs("span", {
									className: "whitespace-nowrap",
									style: { fontSize: size(14, 9) },
									children: [
										money(rate),
										" / ",
										unitName
									]
								})
							] });
							const style = {
								...optionStyle,
								minHeight: size(108, 78),
								gap: size(7, 5),
								padding: `${size(10, 6)} 2px`
							};
							return duracoes.length > 1 ? /* @__PURE__ */ jsx("button", {
								type: "button",
								"aria-pressed": active,
								"aria-label": durationName(n),
								onClick: () => selecionarDuracao(n),
								className: `flex flex-col items-center justify-center ${optionClass(active)}`,
								style,
								children: content
							}, n) : /* @__PURE__ */ jsx("div", {
								className: "flex flex-col items-center justify-center border-[#3453bb] bg-[#f8faff] text-[#2e4cb4]",
								style,
								children: content
							}, n || "single");
						})
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					style: sectionStyle,
					children: [heading(Clock, tr("escolha_sessao", "Escolha a sua sessão *")), loading ? /* @__PURE__ */ jsx("p", {
						role: "status",
						className: "mt-3 rounded-lg bg-slate-50 p-4 text-center text-sm text-slate-500",
						children: tr("carregar", "A carregar horários…")
					}) : !sessoes.length ? /* @__PURE__ */ jsx("p", {
						className: "mt-3 rounded-lg border border-slate-100 bg-slate-50 p-4 text-center text-sm text-slate-500",
						children: tr("sem_horarios", "Sem horários disponíveis para este período. Escolha outra data ou período.")
					}) : /* @__PURE__ */ jsx("div", {
						className: "mt-2 grid grid-cols-4",
						style: { gap: size(9, 5) },
						children: sessoes.slice(0, limit).map((s) => {
							const active = String(selected?.id) === String(s.id), count = Number(s.vagas_disponiveis) || 0;
							return /* @__PURE__ */ jsxs("button", {
								type: "button",
								"aria-pressed": active,
								"aria-label": `${s.hora_inicio} - ${s.hora_fim}`,
								disabled: !count || loading,
								onClick: () => selecionarHorario(s.hora_inicio, s.id),
								className: `flex flex-col items-center justify-center ${optionClass(active)}`,
								style: {
									...optionStyle,
									minHeight: size(80, 57),
									padding: "6px 2px",
									gap: size(7, 5)
								},
								children: [/* @__PURE__ */ jsxs("strong", {
									className: "whitespace-nowrap font-semibold text-[#26334b]",
									style: { fontSize: size(16, 9) },
									children: [
										s.hora_inicio,
										" - ",
										s.hora_fim || "—"
									]
								}), /* @__PURE__ */ jsx("span", {
									className: count >= 4 ? "text-[#278b65]" : count ? "text-[#d66b23]" : "text-[#9ba2af]",
									style: { fontSize: size(15, 9) },
									children: count ? tr("vagas", "{{count}} disponíveis", { count }) : tr("esgotado", "Esgotado")
								})]
							}, s.id);
						})
					})]
				}),
				sessoes.length > 0 && /* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between text-[#727b8d]",
					style: {
						marginTop: size(16, 12),
						gap: 8,
						fontSize: size(17, 11)
					},
					children: [/* @__PURE__ */ jsx("span", { children: tr("horarios_contador", "{{count}} de {{total}} horários", {
						count: Math.min(limit, sessoes.length),
						total: sessoes.length
					}) }), sessoes.length > limit && /* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: () => setExpanded({
							key: pageKey,
							limit: limit + 8
						}),
						className: "flex cursor-pointer items-center rounded-[9px] border border-[#3453bb] font-medium text-[#3453bb] transition hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-[#3453bb]",
						style: {
							gap: size(12, 6),
							padding: `${size(9, 7)} ${size(17, 10)}`,
							fontSize: size(15, 11)
						},
						children: [tr("ver_mais_horarios", "Ver mais horários"), /* @__PURE__ */ jsx(Icon, { icon: ChevronDown })]
					})]
				}),
				vendaPorUnidade && /* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between rounded-[13px] border border-[#d9dce3]",
					style: {
						marginTop: size(18, 14),
						gap: 8,
						minHeight: size(76, 66),
						padding: `${size(12, 10)} ${size(16, 10)}`
					},
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-start",
						style: { gap: size(13, 8) },
						children: [/* @__PURE__ */ jsx(Icon, { icon: UsersRound }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
							className: "font-semibold",
							style: { fontSize: size(20, 13) },
							children: equipmentName
						}), /* @__PURE__ */ jsx("p", {
							className: "mt-1 text-[#727b8d]",
							style: { fontSize: size(15, 10) },
							children: tr("max_jetskis_curto", "Máx. {{count}}", { count: maxUnits })
						})] })]
					}), controls(unidades, 1, maxUnits, (n) => {
						setUnidades(n);
						if (participantes > n * pessoasPorUnidade) setParticipantes(n * pessoasPorUnidade);
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-start justify-between",
					style: {
						marginTop: size(20, 16),
						gap: 8
					},
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-start",
						style: { gap: size(13, 8) },
						children: [/* @__PURE__ */ jsx(Icon, { icon: UsersRound }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
							className: "font-semibold",
							style: {
								fontSize: size(20, 12),
								lineHeight: 1.4
							},
							children: tr("numero_participantes", "Número de participantes *")
						}), /* @__PURE__ */ jsx("p", {
							className: "mt-1 text-[#727b8d]",
							style: { fontSize: size(15, 10) },
							children: vendaPorUnidade ? isJetSki ? tr("max_pessoas_mota", "Máx. {{count}} pessoas por mota", { count: pessoasPorUnidade }) : tr("max_pessoas_unidade", "Máx. {{count}} pessoas por unidade", { count: pessoasPorUnidade }) : tr("max_sessao", "Máx. {{count}} pessoas por sessão", { count: maxParticipantes })
						})] })]
					}), controls(participantes, minParticipantes, maxParticipantes, setParticipantes)]
				}),
				!vendaPorUnidade && !grupo && Number(minimoRealizacao) > 1 && /* @__PURE__ */ jsxs("aside", {
					className: "mt-3 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs leading-relaxed text-blue-800",
					children: [/* @__PURE__ */ jsx(Icon, { icon: UsersRound }), /* @__PURE__ */ jsx("p", { children: tr("minimo_realizacao", "Esta sessão requer pelo menos {{count}} participantes no total de todas as reservas. Pode reservar a partir de 1 lugar.", { count: Number(minimoRealizacao) }) })]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "flex flex-wrap items-center justify-between text-[#747c8e]",
					style: {
						marginTop: size(23, 16),
						gap: size(8, 5),
						fontSize: size(14, 9)
					},
					children: [
						["bg-[#278b65]", tr("legenda_disponivel", "Disponível (4 ou mais)")],
						["bg-[#ec571b]", tr("legenda_poucas", "Poucas vagas (1 a 3)")],
						["bg-[#c5c9d1]", tr("esgotado", "Esgotado")]
					].map(([color, label]) => /* @__PURE__ */ jsxs("span", {
						className: "inline-flex items-center",
						style: { gap: size(12, 5) },
						children: [/* @__PURE__ */ jsx("span", {
							className: `shrink-0 rounded-full ${color}`,
							style: {
								width: size(20, 11),
								height: size(20, 11)
							}
						}), label]
					}, label))
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between rounded-[12px] bg-[#f0f1f5]",
					style: {
						marginTop: size(16, 12),
						padding: `${size(13, 9)} ${size(16, 10)}`,
						gap: 8,
						fontSize: size(20, 13)
					},
					children: [/* @__PURE__ */ jsxs("span", {
						className: "flex items-center font-semibold",
						style: { gap: size(16, 9) },
						children: [/* @__PURE__ */ jsx(Icon, { icon: Tag }), grupo ? tr("preco_grupo", "Preço do grupo") : vendaPorUnidade ? isJetSki ? tr("preco_mota", "Preço por mota") : tr("preco_unidade", "Preço por unidade") : tr("preco_pessoa", "Preço por pessoa")]
					}), /* @__PURE__ */ jsx("strong", {
						className: "whitespace-nowrap font-bold",
						children: money(preco)
					})]
				}),
				/* @__PURE__ */ jsxs("section", {
					className: "rounded-[13px] bg-[#f0f1f5]",
					style: {
						marginTop: size(12, 9),
						padding: `${size(16, 12)} ${size(18, 12)}`
					},
					children: [
						heading(ClipboardList, tr("resumo", "Resumo da reserva")),
						/* @__PURE__ */ jsx("dl", {
							className: "text-[#626d80]",
							style: {
								marginTop: size(8, 6),
								fontSize: size(18, 12),
								lineHeight: 1.5
							},
							children: summary.map(([label, value]) => /* @__PURE__ */ jsxs("div", {
								className: "flex justify-between gap-3",
								children: [/* @__PURE__ */ jsx("dt", { children: label }), /* @__PURE__ */ jsx("dd", {
									className: "text-right",
									children: value
								})]
							}, label))
						}),
						/* @__PURE__ */ jsxs("div", {
							"aria-live": "polite",
							className: "flex items-center justify-between gap-2 border-t border-[#d6dbe3]",
							style: {
								marginTop: size(10, 8),
								paddingTop: size(10, 8)
							},
							children: [/* @__PURE__ */ jsx("strong", {
								className: "font-bold",
								style: { fontSize: size(20, 14) },
								children: tr("total_pagar", "Total a pagar")
							}), /* @__PURE__ */ jsx("strong", {
								className: "font-extrabold text-[#2e4db7]",
								style: { fontSize: size(28, 21) },
								children: money(total)
							})]
						})
					]
				}),
				/* @__PURE__ */ jsxs("button", {
					type: "button",
					disabled: !ready,
					onClick: reservar,
					className: "flex w-full cursor-pointer items-center justify-center rounded-[13px] bg-[#3c53a5] font-semibold text-white transition hover:bg-[#30458f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3453bb] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400",
					style: {
						marginTop: size(14, 12),
						gap: size(16, 10),
						minHeight: size(57, 46),
						fontSize: size(23, 16)
					},
					children: [/* @__PURE__ */ jsx(Icon, { icon: CalendarDays }), loading ? tr("carregar", "A carregar horários…") : bloqueado ? tr("indisponivel", "Data indisponível") : grupo ? tr("reservar_grupo", "Reservar grupo privado") : tr("reservar_curto", "Reservar")]
				}),
				/* @__PURE__ */ jsx("p", {
					className: "text-center text-[#7a8292]",
					style: {
						marginTop: size(10, 8),
						fontSize: size(14, 10),
						lineHeight: 1.4
					},
					children: tr("proximo_generico", "Os dados dos participantes serão preenchidos no próximo passo.")
				})
			]
		})
	});
}
//#endregion
export { CartaoReservaExperiencia as default };
