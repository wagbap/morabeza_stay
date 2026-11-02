import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowLeftRight, CalendarDays, Car, CircleAlert, CircleCheck, Clock, Compass, CreditCard, ExternalLink, House, Landmark, Pause, Percent, Send, Wallet } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region tmp/detail-available.jsx
const pedirRepasses = async () => {
	throw Error("Unexpected request");
};
const Icon = ({ icon: C, size = 22 }) => /* @__PURE__ */ jsx("span", {
	className: "inline-flex shrink-0",
	children: /* @__PURE__ */ jsx(C, {
		size,
		strokeWidth: 1.8,
		"aria-hidden": "true"
	})
});
const money = (n) => `${new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 }).format(Number(n || 0) / 100)} CVE`;
const date = (v) => v ? `${String(v).slice(0, 10).split("-").reverse().join("/")}${String(v).length > 10 ? ` · ${String(v).slice(11, 16)}` : ""}` : "—";
const panel = "rounded-lg border border-[#dce8fa] bg-white/90 p-4 lg:p-5";
function DetalhesRepasse() {
	const { tipo, id } = useParams();
	const { t } = useTranslation();
	const tr = (key, text) => t(`admin_repasses_detalhe_${key}`, text);
	const [data, setData] = useState({
		"row": {
			"reserva_id": 1,
			"codigo_reserva": "MS-EXEMPLO-002",
			"status": "concluida",
			"pagamento_status": "pago",
			"preco_total": 1e4,
			"fim": "2026-10-26",
			"inicio": "2026-10-25",
			"anuncio_id": 1,
			"anuncio_titulo": "Toyota Yaris",
			"prestador_id": 2,
			"prestador_nome": "Santiago Rent",
			"prestador_email": "seed-repasses-rent@example.invalid",
			"iban_numero": "TESTE-NAO-TRANSFERIR-02",
			"iban_titular": "Santiago Rent",
			"validado_em": "2026-10-26 09:00:00",
			"confirmado_em": null,
			"confirmacao_motivo": null,
			"repasse_id": null,
			"legado_total": 0,
			"tipo": "carro",
			"bruto_centavos": 1e6,
			"comissao_centavos": 1e5,
			"liquido_centavos": 9e5,
			"legado_centavos": 0,
			"tem_iban": true,
			"estado": "disponivel",
			"motivo": "pronto",
			"cliente_pago": true,
			"concluido": true,
			"prazo": "2026-10-29",
			"atrasado": true,
			"vence_hoje": false,
			"pode_registar": true,
			"pode_confirmar": false,
			"cliente_nome": "Cliente de teste",
			"validado_por_nome": "Validador de teste"
		},
		"payouts": []
	}), [error, setError] = useState(""), [reveal, setReveal] = useState(false);
	useEffect(() => {
		const controller = new AbortController();
		setData(null);
		setError("");
		setReveal(false);
		window.scrollTo(0, 0);
		pedirRepasses({ action: "painel" }, controller.signal).then((result) => {
			const row = result.reservas.find((r) => r.tipo === tipo && String(r.reserva_id) === id);
			if (!row) throw new Error("BOOKING_NOT_FOUND");
			if (!controller.signal.aborted) setData({
				row,
				payouts: result.historico.filter((h) => h.tipo === tipo && String(h.reserva_id) === id)
			});
		}).catch(() => {
			if (!controller.signal.aborted) setError(tr("erro", "Não foi possível carregar os detalhes deste repasse."));
		});
		return () => controller.abort();
	}, [tipo, id]);
	const row = data?.row;
	const service = t(`admin_repasses_${tipo}_singular`, tipo);
	const base = `/admin/repasses/${tipo}/${id}`;
	const full = `/admin/reservas?tipo=${encodeURIComponent(tipo)}&reserva=${encodeURIComponent(id)}`;
	const ServiceIcon = tipo === "carro" ? Car : tipo === "alojamento" ? House : Compass;
	const paid = data?.payouts.filter((p) => p.estado === "pago").reduce((sum, p) => sum + Math.round(Number(p.valor) * 100), 0) || 0;
	const available = row?.pode_registar ? Math.max(0, row.liquido_centavos - paid) : 0;
	const state = row ? t(`admin_repasses_${row.estado === "verificar" ? "verificar_estado" : row.estado}`, row.estado) : "";
	const heading = (C, title) => /* @__PURE__ */ jsxs("h2", {
		className: "mb-3 flex items-center gap-3 border-b border-[#e5ebf5] pb-3 text-base font-bold",
		children: [/* @__PURE__ */ jsx(Icon, {
			icon: C,
			size: 25
		}), title]
	});
	const badge = (text, ok) => /* @__PURE__ */ jsxs("div", {
		className: `flex items-center gap-3 rounded-lg px-4 py-3 text-xs ${ok ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`,
		children: [/* @__PURE__ */ jsx(Icon, { icon: ok ? CircleCheck : CircleAlert }), text]
	});
	const fields = (pairs) => /* @__PURE__ */ jsx("dl", {
		className: "space-y-2.5 text-xs",
		children: pairs.map(([label, value]) => /* @__PURE__ */ jsxs("div", {
			className: "grid grid-cols-[35%_1fr] gap-3",
			children: [/* @__PURE__ */ jsx("dt", {
				className: "text-[#6575a1]",
				children: label
			}), /* @__PURE__ */ jsx("dd", {
				className: "min-w-0 break-words",
				children: value || "—"
			})]
		}, label))
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "-m-4 min-h-full space-y-3 bg-gradient-to-br from-white to-blue-50/50 p-4 text-[#111849] sm:-m-6 sm:p-6",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap items-center justify-between gap-3 text-xs text-[#52659a]",
				children: [/* @__PURE__ */ jsxs("nav", { children: [
					/* @__PURE__ */ jsx(Link, {
						to: "/admin/repasses",
						children: tr("repasses", "Repasses")
					}),
					" / ",
					row?.codigo_reserva || `#${id}`
				] }), /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-5",
					children: [/* @__PURE__ */ jsxs("span", { children: [
						tr("hoje", "Hoje:"),
						" ",
						new Intl.DateTimeFormat("pt-PT", { timeZone: "Atlantic/Cape_Verde" }).format(/* @__PURE__ */ new Date())
					] }), /* @__PURE__ */ jsxs(Link, {
						to: full,
						className: "inline-flex items-center gap-2 rounded-md border border-[#ccd7eb] bg-white px-4 py-2.5 text-blue-700",
						children: [/* @__PURE__ */ jsx(Icon, {
							icon: ExternalLink,
							size: 17
						}), tr("reserva_completa", "Ver reserva completa")]
					})]
				})]
			}),
			/* @__PURE__ */ jsxs(Link, {
				to: "/admin/repasses",
				className: "inline-flex items-center gap-2 text-xs text-blue-600",
				children: [/* @__PURE__ */ jsx(Icon, {
					icon: ArrowLeft,
					size: 17
				}), tr("voltar", "Voltar aos repasses")]
			}),
			/* @__PURE__ */ jsxs("header", { children: [/* @__PURE__ */ jsx("h1", {
				className: "text-3xl font-bold tracking-tight",
				children: tr("titulo", "Detalhes do repasse")
			}), row && /* @__PURE__ */ jsxs("p", {
				className: "mt-1 text-sm text-[#596b9b]",
				children: [
					tr("reserva", "Reserva"),
					" ",
					row.codigo_reserva,
					" · ",
					service,
					" · ",
					row.anuncio_titulo
				]
			})] }),
			error && /* @__PURE__ */ jsx("p", {
				role: "alert",
				className: "rounded-lg bg-red-50 p-3 text-xs text-red-700",
				children: error
			}),
			!row ? !error && /* @__PURE__ */ jsx("p", {
				role: "status",
				className: "py-12 text-xs",
				children: tr("carregar", "A carregar detalhes…")
			}) : /* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsxs("div", {
					className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-[1.1fr_.9fr_.9fr_1.4fr]",
					children: [
						badge(`${tr("reserva", "Reserva")}: ${row.status}`, [
							"confirmada",
							"concluida",
							"concluída",
							"finalizada"
						].includes(row.status)),
						badge(row.cliente_pago ? tr("pago", "Cliente: pago") : tr("nao_pago", "Cliente: pagamento pendente"), row.cliente_pago),
						badge(`${tr("repasse", "Repasse")}: ${state}`, ["disponivel", "pago"].includes(row.estado)),
						/* @__PURE__ */ jsxs("div", {
							className: `flex items-center gap-3 rounded-lg px-4 py-3 text-xs ${row.atrasado ? "bg-red-50 text-red-600" : "bg-slate-100 text-[#6575a1]"}`,
							children: [/* @__PURE__ */ jsx(Icon, { icon: row.atrasado ? CircleAlert : Clock }), row.prazo ? `${row.atrasado ? tr("atraso", "Em atraso · prazo") : tr("prazo", "Prazo para repasse:")} ${date(row.prazo)}` : tr("sem_prazo", "Prazo disponível após elegibilidade")]
						})
					]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
					children: [
						[
							CreditCard,
							tr("bruto", "Pago pelo cliente"),
							row.bruto_centavos,
							"bg-white"
						],
						[
							Percent,
							tr("comissao", "Comissão Morabeza Stay · 10%"),
							row.comissao_centavos,
							"bg-white"
						],
						[
							Wallet,
							tr("liquido", "Líquido do prestador"),
							row.liquido_centavos,
							"bg-emerald-50"
						],
						[
							ArrowLeftRight,
							tr("ja_pago", "Já repassado"),
							paid,
							"bg-slate-100"
						]
					].map(([C, title, value, color]) => /* @__PURE__ */ jsxs("section", {
						className: `flex items-center gap-4 rounded-lg border border-[#e1ebf8] p-4 ${color}`,
						children: [/* @__PURE__ */ jsx("span", {
							className: "rounded-lg bg-slate-50 p-3",
							children: /* @__PURE__ */ jsx(Icon, {
								icon: C,
								size: 28
							})
						}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
							className: "text-xs",
							children: title
						}), /* @__PURE__ */ jsx("p", {
							className: "mt-1 text-2xl font-bold tracking-tight",
							children: money(value)
						})] })]
					}, title))
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "grid items-start gap-3 lg:grid-cols-[1.08fr_1fr]",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "space-y-3",
						children: [/* @__PURE__ */ jsxs("section", {
							className: panel,
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex flex-wrap items-start justify-between gap-2",
								children: [heading(ServiceIcon, tr("servico", "Reserva e serviço")), /* @__PURE__ */ jsxs(Link, {
									to: full,
									className: "inline-flex items-center gap-1 text-[11px] text-blue-600 underline",
									children: [tr("condicoes", "Consultar condições da reserva"), /* @__PURE__ */ jsx(Icon, {
										icon: ExternalLink,
										size: 13
									})]
								})]
							}), fields([
								[tr("tipo", "Serviço"), service],
								[tr("anuncio", "Anúncio"), row.anuncio_titulo],
								[tr("cliente", "Cliente"), row.cliente_nome],
								[tipo === "carro" ? tr("levantamento", "Levantamento") : tr("inicio", "Início"), date(row.inicio)],
								[tipo === "carro" ? tr("devolucao", "Devolução") : tr("fim", "Fim do serviço"), date(row.fim)],
								[tr("prestador", "Prestador"), row.prestador_nome]
							])]
						}), /* @__PURE__ */ jsxs("section", {
							className: panel,
							children: [
								heading(CircleCheck, tr("validacao", "Validação e conclusão")),
								/* @__PURE__ */ jsxs("div", {
									className: "grid gap-4 sm:grid-cols-2",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "flex gap-3",
										children: [/* @__PURE__ */ jsx("span", {
											className: row.validado_em ? "text-emerald-700" : "text-amber-600",
											children: /* @__PURE__ */ jsx(Icon, { icon: row.validado_em ? CircleCheck : CircleAlert })
										}), /* @__PURE__ */ jsxs("div", {
											className: "space-y-1 text-xs",
											children: [
												/* @__PURE__ */ jsx("strong", { children: row.validado_em ? tr("qr_ok", "QR Code validado") : tr("qr_falta", "Validação QR em falta") }),
												/* @__PURE__ */ jsx("p", {
													className: "text-[#6575a1]",
													children: date(row.validado_em)
												}),
												row.validado_por_nome && /* @__PURE__ */ jsxs("p", {
													className: "text-[#6575a1]",
													children: [
														tr("validado_por", "Validado por:"),
														" ",
														row.validado_por_nome
													]
												}),
												/* @__PURE__ */ jsx(Link, {
													to: `${base}/verificar`,
													className: "inline-block text-blue-600 underline",
													children: tr("ver_registo", "Ver registo")
												})
											]
										})]
									}), /* @__PURE__ */ jsxs("div", {
										className: "flex gap-3",
										children: [/* @__PURE__ */ jsx("span", {
											className: row.concluido ? "text-emerald-700" : "text-amber-600",
											children: /* @__PURE__ */ jsx(Icon, { icon: row.concluido ? CircleCheck : Clock })
										}), /* @__PURE__ */ jsxs("div", {
											className: "space-y-1 text-xs",
											children: [
												/* @__PURE__ */ jsx("strong", { children: row.concluido ? tr("fim_atingido", "Fim do serviço atingido") : tr("em_curso", "Serviço em curso") }),
												/* @__PURE__ */ jsx("p", {
													className: "text-[#6575a1]",
													children: date(row.fim)
												}),
												/* @__PURE__ */ jsx("p", {
													className: "text-[11px] text-[#6575a1]",
													children: tr("fim_ajuda", "Calculado pela data prevista. A validação QR é obrigatória.")
												})
											]
										})]
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "mt-4 grid gap-4 rounded-lg bg-slate-50 p-3 sm:grid-cols-2",
									children: [
										/* @__PURE__ */ jsxs("div", {
											className: "flex gap-3 text-xs",
											children: [/* @__PURE__ */ jsx(Icon, { icon: CalendarDays }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
												className: "text-[#6575a1]",
												children: tr("disponivel", "Disponibilidade")
											}), /* @__PURE__ */ jsx("strong", { children: state })] })]
										}),
										/* @__PURE__ */ jsxs("div", {
											className: `flex gap-3 text-xs ${row.atrasado ? "text-red-600" : ""}`,
											children: [/* @__PURE__ */ jsx(Icon, { icon: Clock }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", { children: tr("prazo", "Prazo para repasse:") }), /* @__PURE__ */ jsx("strong", { children: date(row.prazo) })] })]
										}),
										/* @__PURE__ */ jsx("p", {
											className: "text-[10px] text-[#6575a1] sm:col-span-2",
											children: tr("dias", "Horários de Cabo Verde · Prazo de 3 dias úteis, sem feriados configurados.")
										})
									]
								})
							]
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "space-y-3",
						children: [/* @__PURE__ */ jsxs("section", {
							className: panel,
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "flex flex-wrap items-start justify-between gap-2",
									children: [heading(Landmark, tr("recebimento", "Dados de recebimento")), /* @__PURE__ */ jsx("span", {
										className: `rounded-md px-2 py-1 text-[10px] ${row.tem_iban ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`,
										children: row.tem_iban ? tr("iban_ok", "IBAN confirmado") : tr("iban_falta", "IBAN por confirmar")
									})]
								}),
								fields([
									[tr("prestador", "Prestador"), row.prestador_nome],
									[tr("titular", "Titular"), row.iban_titular],
									[tr("banco", "Banco"), row.iban_banco],
									[tr("pais", "País"), row.iban_pais],
									[tr("iban", "IBAN"), row.iban_numero ? reveal ? row.iban_numero : `${row.iban_numero.slice(0, 2)}•• ••••• ••••• ••••• ${row.iban_numero.slice(-4)}` : null]
								]),
								/* @__PURE__ */ jsxs("button", {
									onClick: () => setReveal((v) => !v),
									disabled: !row.tem_iban,
									className: "mt-3 inline-flex items-center gap-1 text-xs text-blue-600 underline disabled:opacity-50",
									children: [reveal ? tr("ocultar", "Ocultar dados autorizados") : tr("consultar", "Consultar dados autorizados"), /* @__PURE__ */ jsx(Icon, {
										icon: ExternalLink,
										size: 14
									})]
								})
							]
						}), /* @__PURE__ */ jsxs("section", {
							className: "rounded-lg border border-blue-200 bg-gradient-to-br from-emerald-50 to-blue-100/70 p-4 lg:p-5",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "grid gap-4 sm:grid-cols-[1fr_1.1fr]",
									children: [/* @__PURE__ */ jsxs("div", { children: [
										heading(Send, tr("manual", "Repasse manual")),
										/* @__PURE__ */ jsx("p", {
											className: "text-xs text-[#6575a1]",
											children: tr("valor_disponivel", "Valor disponível para registar")
										}),
										/* @__PURE__ */ jsx("p", {
											className: "mt-2 text-3xl font-bold",
											children: money(available)
										})
									] }), /* @__PURE__ */ jsx("ul", {
										className: "space-y-2 text-xs",
										children: [
											[tr("concluido", "Serviço concluído"), row.concluido],
											[tr("validado", "Validação registada"), Boolean(row.validado_em)],
											[tr("iban_ok", "IBAN confirmado"), row.tem_iban],
											[tr("sem_retencao", "Sem retenção ativa"), [
												"disponivel",
												"aguardar",
												"pago"
											].includes(row.estado)]
										].map(([label, ok]) => /* @__PURE__ */ jsxs("li", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ jsx("span", {
												className: ok ? "text-emerald-700" : "text-amber-600",
												children: /* @__PURE__ */ jsx(Icon, {
													icon: ok ? CircleCheck : CircleAlert,
													size: 17
												})
											}), label]
										}, label))
									})]
								}),
								row.pode_registar ? /* @__PURE__ */ jsx(Link, {
									to: `${base}/registar`,
									className: "mt-4 block rounded-md bg-[#00276b] p-3 text-center text-xs text-white",
									children: tr("registar", "Registar repasse")
								}) : /* @__PURE__ */ jsx("button", {
									disabled: true,
									className: "mt-4 w-full rounded-md bg-slate-300 p-3 text-xs text-white",
									children: tr("registar", "Registar repasse")
								}),
								/* @__PURE__ */ jsx("p", {
									className: "mt-2 text-center text-[11px] text-[#6575a1]",
									children: tr("aviso", "Regista uma transferência já realizada. Este botão não envia dinheiro.")
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "mt-3 flex flex-wrap items-center justify-between gap-3",
									children: [!row.repasse_id && /* @__PURE__ */ jsxs(Link, {
										to: `${base}/verificar`,
										className: "inline-flex items-center justify-center gap-2 rounded-md border border-amber-400 bg-amber-50 px-6 py-2 text-xs text-amber-700",
										children: [/* @__PURE__ */ jsx(Icon, {
											icon: Pause,
											size: 15
										}), row.estado === "retido" ? tr("rever", "Rever retenção") : tr("reter", "Reter repasse")]
									}), /* @__PURE__ */ jsx(Link, {
										to: `${base}/verificar`,
										className: "text-xs text-blue-600 underline",
										children: tr("verificacao", "Verificação e acompanhamento")
									})]
								})
							]
						})]
					})]
				}),
				/* @__PURE__ */ jsxs("section", {
					className: panel,
					children: [
						heading(Clock, tr("historico", "Histórico desta reserva")),
						/* @__PURE__ */ jsx("div", {
							className: "grid gap-4 text-xs sm:grid-cols-3",
							children: [
								[tr("pagamento", "Pagamento do cliente"), row.cliente_pago ? tr("confirmado", "Confirmado") : row.pagamento_status],
								[tr("validacao", "Validação e conclusão"), date(row.validado_em)],
								[tr("fim", "Fim do serviço"), date(row.fim)]
							].map(([title, text]) => /* @__PURE__ */ jsxs("div", {
								className: "flex items-start gap-3",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-blue-700",
									children: /* @__PURE__ */ jsx(Icon, {
										icon: Clock,
										size: 18
									})
								}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
									className: "text-[#6575a1]",
									children: text
								}), /* @__PURE__ */ jsx("strong", {
									className: "mt-1 block",
									children: title
								})] })]
							}, title))
						}),
						row.revisoes?.map((r) => /* @__PURE__ */ jsxs("div", {
							className: "mt-3 border-t border-[#e5ebf5] pt-3 text-xs",
							children: [/* @__PURE__ */ jsxs("strong", { children: [
								date(r.criado_em),
								" · ",
								r.resultado === "retido" ? tr("retencao", "Retenção registada") : tr("decisao", "Conclusão confirmada")
							] }), /* @__PURE__ */ jsx("p", {
								className: "mt-1 whitespace-pre-wrap text-[#6575a1]",
								children: r.motivo
							})]
						}, `r${r.id}`)),
						data.payouts.map((p) => /* @__PURE__ */ jsxs("div", {
							className: "mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#e5ebf5] pt-3 text-xs",
							children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("strong", { children: [
								date(p.data_transferencia || p.registado_em),
								" · ",
								money(Math.round(Number(p.valor) * 100))
							] }), /* @__PURE__ */ jsxs("p", {
								className: "mt-1 text-[#6575a1]",
								children: [
									p.referencia || "—",
									" · ",
									p.estado
								]
							})] }), p.comprovativo_url && /* @__PURE__ */ jsx("a", {
								href: p.comprovativo_url,
								target: "_blank",
								rel: "noopener noreferrer",
								className: "text-blue-600 underline",
								children: tr("comprovativo", "Ver comprovativo")
							})]
						}, `p${p.id}`)),
						!paid && /* @__PURE__ */ jsx("p", {
							className: "mt-4 rounded-md border border-blue-100 bg-blue-50 p-3 text-[11px] text-blue-700",
							children: tr("sem_repasse", "Nenhum repasse pago registado. O comprovativo bancário ficará disponível após o registo.")
						})
					]
				})
			] })
		]
	});
}
//#endregion
export { DetalhesRepasse as default };
