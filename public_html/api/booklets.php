<?php
/**
 * Ūrdhv Ascens — Booklets API Endpoint
 * GET: Returns booklet catalog (supports ?courseId=... and ?category=...)
 * POST: Admin-only booklet updates (metadata, active status, displayOrder, customCoverUrl)
 */

require_once __DIR__ . '/config.php';

handle_cors();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (!file_exists(BOOKLETS_FILE)) {
        send_json([], 200);
    }

    header('Cache-Control: no-cache, no-store, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    $raw = @file_get_contents(BOOKLETS_FILE);
    $booklets = @json_decode($raw, true) ?: [];

    $isAdmin = verify_admin();

    // Filter by active status if not admin
    if (!$isAdmin) {
        $booklets = array_values(array_filter($booklets, function($b) {
            return !empty($b['active']);
        }));
    }

    // Optional query parameter filtering
    if (isset($_GET['courseId']) && !empty($_GET['courseId'])) {
        $courseId = trim($_GET['courseId']);
        $booklets = array_values(array_filter($booklets, function($b) use ($courseId) {
            return isset($b['courseId']) && $b['courseId'] === $courseId;
        }));
    }

    if (isset($_GET['category']) && !empty($_GET['category'])) {
        $cat = trim($_GET['category']);
        $booklets = array_values(array_filter($booklets, function($b) use ($cat) {
            return isset($b['category']) && $b['category'] === $cat;
        }));
    }

    // Sort by displayOrder
    usort($booklets, function($a, $b) {
        $orderA = $a['displayOrder'] ?? 999;
        $orderB = $b['displayOrder'] ?? 999;
        return $orderA - $orderB;
    });

    header('ETag: ' . $etag);
    header('Cache-Control: public, max-age=120, stale-while-revalidate=600');
    send_json($booklets);
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

    // Check if full array passed or single booklet update
    $existing = [];
    if (file_exists(BOOKLETS_FILE)) {
        $existing = json_decode(file_get_contents(BOOKLETS_FILE), true) ?: [];
    }

    if (isset($body['booklets']) && is_array($body['booklets'])) {
        // Full replacement
        $existing = $body['booklets'];
    } elseif (is_array($body) && isset($body[0]) && isset($body[0]['id'])) {
        // Direct array payload
        $existing = $body;
    } elseif (isset($body['id'])) {
        // Single booklet update (e.g. from Manual Thumbnail Editor or Metadata Editor)
        $found = false;
        foreach ($existing as $idx => $item) {
            if ($item['id'] === $body['id']) {
                $existing[$idx] = array_merge($item, $body);
                $found = true;
                break;
            }
        }
        if (!$found) {
            $existing[] = $body;
        }
    } else {
        send_json(['success' => false, 'message' => 'Invalid booklet data format.'], 400);
    }

    $encoded = json_encode($existing, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $result = @file_put_contents(BOOKLETS_FILE, $encoded, LOCK_EX);

    if ($result === false) {
        send_json(['success' => false, 'message' => 'Failed to write booklets.json. Check file permissions.'], 500);
    }

    send_json([
        'success' => true,
        'message' => 'Booklet catalog updated successfully.',
        'updatedAt' => date('c')
    ]);
}

send_json(['error' => 'Method not allowed'], 405);
