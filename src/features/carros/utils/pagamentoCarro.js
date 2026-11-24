export function prazoPagamentoCarro(data, recebidoEm = Date.now()) {
  const expires = Date.parse(data.expiresAt);
  const server = Date.parse(data.serverNow);
  if (!data.clientSecret || !Number.isFinite(expires) || !Number.isFinite(server)) {
    throw new Error('Invalid payment hold response');
  }
  return { ...data, prazoLocal: recebidoEm + Math.max(0, expires - server) };
}

export function segundosPagamentoCarro(prazoLocal, agora = Date.now()) {
  return Math.max(0, Math.ceil((prazoLocal - agora) / 1000));
}

export function pagamentoCarroEmCurso(status) {
  return ['processing', 'requires_action', 'requires_capture', 'succeeded'].includes(status);
}

export function erroPagamentoCarro(code) {
  if (code === 'CARRO_HORARIOS_INVALIDOS') return 'carro_horas_invalidas';
  if (code === 'CARRO_DOCUMENTOS_INVALIDOS') return 'carro_docs_obrigatorios';
  if (code === 'CARRO_RETENCAO_EXPIRADA') return 'carro_pagamento_expirado';
  if (code === 'CARRO_PAGAMENTO_FALHOU') return 'carro_pagamento_falhou';
  if (code === 'CARRO_SEM_STOCK') return 'carro_stock_pagamento_indisponivel';
  if (code === 'CAUCAO_ALTERADA') return 'carro_caucao_alterada';
  if (code === 'ALUGUER_ALTERADO') return 'carro_caucao_preco_alterado';
  if (['STRIPE_CONFIG_MISSING', 'STRIPE_SDK_MISSING', 'STRIPE_AUTH_FAILED', 'STRIPE_MODE_MISMATCH'].includes(code)) return 'carro_pagamento_configuracao';
  return 'erro_servidor_pagamentos';
}
