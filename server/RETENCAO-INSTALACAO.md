# Correção das retenções de experiências

Copie os quatro ficheiros para a mesma pasta `api` do servidor:

- `reservar_temporariamente.php`
- `liberar_retensao.php`
- `retencaoExperiencia.php`
- `retencaoBootstrap.php`

Mantenha o `config.php` existente nessa pasta. Não são necessárias alterações SQL.

O pedido de reserva primeiro identifica as retenções do cliente, antes de verificar o saldo. Uma renovação reutiliza o token e substitui a quantidade sem a somar novamente. Retenções expiradas da sessão são marcadas como expiradas dentro da transação. O contador `reservas_pendentes` é recalculado a partir dos registos pendentes reais, corrigindo diferenças deixadas pelo código anterior. A libertação pode ser repetida sem descontar duas vezes. Ambos os endpoints tratam o preflight OPTIONS.

Uma retenção ativa de outro cliente continua a ocupar vagas. O código não apaga reservas confirmadas nem cancela indiscriminadamente retenções de terceiros. Para hóspedes sem utilizador identificado, o endpoint aceita o token anterior no campo `token` para renovar a retenção.

Teste: configure uma sessão com duas vagas livres, abra um checkout de duas pessoas e repita o pedido com o mesmo utilizador. Deve devolver o mesmo token com `renovada: true`. Reduza e aumente a quantidade e confirme que o contador corresponde ao novo valor. Ao libertar, as vagas regressam; repetir a libertação mantém o saldo.

Validação local: `node tests/retencaoServidor.test.cjs`. Usa PHP 8.3 WASM e SQLite para testar estados; os bloqueios de concorrência MySQL são mantidos no código de produção e devem ser validados no servidor.

O prazo de cada nova retenção ou renovação é de 5 minutos (300 segundos). Publique o frontend e retencaoExperiencia.php para manter o contador e a expiração do servidor alinhados.
