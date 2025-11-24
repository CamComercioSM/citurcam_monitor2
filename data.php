<?php
header('Content-Type: application/json; charset=utf-8');
$op = $_GET['operacion'] ?? [];
// === 1. Fuente actual (mock local) ===
// En el futuro esto apuntará a una API real:
// $source = "https://api.miempresa.com/datos";
$source = __DIR__ . '/' . $op . '.json';
// === 2. Leer la fuente ===
$data = @file_get_contents($source);

if (!$data) {
    http_response_code(500);
    echo json_encode([
        "error" => true,
        "message" => "No se pudieron obtener los datos desde la fuente."
    ]);
    exit;
}

echo $data;