import React, { useState } from 'react';
import { FileText, Trash2, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TIPOS_DOCUMENTOS_CONDUTOR, FORMATOS_DOCUMENTOS_CONDUTOR, validarDocumentoCondutor } from '../utils/documentosCondutor';

export default function DocumentosCondutorUpload({ documentos, onChange }) {
  const { t } = useTranslation();
  const [erros, setErros] = useState({});
  const [arrastando, setArrastando] = useState(null);
  const escolher = (tipo, file) => {
    if (!file) return;
    const valido = validarDocumentoCondutor(file);
    setErros(prev => ({ ...prev, [tipo]: !valido }));
    if (valido) onChange({ ...documentos, [tipo]: file });
  };
  return <fieldset className="space-y-4">
    <legend className="mb-2 text-sm font-bold text-slate-900">{t('carro_docs_titulo')}</legend>
    <p className="text-xs text-slate-600">{t('carro_docs_privacidade')}</p>
    {TIPOS_DOCUMENTOS_CONDUTOR.map(tipo => <div key={tipo}>
      <label htmlFor={`condutor-${tipo}`} className="mb-2 block text-sm font-bold text-slate-700">{t(`carro_docs_${tipo}`)} *</label>
      <label htmlFor={`condutor-${tipo}`} onDragOver={e => { e.preventDefault(); setArrastando(tipo); }} onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setArrastando(null); }} onDrop={e => { e.preventDefault(); setArrastando(null); escolher(tipo, e.dataTransfer.files?.[0]); }} className={`flex cursor-pointer flex-col items-center rounded-xl border border-dashed p-5 text-center transition-all duration-200 hover:border-blue-500 hover:bg-blue-50 focus-within:ring-2 focus-within:ring-blue-600 ${arrastando === tipo ? 'scale-[1.01] border-blue-500 bg-blue-50' : 'border-slate-300 bg-white'}`}>
        <span className={documentos?.[tipo] ? 'text-blue-600' : 'text-slate-400'}>{documentos?.[tipo] ? <FileText size={30} /> : <Upload size={30} />}</span>
        <span className="mt-2 text-sm font-medium text-slate-700">{documentos?.[tipo] ? t('carro_docs_selecionado') : t('carro_docs_arrastar')}</span>
        <span className="mt-1 max-w-full break-all text-sm text-slate-500">{documentos?.[tipo]?.name || t('carro_docs_selecionar')}</span>
        <span className="mt-2 text-xs text-slate-500">{t('carro_docs_formatos')}</span>
        <input type="file" id={`condutor-${tipo}`} accept={FORMATOS_DOCUMENTOS_CONDUTOR} aria-invalid={Boolean(erros[tipo])} aria-describedby={`ajuda-${tipo}`} className="sr-only" onChange={e => { escolher(tipo, e.target.files?.[0]); e.target.value = ''; }} />
      </label>
      {documentos?.[tipo] && <button type="button" onClick={() => { onChange({ ...documentos, [tipo]: null }); setErros(prev => ({ ...prev, [tipo]: false })); }} className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-red-700"><span><Trash2 size={16} /></span>{t('carro_docs_remover')}</button>}
      <p id={`ajuda-${tipo}`} role={erros[tipo] ? 'alert' : undefined} className="mt-2 text-sm text-red-700">{erros[tipo] ? t('carro_docs_formato_erro') : ''}</p>
    </div>)}
  </fieldset>;
}
