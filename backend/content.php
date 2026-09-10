<?php
/**
 * Ūrdhv Ascens — Content API Endpoint
 * GET: Returns active live site content.
 * POST: Persists updates to active live site content on Hostinger.
 */

require_once __DIR__ . '/config.php';

handle_cors();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Return live content
    if (file_exists(DATA_FILE)) {
        $content = @file_get_contents(DATA_FILE);
        $json = @json_decode($content, true);
        if ($json) {
            send_json($json);
        }
    }

    // Fallback if data file not yet initialized
    send_json([
        'error' => 'Data file not initialized yet.',
        'status' => 'empty'
    ], 200);
}

if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $body = json_decode($raw, true);

    if (!$body || !is_array($body)) {
        send_json(['success' => false, 'message' => 'Invalid JSON payload received.'], 400);
    }

    // Verify authentication
    if (!verify_admin($body)) {
        send_json([
            'success' => false, 
            'message' => 'Unauthorized: Invalid Admin Secret Key or session token.'
        ], 401);
    }

    // Load existing data to merge
    $existing = [];
    if (file_exists(DATA_FILE)) {
        $existing = json_decode(file_get_contents(DATA_FILE), true) ?: [];
    }

    // Clean payload of security fields before saving
    unset($body['adminKey']);

    // Merge updates
    $merged = array_replace_recursive($existing, $body);

    // If projectsList or services list are passed, replace arrays instead of recursively merging indexed keys
    if (isset($body['projectsList'])) {
        $merged['projectsList'] = $body['projectsList'];
    }
    if (isset($body['services']['list'])) {
        $merged['services']['list'] = $body['services']['list'];
    }
    if (isset($body['capabilities']['list'])) {
        $merged['capabilities']['list'] = $body['capabilities']['list'];
    }
    if (isset($body['about']['stats'])) {
        $merged['about']['stats'] = $body['about']['stats'];
    }

    // Atomically write back to file
    $encoded = json_encode($merged, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $result = @file_put_contents(DATA_FILE, $encoded, LOCK_EX);

    if ($result === false) {
        send_json([
            'success' => false,
            'message' => 'Failed to write to content.json. Please check folder write permissions (chmod 755 or 775 on api/data).'
        ], 500);
    }

    send_json([
        'success' => true,
        'message' => 'Site content updated live on Hostinger!',
        'updatedAt' => date('c')
    ]);
}

send_json(['error' => 'Method not allowed'], 405);
