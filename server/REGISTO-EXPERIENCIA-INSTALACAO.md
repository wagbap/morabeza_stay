# Registo de experiências: modelo e disponibilidade

## Ordem de instalação

1. Guarde uma cópia dos PHP publicados que vai substituir. As migrações 007 e 008 da gestão de sessões devem estar instaladas; não precisa de as repetir se já foram aplicadas.
2. Execute `database/009_modelo_registo_experiencia.sql` na mesma BD. Cria `experiencia_modelos`, sem apagar sessões ou reservas nem alterar o enum antigo de `experiencias`.
3. Extraia `backend-registo-experiencia.zip` na pasta que contém `/api/`, conservando a estrutura do ZIP. Não substitua `config.php` nem `reserva-validacao.php`.
4. Publique o conteúdo de `frontend-registo-experiencia.zip` na raiz do site. No ambiente de desenvolvimento, os ficheiros fonte já estão atualizados.

## PHP incluídos

Em `/api/experiencia/`:

- `modeloRegisto.php` — validação e persistência do modelo, ligação ao stock e dias da agenda.
- `registoComum.php` — ligação, autenticação, campos e relações do registo.
- `registrar.php` — criar experiência.
- `atualizar.php` — editar experiência da conta autenticada.
- `buscar.php` — carregar dados para edição, incluindo modelo e equipamento.

Em `/api/`:

- `agendaExperienciasLogica.php` — disponibilidade com pessoas por equipamento.
- `agenda_experiencias.php` — entrega modelo e equipamento à gestão.
- `experiencia_pagina_completa.php` — entrega o modelo guardado à página pública.
- `retencaoExperiencia.php` — valida participantes contra a capacidade efetiva do equipamento.

`agendaExperienciasLogica.php` passa a depender de `/api/experiencia/modeloRegisto.php`; publique o conjunto completo. Os restantes endpoints de sessões e retenção já instalados continuam a usar estes ficheiros partilhados.

## Comportamento

O primeiro passo exige escolher o modelo. Participantes usam preço por pessoa e capacidade por sessão. Equipamentos usam nome, stock partilhado e pessoas por unidade; o preço base fica em zero e os preços por duração são configurados na gestão de sessões. Não são criados horários fictícios no registo.

Os rascunhos locais conservam modelo e campos dos dois modos. Os dias alimentam a agenda existente, preservando regras de antecedência, exceções, configurações e pausa. Equipamentos reutilizam o recurso associado e conservam a manutenção. As reservas confirmadas não são reescritas.

Criar, atualizar e consultar para edição (`buscar.php?edicao=1`) usam o JWT da conta de anfitrião, enviado no cabeçalho Authorization. O ID de utilizador enviado no corpo não concede acesso a outra conta. O `buscar.php` mantém a consulta pública de campos do anúncio, imagem principal e slug para os consumidores existentes; não devolve o ID do anfitrião nessa consulta. A edição autenticada exige `edicao=1` e verifica a propriedade. O endereço é devolvido como objeto com morada, cidade, ilha, lat e lng, tal como na API original fornecida.

## Validação efetuada

Build de produção e verificação dos componentes em navegador local, desktop e mobile. PHP 8.3 em WASM com fixtures SQLite para criar, consultar e editar, validar propriedade, guardar dias/modelo/stock/capacidade, preservar IDs e manutenção e verificar retenções e disponibilidade partilhada.

Não foi feita publicação nem execução na BD MySQL do alojamento. Após publicar, confirme um registo e uma edição de cada modelo, incluindo voltar a abrir a experiência e reservar uma sessão configurada.
