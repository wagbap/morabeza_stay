<?php
declare(strict_types=1);
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store');
ini_set('display_errors', '0');

function respostaUploadDocumento(int $status, array $body): void {
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') respostaUploadDocumento(405, ['success'=>false,'message'=>'Método inválido.']);

try {
    $file = $_FILES['documento'] ?? null;
    if (!is_array($file) || !isset($file['error']) || is_array($file['error'])) respostaUploadDocumento(400, ['success'=>false,'message'=>'Nenhum ficheiro enviado.']);
    if (in_array($file['error'], [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true)) respostaUploadDocumento(413, ['success'=>false,'message'=>'O ficheiro é demasiado grande (máximo 10 MB).']);
    if ($file['error'] !== UPLOAD_ERR_OK) respostaUploadDocumento(400, ['success'=>false,'message'=>'O upload não foi concluído. Selecione novamente o ficheiro.']);
    $extension = strtolower(pathinfo((string)$file['name'], PATHINFO_EXTENSION));
    // Endpoint partilhado com os pedidos de documentos: manter os formatos existentes.
    if (!in_array($extension, ['pdf','doc','docx','jpg','jpeg','png'], true)) respostaUploadDocumento(415, ['success'=>false,'message'=>'Formato inválido. Utilize PDF, Word ou imagem.']);
    if ((int)$file['size'] <= 0 || (int)$file['size'] > 10 * 1024 * 1024) respostaUploadDocumento(413, ['success'=>false,'message'=>'Selecione um ficheiro válido até 10 MB.']);
    $directory = dirname(__DIR__, 2) . '/uploads/documentos';
    if (!is_dir($directory) && !mkdir($directory, 0755, true) && !is_dir($directory)) throw new RuntimeException('Upload directory unavailable');
    $name = 'doc_' . bin2hex(random_bytes(16)) . '.' . $extension;
    if (!move_uploaded_file($file['tmp_name'], $directory . '/' . $name)) throw new RuntimeException('Upload move failed');
    // O URL ja nasce correto. Nao substituir "https:/" dentro de "https://".
    $url = 'https://welovepalop.com/uploads/documentos/' . $name;
    respostaUploadDocumento(200, ['success'=>true,'documento_url'=>$url]);
} catch (Throwable $e) {
    error_log('[upload_documento] ' . $e->getMessage());
    respostaUploadDocumento(500, ['success'=>false,'message'=>'Erro ao guardar o ficheiro no servidor.']);
}
