<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/theme.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'POST required']);
    exit;
}

$action = (string)($_POST['action'] ?? 'save');

if ($action === 'reset') {
    $theme = theme_studio_defaults();
} else {
    $decoded = json_decode((string)($_POST['theme'] ?? ''), true);
    if (!is_array($decoded)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Invalid theme data']);
        exit;
    }
    $theme = theme_studio_validate($decoded);
}

if (!theme_studio_save($theme)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Could not write theme files']);
    exit;
}

echo json_encode(['ok' => true, 'theme' => $theme]);
