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
            ($parsed_host && preg_match('/(^|\.)urdhvascens\.com$/i', $parsed_host))
        );

        if ($is_allowed) {
            header("Access-Control-Allow-Origin: $origin");
            header('Access-Control-Allow-Credentials: true');
        }
    }
    header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS, PUT');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Admin-Key, X-Admin-Token');
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
    apply_rate_limit();
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        set_cors_headers();
        http_response_code(200);
        exit;
    }
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
 * Uses timing-safe string comparison (hash_equals).
 */
function verify_admin($body = []) {
    // 1. Check X-Admin-Key header
    $header_key = isset($_SERVER['HTTP_X_ADMIN_KEY']) ? trim($_SERVER['HTTP_X_ADMIN_KEY']) : '';
    if (!$header_key && function_exists('getallheaders')) {
        $headers = getallheaders();
        $header_key = $headers['X-Admin-Key'] ?? $headers['x-admin-key'] ?? '';
    }
    if ($header_key && hash_equals(ADMIN_SECRET_KEY, $header_key)) {
        return true;
    }

    // 2. Check X-Admin-Token header
    $admin_token_header = isset($_SERVER['HTTP_X_ADMIN_TOKEN']) ? trim($_SERVER['HTTP_X_ADMIN_TOKEN']) : '';
    if (!$admin_token_header && function_exists('getallheaders')) {
        $headers = getallheaders();
        $admin_token_header = $headers['X-Admin-Token'] ?? $headers['x-admin-token'] ?? '';
    }
    if ($admin_token_header && (hash_equals(ADMIN_SECRET_KEY, $admin_token_header) || verify_session_token($admin_token_header))) {
        return true;
    }

    // 3. Check Authorization Bearer token
    $auth_header = get_auth_header();
    $token = '';
    if ($auth_header && preg_match('/Bearer\s+(.*)$/i', $auth_header, $matches)) {
        $token = trim($matches[1]);
    } else if (!empty($_GET['token'])) {
        $token = trim($_GET['token']);
    } else if (!empty($body['token'])) {
        $token = trim($body['token']);
    }

    if ($token && (hash_equals(ADMIN_SECRET_KEY, $token) || verify_session_token($token))) {
        return true;
    }

    // 4. Check key in parsed request body
    if (isset($body['adminKey']) && is_string($body['adminKey']) && hash_equals(ADMIN_SECRET_KEY, trim($body['adminKey']))) {
        return true;
    }

    return false;
}

/**
 * Simple file-based session verification for Hostinger.
 */
function verify_session_token($token) {
    if (empty($token) || !is_string($token)) return false;
    $clean_token = preg_replace('/[^a-zA-Z0-9_-]/', '', $token);
    if (strlen($clean_token) < 16) return false;
    
    $session_file = DATA_DIR . '/session_' . $clean_token . '.json';
    if (!file_exists($session_file)) return false;
    
    $data = @json_decode(file_get_contents($session_file), true);
    if (!$data || !isset($data['expires'])) return false;
    
    if (time() > $data['expires']) {
        @unlink($session_file);
        return false;
    }
    return true;
}

/**
 * Retrieves session user record if valid, or null.
 */
function get_session_user($token) {
    if (empty($token) || !is_string($token)) return null;
    $clean_token = preg_replace('/[^a-zA-Z0-9_-]/', '', $token);
    if (strlen($clean_token) < 16) return null;
    
    $session_file = DATA_DIR . '/session_' . $clean_token . '.json';
    if (!file_exists($session_file)) return null;
    
    $data = @json_decode(file_get_contents($session_file), true);
    if (!$data || !isset($data['expires']) || time() > $data['expires']) {
        return null;
    }
    return $data;
}

/**
 * Invalidates and deletes a session token on logout.
 */
function invalidate_session_token($token) {
    if (empty($token) || !is_string($token)) return false;
    $clean_token = preg_replace('/[^a-zA-Z0-9_-]/', '', $token);
    if (strlen($clean_token) < 16) return false;
    
    $session_file = DATA_DIR . '/session_' . $clean_token . '.json';
    if (file_exists($session_file)) {
        return @unlink($session_file);
    }
    return false;
}

/**
 * Creates a persistent admin session on Hostinger.
 */
function create_session_token($email = 'devsol@urdhvascens.online', $name = 'DEV', $role = 'admin') {
    $token = bin2hex(random_bytes(24));
    $session_file = DATA_DIR . '/session_' . $token . '.json';
    $data = [
        'email' => $email,
        'name' => $name,
        'role' => $role,
        'created' => time(),
        'expires' => time() + SESSION_LIFETIME
    ];
    @file_put_contents($session_file, json_encode($data));
    return $token;
}
