// src/components/sobre/TermsConditions.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Award, FileText, User, CreditCard, Shield, AlertTriangle, Edit, RefreshCw } from 'lucide-react';

const TermsConditions = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('termos_titulo', 'Termos e Condições')} | Morabeza Stay</title>
        <meta name="description" content={t('termos_descricao', 'Leia atentamente os nossos termos e condições')} />
      </Helmet>

      <div className="w-full bg-white">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
            <div className="bg-blue-50 p-3 rounded-xl flex-shrink-0">
              <FileText size={28} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                {t('termos_titulo', 'Termos e Condições')}
              </h2>
              <p className="text-sm text-gray-500 hidden sm:block">
                {t('termos_subtitulo', 'Leia atentamente os nossos termos e condições')}
              </p>
            </div>
          </div>

          <div className="space-y-6 text-gray-600">
            {/* Introdução */}
            <div className="bg-gray-50 rounded-xl p-5">
              <p className="text-sm md:text-base leading-relaxed">
                {t('termos_introducao', 'Ao aceder, navegar ou utilizar a plataforma Morabeza Stay, o utilizador declara ter lido, compreendido e aceite os presentes Termos e Condições.')}
              </p>
            </div>

            {/* Grid de informações */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <FileText size={18} className="text-blue-600" />
                  <h5 className="font-bold text-[#003580]">
                    {t('termos_objeto_titulo', '1. Objeto da Plataforma')}
                  </h5>
                </div>
                <p className="text-sm text-gray-600">
                  {t('termos_objeto_desc', 'Alojamentos, viaturas para aluguer, experiências e atividades turísticas.')}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <User size={18} className="text-blue-600" />
                  <h5 className="font-bold text-[#003580]">
                    {t('termos_conta_titulo', '2. Criação de Conta')}
                  </h5>
                </div>
                <p className="text-sm text-gray-600">
                  {t('termos_conta_desc', 'Fornecer informações verdadeiras, manter confidencialidade, não partilhar conta.')}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard size={18} className="text-blue-600" />
                  <h5 className="font-bold text-[#003580]">
                    {t('termos_reservas_titulo', '3. Reservas e Pagamentos')}
                  </h5>
                </div>
                <p className="text-sm text-gray-600">
                  {t('termos_reservas_desc', 'Sujeitas a disponibilidade, pagamento necessário para confirmação.')}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <Shield size={18} className="text-blue-600" />
                  <h5 className="font-bold text-[#003580]">
                    {t('termos_responsabilidades_titulo', '4. Responsabilidades')}
                  </h5>
                </div>
                <p className="text-sm text-gray-600">
                  {t('termos_responsabilidades_desc', 'Clientes respeitam regras, anfitriões mantêm informações atualizadas.')}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <Edit size={18} className="text-blue-600" />
                  <h5 className="font-bold text-[#003580]">
                    {t('termos_conteudo_titulo', '5. Conteúdo Publicado')}
                  </h5>
                </div>
                <p className="text-sm text-gray-600">
                  {t('termos_conteudo_desc', 'Utilizadores responsáveis por conteúdos publicados. Conteúdos falsos ou ofensivos poderão ser removidos.')}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle size={18} className="text-blue-600" />
                  <h5 className="font-bold text-[#003580]">
                    {t('termos_suspensao_titulo', '6. Suspensão de Contas')}
                  </h5>
                </div>
                <p className="text-sm text-gray-600">
                  {t('termos_suspensao_desc', 'Contas que violem os termos, sejam fraudulentas ou coloquem outros em risco poderão ser suspensas.')}
                </p>
              </div>
            </div>

            {/* Limitação de Responsabilidade */}
            <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-200">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h5 className="font-bold text-yellow-700 mb-2">
                    {t('termos_limitacao_titulo', 'Limitação de Responsabilidade')}
                  </h5>
                  <p className="text-sm text-gray-700">
                    {t('termos_limitacao_desc', 'A Morabeza Stay atua como intermediária e não pode ser responsabilizada por informações incorretas, cancelamentos de terceiros, danos ou situações de força maior.')}
                  </p>
                </div>
              </div>
            </div>

            {/* Alterações aos Termos */}
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
              <div className="flex items-start gap-3">
                <RefreshCw size={20} className="text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h5 className="font-bold text-[#003580] mb-2">
                    {t('termos_alteracoes_titulo', 'Alterações aos Termos')}
                  </h5>
                  <p className="text-sm text-gray-700">
                    {t('termos_alteracoes_desc', 'A Morabeza Stay poderá atualizar estes Termos e Condições sempre que necessário. As alterações entrarão em vigor após a sua publicação na plataforma.')}
                  </p>
                </div>
              </div>
            </div>

            {/* Lei Aplicável */}
            <div className="bg-green-50 rounded-xl p-5 border border-green-200">
              <div className="flex items-start gap-3">
                <Award size={20} className="text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h5 className="font-bold text-green-700 mb-2">
                    {t('termos_lei_titulo', 'Lei Aplicável')}
                  </h5>
                  <p className="text-sm text-gray-700">
                    {t('termos_lei_desc', 'Os presentes Termos e Condições são regidos pela legislação cabo-verdiana. Qualquer litígio será resolvido nos tribunais da comarca da Praia, Cabo Verde.')}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <p className="text-sm text-gray-400 flex items-center gap-2">
                <FileText size={14} className="text-blue-500" />
                {t('termos_ultima_atualizacao', 'Última atualização: 2026')}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-gray-500">
                    {t('termos_footer_gerais', 'Termos gerais')}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  <span className="text-gray-500">
                    {t('termos_footer_limitacoes', 'Limitações')}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-gray-500">
                    {t('termos_footer_atualizacoes', 'Atualizações')}
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

export default TermsConditions;