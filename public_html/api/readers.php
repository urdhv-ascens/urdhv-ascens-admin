<?php
/**
 * Ūrdhv Ascens — Readers API Endpoint
 * POST: Public course access registration with mandatory privacy consent flag
 * GET: Admin-only reader list, search, and CSV export
 * DELETE: Admin-only reader record removal
 */

require_once __DIR__ . '/config.php';

handle_cors();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $body = json_decode($raw, true);

    if (!$body || !is_array($body)) {
        send_json(['success' => false, 'message' => 'Invalid JSON payload received.'], 400);
    }

    // 1. Mandatory Privacy Consent check (Spec §6.3 / C-11)
    if (empty($body['consentGiven']) || $body['consentGiven'] !== true) {
        send_json([
            'success' => false, 
            'message' => 'Privacy consent is required to access educational booklets.'
        ], 400);
    }

    // 2. Validate required visitor fields
    $name           = isset($body['name']) ? trim(strip_tags($body['name'])) : '';
    $contact        = isset($body['contact']) ? trim(strip_tags($body['contact'])) : '';
    $phone          = isset($body['phone']) ? trim(strip_tags($body['phone'])) : '';
    $city           = isset($body['city']) ? trim(strip_tags($body['city'])) : '';
    $ageGroup       = isset($body['ageGroup']) ? trim(strip_tags($body['ageGroup'])) : '';
    $industry       = isset($body['industry']) ? trim(strip_tags($body['industry'])) : '';
    $intent         = isset($body['intent']) ? trim(strip_tags($body['intent'])) : '';
    $courseSelected = isset($body['courseSelected']) ? trim(strip_tags($body['courseSelected'])) : 'students-ai';
    $role           = isset($body['role']) ? trim(strip_tags($body['role'])) : 'Individual Learner';
    $institution    = isset($body['institution']) ? trim(strip_tags($body['institution'])) : '';

    if (empty($name) || empty($contact)) {
        send_json([
            'success' => false, 
            'message' => 'Full name and email are required for verification.'
        ], 400);
    }

    // 3. Create reader record with rich ad-targeting attributes
    $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    $ipHash = hash('sha256', $ip . '_urdhv_salt_2026');

    $record = [
        'id'             => 'reader_' . bin2hex(random_bytes(8)),
        'name'           => $name,
        'contact'        => $contact,
        'phone'          => $phone,
        'city'           => $city,
        'ageGroup'       => $ageGroup,
        'industry'       => $industry,
        'intent'         => $intent,
        'role'           => $role,
        'institution'    => $institution,
        'courseSelected' => $courseSelected,
        'consentGiven'   => true,
        'registeredAt'   => date('c'),
        'ipHash'         => $ipHash
    ];

    // 4. Append to readers.json atomically
    $existing = [];
    if (file_exists(READERS_FILE)) {
        $existing = json_decode(file_get_contents(READERS_FILE), true) ?: [];
    }

    $existing[] = $record;

    $encoded = json_encode($existing, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $result = @file_put_contents(READERS_FILE, $encoded, LOCK_EX);

    if ($result === false) {
        send_json(['success' => false, 'message' => 'Failed to save reader information.'], 500);
    }

    send_json([
        'success' => true,
        'message' => 'Registration complete. Welcome to the course!',
        'readerId' => $record['id']
    ], 201);
}

if ($method === 'GET') {
    // Admin only
    if (!verify_admin()) {
        send_json(['success' => false, 'message' => 'Unauthorized.'], 401);
    }

    $existing = [];
    if (file_exists(READERS_FILE)) {
        $existing = json_decode(file_get_contents(READERS_FILE), true) ?: [];
    }

    // Optional query filtering
    $q = isset($_GET['q']) ? strtolower(trim($_GET['q'])) : '';
    $courseId = isset($_GET['courseId']) ? trim($_GET['courseId']) : '';

    $filtered = array_values(array_filter($existing, function($r) use ($q, $courseId) {
        if ($courseId && isset($r['courseSelected']) && $r['courseSelected'] !== $courseId) {
            return false;
        }
        if ($q) {
            $name = strtolower($r['name'] ?? '');
            $contact = strtolower($r['contact'] ?? '');
            $inst = strtolower($r['institution'] ?? '');
            if (strpos($name, $q) === false && strpos($contact, $q) === false && strpos($inst, $q) === false) {
                return false;
            }
        }
        return true;
    }));

    // CSV Export option with complete advertising & demographic segmentation
    if (isset($_GET['export']) && $_GET['export'] === 'csv') {
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="urdhv_targeted_leads_' . date('Y-m-d') . '.csv"');
        $out = fopen('php://output', 'w');
        fputcsv($out, ['ID', 'Name', 'Email', 'Phone', 'City', 'Age Group', 'Industry', 'Intent / Target Segment', 'Role', 'Institution', 'Course Track', 'Registered At']);
        foreach ($filtered as $r) {
            fputcsv($out, [
                $r['id'] ?? '',
                $r['name'] ?? '',
                $r['contact'] ?? '',
                $r['phone'] ?? '',
                $r['city'] ?? '',
                $r['ageGroup'] ?? '',
                $r['industry'] ?? '',
                $r['intent'] ?? '',
                $r['role'] ?? '',
                $r['institution'] ?? '',
                $r['courseSelected'] ?? '',
                $r['registeredAt'] ?? ''
            ]);
        }
        fclose($out);
        exit;
    }

    send_json([
        'total' => count($filtered),
        'readers' => $filtered
    ]);
}

if ($method === 'DELETE') {
    // Admin only
    $body = json_decode(file_get_contents('php://input'), true) ?: [];
    if (!verify_admin($body)) {
        send_json(['success' => false, 'message' => 'Unauthorized.'], 401);
    }

    $id = $_GET['id'] ?? $body['id'] ?? '';
    if (empty($id)) {
        send_json(['success' => false, 'message' => 'Reader ID is required for deletion.'], 400);
    }

    $existing = [];
    if (file_exists(READERS_FILE)) {
        $existing = json_decode(file_get_contents(READERS_FILE), true) ?: [];
    }

    $initialCount = count($existing);
    $existing = array_values(array_filter($existing, function($r) use ($id) {
        return ($r['id'] ?? '') !== $id;
    }));

    if (count($existing) === $initialCount) {
        send_json(['success' => false, 'message' => 'Reader record not found.'], 404);
    }

    $encoded = json_encode($existing, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    @file_put_contents(READERS_FILE, $encoded, LOCK_EX);

    send_json(['success' => true, 'message' => 'Reader record deleted successfully.']);
}

send_json(['error' => 'Method not allowed'], 405);
