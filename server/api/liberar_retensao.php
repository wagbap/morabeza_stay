<?php
require_once __DIR__.'/retencaoBootstrap.php';
executarRetencao(static fn(PDO $conn,array $input): array => libertarVagasTemporarias($conn,(string)($input['token'] ?? '')));
