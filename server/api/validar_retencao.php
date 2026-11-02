<?php
require_once __DIR__.'/retencaoBootstrap.php';
executarRetencao(static function(PDO $conn,array $input): array {
    return validarRetencaoComCotacao($conn,(string)($input['token'] ?? ''),isset($input['preco_total']) ? (float)$input['preco_total'] : null);
});
