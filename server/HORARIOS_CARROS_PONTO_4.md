# Horas de levantamento e devolução — ponto 4

## Comportamento

- Em `/gest/condicoes-veiculos`, o anfitrião mantém a janela de levantamento e configura a devolução com o mesmo horário ou com um intervalo próprio. Os intervalos incluem os minutos de início e fim e são do mesmo dia. O local alternativo de devolução continua independente do horário.
- Os novos horários são lidos e guardados por `horarios_carro.php`. A escrita exige autenticação real do anfitrião e verifica a propriedade do anúncio no servidor. Os campos de utilizador enviados pelo browser não concedem acesso.
- O checkout exige duas horas explícitas, dentro das respetivas janelas. Os campos começam vazios. O resumo do checkout e o do pagamento mostram as horas escolhidas; as condições apresentam as janelas permitidas. A devolução deixa de copiar a hora de levantamento ou assumir 10:00.
- Antes de pedir o OTP, o checkout verifica a disponibilidade com datas, horas e quantidade. Ao entrar no pagamento, o servidor repete a validação dentro da transação e bloqueia a unidade para esse período exato. A confirmação repete a verificação, excluindo apenas a própria retenção, e exige as mesmas duas horas associadas ao pagamento.
- As duas horas e as janelas aceites ficam no snapshot da tentativa de pagamento e da reserva. Uma alteração posterior dos horários do anúncio não muda as condições de um pagamento já iniciado. Alterar uma hora no checkout identifica uma nova tentativa; atualizar a página de pagamento conserva a tentativa e o contador existentes.
- Reservas e retenções ocupam o intervalo `[levantamento, devolução)`, em hora local de Cabo Verde. Exemplo: uma devolução às 14:00 impede novo levantamento às 13:59 e permite às 14:00. Manutenção e bloqueios manuais por dia continuam a impedir períodos sobrepostos, incluindo a parte ocupada do dia de devolução.
- Reservas antigas sem hora de devolução conservam esse dado desconhecido. A validação exata protege o dia de devolução até ao seu final, sem inventar 10:00. O calendário do anfitrião sinaliza o dia enquanto existir ocupação parcial.
- `reservas_carro.hora_devolucao` guarda a hora escolhida, utilizada pelo carregamento existente do email e do comprovativo PDF. O desenho dos comprovativos não foi alterado.

## Publicar

1. Fazer cópia da base e dos ficheiros e aplicar `sql/horarios_carros.sql` antes da API. A migração é repetível e acrescenta apenas os campos necessários, sem preencher retroativamente horas desconhecidas.
2. Publicar a API e o frontend do pacote `carros-pontos1-2-3-4-5.zip` em conjunto. A pasta `frontend/` é o build do site; `api/` destina-se à API existente. Manter os ficheiros locais de segredos/configuração já instalados.
3. O pacote é cumulativo com os pontos 1, 2, 3 e 5. Consultar também os documentos desses pontos para Stripe, calendário e documentos privados do condutor. O endpoint autenticado novo utiliza o mecanismo de autenticação de anfitrião já adotado pelo calendário privado.

## Validação local

Testes PHP: intervalos próprios e herdados; minutos nos limites; horários vazios/invertidos/fora da janela; sobreposição no dia de devolução; reservas com e sem matrícula atribuída; retenções; manutenção; bloqueio manual no dia de devolução; reserva antiga sem hora conhecida; rejeição de alteração de hora na mesma retenção; snapshot das condições; regressões de caução, documentos, stock e pagamento.

Testes HTTP: autenticação e propriedade obrigatórias para guardar; outro anfitrião e JWT falso recusados; leitura após gravação; intervalo invertido recusado sem alteração; opção de reutilizar o horário persistida.

Navegador com dados e chamadas simulados: configurar e recarregar o horário do anfitrião; alternar entre intervalo próprio e herdado; escolher 11:30/18:15 dentro de 10:00–14:00/16:30–19:45; transmitir as duas horas para disponibilidade, resumo, cache e pagamento; verificação desktop e telemóvel. Lint e build de produção verificados. Não houve publicação, email, reserva ou cobrança real.
