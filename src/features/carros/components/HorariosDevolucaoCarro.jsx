import { useTranslation } from 'react-i18next';
export default function HorariosDevolucaoCarro({ form, setForm, disabled }) {
  const { t } = useTranslation();
  return <div className="my-4 space-y-3 rounded-xl border border-gray-200 p-4">
    <h3 className="text-sm font-bold">{t('carro_horas_devolucao_janela')}</h3>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" disabled={disabled} checked={Number(form.devolucao_mesmo_horario ?? 1) === 1} onChange={e => setForm(v => ({ ...v, devolucao_mesmo_horario: e.target.checked ? 1 : 0 }))} />{t('carro_horas_mesmo')}</label>
    {Number(form.devolucao_mesmo_horario ?? 1) === 0 && <div className="grid grid-cols-2 gap-4">{['inicio', 'fim'].map(lado => <label key={lado} className="text-xs text-gray-600">{t(`carro_horas_${lado}`)}<input type="time" disabled={disabled} value={form[`devolucao_hora_${lado}`] || ''} onChange={e => setForm(v => ({ ...v, [`devolucao_hora_${lado}`]: e.target.value }))} className="mt-1 block w-full rounded-lg border border-gray-200 p-3 text-gray-900" /></label>)}</div>}
  </div>;
}
