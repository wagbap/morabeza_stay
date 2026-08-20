// src/components/sobre/PrivacyPolicy.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Eye, Database, Lock, Mail, Users, Cookie, Share2, AlertTriangle } from 'lucide-react';

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  return (
    <div className="w-full bg-white">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
          <div className="bg-green-100 p-3 rounded-xl flex-shrink-0">
            <Shield size={28} className="text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              {t('privacidade_titulo', 'Política de Privacidade')}
            </h2>
            <p className="text-sm text-gray-500 hidden sm:block">
              {t('privacidade_subtitulo', 'Como protegemos e utilizamos os seus dados pessoais')}
            </p>
          </div>
        </div>

        <div className="space-y-6 text-gray-600">
          {/* Introdução */}
          <div className="bg-gray-50 rounded-xl p-5">
            <p className="text-sm md:text-base leading-relaxed">
              {t('privacidade_introducao', 'A Morabeza Stay respeita a sua privacidade e está comprometida com a proteção dos seus dados pessoais. Esta Política de Privacidade explica como recolhemos, utilizamos, armazenamos e protegemos as suas informações quando utiliza a nossa plataforma.')}
            </p>
          </div>

          {/* Grid de informações */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <Database size={18} className="text-blue-600" />
                <h5 className="font-bold text-[#003580]">
                  {t('privacidade_dados_titulo', '1. Dados Recolhidos')}
                </h5>
              </div>
              <p className="text-sm text-gray-600">
                {t('privacidade_dados_desc', 'Nome, e-mail, telefone, dados de pagamento, preferências de viagem, histórico de reservas e informações de dispositivo.')}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <Eye size={18} className="text-blue-600" />
                <h5 className="font-bold text-[#003580]">
                  {t('privacidade_finalidade_titulo', '2. Finalidade da Recolha')}
                </h5>
              </div>
              <p className="text-sm text-gray-600">
                {t('privacidade_finalidade_desc', 'Processamento de reservas, comunicação, melhorias da plataforma, marketing personalizado e cumprimento legal.')}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <Lock size={18} className="text-blue-600" />
                <h5 className="font-bold text-[#003580]">
                  {t('privacidade_seguranca_titulo', '3. Segurança dos Dados')}
                </h5>
              </div>
              <p className="text-sm text-gray-600">
                {t('privacidade_seguranca_desc', 'Utilizamos tecnologias de encriptação, firewalls e controlos de acesso para proteger os seus dados contra acessos não autorizados.')}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <Share2 size={18} className="text-blue-600" />
                <h5 className="font-bold text-[#003580]">
                  {t('privacidade_partilha_titulo', '4. Partilha de Dados')}
                </h5>
              </div>
              <p className="text-sm text-gray-600">
                {t('privacidade_partilha_desc', 'Partilha com anfitriões e prestadores de serviços para reservas, entidades legais quando necessário e parceiros de confiança.')}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <Cookie size={18} className="text-blue-600" />
                <h5 className="font-bold text-[#003580]">
                  {t('privacidade_cookies_titulo', '5. Cookies')}
                </h5>
              </div>
              <p className="text-sm text-gray-600">
                {t('privacidade_cookies_desc', 'Utilizamos cookies para melhorar a experiência, analisar tráfego e personalizar conteúdo. Pode gerir as suas preferências no seu navegador.')}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <Users size={18} className="text-blue-600" />
                <h5 className="font-bold text-[#003580]">
                  {t('privacidade_direitos_titulo', '6. Direitos do Utilizador')}
                </h5>
              </div>
              <p className="text-sm text-gray-600">
                {t('privacidade_direitos_desc', 'Acesso, retificação, eliminação, portabilidade e oposição ao tratamento dos seus dados pessoais.')}
              </p>
            </div>
          </div>

          {/* Detalhes adicionais */}
          <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
            <div className="flex items-start gap-3">
              <Mail size={20} className="text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h5 className="font-bold text-[#003580] mb-2">
                  {t('privacidade_contacto_titulo', '7. Contacto para Privacidade')}
                </h5>
                <p className="text-sm text-gray-700">
                  {t('privacidade_contacto_desc', 'Para questões sobre privacidade ou exercer os seus direitos, contacte-nos em:')}
                </p>
                <p className="text-sm text-blue-600 font-medium mt-1">
                  privacidade@morabezastay.com
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-200">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h5 className="font-bold text-yellow-700 mb-2">
                  {t('privacidade_alteracoes_titulo', '8. Alterações à Política')}
                </h5>
                <p className="text-sm text-gray-700">
                  {t('privacidade_alteracoes_desc', 'Esta política pode ser atualizada periodicamente. Recomendamos que reveja esta página regularmente para se manter informado sobre como protegemos os seus dados pessoais.')}
                </p>
              </div>
            </div>
          </div>

          {/* Base Legal */}
          <div className="bg-green-50 rounded-xl p-5 border border-green-200">
            <h5 className="font-bold text-green-700 mb-3 flex items-center gap-2">
              <span>⚖️</span> 
              {t('privacidade_baselegal_titulo', 'Base Legal para o Tratamento de Dados')}
            </h5>
            <div className="space-y-2 text-sm text-gray-700">
              <p>✓ {t('privacidade_baselegal_consentimento', 'Consentimento explícito do utilizador')}</p>
              <p>✓ {t('privacidade_baselegal_contrato', 'Execução de contrato (reservas e pagamentos)')}</p>
              <p>✓ {t('privacidade_baselegal_legal', 'Cumprimento de obrigações legais')}</p>
              <p>✓ {t('privacidade_baselegal_interesse', 'Interesse legítimo da Morabeza Stay')}</p>
            </div>
          </div>

          {/* Período de Retenção */}
          <div className="bg-purple-50 rounded-xl p-5 border border-purple-200">
            <h5 className="font-bold text-purple-700 mb-2 flex items-center gap-2">
              <span>📅</span> 
              {t('privacidade_retencao_titulo', 'Período de Retenção de Dados')}
            </h5>
            <p className="text-sm text-gray-700">
              {t('privacidade_retencao_desc', 'Mantemos os seus dados pessoais apenas durante o período necessário para cumprir as finalidades para as quais foram recolhidos, incluindo para cumprir requisitos legais, contábeis ou de relatórios.')}
            </p>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <p className="text-sm text-gray-400 flex items-center gap-2">
              <Shield size={14} className="text-green-500" />
              {t('privacidade_ultima_atualizacao', 'Última atualização: Janeiro 2026')}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-gray-500">
                  {t('privacidade_footer_privacidade', 'Privacidade')}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span className="text-gray-500">
                  {t('privacidade_footer_seguranca', 'Segurança')}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                <span className="text-gray-500">
                  {t('privacidade_footer_transparencia', 'Transparência')}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;