<?php
/**
 * Ūrdhv Ascens — Root Fallback Entrypoint
 * Handles environments where Git repository is installed directly into public_html/
 */

if (file_exists(__DIR__ . '/public_html/index.html')) {
    $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
    
    // Root request
    if ($uri === '/' || $uri === '' || $uri === '/index.php') {
        readfile(__DIR__ . '/public_html/index.html');
        exit;
    }
    
    // Check if target file or directory exists in public_html
    $target = __DIR__ . '/public_html' . $uri;
    if (is_dir($target) && file_exists($target . '/index.html')) {
        readfile($target . '/index.html');
        exit;
    }
    
    if (file_exists($target) && is_file($target)) {
        if (substr($target, -4) === '.php') {
            require $target;
            exit;
        }
        $ext = strtolower(pathinfo($target, PATHINFO_EXTENSION));
        $mimes = [
            'html' => 'text/html; charset=UTF-8',
            'css'  => 'text/css; charset=UTF-8',
            'js'   => 'application/javascript; charset=UTF-8',
            'json' => 'application/json; charset=UTF-8',
            'png'  => 'image/png',
            'jpg'  => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'webp' => 'image/webp',
            'svg'  => 'image/svg+xml',
            'ico'  => 'image/x-icon',
            'woff2'=> 'font/woff2'
        ];
        if (isset($mimes[$ext])) {
            header('Content-Type: ' . $mimes[$ext]);
        }
        readfile($target);
        exit;
    }
    
    // Fallback for SPA admin routes
    if (strpos($uri, '/admin') === 0 && file_exists(__DIR__ . '/public_html/admin/index.html')) {
        readfile(__DIR__ . '/public_html/admin/index.html');
        exit;
    }
    
    // Fallback to 404
    if (file_exists(__DIR__ . '/public_html/404.html')) {
        http_response_code(404);
        readfile(__DIR__ . '/public_html/404.html');
        exit;
    }
}
?>
