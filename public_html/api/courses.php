<?php
/**
 * Ūrdhv Ascens — Courses API Endpoint
 * GET: Returns active courses catalog (or all courses for admin)
 * POST: Persists updates to courses (Admin only)
 */

require_once __DIR__ . '/config.php';

handle_cors();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (!file_exists(COURSES_FILE)) {
        send_json([], 200);
    }

    $raw = @file_get_contents(COURSES_FILE);
    $courses = @json_decode($raw, true) ?: [];

    // If not admin, return only active courses
    if (!verify_admin()) {
        $courses = array_values(array_filter($courses, function($c) {
            return !empty($c['active']);
        }));
    }

    header('Cache-Control: no-cache, no-store, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');
    send_json($courses);
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

    // Allow payload to be an array of courses or an object containing courses list
    $coursesToSave = isset($body['courses']) && is_array($body['courses']) ? $body['courses'] : (is_array($body) && isset($body[0]) ? $body : null);

    if ($coursesToSave === null) {
        send_json(['success' => false, 'message' => 'Expected array of courses.'], 400);
    }

    $encoded = json_encode($coursesToSave, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $result = @file_put_contents(COURSES_FILE, $encoded, LOCK_EX);

    if ($result === false) {
        send_json(['success' => false, 'message' => 'Failed to write courses.json. Check file permissions.'], 500);
    }

    send_json([
        'success' => true,
        'message' => 'Courses updated successfully.',
        'updatedAt' => date('c')
    ]);
}

send_json(['error' => 'Method not allowed'], 405);
