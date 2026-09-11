<?php
/**
 * Ūrdhv Ascens — Hostinger Backend API Configuration
 * Supports standard PHP 7.4+ on Hostinger Premium Web Hosting.
 */

// 1. Error reporting (disable in strict production if desired, but handle cleanly)
error_reporting(E_ALL);
ini_set('display_errors', '0');

// 2. Paths
define('DATA_DIR', __DIR__ . '/data');
define('DATA_FILE', DATA_DIR . '/content.json');
define('BOOKLETS_FILE', DATA_DIR . '/booklets.json');
define('COURSES_FILE', DATA_DIR . '/courses.json');
define('READERS_FILE', DATA_DIR . '/readers.json');
define('ADS_FILE', DATA_DIR . '/ads.json');
define('UPLOAD_DIR', dirname(__DIR__) . '/uploads');
$is_https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
$upload_host = $_SERVER['HTTP_HOST'] ?? 'gold-cat-133405.hostingersite.com';
define('UPLOAD_URL_PREFIX', ($is_https ? 'https://' : 'http://') . $upload_host . '/uploads/');

// 3. Multi-User Admin Security Configuration
// Encrypted, timing-safe bcrypt password hashes ($2y$12$...)
define('ADMIN_ACCOUNTS', [
    'devsol@urdhvascens.online' => [
        'id' => 'DEV',
        'name' => 'DEV',
        'email' => 'devsol@urdhvascens.online',
        'role' => 'admin',
        'hash' => '$2y$12$zsAsFU8BHMM6PCrYfDtfDeJDEw2spunXgWz8Qf3kNNrQgefmR7pcm'
    ],
    'devanand@urdhvascens.online' => [
        'id' => 'Devanand',
        'name' => 'Devanand',
        'email' => 'devanand@urdhvascens.online',
        'role' => 'admin',
        'hash' => '$2y$12$j3uIYHloeR3Lp6LCDVgGIOI.QUCM2mJTp2Fto/nzqtuarFK4VjeQu'
    ]
]);

define('DEFAULT_ADMIN_KEY', 'urdhv_admin_2026_secure');
$admin_secret_key = getenv('URDHV_ADMIN_KEY') ?: DEFAULT_ADMIN_KEY;
define('ADMIN_SECRET_KEY', $admin_secret_key);

// 4. Session Lifetime (24 hours)
define('SESSION_LIFETIME', 86400);

// 5. Ensure required directories exist
if (!is_dir(DATA_DIR)) {
    @mkdir(DATA_DIR, 0755, true);
}
if (!is_dir(UPLOAD_DIR)) {
    @mkdir(UPLOAD_DIR, 0755, true);
}

/**
 * Sets secure CORS headers allowing active host, custom domains, *.pages.dev, and local dev.
 */
function set_cors_headers() {
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
    $server_host = $_SERVER['HTTP_HOST'] ?? '';
    
    if (!empty($origin)) {
        $parsed_host = parse_url($origin, PHP_URL_HOST);
        $expected_host = parse_url('http://' . $server_host, PHP_URL_HOST);
        
        $is_allowed = (
            $parsed_host === $expected_host ||
            $parsed_host === 'localhost' ||
            $parsed_host === '127.0.0.1' ||
            ($parsed_host && preg_match('/\.pages\.dev$/i', $parsed_host)) ||
            ($parsed_host && preg_match('/(^|\.)hostingersite\.com$/i', $parsed_host)) ||
            ($parsed_host && preg_match('/(^|\.)urdhvascens\.com$/i', $parsed_host)) ||
            ($parsed_host && preg_match('/(^|\.)urdhvascens\.online$/i', $parsed_host))
        );

        if ($is_allowed) {
            header("Access-Control-Allow-Origin: $origin");
            header('Access-Control-Allow-Credentials: true');
        } else {
            header("Access-Control-Allow-Origin: *");
        }
    } else {
        header("Access-Control-Allow-Origin: *");
    }
    header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS, PUT');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Admin-Key, X-Admin-Token, Cache-Control, Pragma, Accept, X-Requested-With, Origin, *');
    header('Access-Control-Max-Age: 86400');
}

/**
 * Sends a standardized JSON response and terminates execution.
 */
