// src/components/admin/DetalheReservaModal.jsx
import React, { useEffect, useState } from 'react';
import {
  X, Loader2, AlertCircle, Home, Car, Compass,
  User, Building2, Calendar, CreditCard, Banknote, ShieldCheck, FileText, Users, Check
} from 'lucide-react';

const API_BASE = 'https://welovepalop.com';
const fmt = (n) => Number(n || 0).toLocaleString('pt-CV', { minimumFractionDigits: 0 });
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('pt-PT') : '—');
const fmtDateTime = (d) => (d ? new Date(d).toLocaleString('pt-PT') : '—');

const Linha = ({ label, valor, mono = false }) => (
  <div className="flex justify-between gap-4 py-2 border-b border-slate-100 last:border-0">
    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
    <span className={`text-sm text-slate-900 text-right ${mono ? 'font-mono' : 'font-medium'} break-all`}>
      {valor || '—'}
    </span>
  </div>
);

const BadgeStatus = ({ status }) => {
  const s = (status || '').toLowerCase();
  const map = {
    confirmada: ['bg-green-100 text-green-800', 'Confirmada'],
    confirmado: ['bg-green-100 text-green-800', 'Confirmada'],
    approved:   ['bg-green-100 text-green-800', 'Confirmada'],
    pendente:   ['bg-yellow-100 text-yellow-800', 'Pendente'],
    pending:    ['bg-yellow-100 text-yellow-800', 'Pendente'],
    cancelada:  ['bg-red-100 text-red-800', 'Cancelada'],
    cancelled:  ['bg-red-100 text-red-800', 'Cancelada'],
  };
  const [cls, label] = map[s] || ['bg-slate-100 text-slate-700', status || '—'];
  return <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${cls}`}>{label}</span>;
};

const BadgePagamento = ({ status }) => {
  const s = (status || '').toLowerCase();
  const map = {
    pago:         ['bg-emerald-100 text-emerald-800', 'Pago'],
    paid:         ['bg-emerald-100 text-emerald-800', 'Pago'],
    aguardando:   ['bg-amber-100 text-amber-800', 'Aguardando'],
    pendente:     ['bg-amber-100 text-amber-800', 'Aguardando'],
    reembolsado: ['bg-blue-100 text-blue-800', 'Reembolsado'],
    falhou:       ['bg-red-100 text-red-800', 'Falhou'],
  };
  const [cls, label] = map[s] || ['bg-slate-100 text-slate-700', status || '—'];
  return <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${cls}`}>{label}</span>;
};

const IconeTipo = ({ tipo }) => {
  if (tipo === 'alojamento')  return <Home size={16} className="text-blue-600" />;
  if (tipo === 'carro')       return <Car size={16} className="text-green-600" />;
  if (tipo === 'experiencia') return <Compass size={16} className="text-purple-600" />;
  return null;
};

const Avatar = ({ src, nome, size = 40 }) => {
  if (src) {
    return (
      <img
        src={src}
        alt={nome || ''}
        className="rounded-full object-cover border border-slate-200"
        style={{ width: size, height: size }}
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
    );
  }
  const inicial = (nome || '?').charAt(0).toUpperCase();
  return (
    <div
      className="rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {inicial}
    </div>
  );
};

