import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

const PayPalButton = ({ amount, currency, onSuccess, onError, reservationData }) => {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(true);
    const [convertedAmount, setConvertedAmount] = useState(null);
    const TAXA_CONVERSAO = 110.265;
    
    // Client ID da Sandbox
    const clientId = 'AaB7TSBPAQOlgGPjvIo2epKQRL0ziLbirhHuJYl9S9_Kck5wZpACLZXLEOc1lBOEJ6GjjONXmk0FW6Gu';
    
    useEffect(() => {
        // Converter CVE para EUR para exibição
        if (currency === 'CVE') {
            const valorEmEUR = amount / TAXA_CONVERSAO;
            setConvertedAmount(valorEmEUR.toFixed(2));
        } else {
            setConvertedAmount(amount);
        }
        setIsLoading(false);
    }, [amount, currency]);
    
    const createOrder = async () => {
        try {
            console.log(`💰 Criando ordem: ${amount} ${currency}`);
            
            const response = await fetch('https://welovepalop.com/api/paypal_api.php?action=create_order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: amount,
                    currency: currency,
                    reservation_data: reservationData
                })
            });
            
            const order = await response.json();
            
            if (order.error) {
                throw new Error(order.error);
            }
            
            console.log('✅ Ordem criada com ID:', order.id);
            return order.id;
        } catch (error) {
            console.error('❌ Erro ao criar order:', error);
            onError?.(error);
            return null;
        }
    };
    
    const onApprove = async (data) => {
        try {
            console.log('✅ Pagamento aprovado! Order ID:', data.orderID);
            
            const response = await fetch('https://welovepalop.com/api/paypal_api.php?action=capture_order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: data.orderID })
            });
            
            const captureData = await response.json();
            
            if (captureData.error) {
                throw new Error(captureData.error);
            }
            
            console.log('✅ Pagamento capturado com sucesso!');
            onSuccess?.(captureData);
            return captureData;
        } catch (error) {
            console.error('❌ Erro ao capturar pagamento:', error);
            onError?.(error);
        }
    };
    
    const handleError = (err) => {
        console.error('❌ PayPal Error:', err);
        onError?.(err);
    };
    
    if (isLoading) {
        return (
            <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-xs text-slate-500 mt-2">{t('carregando_paypal')}</p>
            </div>
        );
    }
    
    // Verificar valor mínimo (€0.50 = ~55 CVE)
    const valorEur = parseFloat(convertedAmount);
    if (currency === 'CVE' && valorEur < 0.50) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <p className="text-sm font-bold text-yellow-800">⚠️ {t('valor_minimo_nao_atingido')}</p>
                <p className="text-xs text-yellow-700 mt-1">
                    {t('paypal_valor_minimo')}<br />
                    {t('seu_total')}: {amount} CVE (≈ €{valorEur.toFixed(2)})
                </p>
                <p className="text-xs text-yellow-700 mt-2">
                    {t('escolha_outro_metodo')}
                </p>
            </div>
        );
    }
    
    // IMPORTANTE: O SDK do PayPal SÓ ACEITA EUR, USD, GBP, etc.
    // NÃO ACEITA CVE! Por isso forçamos 'EUR' aqui
    const paypalOptions = {
        clientId: clientId,
        currency: 'EUR',
        intent: 'capture',
        locale: 'pt_PT'
    };
    
    return (
        <PayPalScriptProvider options={paypalOptions}>
            <div className="paypal-button-container">
                <PayPalButtons
                    createOrder={createOrder}
                    onApprove={onApprove}
                    onError={handleError}
                    onCancel={() => handleError(new Error(t('pagamento_cancelado')))}
                    style={{
                        layout: 'vertical',
                        color: 'blue',
                        shape: 'rect',
                        label: 'pay',
                        height: 45,
                        tagline: false
                    }}
                />
                <p className="text-[10px] text-slate-500 text-center mt-2">
                    {t('sera_cobrado', { valorEur: valorEur, amount: amount })}
                </p>
            </div>
        </PayPalScriptProvider>
    );
};

export default PayPalButton;