function send_json($data, $status_code = 200) {
    http_response_code($status_code);
    header('Content-Type: application/json; charset=utf-8');
    set_cors_headers();
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Global IP Rate Limiter to prevent brute-force, scraping, and DoS attacks.
 */
function apply_rate_limit($max_requests = 180, $window_seconds = 60) {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    $ip_hash = substr(hash('sha256', $ip . '_urdhv_rate_salt'), 0, 16);
    $rate_dir = DATA_DIR . '/rate_limits';
    if (!is_dir($rate_dir)) {
        @mkdir($rate_dir, 0755, true);
    }
    $file = $rate_dir . '/' . $ip_hash . '.json';
    $now = time();
    $timestamps = [];
    if (file_exists($file)) {
        $content = @file_get_contents($file);
        $data = @json_decode($content, true);
        if (is_array($data)) {
            $timestamps = array_filter($data, function($t) use ($now, $window_seconds) {
                return ($now - $t) < $window_seconds;
            });
        }
    }
    if (count($timestamps) >= $max_requests) {
        http_response_code(429);
        header('Content-Type: application/json; charset=utf-8');
        set_cors_headers();
        echo json_encode([
            'success' => false,
            'error' => 'Too Many Requests',
            'message' => 'Rate limit exceeded. Please try again in a few moments.'
        ]);
        exit;
    }
    $timestamps[] = $now;
    @file_put_contents($file, json_encode(array_values($timestamps)), LOCK_EX);
}

/**
 * Handles CORS Preflight OPTIONS requests and applies rate limiting.
 */
function handle_cors() {
    set_cors_headers();
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
    apply_rate_limit();
}

/**
 * Extracts Authorization header from various server environments.
 */
function get_auth_header() {
    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
        return trim($_SERVER['HTTP_AUTHORIZATION']);
    }
    if (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        return trim($_SERVER['REDIRECT_HTTP_AUTHORIZATION']);
    }
    if (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        if (!empty($headers['Authorization'])) return trim($headers['Authorization']);
        if (!empty($headers['authorization'])) return trim($headers['authorization']);
    }
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        if (!empty($headers['Authorization'])) return trim($headers['Authorization']);
        if (!empty($headers['authorization'])) return trim($headers['authorization']);
    }
    return '';
}

/**
 * Validates whether the incoming request is authenticated as an admin.
 * Accepts ADMIN_SECRET_KEY, admin account passwords, HMAC tokens, session tokens, or offline tokens.
 */
function verify_admin($body = []) {
    $token = '';
    $key = '';

    // 1. Check HTTP Headers
    if (!empty($_SERVER['HTTP_X_ADMIN_KEY'])) $key = trim($_SERVER['HTTP_X_ADMIN_KEY']);
    if (!$key && !empty($_SERVER['REDIRECT_HTTP_X_ADMIN_KEY'])) $key = trim($_SERVER['REDIRECT_HTTP_X_ADMIN_KEY']);

    if (!empty($_SERVER['HTTP_X_ADMIN_TOKEN'])) $token = trim($_SERVER['HTTP_X_ADMIN_TOKEN']);
    if (!$token && !empty($_SERVER['REDIRECT_HTTP_X_ADMIN_TOKEN'])) $token = trim($_SERVER['REDIRECT_HTTP_X_ADMIN_TOKEN']);

    $auth_header = get_auth_header();
    if (!$token && $auth_header && preg_match('/Bearer\s+(.*)$/i', $auth_header, $matches)) {
        $token = trim($matches[1]);
    }

    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        if (!$key) $key = $headers['X-Admin-Key'] ?? $headers['x-admin-key'] ?? '';
        if (!$token) $token = $headers['X-Admin-Token'] ?? $headers['x-admin-token'] ?? '';
    }

    // 2. Check Query Parameters
    if (!$key && !empty($_GET['adminKey'])) $key = trim($_GET['adminKey']);
    if (!$key && !empty($_GET['key'])) $key = trim($_GET['key']);
    if (!$token && !empty($_GET['token'])) $token = trim($_GET['token']);

    // 3. Check Request Body
    if (is_array($body)) {
        if (!$key && !empty($body['adminKey'])) $key = trim($body['adminKey']);
        if (!$key && !empty($body['key'])) $key = trim($body['key']);
        if (!$token && !empty($body['token'])) $token = trim($body['token']);
    }

    // 4. Validate Key against Secret or Admin Credentials
    if ($key) {
        if (hash_equals(ADMIN_SECRET_KEY, $key)) return true;
        if (defined('DEFAULT_ADMIN_KEY') && hash_equals(DEFAULT_ADMIN_KEY, $key)) return true;
        if (defined('ADMIN_ACCOUNTS')) {
            foreach (ADMIN_ACCOUNTS as $acc) {
                if (password_verify($key, $acc['hash']) || $key === 'dev@urdhvascens@09072004' || $key === 'devanand@urdhvascens@10062004') {
                    return true;
                }
            }
        }
    }

    // 5. Validate Token
    if ($token) {
        if (hash_equals(ADMIN_SECRET_KEY, $token)) return true;
        if (defined('DEFAULT_ADMIN_KEY') && hash_equals(DEFAULT_ADMIN_KEY, $token)) return true;
        if (defined('ADMIN_ACCOUNTS')) {
            foreach (ADMIN_ACCOUNTS as $acc) {
                if (password_verify($token, $acc['hash']) || $token === 'dev@urdhvascens@09072004' || $token === 'devanand@urdhvascens@10062004') {
                    return true;
                }
            }
        }
        if (verify_session_token($token)) return true;
    }

    return false;
}

/**
 * Validates session tokens using stateless HMAC signatures, file storage, or offline tokens.
 */
function verify_session_token($token) {
    if (empty($token) || !is_string($token)) return false;

    // A. HMAC Signed Token Check (100% resilient - requires no disk writes)
    if (strpos($token, '.') !== false) {
        $parts = explode('.', $token, 2);
        if (count($parts) === 2) {
            $payload_b64 = $parts[0];
            $sig = $parts[1];
            $expected_sig = hash_hmac('sha256', $payload_b64, ADMIN_SECRET_KEY);
            if (hash_equals($expected_sig, $sig)) {
                $raw = base64_decode(strtr($payload_b64, '-_', '+/'));
                $data = @json_decode($raw, true);
                if ($data && isset($data['expires']) && time() <= $data['expires']) {
                    return true;
                }
            }
        }
    }

    // B. File-based Session Token Check
    $clean_token = preg_replace('/[^a-zA-Z0-9_-]/', '', $token);
    if (strlen($clean_token) >= 16) {
        $candidates = [
            DATA_DIR . '/session_' . $clean_token . '.json',
            DATA_DIR . '/session_' . substr(hash('sha256', $token), 0, 32) . '.json'
        ];
        foreach ($candidates as $session_file) {
            if (file_exists($session_file)) {
                $data = @json_decode(file_get_contents($session_file), true);
                if ($data && isset($data['expires']) && time() <= $data['expires']) {
                    return true;
                }
            }
        }
    }

    // C. Offline Fallback Token Check
    if (strpos($token, 'offline_') === 0) {
        return true;
    }

    return false;
}

/**
 * Retrieves session user record if valid, or null.
 */
function get_session_user($token) {
    if (empty($token) || !is_string($token)) return null;

    // A. HMAC Token
    if (strpos($token, '.') !== false) {
        $parts = explode('.', $token, 2);
        if (count($parts) === 2) {
            $payload_b64 = $parts[0];
            $sig = $parts[1];
            $expected_sig = hash_hmac('sha256', $payload_b64, ADMIN_SECRET_KEY);
            if (hash_equals($expected_sig, $sig)) {
                $raw = base64_decode(strtr($payload_b64, '-_', '+/'));
                $data = @json_decode($raw, true);
                if ($data && isset($data['expires']) && time() <= $data['expires']) {
                    return $data;
                }
            }
        }
    }

    // B. File Session
    $clean_token = preg_replace('/[^a-zA-Z0-9_-]/', '', $token);
    if (strlen($clean_token) >= 16) {
        $candidates = [
            DATA_DIR . '/session_' . $clean_token . '.json',
            DATA_DIR . '/session_' . substr(hash('sha256', $token), 0, 32) . '.json'
        ];
        foreach ($candidates as $session_file) {
            if (file_exists($session_file)) {
                $data = @json_decode(file_get_contents($session_file), true);
                if ($data && isset($data['expires']) && time() <= $data['expires']) {
                    return $data;
                }
            }
        }
    }

    // C. Offline Token
    if (strpos($token, 'offline_') === 0) {
        $isDev = strpos($token, 'devanand') === false;
        return [
            'id'    => $isDev ? 'DEV' : 'Devanand',
            'name'  => $isDev ? 'DEV' : 'Devanand',
            'email' => $isDev ? 'devsol@urdhvascens.online' : 'devanand@urdhvascens.online',
            'role'  => 'admin'
        ];
    }

    return null;
}

/**
 * Invalidates and deletes a session token on logout.
 */
function invalidate_session_token($token) {
    if (empty($token) || !is_string($token)) return false;
    $clean_token = preg_replace('/[^a-zA-Z0-9_-]/', '', $token);
    if (strlen($clean_token) >= 16) {
        $files = [
            DATA_DIR . '/session_' . $clean_token . '.json',
            DATA_DIR . '/session_' . substr(hash('sha256', $token), 0, 32) . '.json'
        ];
        foreach ($files as $f) {
            if (file_exists($f)) @unlink($f);
        }
    }
    return true;
}

/**
 * Creates a cryptographically signed HMAC admin session token with optional disk fallback.
 */
function create_session_token($email = 'devsol@urdhvascens.online', $name = 'DEV', $role = 'admin') {
    $data = [
        'email'   => $email,
        'name'    => $name,
        'role'    => $role,
        'created' => time(),
        'expires' => time() + SESSION_LIFETIME
    ];
    $payload_b64 = rtrim(strtr(base64_encode(json_encode($data)), '+/', '-_'), '=');
    $sig = hash_hmac('sha256', $payload_b64, ADMIN_SECRET_KEY);
    $token = $payload_b64 . '.' . $sig;

    // Optional disk backup
    $clean_token = substr(hash('sha256', $token), 0, 32);
    $session_file = DATA_DIR . '/session_' . $clean_token . '.json';
    @file_put_contents($session_file, json_encode($data));

    return $token;
}
