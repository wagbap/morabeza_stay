// src/components/AlojamentoRegisto/ConfiguracaoHorarios.jsx
import React from 'react';
import { Clock, Info, Check, AlertCircle } from 'lucide-react';

/**
 * Configuração de check-in / check-out.
 *
 * Campos geridos:
 *  - checkin_inicio          "14:00"
 *  - checkin_fim             "22:00"
 *  - checkout_limite         "11:00"
 *  - checkin_flexivel        true | false
 *  - checkin_flexivel_nota   string (só quando flexível = true)
 */
const ConfiguracaoHorarios = ({ dados = {}, onChange, readOnly = false }) => {
  const handleChange = (campo, valor) => {
    if (!onChange || readOnly) return;
    onChange({ ...dados, [campo]: valor });
  };

  const checkinFlexivel = !!dados.checkin_flexivel;

  const formatarHora = (valor) => {
    if (!valor) return '';
    return String(valor).substring(0, 5);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock size={18} className="text-[#006ce4]" />
        <h4 className="text-sm font-semibold text-gray-800">
          Horários de check-in e check-out
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Check-in */}
        <div
          className={`border rounded-lg p-4 transition-colors ${
            checkinFlexivel
              ? 'border-gray-200 bg-gray-50 opacity-60'
              : 'border-gray-300 bg-white'
          }`}
        >
          <label className="block text-xs font-bold text-gray-600 uppercase mb-3">
            Intervalo de Check-in
          </label>

          <div className="flex items-center gap-2">
            <div className="flex-1">
              <span className="block text-[10px] text-gray-500 mb-1">Das</span>
              <input
                type="time"
                value={formatarHora(dados.checkin_inicio)}
                onChange={(e) => handleChange('checkin_inicio', e.target.value)}
                disabled={readOnly || checkinFlexivel}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4] disabled:bg-gray-100"
              />
            </div>
            <span className="text-gray-400 text-xs pt-5">até</span>
            <div className="flex-1">
              <span className="block text-[10px] text-gray-500 mb-1">às</span>
              <input
                type="time"
                value={formatarHora(dados.checkin_fim)}
                onChange={(e) => handleChange('checkin_fim', e.target.value)}
                disabled={readOnly || checkinFlexivel}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4] disabled:bg-gray-100"
              />
            </div>
          </div>

          {checkinFlexivel && (
            <p className="text-[11px] text-gray-500 italic mt-2">
              Desativado porque o check-in é flexível.
            </p>
          )}
        </div>

        {/* Check-out */}
        <div className="border border-gray-300 rounded-lg p-4 bg-white">
          <label className="block text-xs font-bold text-gray-600 uppercase mb-3">
            Hora limite de Check-out
          </label>

          <div className="flex-1">
            <span className="block text-[10px] text-gray-500 mb-1">Até às</span>
            <input
              type="time"
              value={formatarHora(dados.checkout_limite)}
              onChange={(e) => handleChange('checkout_limite', e.target.value)}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4]"
            />
          </div>
        </div>
      </div>

      {/* Toggle: Check-in flexível */}
      <div
        className={`border rounded-lg overflow-hidden transition-colors ${
          checkinFlexivel
            ? 'border-[#006ce4] bg-blue-50'
            : 'border-gray-200 bg-white'
        }`}
      >
        <button
          type="button"
          onClick={() => !readOnly && handleChange('checkin_flexivel', checkinFlexivel ? 0 : 1)}
          disabled={readOnly}
          className="w-full flex items-start justify-between gap-3 p-4 text-left hover:bg-black/5 transition-colors disabled:cursor-default"
        >
          <div className="flex items-start gap-3 flex-1">
            <div
              className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                checkinFlexivel
                  ? 'bg-[#006ce4] border-[#006ce4]'
                  : 'border-gray-300 bg-white'
              }`}
            >
              {checkinFlexivel && (
                <Check size={14} className="text-white" strokeWidth={3} />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                Check-in flexível
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                O hóspede pode chegar a qualquer hora. Ideal para alojamentos
                com acesso autónomo (caixa de chaves, fechadura eletrónica,
                receção 24h).
              </p>
            </div>
          </div>
        </button>

        {checkinFlexivel && (
          <div className="px-4 pb-4 border-t border-blue-100">
            <label className="block text-xs font-semibold text-blue-900 mt-3 mb-2">
              Como o hóspede faz o check-in? <span className="text-red-500">*</span>
            </label>
            <textarea
              value={dados.checkin_flexivel_nota || ''}
              onChange={(e) => handleChange('checkin_flexivel_nota', e.target.value)}
              rows={3}
              maxLength={255}
              disabled={readOnly}
              placeholder="Ex: Enviamos o código da caixa de chaves 24h antes da chegada. A receção está aberta 24h no lobby."
              className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:border-[#006ce4] resize-none bg-white"
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-[11px] text-blue-700 flex items-center gap-1">
                <Info size={12} />
                Esta nota será mostrada ao hóspede na confirmação da reserva.
              </p>
              <span className="text-[10px] text-gray-400">
                {(dados.checkin_flexivel_nota || '').length}/255
              </span>
            </div>
          </div>
        )}

        {!checkinFlexivel && (
          <div className="px-4 pb-4">
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg">
              <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-800">
                O hóspede será informado de que <strong>deve chegar entre as horas
                definidas</strong>. Chegadas fora desse intervalo precisam de
                acordo prévio.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfiguracaoHorarios;