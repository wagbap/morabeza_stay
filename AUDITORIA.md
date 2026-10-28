# Auditoria do frontend — Morabeza Stay

Data: 21 de outubro de 2026.

## Alcance e verificações

- ESLint executado sobre 229 ficheiros: 612 erros e 54 avisos.
- Build de produção concluído com sucesso (2898 módulos transformados).
- Revisão manual das rotas, arranque, autenticação admin/gestão, checkout de alojamento, pagamento, calendário, seleção de quartos e serviços relacionados.
- Não foram efetuadas reservas, cobranças ou alterações na API de produção. Não foi feita validação visual de todas as páginas nem auditoria do backend. O build não comprova o funcionamento dos fluxos no navegador.
- O relatório estruturado do lint está em `audit-eslint.json`. Os resultados automáticos requerem triagem: não representam todos falhas funcionais distintas.

## Prioridade alta

### 1. Repetir pagamento pode criar uma nova cobrança

`src/pages/Pagamento.jsx`, fluxo `handleFinalizarPagamento` (aproximadamente linhas 303–413).

Cada tentativa cria um novo PaymentIntent e confirma o cartão antes de gravar a reserva. Se a gravação falhar, o bloqueio de processamento é libertado no finally. Uma nova tentativa volta a criar um PaymentIntent, sem recuperar o pagamento anterior. O cache também só é validado na gravação, depois da cobrança. Assim, uma sessão em falta ou erro de rede pode deixar pagamento sem reserva e permitir nova cobrança. Reutilizar a tentativa de pagamento e reconciliar a reserva com o backend; confirmar o desenho de idempotência e webhooks no servidor.

### 2. Gestão aceita autenticação inválida

`src/components/gest/GestaoRouter.jsx:43`.

Uma falha ao interpretar o token executa `setIsAuthenticated(true)`. Sem token, a mera existência de `user` também autoriza a interface. Falhar a validação deve impedir o acesso. Isto comprova uma falha da proteção do frontend; não comprova acesso indevido aos dados, que depende das verificações do backend.

### 3. Admin monta conteúdo antes de verificar acesso

`src/components/admin/AdminLayout.jsx:10` e `:48`.

A validação ocorre num efeito, mas o Outlet é renderizado imediatamente. Os filhos podem montar e disparar pedidos antes do redirecionamento. A autorização também aceita campos editáveis no localStorage, incluindo um endereço de email fixo. Exigir validação antes de montar os filhos e confirmar autorização dos endpoints no servidor. `AdminProtectedRoute` existe, mas não está ligado às rotas em App.jsx.

### 4. Holds criados no checkout não são enviados ao gravar a reserva

`src/features/alojamento/components/CheckoutAlojamento.jsx:734–799` e `src/pages/Pagamento.jsx:187–231`.

O checkout cria e guarda `hold_ids`, mas o payload de alojamento construído na página de pagamento omite esses IDs e o modelo de venda. Além disso, uma resposta de hold sem sucesso permite continuar para pagamento. Confirmar no backend como os holds são consumidos/libertados e impedir cobrança quando não existe disponibilidade garantida.

### 5. Calendário permite atravessar noites bloqueadas

`src/components/Calendario/CalendarioMorabeza.jsx:168–203`.

Depois de selecionar check-in, o modo de permitir checkout em dia bloqueado remove da exclusão todos os dias bloqueados posteriores ao início. O handler só valida o check-in quando não existe fim; não verifica as noites interiores do intervalo completo. Exemplo: check-in no dia 10, noite 12 bloqueada, checkout no dia 14 pode chegar ao onChange. Permitir checkout na primeira fronteira bloqueada, mas rejeitar intervalos que incluam uma noite bloqueada. A verificação posterior de stock em InfoAlojamento pode impedir a continuação, mas não corrige a seleção inválida no calendário.

## Prioridade média

### 6. Chave quartos sobrescreve um valor de tipo diferente

`src/components/AlojamentoRegisto/FluxoRegisto.jsx:547` e `:591`: o número de quartos é substituído pelo array de quartos no mesmo objeto, inclusive por `[]` no modo inteiro.

`src/services/apiService.js:423` e `:456`: a leitura dos dados faz a mesma colisão, substituindo o número por `[]` antes de carregar os detalhes dos quartos.

