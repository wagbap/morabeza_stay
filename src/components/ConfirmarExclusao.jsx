import React, { useEffect, useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, Loader2, X } from 'lucide-react';

export default function ConfirmarExclusao({ aberto, nome, loading, erro, onClose, onConfirm, tituloKey = 'exclusao_titulo', confirmarKey = 'exclusao_apagar', descricaoKey = 'exclusao_confirmar_nome' }) {
  const { t } = useTranslation();
  const dialogRef = useRef(null);
  const cancelarRef = useRef(null);
  const tituloId = useId();
  const descricaoId = useId();
  useEffect(() => {
    if (!aberto) return;
    const dialog = dialogRef.current;
    const anterior = document.activeElement;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    cancelarRef.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      if (anterior?.isConnected) anterior.focus();
    };
  }, [aberto]);
  if (!aberto) return null;
  return <dialog ref={dialogRef} aria-labelledby={tituloId} aria-describedby={descricaoId} aria-busy={loading}
    onCancel={event => { event.preventDefault(); if (!loading) onClose(); }}
    className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl border border-slate-100 bg-white p-0 text-slate-800 shadow-2xl backdrop:bg-slate-950/40 backdrop:backdrop-blur-sm">
    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
      <div className="flex items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Trash2 size={20} /></span><h2 id={tituloId} className="text-lg font-bold text-slate-900">{t(tituloKey)}</h2></div>
      <button type="button" disabled={loading} onClick={onClose} aria-label={t('exclusao_fechar')} className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 disabled:opacity-40"><X size={18} /></button>
    </div>
    <div className="space-y-3 px-5 py-5">
      <p id={descricaoId} className="break-words text-sm leading-relaxed text-slate-600">{t(descricaoKey, { nome })}</p>
      <p className="text-xs leading-relaxed text-slate-500">{t('exclusao_irreversivel')}</p>
      {erro && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-relaxed text-amber-900">{t(erro)}</p>}
    </div>
    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:justify-end">
      <button ref={cancelarRef} type="button" disabled={loading} onClick={onClose} className="min-h-11 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">{t('exclusao_cancelar')}</button>
      {!['exclusao_associados', 'carro_exclusao_associados'].includes(erro) && <button type="button" disabled={loading} onClick={onConfirm} className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-wait disabled:opacity-50">{loading && <Loader2 size={16} className="animate-spin" />}{t(loading ? 'exclusao_a_apagar' : confirmarKey)}</button>}
    </div>
  </dialog>;
}