const DetalheReservaModal = ({ reserva, onClose, onAprovar, onCancelar }) => {
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchDetalhe = async () => {
      if (!reserva?.id || !reserva?.tipo_reserva) {
        setErro('Dados da reserva em falta.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setErro(null);
      try {
        const url = `${API_BASE}/api/admin/get_reserva_detalhe.php?id=${reserva.id}&tipo=${reserva.tipo_reserva}`;
        const res = await fetch(url);
        const json = await res.json();

        if (json.status === 'success') {
          setData(json.data);
        } else {
          setErro(json.message || 'Erro ao carregar detalhe.');
        }
      } catch (e) {
        console.error('DetalheReservaModal fetch:', e);
        setErro('Erro de rede ao carregar detalhe.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetalhe();
  }, [reserva]);

  // Fecha ao pressionar ESC
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Bloqueia scroll do body enquanto o modal está aberto
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const fin = data?.financeiro || {};
  
  const statusAtual = data?.status || reserva?.status || '';
  const isConfirmada = (st) => ['confirmada', 'approved', 'confirmado'].includes((st || '').toLowerCase());
  const isCancelada = (st) => ['cancelada', 'cancelled'].includes((st || '').toLowerCase());

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start md:items-center justify-center p-2 md:p-6 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-4 md:my-0 max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-200 bg-gradient-to-r from-[#003580] to-[#0050b3] text-white rounded-t-2xl">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <IconeTipo tipo={data?.tipo || reserva?.tipo_reserva} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold truncate">
                Reserva {data?.codigo_reserva || reserva?.codigo_reserva || `#${reserva?.id}`}
              </h2>
              <p className="text-xs text-white/70 truncate">
                Criada em {fmtDateTime(data?.data_reserva || reserva?.data_inicio)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Corpo */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
              <Loader2 className="animate-spin text-[#003580]" size={32} />
              <p className="text-sm">A carregar detalhe completo…</p>
            </div>
          )}

          {erro && !loading && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              <AlertCircle className="shrink-0 mt-0.5" size={20} />
              <p className="text-sm font-medium">{erro}</p>
            </div>
          )}

          {data && !loading && !erro && (
            <div className="space-y-6">

              {/* Status + Pagamento */}
              <div className="flex flex-wrap items-center gap-3">
                <BadgeStatus status={data.status} />
                <BadgePagamento status={data.pagamento_status} />
                {data.politica_aceite && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
                    <ShieldCheck size={12} /> Política aceite
                  </span>
                )}
              </div>

              {/* Grid: Anúncio + Cliente + Prestador */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Anúncio */}
                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 size={16} className="text-[#003580]" />
                    <h3 className="text-sm font-bold text-slate-900">Serviço / Anúncio</h3>
                  </div>
                  <div className="flex gap-3">
                    {data.anuncio?.imagem && (
                      <img
                        src={data.anuncio.imagem}
                        alt=""
                        className="w-20 h-20 rounded-lg object-cover border border-slate-200 shrink-0"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900 truncate">
                        {data.anuncio?.titulo || '—'}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {[data.anuncio?.cidade, data.anuncio?.ilha].filter(Boolean).join(' · ') || '—'}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        {data.anuncio?.localizacao}
                      </p>
                      <p className="text-[11px] font-mono text-slate-400 mt-1">
                        ID #{data.anuncio?.id}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cliente */}
                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                  <div className="flex items-center gap-2 mb-3">
                    <User size={16} className="text-[#003580]" />
                    <h3 className="text-sm font-bold text-slate-900">Cliente</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar src={data.cliente?.foto} nome={data.cliente?.nome} />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900 truncate">{data.cliente?.nome || '—'}</p>
                      <p className="text-xs text-slate-500 truncate">{data.cliente?.email || '—'}</p>
                      <p className="text-xs text-slate-400">{data.cliente?.phone || ''}</p>
                    </div>
                  </div>
                </div>

                {/* Prestador */}
                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 md:col-span-2">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 size={16} className="text-[#003580]" />
                    <h3 className="text-sm font-bold text-slate-900">Prestador</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar src={data.prestador?.foto} nome={data.prestador?.nome} />
                    <div className="min-w-0 flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <p className="text-[11px] font-medium text-slate-500 uppercase">Nome</p>
                        <p className="text-sm font-semibold text-slate-900 truncate">{data.prestador?.nome || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-slate-500 uppercase">Email</p>
                        <p className="text-sm text-slate-700 truncate">{data.prestador?.email || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-slate-500 uppercase">Telefone</p>
                        <p className="text-sm text-slate-700">{data.prestador?.phone || '—'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Datas + Quantidade */}
              <div className="p-4 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={16} className="text-[#003580]" />
                  <h3 className="text-sm font-bold text-slate-900">Datas e Quantidade</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-[11px] font-medium text-slate-500 uppercase">Início</p>
                    <p className="font-semibold text-slate-900">{fmtDate(data.data_inicio)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-slate-500 uppercase">Fim</p>
                    <p className="font-semibold text-slate-900">{fmtDate(data.data_fim)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-slate-500 uppercase">Horário</p>
                    <p className="font-semibold text-slate-900">{data.hora || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-slate-500 uppercase">
                      {data.tipo === 'alojamento' ? 'Noites' : data.tipo === 'carro' ? 'Dias' : 'Pessoas'}
                    </p>
                    <p className="font-semibold text-slate-900">
                      {data.tipo === 'alojamento' && data.noites}
                      {data.tipo === 'carro' && data.dias}
                      {data.tipo === 'experiencia' && data.quantidade}
                      {' '}
                      {!data.noites && !data.dias && !data.quantidade && '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Participantes (alojamento / experiência) */}
              {data.participantes?.length > 0 && (
                <div className="p-4 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Users size={16} className="text-[#003580]" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Participantes ({data.participantes.length})
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {data.participantes.map((p, i) => (
                      <div key={i} className="flex items-center justify-between gap-2 py-1.5 px-2.5 bg-slate-50 rounded-lg text-sm">
                        <span className="font-medium text-slate-900 truncate">
                          {p.nome_completo}
                          {p.tipo === 'principal' && (
                            <span className="ml-2 text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">Principal</span>
                          )}
                        </span>
                        <span className="text-xs text-slate-500 shrink-0">
                          {p.idade === 'crianca' ? '👶 Criança' : '👤 Adulto'} · {p.nacionalidade || '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Financeiro */}
              <div className="p-4 border border-slate-200 rounded-xl bg-gradient-to-br from-slate-50 to-white">
                <div className="flex items-center gap-2 mb-3">
                  <Banknote size={16} className="text-[#003580]" />
                  <h3 className="text-sm font-bold text-slate-900">Financeiro</h3>
                </div>
                <Linha label="Valor bruto"     valor={`${fmt(fin.valor_bruto)} ${fin.moeda}`} />
                <Linha label="Taxa de limpeza" valor={fin.taxa_limpeza > 0 ? `${fmt(fin.taxa_limpeza)} ${fin.moeda}` : 'Não aplicável'} />
                <Linha label="Comissão Morabeza" valor={`− ${fmt(fin.comissao)} ${fin.moeda}`} />
                <Linha label="Líquido do prestador" valor={`${fmt(fin.liquido)} ${fin.moeda}`} />
              </div>

              {/* Pagamento */}
              <div className="p-4 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard size={16} className="text-[#003580]" />
                  <h3 className="text-sm font-bold text-slate-900">Pagamento</h3>
                </div>
                <Linha label="Estado" valor={<BadgePagamento status={data.pagamento_status} />} />
                <Linha label="Método" valor={data.pagamento?.metodo || '—'} />
                <Linha label="Referência" valor={data.pagamento?.referencia || '—'} mono />
                <Linha label="Pago em" valor={fmtDateTime(data.pagamento?.pago_em)} />
              </div>

              {/* Cancelamento / Reembolso (só se cancelada) */}
              {(data.status || '').toLowerCase() === 'cancelada' && (
                <div className="p-4 border border-red-200 rounded-xl bg-red-50/50">
                  <h3 className="text-sm font-bold text-red-700 mb-3">Cancelamento & Reembolso</h3>
                  <Linha label="Cancelada em" valor={fmtDateTime(data.cancelamento?.cancelada_em)} />
                  <Linha label="Motivo" valor={data.cancelamento?.motivo || '—'} />
                  <Linha label="Reembolso" valor={data.cancelamento?.reembolso || '—'} />
                  <Linha label="Valor reembolsado" valor={`${fmt(data.cancelamento?.valor_reembolso)} ${fin.moeda}`} />
                </div>
              )}

              {/* Repasse */}
              <div className="p-4 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={16} className="text-[#003580]" />
                  <h3 className="text-sm font-bold text-slate-900">Repasse ao prestador</h3>
                </div>
                {data.repasse?.id ? (
                  <>
                    <Linha label="Valor"       valor={`${fmt(data.repasse.valor)} ${fin.moeda}`} />
                    <Linha label="Método"      valor={data.repasse.metodo || '—'} />
                    <Linha label="IBAN destino" valor={data.repasse.iban_destino || '—'} mono />
                    <Linha label="Estado"      valor={data.repasse.estado || '—'} />
                    <Linha label="Registado em" valor={fmtDateTime(data.repasse.registado_em)} />
                    {data.repasse.comprovativo && (
                      <Linha
                        label="Comprovativo"
                        valor={
                          <a href={data.repasse.comprovativo} target="_blank" rel="noopener noreferrer"
                             className="text-blue-600 underline text-xs">
                            Ver ficheiro
                          </a>
                        }
                      />
                    )}
                    {data.repasse.observacoes && (
                      <Linha label="Observações" valor={data.repasse.observacoes} />
                    )}
                  </>
                ) : (
                  <p className="text-sm text-slate-400 italic">
                    Nenhum repasse registado para este prestador.
                  </p>
                )}
              </div>

            </div>
          )}
        </div>

        {/* Footer com os Botões Adicionados */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap justify-between items-center gap-4 rounded-b-2xl">
          <div className="flex flex-wrap items-center gap-2">
            {onAprovar && (
              <button
                type="button"
                onClick={onAprovar}
                disabled={isConfirmada(statusAtual)}
                className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl text-sm font-bold border border-green-200 transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
              >
                <Check size={16} /> Aprovar / Confirmar
              </button>
            )}

            {onCancelar && (
              <button
                type="button"
                onClick={onCancelar}
                disabled={isCancelada(statusAtual)}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-bold border border-red-200 transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
              >
                <AlertCircle size={16} /> Cancelar / Reembolsar
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#003580] hover:bg-[#002550] text-white text-sm font-bold rounded-xl transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetalheReservaModal;