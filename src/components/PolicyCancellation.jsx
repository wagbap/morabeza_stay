// src/components/sobre/PolicyCancellation.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Clock, Home, Car, Compass, Shield, AlertTriangle, RefreshCw } from 'lucide-react';

const PolicyCancellation = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('cancelamento_titulo', 'Política de Cancelamento')} | Morabeza Stay</title>
        <meta name="description" content={t('cancelamento_descricao', 'Conheça as regras para cancelamento de reservas')} />
      </Helmet>

      <div className="w-full bg-white">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
            <div className="bg-red-100 p-3 rounded-xl flex-shrink-0">
              <Clock size={28} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                {t('cancelamento_titulo', 'Política de Cancelamento')}
              </h2>
              <p className="text-sm text-gray-500 hidden sm:block">
                {t('cancelamento_subtitulo', 'Conheça as regras para cancelamento de reservas')}
              </p>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* 1. Alojamentos */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Home size={20} className="text-blue-600" />
                <h4 className="text-lg font-bold text-[#003580]">
                  {t('cancelamento_alojamentos_titulo', '1. Alojamentos')}
                </h4>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center text-sm py-1 border-b border-gray-200 last:border-0">
                  <span>{t('cancelamento_alojamentos_7dias', 'Mais de 7 dias antes do check-in')}</span>
                  <span className="font-bold text-green-600">{t('cancelamento_reembolso_100', '100% reembolso')}</span>
                </div>
                <div className="flex justify-between items-center text-sm py-1 border-b border-gray-200 last:border-0">
                  <span>{t('cancelamento_alojamentos_3a7dias', 'Entre 3 e 7 dias antes do check-in')}</span>
                  <span className="font-bold text-yellow-600">{t('cancelamento_reembolso_50', '50% reembolso')}</span>
                </div>
                <div className="flex justify-between items-center text-sm py-1 border-b border-gray-200 last:border-0">
                  <span>{t('cancelamento_alojamentos_72h', 'Menos de 72 horas antes do check-in')}</span>
                  <span className="font-bold text-red-600">{t('cancelamento_sem_reembolso', 'Sem reembolso')}</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                ⚠️ {t('cancelamento_no_show', 'Não comparência (No-Show): sem direito a reembolso')}
              </p>
            </div>

            {/* 2. Aluguer de Viaturas */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Car size={20} className="text-blue-600" />
                <h4 className="text-lg font-bold text-[#003580]">
                  {t('cancelamento_carros_titulo', '2. Aluguer de Viaturas')}
                </h4>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center text-sm py-1 border-b border-gray-200 last:border-0">
                  <span>{t('cancelamento_carros_48h', 'Até 48 horas antes do levantamento')}</span>
                  <span className="font-bold text-green-600">{t('cancelamento_reembolso_100', '100% reembolso')}</span>
                </div>
                <div className="flex justify-between items-center text-sm py-1 border-b border-gray-200 last:border-0">
                  <span>{t('cancelamento_carros_menos48h', 'Menos de 48 horas antes')}</span>
                  <span className="font-bold text-red-600">{t('cancelamento_sem_reembolso', 'Sem reembolso')}</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                ⚠️ {t('cancelamento_no_show', 'Não comparência (No-Show): sem direito a reembolso')}
              </p>
            </div>

            {/* 3. Experiências e Atividades */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Compass size={20} className="text-blue-600" />
                <h4 className="text-lg font-bold text-[#003580]">
                  {t('cancelamento_experiencias_titulo', '3. Experiências e Atividades')}
                </h4>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center text-sm py-1 border-b border-gray-200 last:border-0">
                  <span>{t('cancelamento_experiencias_48h', 'Até 48 horas antes da atividade')}</span>
                  <span className="font-bold text-green-600">{t('cancelamento_reembolso_100', '100% reembolso')}</span>
                </div>
                <div className="flex justify-between items-center text-sm py-1 border-b border-gray-200 last:border-0">
                  <span>{t('cancelamento_experiencias_menos48h', 'Menos de 48 horas antes')}</span>
                  <span className="font-bold text-red-600">{t('cancelamento_sem_reembolso', 'Sem reembolso')}</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                ⚠️ {t('cancelamento_no_show', 'Não comparência (No-Show): sem direito a reembolso')}
              </p>
            </div>

            {/* 4. Cancelamento pelo Anfitrião */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={20} className="text-blue-600" />
                <h4 className="font-bold text-[#003580]">
                  {t('cancelamento_anfitriao_titulo', '4. Cancelamento pelo Anfitrião')}
                </h4>
              </div>
              <p className="text-sm text-gray-700">✓ {t('cancelamento_anfitriao_reembolso', 'Reembolso de 100% do valor pago')}</p>
              <p className="text-sm text-gray-700">✓ {t('cancelamento_anfitriao_alternativa', 'A Morabeza Stay ajuda a encontrar alternativa')}</p>
              <p className="text-sm text-gray-700">✓ {t('cancelamento_anfitriao_advertencia', 'Cancelamentos frequentes = advertência ou remoção')}</p>
            </div>

            {/* 5. Circunstâncias Excecionais */}
            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={20} className="text-yellow-600" />
                <h4 className="font-bold text-yellow-700">
                  {t('cancelamento_excecoes_titulo', '5. Circunstâncias Excecionais')}
                </h4>
              </div>
              <p className="text-sm text-gray-700">
                {t('cancelamento_excecoes_desc', 'Catástrofes naturais, condições extremas, acidentes, hospitalização, falecimento, encerramento de aeroportos')}
              </p>
              <p className="text-sm text-gray-700 mt-1">
                {t('cancelamento_excecoes_possibilidades', 'Poderá ser concedido: reagendamento, crédito futuro ou reembolso total/parcial')}
              </p>
            </div>

            {/* 6. Como Solicitar Cancelamento */}
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw size={20} className="text-green-600" />
                <h4 className="font-bold text-green-700">
                  {t('cancelamento_como_solicitar_titulo', '6. Como Solicitar Cancelamento')}
                </h4>
              </div>
              <p className="text-sm text-gray-700">
                {t('cancelamento_como_solicitar_desc', 'Para solicitar o cancelamento de uma reserva, acesse a sua conta, vá para "Minhas Reservas", selecione a reserva desejada e clique em "Cancelar Reserva". O reembolso será processado de acordo com a política aplicável.')}
              </p>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <p className="text-sm text-gray-400 flex items-center gap-2">
                <Clock size={14} className="text-red-500" />
                {t('cancelamento_ultima_atualizacao', 'Última atualização: 2026')}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-gray-500">
                    {t('cancelamento_footer_total', 'Reembolso total')}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  <span className="text-gray-500">
                    {t('cancelamento_footer_parcial', 'Reembolso parcial')}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span className="text-gray-500">
                    {t('cancelamento_footer_sem', 'Sem reembolso')}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PolicyCancellation;