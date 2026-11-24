import { useTranslation } from 'react-i18next';

export default function CondicoesCarro({ dados = {} }) {
  const { t } = useTranslation();
  const valor = value => value === undefined || value === null || value === '' ? t('carro_cond_nao_definido') : value;
  const dinheiro = value => `${valor(value)} CVE`;
  const linhas = [
    ['levantamento', [dados.levantamento_ilha, dados.levantamento_local].filter(Boolean).join(' - ')],
    ['horario', dados.levantamento_hora_inicio && dados.levantamento_hora_fim ? `${dados.levantamento_hora_inicio.slice(0,5)} - ${dados.levantamento_hora_fim.slice(0,5)}` : null],
    ['devolucao', dados.devolucao_mesmo_local == null ? null : Number(dados.devolucao_mesmo_local) === 1 ? t('carro_cond_mesmo_local') : dados.devolucao_local_alternativo],
    ['horario_devolucao', Number(dados.devolucao_mesmo_horario ?? 1) === 1 ? [dados.levantamento_hora_inicio, dados.levantamento_hora_fim].filter(Boolean).map(h => h.slice(0,5)).join(' - ') : [dados.devolucao_hora_inicio, dados.devolucao_hora_fim].filter(Boolean).map(h => h.slice(0,5)).join(' - ')],
    ['idade', dados.idade_minima], ['carta', dados.carta_minima_anos],
    ['franquia', dados.franquia == null ? null : dinheiro(dados.franquia)],
    ['combustivel', dados.politica_combustivel ? t(`carro_cond_${dados.politica_combustivel}`) : null],
    ['km', dados.limite_km == null ? null : Number(dados.limite_km) === 0 ? t('carro_cond_ilimitado') : `${dados.limite_km} km`],
    ['km_extra', Number(dados.limite_km) > 0 ? dinheiro(dados.custo_km_extra) : null],
    ['segundo', dados.segundo_condutor == null ? null : t(Number(dados.segundo_condutor) === 1 ? 'carro_cond_sim' : 'carro_cond_nao')],
  ];
  return <section className="my-4 min-w-0 rounded-xl border border-gray-200 bg-white p-5 text-base leading-relaxed text-gray-700 [overflow-wrap:anywhere]">
    <h3 className="mb-2 text-xl font-bold text-gray-900">{t('carro_cond_titulo')}</h3>
    <p className="mb-4 text-sm text-gray-600">{t('carro_cond_unidades')}</p>
    <dl className="grid gap-4 sm:grid-cols-2">{linhas.filter(([key]) => key !== 'km_extra' || Number(dados.limite_km) > 0).map(([key, value]) => <div key={key}><dt className="text-sm text-gray-600">{t(`carro_cond_${key}`)}</dt><dd className="mt-1 font-medium">{valor(value)}</dd></div>)}</dl>
    {dados.levantamento_notas && <p className="mt-3 whitespace-pre-line">{dados.levantamento_notas}</p>}
    {dados.politica_atraso && <p className="mt-3 whitespace-pre-line"><strong>{t('carro_cond_atraso')}: </strong>{dados.politica_atraso}</p>}
  </section>;
}
