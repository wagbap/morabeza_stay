-- REFERENCE ONLY. Table definitions, indexes and foreign keys from the supplied export.
-- No records, routines, DEFINER clauses or production counters. Do not import over production.

CREATE TABLE `admin_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `token_hash` char(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `expires_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `admin_login_attempts` (
  `email_hash` char(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `attempts` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `window_start` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `alojamentos` (
  `id` int(11) NOT NULL,
  `proprietario_id` int(11) DEFAULT NULL,
  `titulo` varchar(255) NOT NULL,
  `num_apartamento` varchar(50) DEFAULT NULL,
  `slug` varchar(100) NOT NULL,
  `localizacao` varchar(100) NOT NULL,
  `cidade` varchar(100) NOT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `preco_noite` decimal(10,2) NOT NULL,
  `taxa_limpeza` decimal(10,2) DEFAULT 0.00,
  `capacidade` int(11) DEFAULT 2,
  `imagem_url` varchar(255) DEFAULT NULL,
  `estrelas` decimal(2,1) DEFAULT 4.5,
  `tipo` varchar(50) DEFAULT 'Apartamento',
  `status` enum('pendente','aprovado','rejeitado') DEFAULT 'aprovado',
  `motivo_rejeicao` text DEFAULT NULL,
  `descricao` text DEFAULT NULL,
  `descricao_detalhada` text DEFAULT NULL,
  `tipo_propriedade` varchar(50) DEFAULT 'Apartamento',
  `modelo_venda` enum('inteiro','por_quarto') NOT NULL DEFAULT 'inteiro',
  `tempo_resposta` varchar(50) DEFAULT 'Dentro de 1 hora',
  `regras_adicionais` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp(),
  `ilha` varchar(50) DEFAULT NULL,
  `codigo_postal` varchar(20) DEFAULT NULL,
  `checkin_inicio` time DEFAULT NULL,
  `checkin_fim` time DEFAULT NULL,
  `checkout_limite` time DEFAULT NULL,
  `checkin_flexivel` tinyint(1) NOT NULL DEFAULT 0,
  `checkin_flexivel_nota` varchar(255) DEFAULT NULL,
  `destaque` tinyint(1) NOT NULL DEFAULT 0,
  `ordem_destaque` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `alojamento_comodidades` (
  `alojamento_id` int(11) NOT NULL,
  `comodidade_id` int(11) NOT NULL,
  `activo` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `alojamento_estatisticas` (
  `id` int(11) NOT NULL,
  `alojamento_id` int(11) NOT NULL,
  `data` date NOT NULL,
  `visualizacoes` int(11) DEFAULT 0,
  `cliques_reserva` int(11) DEFAULT 0,
  `cliques_contato` int(11) DEFAULT 0,
  `visualizacoes_mapa` int(11) DEFAULT 0,
  `tempo_medio_segundos` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `alojamento_imagens` (
  `id` int(11) NOT NULL,
  `alojamento_id` int(11) NOT NULL,
  `caminho_url` varchar(255) NOT NULL,
  `ordem` int(11) DEFAULT 0,
  `principal` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `alojamento_logs` (
  `id` bigint(20) NOT NULL,
  `alojamento_id` int(11) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `tipo_evento` enum('view','click_reserva','click_contato','view_mapa') NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `session_id` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `alojamento_quartos` (
  `id` int(11) NOT NULL,
  `alojamento_id` int(11) NOT NULL,
  `tipo_quarto_id` int(11) NOT NULL,
  `numero_quarto` varchar(20) DEFAULT NULL,
  `andar` varchar(20) DEFAULT NULL,
  `quantidade_disponivel` int(11) DEFAULT 1,
  `preco_personalizado` decimal(10,2) DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `alojamento_regras` (
  `id` int(11) NOT NULL,
  `alojamento_id` int(11) NOT NULL,
  `regra_id` int(11) NOT NULL,
  `activo` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `alojamento_reviews` (
  `id` int(11) NOT NULL,
  `alojamento_id` int(11) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `nome_usuario` varchar(100) DEFAULT NULL,
  `foto` varchar(500) DEFAULT NULL,
  `email_usuario` varchar(100) NOT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `comentario` text DEFAULT NULL,
  `data_estadia` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `aprovado` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `alojamento_tipos_quarto` (
  `id` int(11) NOT NULL,
  `alojamento_id` int(11) NOT NULL,
  `tipo_quarto_id` int(11) NOT NULL,
  `quantidade` int(11) NOT NULL DEFAULT 1,
  `preco_noite` decimal(10,2) NOT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cancelamentos` (
  `id` int(11) NOT NULL,
  `reserva_id` int(11) NOT NULL,
  `tipo_reserva` varchar(50) NOT NULL COMMENT 'alojamento, carro ou experiencia',
  `motivo` text NOT NULL,
  `cancelada_em` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `carros` (
  `id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `marca` varchar(100) NOT NULL,
  `modelo` varchar(100) NOT NULL,
  `lugares` varchar(10) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `descricao` text DEFAULT NULL,
  `descricao_curta` varchar(500) DEFAULT NULL,
  `imagens_extra` text DEFAULT NULL,
  `localizacao` varchar(255) NOT NULL,
  `cidade` varchar(100) NOT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `ilha` varchar(100) NOT NULL,
  `preco_dia` decimal(10,2) NOT NULL,
  `tipo` varchar(100) DEFAULT NULL,
  `estrelas` decimal(2,1) DEFAULT 0.0,
  `total_reviews` int(11) DEFAULT 0,
  `ano` int(11) DEFAULT NULL,
  `passageiros` int(11) DEFAULT NULL,
  `combustivel` varchar(50) DEFAULT NULL,
  `imagem_url` varchar(100) NOT NULL,
  `quilometragem` int(11) DEFAULT NULL,
  `transmissao` varchar(50) DEFAULT 'Manual',
  `cor` varchar(50) DEFAULT NULL,
  `status` enum('disponivel','indisponivel','manutencao') DEFAULT 'disponivel',
  `status_carro` enum('pendente','aprovado','rejeitado') DEFAULT 'pendente',
  `motivo_rejeicao` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `data_levantamento` date NOT NULL,
  `data_devolucao` date NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `categoria_id` int(11) DEFAULT NULL,
  `portas` int(11) DEFAULT 4,
  `consumo` varchar(50) DEFAULT NULL,
  `descricao_detalhada` text DEFAULT NULL,
  `levantamento_ilha` varchar(100) DEFAULT NULL,
  `levantamento_local` varchar(255) DEFAULT NULL,
  `levantamento_hora_inicio` time DEFAULT '08:00:00',
  `levantamento_hora_fim` time DEFAULT '20:00:00',
  `devolucao_mesmo_local` tinyint(1) NOT NULL DEFAULT 1,
  `devolucao_local_alternativo` varchar(255) DEFAULT NULL,
  `entrega_aeroporto` tinyint(1) NOT NULL DEFAULT 0,
  `entrega_hotel` tinyint(1) NOT NULL DEFAULT 0,
  `entrega_custo_aeroporto` decimal(10,2) NOT NULL DEFAULT 0.00,
  `entrega_custo_hotel` decimal(10,2) NOT NULL DEFAULT 0.00,
  `levantamento_notas` text DEFAULT NULL,
  `exige_caucao` tinyint(1) NOT NULL DEFAULT 0,
  `caucao_valor` decimal(10,2) NOT NULL DEFAULT 0.00,
  `caucao_formas` varchar(255) DEFAULT NULL,
  `caucao_condicoes` text DEFAULT NULL,
  `idade_minima` int(11) NOT NULL DEFAULT 21,
  `carta_minima_anos` int(11) NOT NULL DEFAULT 2,
  `franquia` decimal(10,2) NOT NULL DEFAULT 0.00,
  `politica_combustivel` varchar(50) NOT NULL DEFAULT 'cheio_cheio',
  `limite_km` int(11) NOT NULL DEFAULT 0,
  `custo_km_extra` decimal(10,2) NOT NULL DEFAULT 0.00,
  `politica_atraso` text DEFAULT NULL,
  `segundo_condutor` tinyint(1) NOT NULL DEFAULT 0,
  `entrega_custo` decimal(10,2) NOT NULL DEFAULT 0.00,
  `destaque` tinyint(1) NOT NULL DEFAULT 0,
  `ordem_destaque` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `carro_caracteristicas` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `icone` varchar(50) DEFAULT NULL,
  `tipo` varchar(50) DEFAULT 'padrao',
  `ordem` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `carro_caracteristicas_rel` (
  `carro_id` int(11) NOT NULL,
  `caracteristica_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `carro_disponibilidade` (
  `id` int(11) NOT NULL,
  `carro_id` int(11) NOT NULL,
  `data_levantamento` date NOT NULL,
  `data_devolucao` date NOT NULL,
  `quantidade_disponivel` int(11) DEFAULT 1,
  `status` enum('disponivel','ocupado','manutencao') DEFAULT 'disponivel'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `carro_estatisticas` (
  `id` int(11) NOT NULL,
  `carro_id` int(11) NOT NULL,
  `data` date NOT NULL,
  `visualizacoes` int(11) DEFAULT 0,
  `cliques_reserva` int(11) DEFAULT 0,
  `visualizacoes_mapa` int(11) DEFAULT 0,
  `tempo_medio_segundos` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `carro_imagens` (
  `id` int(11) NOT NULL,
  `carro_id` int(11) NOT NULL,
  `caminho_url` varchar(500) NOT NULL,
  `ordem` int(11) DEFAULT 0,
  `principal` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `carro_logs` (
  `id` bigint(20) NOT NULL,
  `carro_id` int(11) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `tipo_evento` varchar(50) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `session_id` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `carro_reviews` (
  `id` int(11) NOT NULL,
  `carro_id` int(11) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `nome_usuario` varchar(100) DEFAULT NULL,
  `foto` varchar(500) DEFAULT NULL,
  `email_usuario` varchar(100) NOT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `comentario` text DEFAULT NULL,
  `data_aluguer` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `aprovado` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `comodidades` (
  `id` int(11) NOT NULL,
  `nome` varchar(50) NOT NULL,
  `icone` varchar(50) DEFAULT NULL,
  `categoria` varchar(100) NOT NULL,
  `ativo` int(11) NOT NULL,
  `descricao` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `comodidades_quarto` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `icone` varchar(50) DEFAULT NULL,
  `categoria` varchar(80) DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `descricao` text DEFAULT NULL,
  `ordem` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `config_recebimento_empresa` (
  `id` int(11) NOT NULL,
  `operador_nome` varchar(100) NOT NULL DEFAULT 'Vinti4 / Stripe / Operador Local',
  `modo_ambiente` enum('sandbox','producao') NOT NULL DEFAULT 'sandbox',
  `merchant_id` varchar(255) NOT NULL,
  `api_key_mascarada` varchar(50) NOT NULL COMMENT 'Armazena apenas os ultimos caracteres visiveis ex: ****abcd',
  `api_key_encrypted` text NOT NULL COMMENT 'Chave secreta encriptada',
  `banco_nome` varchar(150) NOT NULL,
  `iban_mascarado` varchar(50) NOT NULL,
  `status_conexao` enum('Conectado','Desconectado','Erro de Autenticação') NOT NULL DEFAULT 'Desconectado',
  `ultima_sincronizacao` datetime DEFAULT NULL,
  `atualizado_em` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `conversas` (
  `id` int(11) NOT NULL,
  `participante1_id` int(11) NOT NULL,
  `participante2_id` int(11) NOT NULL,
  `anuncio_id` int(11) DEFAULT NULL,
  `tipo_anuncio` varchar(20) DEFAULT NULL,
  `reserva_id` int(11) DEFAULT NULL,
  `ultima_mensagem` text DEFAULT NULL,
  `ultima_mensagem_data` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `dados_recebimento` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `titular` varchar(150) NOT NULL,
  `iban` varchar(50) NOT NULL,
  `banco` varchar(100) DEFAULT NULL,
  `pais` varchar(80) DEFAULT 'Cabo Verde',
  `nif` varchar(30) DEFAULT NULL,
  `confirmado` tinyint(1) DEFAULT 0,
  `criado_em` datetime DEFAULT current_timestamp(),
  `atualizado_em` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `denuncias` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL COMMENT 'Quem fez a denúncia',
  `tipo_conteudo` enum('alojamento','experiencia','carro','comentario') NOT NULL,
  `conteudo_id` int(11) NOT NULL COMMENT 'ID do item denunciado',
  `item_titulo` varchar(100) NOT NULL,
  `motivo` varchar(100) NOT NULL COMMENT 'Categoria do motivo',
  `descricao` text DEFAULT NULL COMMENT 'Detalhes adicionais',
  `status` enum('pendente','analisada','rejeitada') DEFAULT 'pendente',
  `criada_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizada_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `experiencias` (
  `id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `descricao_curta` text DEFAULT NULL,
  `descricao_longa` text DEFAULT NULL,
  `descricao_completa` text DEFAULT NULL,
  `categoria` enum('aventura','cultural','gastronomia','natureza','relax') NOT NULL,
  `localizacao` varchar(255) NOT NULL,
  `cidade` varchar(100) NOT NULL,
  `endereco` text DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `ilha` varchar(100) DEFAULT NULL,
  `preco` decimal(10,2) NOT NULL,
  `preco_grupo` decimal(10,2) DEFAULT NULL,
  `preco_epoca_alta` decimal(10,2) DEFAULT NULL,
  `epoca_alta_inicio` date DEFAULT NULL,
  `epoca_alta_fim` date DEFAULT NULL,
  `preco_crianca` decimal(10,2) DEFAULT NULL,
  `preco_bebe` decimal(10,2) DEFAULT NULL,
  `duracao` varchar(50) NOT NULL,
  `max_pessoas` int(11) NOT NULL DEFAULT 10,
  `max_pessoas_grupo` int(11) DEFAULT NULL,
  `min_pessoas_grupo` int(11) DEFAULT 1,
  `modelo_reserva` enum('por_pessoa','grupo_privado') NOT NULL DEFAULT 'por_pessoa',
  `antecedencia_minima_horas` int(11) DEFAULT 24,
  `antecedencia_maxima_dias` int(11) DEFAULT 180,
  `max_reservas_por_cliente` int(11) DEFAULT NULL,
  `min_pessoas` int(11) DEFAULT 1,
  `imagem_principal` varchar(500) DEFAULT NULL,
  `rating` decimal(3,1) DEFAULT 0.0,
  `total_reviews` int(11) DEFAULT 0,
  `status` enum('pendente','aprovado','rejeitado') DEFAULT 'pendente',
  `motivo_rejeicao` text DEFAULT NULL,
  `inclui_guia` tinyint(1) DEFAULT 1,
  `inclui_transporte` tinyint(1) DEFAULT 0,
  `inclui_refeicao` tinyint(1) DEFAULT 0,
  `ponto_encontro` varchar(255) DEFAULT NULL,
  `horario_inicio` time DEFAULT NULL,
  `dias_disponiveis` set('segunda','terca','quarta','quinta','sexta','sabado','domingo') DEFAULT NULL,
  `data_levantamento` datetime NOT NULL DEFAULT current_timestamp(),
  `data_participacao` datetime NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `horarios_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Armazena lista de horários ex: ["08:00", "09:00", "10:00"]' CHECK (json_valid(`horarios_json`)),
  `usuario_id` int(11) NOT NULL,
  `max_pessoas_por_jet_ski` int(11) DEFAULT 2,
  `total_jet_skis` int(11) DEFAULT 6,
  `politica_cancelamento_horas` int(11) DEFAULT 48 COMMENT 'Horas mínimas antes para o cliente poder cancelar',
  `politica_cancelamento_reembolso_pct` int(11) DEFAULT 100 COMMENT 'Percentagem de reembolso (0-100)',
  `politica_cancelamento_taxa` decimal(10,2) DEFAULT 0.00 COMMENT 'Taxa fixa cobrada no cancelamento',
  `politica_reagendamento_horas` int(11) DEFAULT 24 COMMENT 'Horas mínimas antes para o cliente poder reagendar',
  `politica_reagendamento_max_vezes` int(11) DEFAULT 1 COMMENT 'Nº máximo de reagendamentos por reserva',
  `politica_reagendamento_custo` decimal(10,2) DEFAULT 0.00 COMMENT 'Taxa cobrada por reagendamento',
  `politica_reagendamento_permitido` tinyint(1) DEFAULT 1 COMMENT 'Se o cliente pode reagendar',
  `politica_anfitriao_oferece_reagendar` tinyint(1) DEFAULT 1,
  `politica_anfitriao_reembolso_total` tinyint(1) DEFAULT 1,
  `destaque` tinyint(1) NOT NULL DEFAULT 0,
  `ordem_destaque` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `experiencias_estatisticas` (
  `id` int(11) NOT NULL,
  `experiencia_id` int(11) NOT NULL,
  `data` date NOT NULL,
  `visualizacoes` int(11) DEFAULT 0,
  `cliques_reserva` int(11) DEFAULT 0,
  `cliques_contato_guia` int(11) DEFAULT 0,
  `visualizacoes_mapa` int(11) DEFAULT 0,
  `tempo_medio_segundos` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `experiencias_logs` (
  `id` bigint(20) NOT NULL,
  `experiencia_id` int(11) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `tipo_evento` varchar(50) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `session_id` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `experiencia_bloqueios` (
  `id` int(11) NOT NULL,
  `experiencia_id` int(11) NOT NULL,
  `data_inicio` date NOT NULL,
  `data_fim` date NOT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `tipo` enum('ferias','manutencao','lotado','outro') DEFAULT 'outro',
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `experiencia_categorias` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `icone` varchar(50) DEFAULT NULL,
  `descricao` text DEFAULT NULL,
  `cor` varchar(20) DEFAULT NULL,
  `ordem` int(11) DEFAULT 0,
  `ativo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `experiencia_disponibilidade` (
  `id` int(11) NOT NULL,
  `experiencia_id` int(11) NOT NULL,
  `data_especifica` date NOT NULL,
  `disponivel` tinyint(1) DEFAULT 1,
  `periodo` varchar(50) NOT NULL,
  `vagas_disponiveis` int(11) DEFAULT NULL,
  `preco_especial` decimal(10,2) DEFAULT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `duracao_id` int(11) DEFAULT NULL,
  `vagas_jet_skis` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `experiencia_duracoes` (
  `id` int(11) NOT NULL,
  `experiencia_id` int(11) NOT NULL,
  `label` varchar(50) NOT NULL,
  `preco` decimal(10,2) NOT NULL,
  `ativo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `experiencia_idiomas` (
  `id` int(11) NOT NULL,
  `experiencia_id` int(11) NOT NULL,
  `idioma` varchar(50) NOT NULL,
  `nivel` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `experiencia_imagens` (
  `id` int(11) NOT NULL,
  `experiencia_id` int(11) NOT NULL,
  `caminho_url` varchar(500) NOT NULL,
  `principal` tinyint(1) DEFAULT 0,
  `ordem` int(11) DEFAULT 0,
  `legenda` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `experiencia_inclusoes` (
  `id` int(11) NOT NULL,
  `experiencia_id` int(11) NOT NULL,
  `item` varchar(255) NOT NULL,
  `icone` varchar(50) DEFAULT NULL,
  `incluido` tinyint(1) DEFAULT 1,
  `ordem` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `experiencia_requisitos` (
  `id` int(11) NOT NULL,
  `experiencia_id` int(11) NOT NULL,
  `requisito` varchar(255) NOT NULL,
  `obrigatorio` tinyint(1) DEFAULT 1,
  `ordem` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `experiencia_reservas` (
  `id` int(11) NOT NULL,
  `experiencia_id` int(11) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `nome_cliente` varchar(255) NOT NULL,
  `email_cliente` varchar(255) NOT NULL,
  `telefone_cliente` varchar(50) DEFAULT NULL,
  `data_experiencia` date NOT NULL,
  `num_pessoas` int(11) NOT NULL,
  `preco_total` decimal(10,2) NOT NULL,
  `status` enum('pendente','confirmada','cancelada','concluida') DEFAULT 'pendente',
  `cancelado_por` varchar(20) DEFAULT NULL,
  `motivo_cancelamento` text DEFAULT NULL,
  `cancelado_em` datetime DEFAULT NULL,
  `observacoes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `experiencia_reviews` (
  `id` int(11) NOT NULL,
  `experiencia_id` int(11) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `nome_usuario` varchar(100) DEFAULT NULL,
  `foto` varchar(500) DEFAULT NULL,
  `email_usuario` varchar(100) NOT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `comentario` text DEFAULT NULL,
  `data_experiencia` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `aprovado` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `experiencia_sessoes` (
  `id` int(11) NOT NULL,
  `experiencia_id` int(11) NOT NULL,
  `data` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fim` time NOT NULL,
  `periodo` enum('Manhã','Meio dia','Tarde') NOT NULL,
  `tipo_reserva` enum('individual','grupo_privado') NOT NULL DEFAULT 'individual',
  `capacidade_maxima` int(11) NOT NULL DEFAULT 15,
  `vagas_ocupadas` int(11) NOT NULL DEFAULT 0,
  `reservas_pendentes` int(11) NOT NULL DEFAULT 0 COMMENT 'Vagas retidas temporariamente durante pagamento',
  `vagas_disponiveis` int(11) GENERATED ALWAYS AS (`capacidade_maxima` - `vagas_ocupadas` - `reservas_pendentes`) STORED,
  `reserva_grupo_id` int(11) DEFAULT NULL,
  `preco_especial` decimal(10,2) DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `favoritos` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `tipo` enum('alojamento','carro','experiencia') NOT NULL,
  `item_id` int(11) NOT NULL,
  `item_data` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `historico_reservas` (
  `id` int(11) NOT NULL,
  `reserva_id` int(11) NOT NULL,
  `tipo_reserva` varchar(50) NOT NULL COMMENT 'alojamento, carro ou experiencia',
  `acao` varchar(255) NOT NULL,
  `motivo` text DEFAULT NULL,
  `data_acao` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `historico_sessoes` (
  `id` int(11) NOT NULL,
  `experiencia_id` int(11) NOT NULL,
  `data` date NOT NULL,
  `total_sessoes` int(11) NOT NULL DEFAULT 0,
  `capacidade_total` int(11) NOT NULL DEFAULT 0,
  `vagas_ocupadas` int(11) NOT NULL DEFAULT 0,
  `vagas_disponiveis` int(11) NOT NULL DEFAULT 0,
  `receita_estimada` decimal(10,2) NOT NULL DEFAULT 0.00,
  `preco_min` decimal(10,2) DEFAULT NULL,
  `preco_max` decimal(10,2) DEFAULT NULL,
  `motivo` varchar(64) NOT NULL DEFAULT 'transferencia',
  `observacao` varchar(255) DEFAULT NULL,
  `criado_em` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `historico_sessoes_log` (
  `id` int(11) NOT NULL,
  `executado_em` timestamp NULL DEFAULT current_timestamp(),
  `data_limite` date NOT NULL,
  `dias_arquivados` int(11) NOT NULL DEFAULT 0,
  `sessoes_apagadas` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `info_carros` (
  `id` int(11) NOT NULL,
  `carro_id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `valor` varchar(255) NOT NULL,
  `icone` varchar(100) DEFAULT 'CheckCircle',
  `cor_classe` varchar(100) DEFAULT 'text-green-600',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `links` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `url` varchar(500) NOT NULL,
  `category` varchar(100) DEFAULT 'Geral',
  `description` text DEFAULT NULL,
  `icon` varchar(100) DEFAULT 'fas fa-link',
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `localizacoes` (
  `id` int(11) NOT NULL,
  `alojamento_id` int(11) NOT NULL,
  `endereco` text DEFAULT NULL,
  `num_apartamento` varchar(50) DEFAULT NULL,
  `coordenadas_lat` decimal(10,8) DEFAULT NULL,
  `coordenadas_lng` decimal(11,8) DEFAULT NULL,
  `pontos_proximos` text DEFAULT NULL,
  `cidade` varchar(100) DEFAULT NULL,
  `ilha` varchar(50) DEFAULT NULL,
  `codigo_postal` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `login_attempts` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `ip` varchar(45) NOT NULL,
  `attempted_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `mensagens` (
  `id` int(11) NOT NULL,
  `conversa_id` int(11) NOT NULL,
  `anuncio_id` int(11) DEFAULT NULL,
  `tipo_anuncio` varchar(20) DEFAULT NULL,
  `reserva_id` int(11) DEFAULT NULL,
  `remetente_id` int(11) NOT NULL,
  `destinatario_id` int(11) NOT NULL,
  `mensagem` text NOT NULL,
  `lida` tinyint(1) DEFAULT 0,
  `lida_em` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `mensagens_anfitriao` (
  `id` int(11) NOT NULL,
  `alojamento_id` int(11) NOT NULL,
  `destinatario_id` int(11) NOT NULL,
  `remetente_id` int(11) DEFAULT NULL,
  `remetente_nome` varchar(120) NOT NULL,
  `remetente_email` varchar(255) NOT NULL,
  `telefone` varchar(30) DEFAULT NULL,
  `mensagem` text NOT NULL,
  `lida` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `notificacoes` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `mensagem` text NOT NULL,
  `tipo` varchar(50) DEFAULT 'geral',
  `lida` tinyint(1) DEFAULT 0,
  `criado_em` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `participantes` (
  `id` int(11) NOT NULL,
  `category` varchar(100) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `reserva_id` int(11) NOT NULL,
  `nome_completo` varchar(255) NOT NULL,
  `idade` varchar(20) NOT NULL,
  `nacionalidade` varchar(100) NOT NULL,
  `tipo` varchar(20) DEFAULT 'adicional',
  `documento_tipo` varchar(50) DEFAULT NULL,
  `documento_numero` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `password_resets` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `pedidos_documentos` (
  `id` int(11) NOT NULL,
  `anuncio_id` int(11) NOT NULL,
  `anuncio_tipo` varchar(20) NOT NULL,
  `admin_id` int(11) NOT NULL,
  `prestador_id` int(11) NOT NULL,
  `tipo_documento` varchar(80) NOT NULL,
  `motivo` text NOT NULL,
  `prazo` date NOT NULL,
  `estado` enum('pendente','enviado','aprovado','rejeitado','expirado') DEFAULT 'pendente',
  `documento_url` varchar(500) DEFAULT NULL,
  `enviado_em` datetime DEFAULT NULL,
  `aprovado_em` datetime DEFAULT NULL,
  `motivo_rejeicao` text DEFAULT NULL,
  `criado_em` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `quarto_comodidades` (
  `id` int(11) NOT NULL,
  `quarto_id` int(11) NOT NULL,
  `comodidade_id` int(11) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `quarto_imagens` (
  `id` int(11) NOT NULL,
  `quarto_id` int(11) NOT NULL,
  `caminho_url` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `quarto_ocupacao` (
  `id` bigint(20) NOT NULL,
  `quarto_id` int(11) NOT NULL DEFAULT 0,
  `alojamento_id` int(11) DEFAULT NULL,
  `data` date NOT NULL,
  `tipo` enum('reserva','bloqueio','manutencao','hold') NOT NULL,
  `reserva_id` int(11) DEFAULT NULL,
  `hold_id` varchar(64) DEFAULT NULL,
  `session_id` varchar(64) DEFAULT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `expira_em` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `quantidade` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `quarto_ocupacao_backup_20261006` (
  `id` bigint(20) NOT NULL DEFAULT 0,
  `quarto_id` int(11) NOT NULL,
  `alojamento_id` int(11) DEFAULT NULL,
  `data` date NOT NULL,
  `tipo` enum('reserva','bloqueio','manutencao','hold') NOT NULL,
  `reserva_id` int(11) DEFAULT NULL,
  `hold_id` varchar(64) DEFAULT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `expira_em` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `quarto_ocupacao_backup_20261007` (
  `id` bigint(20) NOT NULL DEFAULT 0,
  `quarto_id` int(11) NOT NULL DEFAULT 0,
  `alojamento_id` int(11) DEFAULT NULL,
  `data` date NOT NULL,
  `tipo` enum('reserva','bloqueio','manutencao','hold') NOT NULL,
  `reserva_id` int(11) DEFAULT NULL,
  `hold_id` varchar(64) DEFAULT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `expira_em` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `reembolsos` (
  `id` int(11) NOT NULL,
  `reserva_id` int(11) NOT NULL,
  `tipo_reserva` varchar(50) NOT NULL COMMENT 'alojamento, carro ou experiencia',
  `valor_reembolsado` decimal(10,2) NOT NULL,
  `moeda` varchar(10) DEFAULT 'CVE',
  `estado` enum('Solicitado','Aprovado','Em processamento','Reembolsado','Falhou') NOT NULL DEFAULT 'Solicitado',
  `referencia_operador` varchar(255) DEFAULT NULL,
  `comprovativo` varchar(255) DEFAULT NULL,
  `motivo` text NOT NULL,
  `criado_em` datetime NOT NULL DEFAULT current_timestamp(),
  `atualizado_em` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `regras_casa` (
  `id` int(11) NOT NULL,
  `titulo` varchar(100) NOT NULL,
  `descricao` text DEFAULT NULL,
  `icone` varchar(50) DEFAULT NULL,
  `obrigatorio` int(11) NOT NULL,
  `ordem` int(11) DEFAULT 0,
  `ativo` int(11) NOT NULL,
  `categoria` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `regras_disponibilidade` (
  `id` int(11) NOT NULL,
  `experiencia_id` int(11) NOT NULL,
  `data_especifica` date NOT NULL,
  `periodo` enum('Manhã','Meio dia','Tarde') NOT NULL,
  `preco_especial` decimal(10,2) DEFAULT NULL,
  `vagas_disponiveis` int(11) DEFAULT 10,
  `disponivel` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `repasses` (
  `id` int(11) NOT NULL,
  `prestador_id` int(11) NOT NULL,
  `reserva_id` int(11) DEFAULT NULL,
  `valor` decimal(12,2) NOT NULL,
  `metodo` varchar(50) DEFAULT 'transferencia',
  `iban_destino` varchar(50) DEFAULT NULL,
  `comprovativo_url` varchar(500) DEFAULT NULL,
  `registado_por` int(11) NOT NULL,
  `registado_em` datetime DEFAULT current_timestamp(),
  `observacoes` text DEFAULT NULL,
  `estado` enum('pendente','pago','cancelado') DEFAULT 'pago'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `reservas` (
  `id` int(11) NOT NULL,
  `alojamento_id` int(11) DEFAULT NULL,
  `data_entrada` date NOT NULL,
  `data_saida` date NOT NULL,
  `status` enum('confirmada','cancelada') DEFAULT 'confirmada',
  `experiencia_id` int(11) NOT NULL,
  `codigo_reserva` varchar(10) NOT NULL,
  `data_reagendamento` date DEFAULT NULL,
  `horario_reagendamento` time DEFAULT NULL,
  `periodo_reagendamento` enum('Manhã','Meio dia','Tarde') DEFAULT NULL,
  `sessao_id_nova` int(11) DEFAULT NULL,
  `motivo_reagendamento` varchar(255) DEFAULT NULL,
  `reagendamento_pendente` tinyint(1) DEFAULT 0,
  `reagendamento_aceite` tinyint(1) DEFAULT 0,
  `idempotency_key` varchar(64) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `reservas_alojamento` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `alojamento_id` int(11) NOT NULL,
  `codigo_reserva` varchar(50) NOT NULL,
  `data_checkin` date NOT NULL,
  `data_checkout` date NOT NULL,
  `quantidade_hospedes` int(11) NOT NULL DEFAULT 1,
  `noites` int(11) NOT NULL DEFAULT 1,
  `preco_total` decimal(10,2) NOT NULL,
  `subtotal_noites` decimal(12,2) DEFAULT NULL,
  `taxa_limpeza` decimal(12,2) DEFAULT NULL,
  `comissao_morabeza` decimal(12,2) DEFAULT NULL,
  `valor_liquido_anfitriao` decimal(12,2) DEFAULT NULL,
  `tipo_venda` varchar(20) NOT NULL DEFAULT 'inteiro',
  `taxa_limpeza_aplicada` decimal(10,2) DEFAULT 0.00,
  `status` varchar(50) DEFAULT 'pendente',
  `cancelado_por` varchar(20) DEFAULT NULL,
  `motivo_cancelamento` text DEFAULT NULL,
  `cancelado_em` datetime DEFAULT NULL,
  `pagamento_status` varchar(50) DEFAULT 'aguardando',
  `data_reserva` datetime DEFAULT current_timestamp(),
  `category` varchar(50) DEFAULT 'Alojamento',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `comissao` decimal(10,2) NOT NULL DEFAULT 0.00,
  `idempotency_key` varchar(64) DEFAULT NULL,
  `is_bloqueio` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `reservas_alojamento_quartos` (
  `id` int(11) NOT NULL,
  `reserva_id` int(11) NOT NULL,
  `tipo_quarto_id` int(11) NOT NULL,
  `quantidade` int(11) NOT NULL,
  `preco_noite` decimal(12,2) NOT NULL,
  `capacidade` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `reservas_carro` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `carro_id` int(11) NOT NULL,
  `unidade_id` int(11) DEFAULT NULL,
  `codigo_reserva` varchar(50) NOT NULL,
  `data_levantamento` date NOT NULL,
  `data_devolucao` date NOT NULL,
  `hora_devolucao` time DEFAULT '10:00:00',
  `dias` int(11) NOT NULL DEFAULT 1,
  `preco_total` decimal(10,2) NOT NULL,
  `status` enum('pendente','confirmada','cancelada','concluida') DEFAULT 'pendente',
  `cancelado_por` varchar(20) DEFAULT NULL,
  `motivo_cancelamento` text DEFAULT NULL,
  `cancelado_em` datetime DEFAULT NULL,
  `pagamento_status` enum('aguardando','pago','falhou','reembolsado') DEFAULT 'aguardando',
  `payment_intent_id` varchar(255) DEFAULT NULL,
  `num_documento` varchar(100) DEFAULT NULL,
  `hora_levantamento` time DEFAULT '10:00:00',
  `observacoes` text DEFAULT NULL,
  `carta_conducao` varchar(255) DEFAULT NULL,
  `data_reserva` datetime DEFAULT current_timestamp(),
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `comissao` varchar(10) NOT NULL,
  `unidade_atribuida_em` datetime DEFAULT NULL,
  `unidade_atribuida_por` int(11) DEFAULT NULL,
  `idempotency_key` varchar(64) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_uca1400_ai_ci;

CREATE TABLE `reservas_carro_condicoes` (
  `reserva_id` int(11) NOT NULL,
  `snapshot_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`snapshot_json`)),
  `aceite_cliente` tinyint(1) DEFAULT 0,
  `aceite_em` datetime DEFAULT NULL,
  `aceite_ip` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `reservas_carro_documentos` (
  `id` int(11) NOT NULL,
  `reserva_id` int(11) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `tipo_label` varchar(80) DEFAULT NULL,
  `url` varchar(500) NOT NULL,
  `estado` enum('pendente','aprovado','rejeitado') DEFAULT 'pendente',
  `motivo_rejeicao` text DEFAULT NULL,
  `enviado_em` datetime DEFAULT current_timestamp(),
  `verificado_em` datetime DEFAULT NULL,
  `verificado_por` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `reservas_experiencia` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `experiencia_id` int(11) NOT NULL,
  `codigo_reserva` varchar(50) NOT NULL,
  `data_reserva` datetime DEFAULT current_timestamp(),
  `data_participacao` date NOT NULL,
  `horario` varchar(50) NOT NULL,
  `quantidade_pessoas` int(11) NOT NULL DEFAULT 1,
  `preco_total` decimal(10,2) NOT NULL,
  `status` varchar(50) DEFAULT 'pendente',
  `pagamento_status` varchar(50) DEFAULT 'aguardando',
  `observacoes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `comissao` varchar(100) NOT NULL,
  `duracao_id` int(11) DEFAULT NULL,
  `quantidade_jet_skis` int(11) DEFAULT 1,
  `idempotency_key` varchar(64) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `reservas_temporarias` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `experiencia_id` int(11) NOT NULL,
  `sessao_id` int(11) NOT NULL,
  `quantidade` int(11) NOT NULL DEFAULT 1,
  `modelo` enum('por_pessoa','grupo_privado') DEFAULT 'por_pessoa',
  `token` varchar(64) NOT NULL,
  `dados_reserva` text DEFAULT NULL COMMENT 'JSON com dados do checkout',
  `expira_em` datetime NOT NULL,
  `status` enum('pendente','confirmada','expirada','cancelada') DEFAULT 'pendente',
  `reserva_id` int(11) DEFAULT NULL COMMENT 'ID da reserva final (após confirmar)',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `reserva_alojamento_itens` (
  `id` int(11) NOT NULL,
  `reserva_id` int(11) NOT NULL,
  `quarto_id` int(11) NOT NULL,
  `quantidade` int(11) NOT NULL DEFAULT 1,
  `preco_noite_unitario` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `reserva_validacoes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `categoria` varchar(20) NOT NULL,
  `reserva_id` int(11) NOT NULL,
  `codigo_reserva` varchar(50) NOT NULL,
  `validado_por` int(11) NOT NULL,
  `validado_em` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `site_statistics` (
  `id` int(11) NOT NULL,
  `stat_key` varchar(100) NOT NULL,
  `stat_value` bigint(20) NOT NULL DEFAULT 0,
  `category` enum('alojamentos','carros','experiencias','usuarios','reservas') NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `tipos_carros` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `icone` varchar(50) DEFAULT NULL,
  `descricao` text DEFAULT NULL,
  `ordem` int(11) DEFAULT 0,
  `ativo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `tipos_quarto` (
  `id` int(11) NOT NULL,
  `alojamento_id` int(11) DEFAULT NULL,
  `nome` varchar(50) NOT NULL,
  `slug` varchar(50) NOT NULL,
  `descricao` varchar(255) DEFAULT NULL,
  `icone` varchar(50) DEFAULT NULL,
  `multiplicador_preco` decimal(3,2) DEFAULT 1.00,
  `preco_noite` decimal(10,2) DEFAULT NULL,
  `capacidade` int(11) DEFAULT 2,
  `quantidade` int(11) NOT NULL DEFAULT 1,
  `camas` varchar(100) DEFAULT NULL,
  `imagem_url` varchar(500) DEFAULT NULL,
  `ordem` int(11) DEFAULT 0,
  `ativo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_roles` (
  `user_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `approved_at` timestamp NULL DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `document_url` varchar(500) DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `google_id` varchar(255) DEFAULT NULL,
  `nome` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verificado` tinyint(1) DEFAULT 0,
  `email_verificado_em` datetime DEFAULT NULL,
  `senha` varchar(100) NOT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `tipo_conta` enum('hospede','proprietario') DEFAULT 'hospede',
  `category` varchar(100) NOT NULL,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `phone` varchar(20) DEFAULT NULL,
  `contacto_nome` varchar(150) DEFAULT NULL,
  `contacto_email` varchar(150) DEFAULT NULL,
  `contacto_whatsapp` varchar(30) DEFAULT NULL,
  `contacto_telefone` varchar(30) DEFAULT NULL,
  `contacto_publico` tinyint(1) NOT NULL DEFAULT 0,
  `contacto_instrucoes` text DEFAULT NULL,
  `codigo_otp` varchar(10) DEFAULT NULL,
  `otp_expira` datetime DEFAULT NULL,
  `reset_otp` varchar(10) DEFAULT NULL,
  `reset_otp_expira` datetime DEFAULT NULL,
  `ultimo_login` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `online_status` varchar(10) NOT NULL,
  `last_seen` varchar(10) NOT NULL,
  `ativo` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `vehicle_categories` (
  `id` int(11) NOT NULL,
  `descricao` varchar(100) NOT NULL,
  `categoria` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `veiculos_unidades` (
  `id` int(11) NOT NULL,
  `carro_id` int(11) NOT NULL,
  `matricula` varchar(20) NOT NULL,
  `ano` int(11) DEFAULT NULL,
  `cor` varchar(50) DEFAULT NULL,
  `quilometragem` int(11) DEFAULT 0,
  `documentos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`documentos`)),
  `estado` enum('disponivel','reservada','entregue','manutencao','indisponivel') DEFAULT 'disponivel',
  `motivo_bloqueio` varchar(255) DEFAULT NULL,
  `estado_atualizado_em` datetime DEFAULT NULL,
  `estado_atualizado_por` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `admin_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_token_hash` (`token_hash`),
  ADD KEY `token_user` (`user_id`),
  ADD KEY `token_expiry` (`expires_at`);

ALTER TABLE `admin_login_attempts`
  ADD PRIMARY KEY (`email_hash`);

ALTER TABLE `alojamentos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_proprietario_aloj` (`proprietario_id`),
  ADD KEY `idx_num_apartamento` (`num_apartamento`),
  ADD KEY `idx_aloj_modelo` (`modelo_venda`);

ALTER TABLE `alojamento_comodidades`
  ADD PRIMARY KEY (`alojamento_id`,`comodidade_id`),
  ADD KEY `comodidade_id` (`comodidade_id`);

ALTER TABLE `alojamento_estatisticas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_alojamento_data` (`alojamento_id`,`data`);

ALTER TABLE `alojamento_imagens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `alojamento_id` (`alojamento_id`);

ALTER TABLE `alojamento_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_alojamento_data` (`alojamento_id`,`created_at`),
  ADD KEY `idx_tipo_evento` (`tipo_evento`);

ALTER TABLE `alojamento_quartos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_alojamento_tipo` (`alojamento_id`,`tipo_quarto_id`),
  ADD UNIQUE KEY `uniq_aloj_tipo` (`alojamento_id`,`tipo_quarto_id`),
  ADD KEY `alojamento_id` (`alojamento_id`),
  ADD KEY `tipo_quarto_id` (`tipo_quarto_id`),
  ADD KEY `idx_aloj_quartos_aloj` (`alojamento_id`,`ativo`);

ALTER TABLE `alojamento_regras`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_alojamento_regra` (`alojamento_id`,`regra_id`),
  ADD KEY `regra_id` (`regra_id`);

ALTER TABLE `alojamento_reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `alojamento_id` (`alojamento_id`),
  ADD KEY `idx_aprovado` (`aprovado`),
  ADD KEY `idx_rating` (`rating`);

ALTER TABLE `alojamento_tipos_quarto`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_aloj_tipo` (`alojamento_id`,`tipo_quarto_id`),
  ADD KEY `idx_aloj` (`alojamento_id`),
  ADD KEY `idx_tipo` (`tipo_quarto_id`);

ALTER TABLE `cancelamentos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_reserva` (`reserva_id`,`tipo_reserva`);

ALTER TABLE `carros`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `ilha` (`ilha`),
  ADD KEY `status` (`status`),
  ADD KEY `fk_carro_usuario` (`usuario_id`),
  ADD KEY `fk_carro_categoria` (`categoria_id`);

ALTER TABLE `carro_caracteristicas`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `carro_caracteristicas_rel`
  ADD PRIMARY KEY (`carro_id`,`caracteristica_id`),
  ADD KEY `fk_carro_carac_carac` (`caracteristica_id`);

ALTER TABLE `carro_disponibilidade`
  ADD PRIMARY KEY (`id`),
  ADD KEY `carro_id` (`carro_id`),
  ADD KEY `idx_datas` (`data_levantamento`,`data_devolucao`);

ALTER TABLE `carro_estatisticas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_carro_data` (`carro_id`,`data`),
  ADD KEY `idx_data` (`data`),
  ADD KEY `idx_carro` (`carro_id`);

ALTER TABLE `carro_imagens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `carro_id` (`carro_id`);

ALTER TABLE `carro_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_carro_data` (`carro_id`,`created_at`),
  ADD KEY `idx_tipo_evento` (`tipo_evento`),
  ADD KEY `idx_session` (`session_id`);

ALTER TABLE `carro_reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `carro_id` (`carro_id`),
  ADD KEY `idx_aprovado` (`aprovado`),
  ADD KEY `idx_rating` (`rating`);

ALTER TABLE `comodidades`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `comodidades_quarto`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `config_recebimento_empresa`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `conversas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_conversa` (`participante1_id`,`participante2_id`),
  ADD KEY `participante1_id` (`participante1_id`),
  ADD KEY `participante2_id` (`participante2_id`),
  ADD KEY `idx_conversa_anuncio` (`anuncio_id`),
  ADD KEY `idx_conversa_reserva` (`reserva_id`);

ALTER TABLE `dados_recebimento`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `usuario_id` (`usuario_id`),
  ADD KEY `idx_user` (`usuario_id`);

ALTER TABLE `denuncias`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `tipo_conteudo` (`tipo_conteudo`,`conteudo_id`);

ALTER TABLE `experiencias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_categoria` (`categoria`),
  ADD KEY `idx_localizacao` (`localizacao`);

ALTER TABLE `experiencias_estatisticas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_experiencia_data` (`experiencia_id`,`data`);

ALTER TABLE `experiencias_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_experiencia_data` (`experiencia_id`,`created_at`),
  ADD KEY `idx_tipo_evento` (`tipo_evento`);

ALTER TABLE `experiencia_bloqueios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_experiencia_datas` (`experiencia_id`,`data_inicio`,`data_fim`);

ALTER TABLE `experiencia_categorias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

ALTER TABLE `experiencia_disponibilidade`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_data_exp` (`experiencia_id`,`data_especifica`),
  ADD KEY `idx_disponivel` (`disponivel`),
  ADD KEY `idx_exp_disponibilidade_data` (`data_especifica`,`disponivel`),
  ADD KEY `fk_disponibilidade_duracao` (`duracao_id`);

ALTER TABLE `experiencia_duracoes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `experiencia_id` (`experiencia_id`);

ALTER TABLE `experiencia_idiomas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `experiencia_id` (`experiencia_id`);

ALTER TABLE `experiencia_imagens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `experiencia_id` (`experiencia_id`),
  ADD KEY `idx_principal` (`principal`),
  ADD KEY `idx_ordem` (`ordem`);

ALTER TABLE `experiencia_inclusoes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `experiencia_id` (`experiencia_id`);

ALTER TABLE `experiencia_requisitos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `experiencia_id` (`experiencia_id`);

ALTER TABLE `experiencia_reservas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `experiencia_id` (`experiencia_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_data` (`data_experiencia`);

ALTER TABLE `experiencia_reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `experiencia_id` (`experiencia_id`),
  ADD KEY `idx_aprovado` (`aprovado`),
  ADD KEY `idx_rating` (`rating`);

ALTER TABLE `experiencia_sessoes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_sessao` (`experiencia_id`,`data`,`hora_inicio`),
  ADD KEY `idx_data` (`data`),
  ADD KEY `idx_experiencia_data` (`experiencia_id`,`data`),
  ADD KEY `idx_reserva_grupo` (`reserva_grupo_id`);

ALTER TABLE `favoritos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_favorito` (`usuario_id`,`tipo`,`item_id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `idx_tipo_item` (`tipo`,`item_id`);

ALTER TABLE `historico_reservas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_reserva_historico` (`reserva_id`,`tipo_reserva`);

ALTER TABLE `historico_sessoes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_exp_data` (`experiencia_id`,`data`),
  ADD KEY `idx_data` (`data`),
  ADD KEY `idx_motivo` (`motivo`);

ALTER TABLE `historico_sessoes_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_exec` (`executado_em`);

ALTER TABLE `info_carros`
  ADD PRIMARY KEY (`id`),
  ADD KEY `carro_id` (`carro_id`);

ALTER TABLE `links`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `localizacoes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `alojamento_id` (`alojamento_id`);

ALTER TABLE `login_attempts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_email_ip_time` (`email`,`ip`,`attempted_at`);

ALTER TABLE `mensagens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `conversa_id` (`conversa_id`),
  ADD KEY `remetente_id` (`remetente_id`),
  ADD KEY `destinatario_id` (`destinatario_id`),
  ADD KEY `idx_lida` (`lida`);

ALTER TABLE `mensagens_anfitriao`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_dest` (`destinatario_id`,`lida`),
  ADD KEY `idx_aloj` (`alojamento_id`),
  ADD KEY `idx_spam` (`alojamento_id`,`remetente_email`,`created_at`);

ALTER TABLE `notificacoes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`usuario_id`);

ALTER TABLE `participantes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_reserva` (`reserva_id`),
  ADD KEY `idx_usuario` (`usuario_id`),
  ADD KEY `idx_participantes_usuario` (`usuario_id`,`tipo`,`category`);

ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

ALTER TABLE `pedidos_documentos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_anuncio` (`anuncio_id`,`anuncio_tipo`),
  ADD KEY `idx_prestador` (`prestador_id`),
  ADD KEY `idx_estado` (`estado`);

ALTER TABLE `quarto_comodidades`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_quarto_comodidade` (`quarto_id`,`comodidade_id`),
  ADD KEY `fk_qc_quarto` (`quarto_id`),
  ADD KEY `fk_qc_comodidade` (`comodidade_id`);

ALTER TABLE `quarto_imagens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quarto_id` (`quarto_id`);

ALTER TABLE `quarto_ocupacao`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_quarto_data_tipo` (`quarto_id`,`data`,`tipo`),
  ADD UNIQUE KEY `uniq_quarto_data_tipo` (`quarto_id`,`data`,`tipo`),
  ADD KEY `idx_quarto_data` (`quarto_id`,`data`),
  ADD KEY `idx_reserva` (`reserva_id`),
  ADD KEY `idx_expira` (`expira_em`),
  ADD KEY `idx_alojamento` (`alojamento_id`);

ALTER TABLE `reembolsos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_reserva_reembolso` (`reserva_id`,`tipo_reserva`);

ALTER TABLE `regras_casa`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `regras_disponibilidade`
  ADD PRIMARY KEY (`id`),
  ADD KEY `experiencia_id` (`experiencia_id`);

ALTER TABLE `repasses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_prestador` (`prestador_id`),
  ADD KEY `idx_reserva` (`reserva_id`);

ALTER TABLE `reservas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_idempotency` (`idempotency_key`),
  ADD KEY `alojamento_id` (`alojamento_id`);

ALTER TABLE `reservas_alojamento`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo_reserva` (`codigo_reserva`),
  ADD UNIQUE KEY `uk_idempotency_alo` (`idempotency_key`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `alojamento_id` (`alojamento_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_codigo` (`codigo_reserva`),
  ADD KEY `idx_reservas_aloj_datas` (`alojamento_id`,`status`,`data_checkin`,`data_checkout`),
  ADD KEY `idx_reservas_aloj_idem` (`idempotency_key`);

ALTER TABLE `reservas_alojamento_quartos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_reserva` (`reserva_id`),
  ADD KEY `idx_quarto` (`tipo_quarto_id`),
  ADD KEY `idx_reservas_quartos_res` (`reserva_id`,`tipo_quarto_id`);

ALTER TABLE `reservas_carro`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo_reserva` (`codigo_reserva`),
  ADD UNIQUE KEY `uk_idempotency_car` (`idempotency_key`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `carro_id` (`carro_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_pagamento_status` (`pagamento_status`),
  ADD KEY `idx_datas` (`data_levantamento`,`data_devolucao`),
  ADD KEY `idx_unidade` (`unidade_id`),
  ADD KEY `idx_reservas_carro_idem` (`idempotency_key`);

ALTER TABLE `reservas_carro_condicoes`
  ADD PRIMARY KEY (`reserva_id`);

ALTER TABLE `reservas_carro_documentos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_reserva_estado` (`reserva_id`,`estado`);

ALTER TABLE `reservas_experiencia`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo_reserva` (`codigo_reserva`),
  ADD UNIQUE KEY `uk_idempotency_exp` (`idempotency_key`),
  ADD KEY `experiencia_id` (`experiencia_id`),
  ADD KEY `idx_usuario` (`usuario_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_codigo` (`codigo_reserva`),
  ADD KEY `fk_reserva_duracao` (`duracao_id`),
  ADD KEY `idx_reservas_exp_idem` (`idempotency_key`);

ALTER TABLE `reservas_temporarias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_token` (`token`),
  ADD KEY `idx_sessao_status` (`sessao_id`,`status`),
  ADD KEY `idx_expira` (`expira_em`,`status`),
  ADD KEY `idx_usuario` (`usuario_id`);

ALTER TABLE `reserva_alojamento_itens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quarto_id` (`quarto_id`);

ALTER TABLE `reserva_validacoes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unica_validacao` (`categoria`,`reserva_id`),
  ADD KEY `codigo_validado` (`codigo_reserva`),
  ADD KEY `administrador_validacao` (`validado_por`);

ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

ALTER TABLE `site_statistics`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `stat_key` (`stat_key`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_stat_key` (`stat_key`);

ALTER TABLE `tipos_carros`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

ALTER TABLE `tipos_quarto`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_tq_aloj` (`alojamento_id`);

ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`user_id`,`role_id`),
  ADD KEY `role_id` (`role_id`);

ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `google_id` (`google_id`),
  ADD KEY `idx_usuarios_email` (`email`),
  ADD KEY `idx_usuarios_google_id` (`google_id`);

ALTER TABLE `vehicle_categories`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `veiculos_unidades`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_matricula` (`matricula`),
  ADD KEY `idx_carro_estado` (`carro_id`,`estado`);

ALTER TABLE `admin_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `alojamentos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `alojamento_estatisticas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `alojamento_imagens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `alojamento_logs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `alojamento_quartos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `alojamento_regras`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `alojamento_reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `alojamento_tipos_quarto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `cancelamentos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `carros`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `carro_caracteristicas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `carro_disponibilidade`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `carro_estatisticas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `carro_imagens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `carro_logs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `carro_reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `comodidades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `comodidades_quarto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `config_recebimento_empresa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `conversas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `dados_recebimento`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `denuncias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `experiencias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `experiencias_estatisticas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `experiencias_logs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `experiencia_bloqueios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `experiencia_categorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `experiencia_disponibilidade`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `experiencia_duracoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `experiencia_idiomas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `experiencia_imagens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `experiencia_inclusoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `experiencia_requisitos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `experiencia_reservas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `experiencia_reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `experiencia_sessoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `favoritos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `historico_reservas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `historico_sessoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `historico_sessoes_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `info_carros`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `links`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `localizacoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `login_attempts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `mensagens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `mensagens_anfitriao`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `notificacoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `participantes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `password_resets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `pedidos_documentos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `quarto_comodidades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `quarto_imagens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `quarto_ocupacao`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `reembolsos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `regras_casa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `regras_disponibilidade`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `repasses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `reservas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `reservas_alojamento`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `reservas_alojamento_quartos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `reservas_carro`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `reservas_carro_documentos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `reservas_experiencia`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `reservas_temporarias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `reserva_alojamento_itens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `reserva_validacoes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `site_statistics`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `tipos_carros`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `tipos_quarto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `vehicle_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `veiculos_unidades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `alojamentos`
  ADD CONSTRAINT `fk_proprietario_aloj` FOREIGN KEY (`proprietario_id`) REFERENCES `usuarios` (`id`);

ALTER TABLE `alojamento_comodidades`
  ADD CONSTRAINT `alojamento_comodidades_ibfk_1` FOREIGN KEY (`alojamento_id`) REFERENCES `alojamentos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `alojamento_comodidades_ibfk_2` FOREIGN KEY (`comodidade_id`) REFERENCES `comodidades` (`id`) ON DELETE CASCADE;

ALTER TABLE `alojamento_estatisticas`
  ADD CONSTRAINT `alojamento_estatisticas_ibfk_1` FOREIGN KEY (`alojamento_id`) REFERENCES `alojamentos` (`id`) ON DELETE CASCADE;

ALTER TABLE `alojamento_imagens`
  ADD CONSTRAINT `alojamento_imagens_ibfk_1` FOREIGN KEY (`alojamento_id`) REFERENCES `alojamentos` (`id`) ON DELETE CASCADE;

ALTER TABLE `alojamento_quartos`
  ADD CONSTRAINT `fk_alojamento_quartos_alojamento` FOREIGN KEY (`alojamento_id`) REFERENCES `alojamentos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_alojamento_quartos_tipo` FOREIGN KEY (`tipo_quarto_id`) REFERENCES `tipos_quarto` (`id`) ON DELETE CASCADE;

ALTER TABLE `alojamento_regras`
  ADD CONSTRAINT `alojamento_regras_ibfk_1` FOREIGN KEY (`alojamento_id`) REFERENCES `alojamentos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `alojamento_regras_ibfk_2` FOREIGN KEY (`regra_id`) REFERENCES `regras_casa` (`id`) ON DELETE CASCADE;

ALTER TABLE `alojamento_reviews`
  ADD CONSTRAINT `alojamento_reviews_ibfk_1` FOREIGN KEY (`alojamento_id`) REFERENCES `alojamentos` (`id`) ON DELETE CASCADE;

ALTER TABLE `alojamento_tipos_quarto`
  ADD CONSTRAINT `fk_atq_aloj` FOREIGN KEY (`alojamento_id`) REFERENCES `alojamentos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_atq_tipo` FOREIGN KEY (`tipo_quarto_id`) REFERENCES `tipos_quarto` (`id`);

ALTER TABLE `carros`
  ADD CONSTRAINT `fk_carro_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `tipos_carros` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_carro_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

ALTER TABLE `carro_caracteristicas_rel`
  ADD CONSTRAINT `fk_carro_carac_carac` FOREIGN KEY (`caracteristica_id`) REFERENCES `carro_caracteristicas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_carro_carac_carro` FOREIGN KEY (`carro_id`) REFERENCES `carros` (`id`) ON DELETE CASCADE;

ALTER TABLE `carro_disponibilidade`
  ADD CONSTRAINT `carro_disponibilidade_ibfk_1` FOREIGN KEY (`carro_id`) REFERENCES `carros` (`id`) ON DELETE CASCADE;

ALTER TABLE `carro_imagens`
  ADD CONSTRAINT `carro_imagens_ibfk_1` FOREIGN KEY (`carro_id`) REFERENCES `carros` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_carro_imagem` FOREIGN KEY (`carro_id`) REFERENCES `carros` (`id`) ON DELETE CASCADE;

ALTER TABLE `carro_reviews`
  ADD CONSTRAINT `carro_reviews_ibfk_1` FOREIGN KEY (`carro_id`) REFERENCES `carros` (`id`) ON DELETE CASCADE;

ALTER TABLE `conversas`
  ADD CONSTRAINT `conversas_ibfk_1` FOREIGN KEY (`participante1_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `conversas_ibfk_2` FOREIGN KEY (`participante2_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

ALTER TABLE `experiencia_bloqueios`
  ADD CONSTRAINT `fk_bloqueio_experiencia` FOREIGN KEY (`experiencia_id`) REFERENCES `experiencias` (`id`) ON DELETE CASCADE;

ALTER TABLE `experiencia_disponibilidade`
  ADD CONSTRAINT `experiencia_disponibilidade_ibfk_1` FOREIGN KEY (`experiencia_id`) REFERENCES `experiencias` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_disponibilidade_duracao` FOREIGN KEY (`duracao_id`) REFERENCES `experiencia_duracoes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_exp_disponibilidade_experiencia` FOREIGN KEY (`experiencia_id`) REFERENCES `experiencias` (`id`) ON DELETE CASCADE;

ALTER TABLE `experiencia_duracoes`
  ADD CONSTRAINT `fk_duracao_experiencia` FOREIGN KEY (`experiencia_id`) REFERENCES `experiencias` (`id`) ON DELETE CASCADE;

ALTER TABLE `experiencia_idiomas`
  ADD CONSTRAINT `experiencia_idiomas_ibfk_1` FOREIGN KEY (`experiencia_id`) REFERENCES `experiencias` (`id`) ON DELETE CASCADE;

ALTER TABLE `experiencia_imagens`
  ADD CONSTRAINT `experiencia_imagens_ibfk_1` FOREIGN KEY (`experiencia_id`) REFERENCES `experiencias` (`id`) ON DELETE CASCADE;

ALTER TABLE `experiencia_inclusoes`
  ADD CONSTRAINT `experiencia_inclusoes_ibfk_1` FOREIGN KEY (`experiencia_id`) REFERENCES `experiencias` (`id`) ON DELETE CASCADE;

ALTER TABLE `experiencia_requisitos`
  ADD CONSTRAINT `experiencia_requisitos_ibfk_1` FOREIGN KEY (`experiencia_id`) REFERENCES `experiencias` (`id`) ON DELETE CASCADE;

ALTER TABLE `experiencia_reservas`
  ADD CONSTRAINT `experiencia_reservas_ibfk_1` FOREIGN KEY (`experiencia_id`) REFERENCES `experiencias` (`id`);

ALTER TABLE `experiencia_reviews`
  ADD CONSTRAINT `experiencia_reviews_ibfk_1` FOREIGN KEY (`experiencia_id`) REFERENCES `experiencias` (`id`) ON DELETE CASCADE;

ALTER TABLE `experiencia_sessoes`
  ADD CONSTRAINT `fk_sessao_experiencia` FOREIGN KEY (`experiencia_id`) REFERENCES `experiencias` (`id`) ON DELETE CASCADE;

ALTER TABLE `info_carros`
  ADD CONSTRAINT `info_carros_ibfk_1` FOREIGN KEY (`carro_id`) REFERENCES `carros` (`id`) ON DELETE CASCADE;

ALTER TABLE `localizacoes`
  ADD CONSTRAINT `localizacoes_ibfk_1` FOREIGN KEY (`alojamento_id`) REFERENCES `alojamentos` (`id`) ON DELETE CASCADE;

ALTER TABLE `mensagens`
  ADD CONSTRAINT `mensagens_ibfk_1` FOREIGN KEY (`conversa_id`) REFERENCES `conversas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mensagens_ibfk_2` FOREIGN KEY (`remetente_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mensagens_ibfk_3` FOREIGN KEY (`destinatario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

ALTER TABLE `participantes`
  ADD CONSTRAINT `participantes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

ALTER TABLE `password_resets`
  ADD CONSTRAINT `password_resets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

ALTER TABLE `quarto_comodidades`
  ADD CONSTRAINT `fk_qc_quarto` FOREIGN KEY (`quarto_id`) REFERENCES `alojamento_quartos` (`id`) ON DELETE CASCADE;

ALTER TABLE `quarto_imagens`
  ADD CONSTRAINT `quarto_imagens_ibfk_1` FOREIGN KEY (`quarto_id`) REFERENCES `alojamento_quartos` (`id`) ON DELETE CASCADE;

ALTER TABLE `quarto_ocupacao`
  ADD CONSTRAINT `fk_qo_alojamento` FOREIGN KEY (`alojamento_id`) REFERENCES `alojamentos` (`id`) ON DELETE CASCADE;

ALTER TABLE `regras_disponibilidade`
  ADD CONSTRAINT `regras_disponibilidade_ibfk_1` FOREIGN KEY (`experiencia_id`) REFERENCES `experiencias` (`id`) ON DELETE CASCADE;

ALTER TABLE `reservas`
  ADD CONSTRAINT `reservas_ibfk_1` FOREIGN KEY (`alojamento_id`) REFERENCES `alojamentos` (`id`);

ALTER TABLE `reservas_alojamento`
  ADD CONSTRAINT `reservas_alojamento_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `reservas_alojamento_ibfk_2` FOREIGN KEY (`alojamento_id`) REFERENCES `alojamentos` (`id`);

ALTER TABLE `reservas_alojamento_quartos`
  ADD CONSTRAINT `fk_raq_reserva` FOREIGN KEY (`reserva_id`) REFERENCES `reservas_alojamento` (`id`) ON DELETE CASCADE;

ALTER TABLE `reservas_carro`
  ADD CONSTRAINT `fk_reserva_unidade` FOREIGN KEY (`unidade_id`) REFERENCES `veiculos_unidades` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `reservas_carro_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reservas_carro_ibfk_2` FOREIGN KEY (`carro_id`) REFERENCES `carros` (`id`) ON DELETE CASCADE;

ALTER TABLE `reservas_carro_condicoes`
  ADD CONSTRAINT `fk_rcc_reserva` FOREIGN KEY (`reserva_id`) REFERENCES `reservas_carro` (`id`) ON DELETE CASCADE;

ALTER TABLE `reservas_carro_documentos`
  ADD CONSTRAINT `fk_rcd_reserva` FOREIGN KEY (`reserva_id`) REFERENCES `reservas_carro` (`id`) ON DELETE CASCADE;

ALTER TABLE `reservas_experiencia`
  ADD CONSTRAINT `fk_reserva_duracao` FOREIGN KEY (`duracao_id`) REFERENCES `experiencia_duracoes` (`id`),
  ADD CONSTRAINT `reservas_experiencia_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `reservas_experiencia_ibfk_2` FOREIGN KEY (`experiencia_id`) REFERENCES `experiencias` (`id`);

ALTER TABLE `reserva_alojamento_itens`
  ADD CONSTRAINT `reserva_alojamento_itens_ibfk_1` FOREIGN KEY (`quarto_id`) REFERENCES `alojamento_quartos` (`id`);

ALTER TABLE `tipos_quarto`
  ADD CONSTRAINT `fk_tq_aloj` FOREIGN KEY (`alojamento_id`) REFERENCES `alojamentos` (`id`) ON DELETE CASCADE;

ALTER TABLE `user_roles`
  ADD CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

ALTER TABLE `veiculos_unidades`
  ADD CONSTRAINT `fk_unidade_carro` FOREIGN KEY (`carro_id`) REFERENCES `carros` (`id`) ON DELETE CASCADE;