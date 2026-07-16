// src/components/sobre/TermsConditions.jsx
import React from 'react';
import { Award } from 'lucide-react';

const TermsConditions = () => {
  return (
    <div className="w-full bg-white">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
          <div className="bg-gray-100 p-3 rounded-xl flex-shrink-0">
            <Award size={28} className="text-gray-700" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              Termos e Condições
            </h2>
            <p className="text-sm text-gray-500 hidden sm:block">
              Leia atentamente os nossos termos e condições
            </p>
          </div>
        </div>

        <div className="space-y-6 text-gray-600">
          <p className="text-sm md:text-base leading-relaxed">
            Ao aceder, navegar ou utilizar a plataforma Morabeza Stay, o utilizador declara 
            ter lido, compreendido e aceite os presentes Termos e Condições.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
              <h5 className="font-bold text-[#003580] mb-2">1. Objeto da Plataforma</h5>
              <p className="text-sm text-gray-600">
                Alojamentos, viaturas para aluguer, experiências e atividades turísticas.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
              <h5 className="font-bold text-[#003580] mb-2">2. Criação de Conta</h5>
              <p className="text-sm text-gray-600">
                Fornecer informações verdadeiras, manter confidencialidade, não partilhar conta.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
              <h5 className="font-bold text-[#003580] mb-2">3. Reservas e Pagamentos</h5>
              <p className="text-sm text-gray-600">
                Sujeitas a disponibilidade, pagamento necessário para confirmação.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
              <h5 className="font-bold text-[#003580] mb-2">4. Responsabilidades</h5>
              <p className="text-sm text-gray-600">
                Clientes respeitam regras, anfitriões mantêm informações atualizadas.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
              <h5 className="font-bold text-[#003580] mb-2">5. Conteúdo Publicado</h5>
              <p className="text-sm text-gray-600">
                Utilizadores responsáveis por conteúdos publicados. Conteúdos falsos ou ofensivos 
                poderão ser removidos.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
              <h5 className="font-bold text-[#003580] mb-2">6. Suspensão de Contas</h5>
              <p className="text-sm text-gray-600">
                Contas que violem os termos, sejam fraudulentas ou coloquem outros em risco 
                poderão ser suspensas.
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
            <h5 className="font-bold text-yellow-700 mb-2 flex items-center gap-2">
              <span>⚠️</span> Limitação de Responsabilidade
            </h5>
            <p className="text-sm text-gray-700">
              A Morabeza Stay atua como intermediária e não pode ser responsabilizada por 
              informações incorretas, cancelamentos de terceiros, danos ou situações de força maior.
            </p>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <h5 className="font-bold text-[#003580] mb-2 flex items-center gap-2">
              <span>📝</span> Alterações aos Termos
            </h5>
            <p className="text-sm text-gray-700">
              A Morabeza Stay poderá atualizar estes Termos e Condições sempre que necessário. 
              As alterações entrarão em vigor após a sua publicação na plataforma.
            </p>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <p className="text-sm text-gray-400 italic flex items-center gap-2">
              <Award size={14} />
              Última atualização: 2026
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span className="text-gray-500">Termos gerais</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                <span className="text-gray-500">Limitações</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-gray-500">Atualizações</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;