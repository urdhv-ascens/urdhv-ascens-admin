<?php
/**
 * Ūrdhv Ascens — Advertisements API Endpoint
 * GET: Returns active sponsor top bar and side ads configuration
 * POST: Admin-only ads configuration update
 */

require_once __DIR__ . '/config.php';

handle_cors();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (!file_exists(ADS_FILE)) {
        send_json([
            'topBar' => ['enabled' => false, 'slides' => [], 'rotationIntervalSeconds' => 6],
            'sideAds' => ['leftAd' => ['enabled' => false], 'rightAd' => ['enabled' => false]]
        ], 200);
    }

    header('Cache-Control: no-cache, no-store, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    $raw = @file_get_contents(ADS_FILE);
    $ads = @json_decode($raw, true) ?: [];

    $isAdmin = verify_admin();

    // If public user, filter inactive slides and honor schedule
    if (!$isAdmin && isset($ads['topBar']['slides'])) {
        $now = time();
        $ads['topBar']['slides'] = array_values(array_filter($ads['topBar']['slides'], function($s) use ($now) {
            if (empty($s['active'])) return false;
            if (!empty($s['startDate']) && strtotime($s['startDate']) > $now) return false;
            if (!empty($s['endDate']) && strtotime($s['endDate']) < $now) return false;
            return true;
        }));
    }

    // Zero cache policy for dynamic CMS ads
    header('Cache-Control: no-cache, no-store, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');
    send_json($ads);
}

if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $body = json_decode($raw, true);

    if (!$body) {
        send_json(['success' => false, 'message' => 'Invalid JSON payload received.'], 400);
    }

    if (!verify_admin($body)) {
        send_json(['success' => false, 'message' => 'Unauthorized: Invalid Admin Secret Key or session token.'], 401);
    }

    unset($body['adminKey']);
    unset($body['token']);
    unset($body['key']);

    $existing = [];
    if (file_exists(ADS_FILE)) {
        $existing = json_decode(file_get_contents(ADS_FILE), true) ?: [];
    }

    // Merge or replace
    $merged = array_replace_recursive($existing, $body);

    // If full slides array provided, replace it directly to allow reordering/deleting
    if (isset($body['topBar']['slides'])) {
        $merged['topBar']['slides'] = $body['topBar']['slides'];
    }

    $encoded = json_encode($merged, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $result = @file_put_contents(ADS_FILE, $encoded, LOCK_EX);

    if ($result === false) {
        send_json(['success' => false, 'message' => 'Failed to write ads.json. Check file permissions.'], 500);
    }

    send_json([
        'success' => true,
        'message' => 'Advertisement configuration updated successfully.',
        'updatedAt' => date('c')
    ]);
}

send_json(['error' => 'Method not allowed'], 405);