Separar quantidade de quartos e lista de tipos/quartos; confirmar os nomes do contrato da API. A sobrescrita é certa; o efeito persistido depende de como o backend interpreta esse campo.

### 7. Traduções duplicadas e italiano com código incorreto

441 ocorrências de chaves duplicadas nos sete ficheiros de tradução. Em objetos JavaScript, a última definição prevalece. Há ainda duas duplicações de `quartos` fora das traduções, totalizando 443 alertas `no-dupe-keys`.

`src/components/Navbar.jsx:93` usa `ir` para italiano, e o carregamento automático em `src/i18n.js` regista `ir.js` como `ir`. Um navegador com idioma `it` não encontra o recurso italiano e recorre ao fallback português. O ficheiro alternativo `src/i18n/index.js`, sem utilização identificada no arranque, aponta para imports de locales inexistentes nessa pasta.

### 8. Calendário e várias mensagens não seguem o idioma

`src/components/Calendario/CalendarioMorabeza.jsx:11` fixa os meses em português e os aria-labels também são literais. Há chamadas com `locale="pt"`, por exemplo em `InfoAlojamento.jsx:729`, além de mensagens de disponibilidade em português em `InfoAlojamento.jsx:1331–1349`. Mesmo mudando o idioma da aplicação, estas partes permanecem em português.

### 9. Rotas lazy sem fallback abrangente

`src/App.jsx`: existe Suspense em torno de Home, mas as restantes páginas lazy não têm uma fronteira Suspense comum no App ou no main. Falta um estado de carregamento controlado para esses acessos e tratamento de falhas ao carregar chunks. O efeito exato depende de se tratar de primeira montagem ou navegação. Não classificar automaticamente todas estas rotas como quebradas.

### 10. Mensagem detalhada de bloqueio nunca é apresentada

`src/features/alojamento/components/InfoAlojamento.jsx:1337–1340`.

O primeiro if já aceita todo `motivo === 'bloqueio_manual'`. O else-if com o mesmo motivo e `datas.length` nunca executa; a lista de datas bloqueadas não é exibida por esse ramo.

## Integrações incompletas ou código sem uso identificado

- `src/pages/PayPalButton.jsx:12`: clientId vazio. Não foi encontrada utilização desse componente no fluxo atual de pagamento, que apresenta cartão. Portanto, o suporte efetivo a PayPal descrito na documentação não está integrado neste fluxo.
- `src/components/PagamentoWrapper.jsx:3`: importa `./Pagamento`, que não existe em components; a página está em pages. Sem importadores identificados, não bloqueia o build atual, mas falhará se for utilizado.
- `src/features/alojamento/hooks/useReserva.js:2`: importa um BookingContext ausente do repositório. Sem consumidores identificados, também não bloqueia o build atual.
- `src/services/experienciaApiService.js:86`: onProgress não está declarado nem recebido como argumento. O typeof evita ReferenceError no caminho normal, mas o serviço não disponibiliza corretamente o callback de progresso.

## Leitura do lint e desempenho

Principais grupos: 443 chaves duplicadas, 107 variáveis não utilizadas, 51 alertas de dependências dos hooks, 27 alertas de atualização de estado em efeitos, 9 de React Refresh e 6 de componentes criados durante render. Alguns alertas podem ser falsos positivos: por exemplo, a seleção de um ícone já importado em SeccaoEscolhaQuarto não significa por si só que se criou um novo componente.

Os alertas de require/module em setupProxy.js e process em vite.config.js também refletem a falta de globals Node na configuração do lint; não demonstram falhas no browser.

O build avisou sobre chunks grandes: Mapbox ~1,73 MB, painel admin ~560 KB e entrada principal ~556 KB, antes de gzip. Avaliar carregamento e distribuição de dependências conforme medições reais. O projeto já usa lazy loading e ScrollToTop global, apesar de AGENTS.md ainda os descrever como ausentes.

## Ordem sugerida

1. Pagamento e recuperação após falhas.
2. Autorização de gestão/admin e contrato com backend.
3. Holds, disponibilidade e validação de intervalos.
4. Contrato dos quartos no registo/edição.
5. Traduções, carregamento de rotas e limpeza dos restantes alertas.
