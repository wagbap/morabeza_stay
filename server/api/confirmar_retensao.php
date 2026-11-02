<?php
require_once __DIR__.'/retencaoBootstrap.php';
executarRetencao(static fn(PDO $conn,array $input): array => confirmarVagasTemporarias($conn,(string)($input['token'] ?? ''),(int)($input['reserva_id'] ?? 0)));
