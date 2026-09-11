<?php
/**
 * Ūrdhv Ascens — Admin Authentication Endpoint (Hardened Multi-User)
 * Verifies admin credentials on Hostinger with brute-force rate limiting,
 * timing-safe bcrypt comparisons, and server-side session revocation.
 */

require_once __DIR__ . '/config.php';

handle_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'GET') {
    send_json(['error' => 'Method not allowed'], 405);
}

$raw = file_get_contents('php://input');
$body = json_decode($raw, true) ?: $_POST;

$action   = isset($_GET['action']) ? trim($_GET['action']) : (isset($body['action']) ? trim($body['action']) : 'login');
$token    = isset($body['token']) ? trim($body['token']) : '';
$password = isset($body['password']) ? trim($body['password']) : '';
$adminKey = isset($body['adminKey']) ? trim($body['adminKey']) : '';
$email    = isset($body['email']) ? filter_var(trim($body['email']), FILTER_SANITIZE_EMAIL) : '';

// -----------------------------------------------------------------------------
// 1. Session Verification Action (GET or POST /api/auth.php?action=verify)
// -----------------------------------------------------------------------------
if ($action === 'verify') {
    $auth_header = get_auth_header();
    $chk_token = $token;
    if (!$chk_token && preg_match('/Bearer\s+(.*)$/i', $auth_header, $matches)) {
        $chk_token = trim($matches[1]);
    }
    if (!$chk_token && isset($_SERVER['HTTP_X_ADMIN_TOKEN'])) {
        $chk_token = trim($_SERVER['HTTP_X_ADMIN_TOKEN']);
    }

    $sessionData = get_session_user($chk_token);
    $isValid = ($sessionData !== null) || verify_admin($body);

    $userPayload = null;
    if ($sessionData) {
        $userPayload = [
            'name'  => $sessionData['name'] ?? 'Admin',
            'email' => $sessionData['email'] ?? 'devsol@urdhvascens.online',
            'role'  => $sessionData['role'] ?? 'admin'
        ];
    } else if ($isValid) {
        $userPayload = [
            'name'  => 'DEV',
            'email' => 'devsol@urdhvascens.online',
            'role'  => 'admin'
        ];
    }

    send_json([
        'authenticated' => $isValid,
        'user' => $userPayload,
        'role' => $isValid ? 'admin' : null
    ]);
}

// -----------------------------------------------------------------------------
// 2. Session Invalidation / Logout Action
// -----------------------------------------------------------------------------
if ($action === 'logout') {
    $auth_header = get_auth_header();
    if (!$token && preg_match('/Bearer\s+(.*)$/i', $auth_header, $matches)) {
        $token = trim($matches[1]);
    }
    if (!$token && isset($_SERVER['HTTP_X_ADMIN_TOKEN'])) {
        $token = trim($_SERVER['HTTP_X_ADMIN_TOKEN']);
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
// 3. IP Rate Limiting & Brute-Force Throttling
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
    if (isset($data['locked_until']) && $now > $data['locked_until'] && ($now - ($data['last_attempt'] ?? $now)) > 3600) {
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
// 4. Multi-User Timing-Safe Credential Verification
// -----------------------------------------------------------------------------
$authenticated = false;
$authenticatedUser = null;

$input_email = strtolower(trim($email));
$pass_to_check = !empty($password) ? $password : $adminKey;

// A. Check specific account by email
if (!empty($input_email) && defined('ADMIN_ACCOUNTS') && isset(ADMIN_ACCOUNTS[$input_email])) {
    $acc = ADMIN_ACCOUNTS[$input_email];
    if (!empty($pass_to_check) && is_string($pass_to_check) && password_verify($pass_to_check, $acc['hash'])) {
        $authenticated = true;
        $authenticatedUser = $acc;
    }
}

// B. Check against any configured admin account if email was empty or mismatched
if (!$authenticated && !empty($pass_to_check) && is_string($pass_to_check) && defined('ADMIN_ACCOUNTS')) {
    foreach (ADMIN_ACCOUNTS as $acc) {
        if (password_verify($pass_to_check, $acc['hash'])) {
            $authenticated = true;
            $authenticatedUser = $acc;
            break;
        }
    }
}

// C. Fallback for master administrative key / deployment automation
if (!$authenticated && !empty($pass_to_check) && is_string($pass_to_check) && defined('ADMIN_SECRET_KEY')) {
    if (hash_equals(ADMIN_SECRET_KEY, $pass_to_check)) {
        $authenticated = true;
        $authenticatedUser = [
            'id'    => 'DEV',
            'name'  => 'DEV',
            'email' => 'devsol@urdhvascens.online',
            'role'  => 'admin'
        ];
    }
}

// -----------------------------------------------------------------------------
// 5. Response & Rate-Limit Accounting
// -----------------------------------------------------------------------------
if ($authenticated && $authenticatedUser) {
    // Reset failed counter on success
    if (isset($rate_data[$ip])) {
        unset($rate_data[$ip]);
        @file_put_contents($rate_file, json_encode($rate_data), LOCK_EX);
    }

    $sessionToken = create_session_token($authenticatedUser['email'], $authenticatedUser['name'], $authenticatedUser['role']);
    send_json([
        'success' => true,
        'token'   => $sessionToken,
        'user'    => [
            'id'    => $authenticatedUser['id'],
            'name'  => $authenticatedUser['name'],
            'email' => $authenticatedUser['email'],
            'role'  => $authenticatedUser['role']
        ],
        'email'   => $authenticatedUser['email'],
        'name'    => $authenticatedUser['name'],
        'role'    => $authenticatedUser['role'],
        'message' => "Welcome {$authenticatedUser['name']}, authenticated successfully to Ūrdhv Control Plane."
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
        'message' => 'Invalid email or password credentials.'
    ], 401);
}
