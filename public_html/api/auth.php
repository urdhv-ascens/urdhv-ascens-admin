<?php
/**
 * Ūrdhv Ascens — Admin Authentication Endpoint (Hardened)
 * Verifies admin credentials on Hostinger with brute-force rate limiting,
 * timing-safe comparisons, and server-side session revocation.
 */

require_once __DIR__ . '/config.php';

handle_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json(['error' => 'Method not allowed'], 405);
}

$raw = file_get_contents('php://input');
$body = json_decode($raw, true) ?: $_POST;

$action   = isset($body['action']) ? trim($body['action']) : (isset($_GET['action']) ? trim($_GET['action']) : 'login');
$token    = isset($body['token']) ? trim($body['token']) : '';
$password = isset($body['password']) ? trim($body['password']) : '';
$adminKey = isset($body['adminKey']) ? trim($body['adminKey']) : '';
$email    = isset($body['email']) ? filter_var(trim($body['email']), FILTER_SANITIZE_EMAIL) : 'admin@urdhvascens.com';

// -----------------------------------------------------------------------------
// 1. Session Invalidation / Logout Action
// -----------------------------------------------------------------------------
if ($action === 'logout') {
    // Look for token in payload or Bearer header
    $auth_header = isset($_SERVER['HTTP_AUTHORIZATION']) ? trim($_SERVER['HTTP_AUTHORIZATION']) : '';
    if (!$token && preg_match('/Bearer\s+(.*)$/i', $auth_header, $matches)) {
        $token = trim($matches[1]);
    }
    
    if ($token) {
        invalidate_session_token($token);
    }

    send_json([
        'success' => true,
        'message' => 'Admin session terminated successfully.'
    ]);
}

// -----------------------------------------------------------------------------
// 2. IP Rate Limiting & Brute-Force Throttling
// -----------------------------------------------------------------------------
$rate_file = DATA_DIR . '/rate_limit.json';
$ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
$rate_data = [];

if (file_exists($rate_file)) {
    $rate_data = @json_decode(file_get_contents($rate_file), true) ?: [];
}

// Clean up expired locks (> 1 hour old)
$now = time();
foreach ($rate_data as $cached_ip => $data) {
    if (isset($data['locked_until']) && $now > $data['locked_until'] && ($now - $data['last_attempt']) > 3600) {
        unset($rate_data[$cached_ip]);
    }
}

// Check if current IP is locked
if (isset($rate_data[$ip])) {
    $ip_record = $rate_data[$ip];
    if (isset($ip_record['locked_until']) && $now < $ip_record['locked_until']) {
        $wait_min = ceil(($ip_record['locked_until'] - $now) / 60);
        send_json([
            'success' => false,
            'message' => "Too many failed attempts. Access temporarily suspended. Please try again in {$wait_min} minute(s)."
        ], 429);
    }
}

// -----------------------------------------------------------------------------
// 3. Timing-Safe Credential Verification
// -----------------------------------------------------------------------------
$authenticated = false;

// Check adminKey header/body or password using timing-safe comparison
if (!empty($adminKey) && is_string($adminKey) && hash_equals(ADMIN_SECRET_KEY, $adminKey)) {
    $authenticated = true;
} else if (!empty($password) && is_string($password) && hash_equals(ADMIN_SECRET_KEY, $password)) {
    $authenticated = true;
}

// -----------------------------------------------------------------------------
// 4. Response & Rate-Limit Accounting
// -----------------------------------------------------------------------------
if ($authenticated) {
    // Reset failed counter on success
    if (isset($rate_data[$ip])) {
        unset($rate_data[$ip]);
        @file_put_contents($rate_file, json_encode($rate_data), LOCK_EX);
    }

    $sessionToken = create_session_token($email);
    send_json([
        'success' => true,
        'token' => $sessionToken,
        'email' => $email,
        'role' => 'admin',
        'message' => 'Authenticated successfully.'
    ]);
} else {
    // Record failed attempt
    if (!isset($rate_data[$ip])) {
        $rate_data[$ip] = ['attempts' => 1, 'last_attempt' => $now];
    } else {
        $rate_data[$ip]['attempts'] = ($rate_data[$ip]['attempts'] ?? 0) + 1;
        $rate_data[$ip]['last_attempt'] = $now;
    }

    // Lock if >= 5 failed attempts
    if ($rate_data[$ip]['attempts'] >= 5) {
        $rate_data[$ip]['locked_until'] = $now + 900; // 15 minute penalty
    }

    @file_put_contents($rate_file, json_encode($rate_data), LOCK_EX);

    // Sleep 1 second to throttle brute-force scripts and mitigate timing attacks
    sleep(1);

    send_json([
        'success' => false,
        'message' => 'Invalid password or credentials.'
    ], 401);
}
