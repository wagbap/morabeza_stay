// src/components/sobre/PolicyCancellation.jsx
import React from 'react';
import { Clock } from 'lucide-react';

const PolicyCancellation = () => {
  return (
    <div className="w-full bg-white">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
          <div className="bg-red-100 p-3 rounded-xl flex-shrink-0">
            <Clock size={28} className="text-red-600" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              Política de Cancelamento
            </h2>
            <p className="text-sm text-gray-500 hidden sm:block">
              Conheça as regras para cancelamento de reservas
            </p>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* 1. Alojamentos */}
          <div>
            <h4 className="text-lg font-bold text-[#003580] mb-3">1. Alojamentos</h4>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="flex justify-between text-sm">
                <span>Mais de 7 dias antes do check-in</span>
                <span className="font-bold text-green-600">100% reembolso</span>
              </p>
              <p className="flex justify-between text-sm">
                <span>Entre 3 e 7 dias antes do check-in</span>
                <span className="font-bold text-yellow-600">50% reembolso</span>
              </p>
              <p className="flex justify-between text-sm">
                <span>Menos de 72 horas antes do check-in</span>
                <span className="font-bold text-red-600">Sem reembolso</span>
              </p>
            </div>
            <p className="text-sm text-gray-500 mt-2">⚠️ Não comparência (No-Show): sem direito a reembolso</p>
          </div>

          {/* 2. Aluguer de Viaturas */}
          <div>
            <h4 className="text-lg font-bold text-[#003580] mb-3">2. Aluguer de Viaturas</h4>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="flex justify-between text-sm">
                <span>Até 48 horas antes do levantamento</span>
                <span className="font-bold text-green-600">100% reembolso</span>
              </p>
              <p className="flex justify-between text-sm">
                <span>Menos de 48 horas antes</span>
                <span className="font-bold text-red-600">Sem reembolso</span>
              </p>
            </div>
            <p className="text-sm text-gray-500 mt-2">⚠️ Não comparência (No-Show): sem direito a reembolso</p>
          </div>

          {/* 3. Experiências e Atividades */}
          <div>
            <h4 className="text-lg font-bold text-[#003580] mb-3">3. Experiências e Atividades</h4>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="flex justify-between text-sm">
                <span>Até 48 horas antes da atividade</span>
                <span className="font-bold text-green-600">100% reembolso</span>
              </p>
              <p className="flex justify-between text-sm">
                <span>Menos de 48 horas antes</span>
                <span className="font-bold text-red-600">Sem reembolso</span>
              </p>
            </div>
            <p className="text-sm text-gray-500 mt-2">⚠️ Não comparência (No-Show): sem direito a reembolso</p>
          </div>

          {/* 4. Cancelamento pelo Anfitrião */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <h4 className="font-bold text-[#003580] mb-2">4. Cancelamento pelo Anfitrião</h4>
            <p className="text-sm text-gray-700">✓ Reembolso de 100% do valor pago</p>
            <p className="text-sm text-gray-700">✓ A Morabeza Stay ajuda a encontrar alternativa</p>
            <p className="text-sm text-gray-700">✓ Cancelamentos frequentes = advertência ou remoção</p>
          </div>

          {/* 5. Circunstâncias Excecionais */}
          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
            <h4 className="font-bold text-yellow-700 mb-2">5. Circunstâncias Excecionais</h4>
            <p className="text-sm text-gray-700">
              Catástrofes naturais, condições extremas, acidentes, hospitalização, 
              falecimento, encerramento de aeroportos
            </p>
            <p className="text-sm text-gray-700 mt-1">
              Poderá ser concedido: reagendamento, crédito futuro ou reembolso total/parcial
            </p>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <p className="text-sm text-gray-400 italic flex items-center gap-2">
              <Clock size={14} />
              Última atualização: 2026
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-gray-500">Reembolso total</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                <span className="text-gray-500">Reembolso parcial</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span className="text-gray-500">Sem reembolso</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyCancellation;