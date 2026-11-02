import { createRequire } from "node:module";
import "react";
import { CalendarDays, Car, CircleAlert, CircleCheck, Clock, ExternalLink, Eye, FileText, House, Loader2, Map as Map$1, MoreHorizontal, UserRound } from "lucide-react";
//#region \0rolldown/runtime.js
var __commonJSMin = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __require = /* @__PURE__ */ createRequire(import.meta.url);
//#endregion
//#region node_modules/react/cjs/react-jsx-runtime.production.js
/**
* @license React
* react-jsx-runtime.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_jsx_runtime_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
	function jsxProd(type, config, maybeKey) {
		var key = null;
		void 0 !== maybeKey && (key = "" + maybeKey);
		void 0 !== config.key && (key = "" + config.key);
		if ("key" in config) {
			maybeKey = {};
			for (var propName in config) "key" !== propName && (maybeKey[propName] = config[propName]);
		} else maybeKey = config;
		config = maybeKey.ref;
		return {
			$$typeof: REACT_ELEMENT_TYPE,
			type,
			key,
			ref: void 0 !== config ? config : null,
			props: maybeKey
		};
	}
	exports.Fragment = REACT_FRAGMENT_TYPE;
	exports.jsx = jsxProd;
	exports.jsxs = jsxProd;
}));
//#endregion
//#region node_modules/react/cjs/react-jsx-runtime.development.js
/**
* @license React
* react-jsx-runtime.development.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_jsx_runtime_development = /* @__PURE__ */ __commonJSMin(((exports) => {
	"production" !== process.env.NODE_ENV && (function() {
		function getComponentNameFromType(type) {
			if (null == type) return null;
			if ("function" === typeof type) return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
			if ("string" === typeof type) return type;
			switch (type) {
				case REACT_FRAGMENT_TYPE: return "Fragment";
				case REACT_PROFILER_TYPE: return "Profiler";
				case REACT_STRICT_MODE_TYPE: return "StrictMode";
				case REACT_SUSPENSE_TYPE: return "Suspense";
				case REACT_SUSPENSE_LIST_TYPE: return "SuspenseList";
				case REACT_ACTIVITY_TYPE: return "Activity";
			}
			if ("object" === typeof type) switch ("number" === typeof type.tag && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), type.$$typeof) {
				case REACT_PORTAL_TYPE: return "Portal";
				case REACT_CONTEXT_TYPE: return type.displayName || "Context";
				case REACT_CONSUMER_TYPE: return (type._context.displayName || "Context") + ".Consumer";
				case REACT_FORWARD_REF_TYPE:
					var innerType = type.render;
					type = type.displayName;
					type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
					return type;
				case REACT_MEMO_TYPE: return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
				case REACT_LAZY_TYPE:
					innerType = type._payload;
					type = type._init;
					try {
						return getComponentNameFromType(type(innerType));
					} catch (x) {}
			}
			return null;
		}
		function testStringCoercion(value) {
			return "" + value;
		}
		function checkKeyStringCoercion(value) {
			try {
				testStringCoercion(value);
				var JSCompiler_inline_result = !1;
			} catch (e) {
				JSCompiler_inline_result = !0;
			}
			if (JSCompiler_inline_result) {
				JSCompiler_inline_result = console;
				var JSCompiler_temp_const = JSCompiler_inline_result.error;
				var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
				JSCompiler_temp_const.call(JSCompiler_inline_result, "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.", JSCompiler_inline_result$jscomp$0);
				return testStringCoercion(value);
			}
		}
		function getTaskName(type) {
			if (type === REACT_FRAGMENT_TYPE) return "<>";
			if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE) return "<...>";
			try {
				var name = getComponentNameFromType(type);
				return name ? "<" + name + ">" : "<...>";
			} catch (x) {
				return "<...>";
			}
		}
		function getOwner() {
			var dispatcher = ReactSharedInternals.A;
			return null === dispatcher ? null : dispatcher.getOwner();
		}
		function UnknownOwner() {
			return Error("react-stack-top-frame");
		}
		function hasValidKey(config) {
			if (hasOwnProperty.call(config, "key")) {
				var getter = Object.getOwnPropertyDescriptor(config, "key").get;
				if (getter && getter.isReactWarning) return !1;
			}
			return void 0 !== config.key;
		}
		function defineKeyPropWarningGetter(props, displayName) {
			function warnAboutAccessingKey() {
				specialPropKeyWarningShown || (specialPropKeyWarningShown = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", displayName));
			}
			warnAboutAccessingKey.isReactWarning = !0;
			Object.defineProperty(props, "key", {
				get: warnAboutAccessingKey,
				configurable: !0
			});
		}
		function elementRefGetterWithDeprecationWarning() {
			var componentName = getComponentNameFromType(this.type);
			didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."));
			componentName = this.props.ref;
			return void 0 !== componentName ? componentName : null;
		}
		function ReactElement(type, key, props, owner, debugStack, debugTask) {
			var refProp = props.ref;
			type = {
				$$typeof: REACT_ELEMENT_TYPE,
				type,
				key,
				props,
				_owner: owner
			};
			null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
				enumerable: !1,
				get: elementRefGetterWithDeprecationWarning
			}) : Object.defineProperty(type, "ref", {
				enumerable: !1,
				value: null
			});
			type._store = {};
			Object.defineProperty(type._store, "validated", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: 0
			});
			Object.defineProperty(type, "_debugInfo", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: null
			});
			Object.defineProperty(type, "_debugStack", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: debugStack
			});
			Object.defineProperty(type, "_debugTask", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: debugTask
			});
			Object.freeze && (Object.freeze(type.props), Object.freeze(type));
			return type;
		}
		function jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStack, debugTask) {
			var children = config.children;
			if (void 0 !== children) if (isStaticChildren) if (isArrayImpl(children)) {
				for (isStaticChildren = 0; isStaticChildren < children.length; isStaticChildren++) validateChildKeys(children[isStaticChildren]);
				Object.freeze && Object.freeze(children);
			} else console.error("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
			else validateChildKeys(children);
			if (hasOwnProperty.call(config, "key")) {
				children = getComponentNameFromType(type);
				var keys = Object.keys(config).filter(function(k) {
					return "key" !== k;
				});
				isStaticChildren = 0 < keys.length ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";
				didWarnAboutKeySpread[children + isStaticChildren] || (keys = 0 < keys.length ? "{" + keys.join(": ..., ") + ": ...}" : "{}", console.error("A props object containing a \"key\" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />", isStaticChildren, children, keys, children), didWarnAboutKeySpread[children + isStaticChildren] = !0);
			}
			children = null;
			void 0 !== maybeKey && (checkKeyStringCoercion(maybeKey), children = "" + maybeKey);
			hasValidKey(config) && (checkKeyStringCoercion(config.key), children = "" + config.key);
			if ("key" in config) {
				maybeKey = {};
				for (var propName in config) "key" !== propName && (maybeKey[propName] = config[propName]);
			} else maybeKey = config;
			children && defineKeyPropWarningGetter(maybeKey, "function" === typeof type ? type.displayName || type.name || "Unknown" : type);
			return ReactElement(type, children, maybeKey, getOwner(), debugStack, debugTask);
		}
		function validateChildKeys(node) {
			isValidElement(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));
		}
		function isValidElement(object) {
			return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
		}
		var React = __require("react"), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"), ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, hasOwnProperty = Object.prototype.hasOwnProperty, isArrayImpl = Array.isArray, createTask = console.createTask ? console.createTask : function() {
			return null;
		};
		React = { react_stack_bottom_frame: function(callStackForError) {
			return callStackForError();
		} };
		var specialPropKeyWarningShown;
		var didWarnAboutElementRef = {};
		var unknownOwnerDebugStack = React.react_stack_bottom_frame.bind(React, UnknownOwner)();
		var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
		var didWarnAboutKeySpread = {};
		exports.Fragment = REACT_FRAGMENT_TYPE;
		exports.jsx = function(type, config, maybeKey) {
			var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
			return jsxDEVImpl(type, config, maybeKey, !1, trackActualOwner ? Error("react-stack-top-frame") : unknownOwnerDebugStack, trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask);
		};
		exports.jsxs = function(type, config, maybeKey) {
			var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
			return jsxDEVImpl(type, config, maybeKey, !0, trackActualOwner ? Error("react-stack-top-frame") : unknownOwnerDebugStack, trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask);
		};
	})();
}));
//#endregion
//#region src/components/admin/RepassesLista.jsx
var import_jsx_runtime = (/* @__PURE__ */ __commonJSMin(((exports, module) => {
	if (process.env.NODE_ENV === "production") module.exports = require_react_jsx_runtime_production();
	else module.exports = require_react_jsx_runtime_development();
})))();
const SmallIcon = ({ icon: Component, size = 12 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Component, {
	size,
	strokeWidth: 1.7,
	"aria-hidden": "true"
});
const tones = {
	pago: "bg-emerald-100 text-emerald-700",
	disponivel: "bg-emerald-100 text-emerald-700",
	verificar: "bg-amber-100 text-amber-800",
	retido: "bg-amber-100 text-amber-800",
	cancelado: "bg-red-50 text-red-700",
	aguardar: "bg-slate-100 text-slate-600",
	pendente: "bg-slate-100 text-slate-600"
};
function validationText(row, tr) {
	if (row.confirmado_em) return tr("confirmacao_admin", "Confirmação administrativa");
	if (!row.validado_em) return tr("em_falta", "Em falta");
	if (row.tipo === "alojamento") return tr("checkin_validado", "Check-in validado");
	if (row.tipo === "carro") return tr("entrega_validada", "Entrega validada");
	return tr("presenca_validada", "Presença validada");
}
function completionText(row, tr) {
	if (!row.concluido) return tr("em_curso_curto", "Em curso");
	if (row.estado === "verificar") return tr("por_confirmar", "Por confirmar");
	if (!(row.confirmado_em || [
		"concluida",
		"concluída",
		"finalizada",
		"completed"
	].includes(String(row.status).toLowerCase()))) return tr("fim_atingido", "Fim do serviço atingido");
	if (row.tipo === "carro") return tr("devolucao_confirmada", "Devolução confirmada");
	if (row.tipo === "experiencia") return tr("sessao_concluida", "Sessão concluída");
	return tr("estadia_concluida", "Estadia concluída");
}
function serviceText(row, tr) {
	return row.tipo === "alojamento" ? tr("alojamento_singular", "Alojamento") : row.tipo === "carro" ? tr("carro_singular", "Carro") : tr("experiencia_singular", "Experiência");
}
function RepassesLista(props) {
	const { rows, historic, tab, loading, labels, services, reasons, tr, money, date, onOpen } = props;
	const history = tab === "historico";
	const items = history ? historic : rows;
	if (loading || !items.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompactCards, { ...props });
	const headers = history ? [
		tr("data", "Data"),
		tr("prestador", "Prestador"),
		tr("reserva", "Reserva"),
		tr("valor", "Valor"),
		tr("referencia", "Referência"),
		tr("estado", "Estado"),
		tr("comprovativo", "Comprovativo")
	] : [
		tr("reserva_servico", "Reserva / Serviço"),
		tr("prestador", "Prestador"),
		tr("bruto_comissao", "Bruto / Comissão 10%"),
		tr("liquido", "Líquido"),
		tr("validacao", "Validação"),
		tr("conclusao", "Conclusão"),
		tr("estado_prazo", "Estado / Prazo"),
		tr("acoes", "Ações")
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "lg:hidden",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompactCards, { ...props })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "hidden overflow-hidden rounded-xl border border-[#dbe3ef] bg-white lg:block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[1000px] table-auto text-left text-[11px] leading-[1.45] text-[#10164b]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "border-b border-[#e2e8f2] bg-[#f3f6fa] text-[10px] text-[#52618b]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: headers.map((header) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-3 py-2.5 font-semibold",
						children: header
					}, header)) })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
					className: "divide-y divide-[#e8edf5]",
					children: items.map((row) => history ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "hover:bg-[#f8faff]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "whitespace-nowrap px-3 py-3 text-[10px] text-slate-500",
								children: date(row.data_transferencia || row.registado_em)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-3 font-semibold",
								children: row.prestador_nome
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-3 text-slate-500",
								children: row.tipo ? `${services[row.tipo]} #${row.reserva_id}` : tr("sem_vinculo", "Sem reserva associada")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "whitespace-nowrap px-3 py-3 font-bold",
								children: money(Math.round(Number(row.valor) * 100))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-3 text-slate-500",
								children: row.referencia || "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `inline-block rounded-md px-2 py-1 text-[10px] font-medium ${tones[row.estado] || tones.pendente}`,
									children: labels[row.estado] || row.estado
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-3",
								children: row.comprovativo_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: row.comprovativo_url,
									target: "_blank",
									rel: "noopener noreferrer",
									className: "inline-flex items-center gap-1.5 text-blue-600 hover:underline",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SmallIcon, { icon: Eye }), tr("ver", "Ver")]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] text-slate-400",
									children: tr("sem_comprovativo", "Sem comprovativo")
								})
							})
						]
					}, row.id) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "align-middle hover:bg-[#f8faff]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "max-w-52 px-3 py-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => onOpen("detalhes", row),
										className: "inline-flex items-center gap-1.5 font-bold text-[#001b67] underline underline-offset-2",
										children: [row.codigo_reserva, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-blue-600",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SmallIcon, {
												icon: ExternalLink,
												size: 11
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-0.5 text-[10px] text-[#5d6b96]",
										children: [
											serviceText(row, tr),
											" · ",
											row.anuncio_titulo
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-1.5 flex flex-wrap gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => onOpen("detalhes", row),
											className: "rounded bg-blue-50 px-1.5 py-0.5 text-[9px] text-blue-600",
											children: tr("ver_detalhes", "Ver detalhes")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `rounded px-1.5 py-0.5 text-[9px] ${row.cliente_pago ? "bg-emerald-100/75 text-emerald-700" : "bg-amber-50 text-amber-700"}`,
											children: row.cliente_pago ? tr("cliente_pago", "Cliente: pago") : tr("cliente_pendente", "Cliente: por pagar")
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-4 font-medium",
								children: row.prestador_nome
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "whitespace-nowrap px-3 py-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: money(row.bruto_centavos) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-0.5 text-[10px] text-[#6072a3]",
									children: ["−", money(row.comissao_centavos)]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "whitespace-nowrap px-3 py-4 font-bold",
								children: money(row.liquido_centavos)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex items-center gap-1.5 text-[10px]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: row.validado_em || row.confirmado_em ? "text-emerald-600" : "text-amber-600",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SmallIcon, {
											icon: row.validado_em || row.confirmado_em ? CircleCheck : CircleAlert,
											size: 13
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: !row.validado_em && !row.confirmado_em ? "text-amber-600" : "",
										children: validationText(row, tr)
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-3 py-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex items-center gap-1.5 text-[10px]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: row.concluido && row.estado !== "verificar" ? "text-emerald-600" : "text-[#10164b]",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SmallIcon, {
											icon: row.concluido && row.estado !== "verificar" ? CircleCheck : Clock,
											size: 13
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: !row.concluido ? "font-semibold" : "",
										children: completionText(row, tr)
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-[9px] text-[#6072a3]",
									children: [
										row.estado === "verificar" ? tr("fim_previsto", "Fim previsto:") : row.tipo === "alojamento" ? tr("checkout", "Check-out:") : "",
										" ",
										date(row.fim)
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-3 py-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: `inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[10px] font-medium ${row.estado === "disponivel" ? "text-emerald-600" : row.estado === "verificar" ? "text-amber-600" : tones[row.estado] || tones.pendente}`,
										children: [["disponivel", "verificar"].includes(row.estado) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `h-2 w-2 rounded-full ${row.estado === "disponivel" ? "bg-emerald-600" : "bg-amber-500"}` }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SmallIcon, {
											icon: row.estado === "aguardar" ? Clock : CircleAlert,
											size: 12
										}), labels[row.estado]]
									}),
									row.prazo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-[9px] text-[#6072a3]",
										children: [
											tr("prazo", "Prazo:"),
											" ",
											date(row.prazo)
										]
									}),
									(row.atrasado || row.vence_hoje) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `mt-1 inline-block rounded px-1.5 py-0.5 text-[9px] font-medium ${row.atrasado ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`,
										children: row.atrasado ? tr("atrasado", "Em atraso") : tr("vence_hoje", "Vence hoje")
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "min-w-40 px-3 py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [
											row.pode_confirmar && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => onOpen("verificar", row),
												className: "mb-1 w-full rounded-md border border-blue-900 px-2 py-1.5 text-[10px] font-medium text-blue-900 hover:bg-blue-50",
												children: tr("verificar", "Verificar")
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												disabled: !row.pode_registar,
												onClick: () => onOpen("registar", row),
												className: "w-full rounded-md bg-[#00276b] px-2 py-2 text-[10px] font-medium text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-[#eef0f5] disabled:text-[#929bb2] disabled:shadow-none",
												children: tr("registar", "Registar repasse")
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-[9px] text-[#6072a3]",
												children: reasons[row.motivo]
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => onOpen("detalhes", row),
										"aria-label": tr("ver_detalhes", "Ver detalhes"),
										className: "rounded p-1 text-blue-950 hover:bg-blue-50",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SmallIcon, {
											icon: MoreHorizontal,
											size: 16
										})
									})]
								})
							})
						]
					}, `${row.tipo}-${row.reserva_id}`))
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
			className: "flex justify-between gap-3 border-t border-[#e8edf5] px-3 py-2 text-[10px] text-[#6072a3]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
				items.length,
				" ",
				history ? tr("registos", "registos") : tr("reservas_pendentes", "reservas pendentes")
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: tr("exclusao_saldo", "Por verificar e retidos não integram o saldo disponível.") })]
		})]
	})] });
}
function CompactCards({ rows, historic, tab, loading, labels, services, reasons, tr, money, date, onOpen, language }) {
	const history = tab === "historico";
	const items = history ? historic : rows;
	const groups = /* @__PURE__ */ new Map();
	items.forEach((row) => {
		const key = String(history ? row.data_transferencia || row.registado_em : row.fim).slice(0, 7);
		if (!groups.has(key)) groups.set(key, []);
		groups.get(key).push(row);
	});
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "status",
		className: "flex items-center justify-center gap-2 py-12 text-xs text-slate-500",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "animate-spin",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SmallIcon, {
				icon: Loader2,
				size: 16
			})
		}), tr("carregar", "A carregar repasses…")]
	});
	if (!items.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-2xl border border-slate-100 bg-white py-12 text-center text-xs text-slate-500",
		children: tr("sem_resultados", "Nenhum registo para os filtros selecionados.")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-5",
		children: [...groups].sort(([a], [b]) => b.localeCompare(a)).map(([month, group]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "space-y-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center gap-2 px-1 text-blue-950",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SmallIcon, {
						icon: CalendarDays,
						size: 14
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-xs font-bold capitalize",
						children: new Intl.DateTimeFormat(["cv", "ir"].includes(language) ? "pt-PT" : language, {
							month: "long",
							year: "numeric"
						}).format(/* @__PURE__ */ new Date(`${month}-15T12:00:00`))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "rounded-full bg-slate-200/75 px-2 py-0.5 text-[9px] font-medium",
						children: [
							group.length,
							" ",
							tr("registos", "registos")
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ml-2 h-px flex-1 bg-slate-200" })
				]
			}), group.map((row) => {
				const TypeIcon = {
					alojamento: House,
					carro: Car,
					experiencia: Map$1
				}[row.tipo] || FileText;
				const estado = row.estado;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "flex flex-wrap items-start gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-[0_2px_2px_0_rgba(15,23,42,0.07)] transition-shadow hover:shadow-sm sm:flex-nowrap sm:items-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 sm:mt-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SmallIcon, {
								icon: TypeIcon,
								size: 15
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1 space-y-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-x-2 gap-y-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-slate-400",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SmallIcon, { icon: UserRound })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
											className: "text-xs font-bold text-slate-900",
											children: row.prestador_nome
										}),
										row.prestador_email && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "max-w-56 truncate text-[9px] text-slate-400",
											children: row.prestador_email
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: `inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold ${tones[estado] || tones.pendente}`,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SmallIcon, {
												icon: ["pago", "disponivel"].includes(estado) ? CircleCheck : estado === "aguardar" ? Clock : CircleAlert,
												size: 10
											}), labels[estado] || estado]
										}),
										row.tipo && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "rounded-full bg-slate-100 px-2 py-0.5 text-[9px] text-slate-600",
											children: services[row.tipo]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold text-slate-600",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-slate-400",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SmallIcon, { icon: FileText })
									}), history ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: row.referencia || (row.reserva_id ? `#${row.reserva_id}` : tr("sem_vinculo", "Sem reserva associada")) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => onOpen("detalhes", row),
											className: "text-left hover:text-blue-700",
											children: row.codigo_reserva
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-normal text-slate-400",
											children: "·"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-normal",
											children: row.anuncio_titulo
										})
									] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-wrap gap-x-4 gap-y-1 text-[9px] leading-4 text-slate-500",
									children: history ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
											tr("data", "Data"),
											": ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												className: "font-semibold",
												children: date(row.data_transferencia || row.registado_em)
											})
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
											tr("valor", "Valor"),
											": ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												className: "font-semibold text-slate-700",
												children: money(Math.round(Number(row.valor) * 100))
											})
										] }),
										!row.comprovativo_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-slate-400",
											children: tr("sem_comprovativo", "Sem comprovativo")
										})
									] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
											tr("valor", "Valor"),
											": ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												className: "font-semibold text-slate-600",
												children: money(row.bruto_centavos)
											})
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
											tr("comissao", "Comissão 10%"),
											": ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
												className: "font-semibold",
												children: ["−", money(row.comissao_centavos)]
											})
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-emerald-700",
											children: [
												tr("liquido", "Líquido"),
												": ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
													className: "font-semibold",
													children: money(row.liquido_centavos)
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
											tr("fim", "Fim:"),
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												className: "font-semibold",
												children: date(row.fim)
											})
										] }),
										row.prazo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: row.atrasado ? "text-red-600" : "text-blue-600",
											children: [
												tr("prazo", "Prazo:"),
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
													className: "font-semibold",
													children: date(row.prazo)
												}),
												row.atrasado ? ` · ${tr("atrasado", "Em atraso")}` : row.vence_hoje ? ` · ${tr("vence_hoje", "Vence hoje")}` : ""
											]
										})
									] })
								}),
								!history && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-x-3 gap-y-1 text-[9px]",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: row.cliente_pago ? "text-emerald-600" : "text-amber-600",
											children: row.cliente_pago ? tr("cliente_pago", "Cliente: pago") : tr("cliente_pendente", "Cliente: por pagar")
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: row.validado_em || row.confirmado_em ? "text-emerald-600" : "text-slate-400",
											children: validationText(row, tr)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-slate-400",
											children: reasons[row.motivo]
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex w-full shrink-0 items-center justify-end gap-2 pl-[52px] sm:w-auto sm:gap-3 sm:pl-0",
							children: [!history && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-1.5 sm:flex-row",
								children: [row.pode_confirmar && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => onOpen("verificar", row),
									className: "rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-semibold text-blue-900 hover:bg-slate-50",
									children: tr("verificar", "Verificar")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									disabled: !row.pode_registar,
									onClick: () => onOpen("registar", row),
									className: "rounded-lg bg-[#003580] px-3 py-2 text-[10px] font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400",
									children: tr("registar", "Registar repasse")
								})]
							}), history ? row.comprovativo_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: row.comprovativo_url,
								target: "_blank",
								rel: "noopener noreferrer",
								"aria-label": tr("comprovativo", "Comprovativo"),
								className: "rounded-lg p-2 text-blue-600 hover:bg-blue-50",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SmallIcon, {
									icon: Eye,
									size: 15
								})
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => onOpen("detalhes", row),
								"aria-label": tr("ver_detalhes", "Ver detalhes"),
								className: "rounded-lg p-2 text-blue-600 hover:bg-blue-50",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SmallIcon, {
									icon: Eye,
									size: 15
								})
							})]
						})
					]
				}, history ? row.id : `${row.tipo}-${row.reserva_id}`);
			})]
		}, month))
	});
}
//#endregion
export { RepassesLista as default };
