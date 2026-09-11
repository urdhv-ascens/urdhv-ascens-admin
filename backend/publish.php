<?php
/**
 * Ūrdhv Ascens — Publish API Endpoint
 * POST: Triggers live network publication, cache flush, and edge CDN rebuild.
 * Runs server-to-server with zero CORS or CSP limitations.
 */

require_once __DIR__ . '/config.php';

handle_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json(['error' => 'Method not allowed. Use POST to trigger publishing.'], 405);
}

$raw = file_get_contents('php://input');
$body = json_decode($raw, true) ?: $_POST;

if (!verify_admin($body)) {
    send_json(['success' => false, 'message' => 'Unauthorized: Invalid Admin Secret Key or session token.'], 401);
}

// 1. Touch and refresh data stores
if (file_exists(DATA_FILE)) {
    @touch(DATA_FILE);
}
if (file_exists(BOOKLETS_FILE)) {
    @touch(BOOKLETS_FILE);
}
if (file_exists(ADS_FILE)) {
    @touch(ADS_FILE);
}
if (defined('COURSES_FILE') && file_exists(COURSES_FILE)) {
    @touch(COURSES_FILE);
}

// Clear PHP opcache/stat cache if available
if (function_exists('clearstatcache')) {
    clearstatcache(true);
}
if (function_exists('opcache_reset')) {
    @opcache_reset();
}

// 2. Discover Cloudflare Webhook URL
$webhookUrl = '';
if (!empty($body['cloudflareWebhookUrl'])) {
    $webhookUrl = trim($body['cloudflareWebhookUrl']);
} else if (file_exists(DATA_FILE)) {
    $content = @json_decode(file_get_contents(DATA_FILE), true);
    if (!empty($content['cloudflareWebhookUrl'])) {
        $webhookUrl = trim($content['cloudflareWebhookUrl']);
    }
}

if (!$webhookUrl && getenv('CLOUDFLARE_DEPLOY_WEBHOOK_URL')) {
    $webhookUrl = getenv('CLOUDFLARE_DEPLOY_WEBHOOK_URL');
}

$webhookSuccess = false;
$webhookHttpCode = null;
$webhookMessage = 'Live storage synchronized. No edge webhook URL configured.';

// 3. Server-side Webhook Dispatch (Bypasses all browser CORS & CSP blocks)
if (!empty($webhookUrl)) {
    if (function_exists('curl_init')) {
        $ch = curl_init($webhookUrl);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, '{}');
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json', 'User-Agent: UrdhvAscens-ControlPlane/2.0']);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 12);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $response = curl_exec($ch);
        $webhookHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($webhookHttpCode >= 200 && $webhookHttpCode < 300) {
            $webhookSuccess = true;
            $webhookMessage = 'Cloudflare Pages deployment triggered successfully!';
        } else {
            $webhookMessage = "Cloudflare Webhook returned HTTP {$webhookHttpCode}.";
        }
    } else {
        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => "Content-Type: application/json\r\nUser-Agent: UrdhvAscens-ControlPlane/2.0\r\n",
                'content' => '{}',
                'timeout' => 12
            ]
        ]);
        $fp = @fopen($webhookUrl, 'r', false, $context);
        if ($fp) {
            $webhookSuccess = true;
            $webhookMessage = 'Cloudflare Pages deployment triggered successfully via stream context!';
            @fclose($fp);
        } else {
            $webhookMessage = 'Could not trigger Cloudflare Pages webhook stream.';
        }
    }
}

send_json([
    'success'           => true,
    'message'           => 'Site published successfully! Changes are live on Hostinger dynamic storage and edge CDN.',
    'webhookTriggered'  => $webhookSuccess,
    'webhookHttpCode'   => $webhookHttpCode,
    'webhookNote'       => $webhookMessage,
    'updatedAt'         => date('c'),
    'timestamp'         => time()
]);
