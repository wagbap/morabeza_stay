// FormularioPagamentoStripe.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Lock, ChevronDown } from 'lucide-react';
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const elementStyle = {
  style: {
    base: {
      fontSize: '14px',
      color: '#0f172a',
      fontWeight: '500',
      fontFamily: 'inherit',
      '::placeholder': { color: '#94a3b8' },
      padding: '0',
    },
    invalid: { color: '#ef4444', iconColor: '#ef4444' },
  },
};

export const FormularioPagamentoStripe = ({
  valorTotal = 0,
  moeda = 'CVE',
  onPagar,
}) => {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();

  const [pais, setPais] = useState('Cabo Verde'); // removido? Actually we remove country
  const [zip, setZip] = useState('');
  const [salvarCartao, setSalvarCartao] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    try {
      if (onPagar) {
        await onPagar({
          stripe,
          elements,
          zip,
          salvarCartao,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Card Information */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-700 tracking-wide">
              {t('card_information', 'Informações do cartão')}
            </span>
          <button
  type="button"
  className="text-blue-600 hover:text-blue-700 text-xs font-semibold flex items-center gap-1 transition-colors"
  onClick={() => alert(t('scan_card_soon', 'Funcionalidade de scanner em breve'))}
>
  <Lock size={14} />
  <span>{t('pagamento_seguro', 'Pagamento seguro')}</span>
</button>
          </div>

          <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
            {/* Número do cartão */}
            <div className="relative flex items-center px-3.5 py-2.5 border-b border-slate-100">
              <div className="w-full">
                <CardNumberElement
                  options={{
                    ...elementStyle,
                    placeholder: t('card_number', 'Número do cartão'),
                  }}
                />
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <img
                  src="https://res.cloudinary.com/dpsrmzvsl/image/upload/v1789984475/45797ee6-e620-41c1-94b9-90fedd09da1c_1_bteoeg.png"
                  alt="Visa"
                  className="h-3.5 w-auto"
                />
                <img
                  src="https://res.cloudinary.com/dpsrmzvsl/image/upload/v1789984506/Stripe_Logo__revised_2016.svg_pbo81y.webp"
                  alt="Apple Pay"
                  className="h-3.5 w-auto"
                />
                <img
                  src="https://res.cloudinary.com/dpsrmzvsl/image/upload/v1789984239/Mastercard-logo_nvresu.png"
                  alt="Google Pay"
                  className="h-4 w-auto"
                />
              </div>
            </div>

            {/* Validade + CVC */}
            <div className="flex">
              <div className="flex-1 px-3.5 py-2.5 border-r border-slate-100">
                <CardExpiryElement
                  options={{
                    ...elementStyle,
                    placeholder: 'MM / YY',
                  }}
                />
              </div>
              <div className="flex-1 px-3.5 py-2.5">
                <CardCvcElement
                  options={{
                    ...elementStyle,
                    placeholder: 'CVC',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Billing Address - sem país */}
        <div>
          <span className="text-xs font-bold text-slate-700 tracking-wide block mb-2">
            {t('billing_address', 'Morada de faturação')}
          </span>

          <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
            <div className="px-3.5 py-2.5">
              <input
                type="text"
                autoComplete="postal-code"
                placeholder={t('zip_code', 'Código postal')}
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                className="w-full text-sm text-slate-900 placeholder:text-slate-400 outline-none bg-transparent font-medium"
              />
            </div>
          </div>
        </div>

        {/* Save card */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="salvarCartaoStripe"
            checked={salvarCartao}
            onChange={(e) => setSalvarCartao(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <label
            htmlFor="salvarCartaoStripe"
            className="text-xs text-slate-600 font-medium cursor-pointer select-none"
          >
            {t('save_card_future', 'Guardar este cartão para pagamentos futuros')}
          </label>
        </div>

        {/* Pay button */}
        <button
          type="submit"
          disabled={!stripe || loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.99] disabled:opacity-50"
        >
          <span>
            {t('pay', 'Pagar')} {moeda}{' '}
            {Number(valorTotal).toLocaleString('pt-CV', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </span>
          <Lock size={15} />
        </button>
      </form>
    </div>
  );
};

export default FormularioPagamentoStripe;