<?php
/**
 * Ūrdhv Ascens — Media Storage Endpoint (Hardened)
 * Handles uploading, listing, and deleting media safely in Hostinger's uploads directory.
 * SVG format is rejected to prevent Stored Cross-Site Scripting (XSS).
 */

require_once __DIR__ . '/config.php';

handle_cors();

$method = $_SERVER['REQUEST_METHOD'];

// 1. GET: List all media assets in UPLOAD_DIR
if ($method === 'GET') {
    if (!verify_admin($_GET)) {
        send_json(['success' => false, 'message' => 'Unauthorized: Invalid Admin credentials.'], 401);
    }

    $assets = [];
    if (is_dir(UPLOAD_DIR)) {
        $files = @scandir(UPLOAD_DIR);
        if (is_array($files)) {
            foreach ($files as $f) {
                if ($f === '.' || $f === '..' || $f === '.htaccess' || strpos($f, '.') === 0) {
                    continue;
                }
                $filepath = UPLOAD_DIR . '/' . $f;
                if (!is_file($filepath)) continue;

                $size = @filesize($filepath) ?: 0;
                $mtime = @filemtime($filepath) ?: time();
                $ext = strtolower(pathinfo($f, PATHINFO_EXTENSION));
                $isVideo = in_array($ext, ['mp4', 'webm', 'mov', 'ogg'], true);

                $assets[] = [
                    'url' => UPLOAD_URL_PREFIX . $f,
                    'filename' => $f,
                    'size' => $size,
                    'type' => $isVideo ? 'video' : 'image',
                    'uploadedAt' => date('c', $mtime),
                    'timestamp' => $mtime
                ];
            }
        }
    }

    // Sort newest first
    usort($assets, function($a, $b) {
        return ($b['timestamp'] ?? 0) - ($a['timestamp'] ?? 0);
    });

    send_json(['success' => true, 'assets' => $assets]);
}

// 2. DELETE: Remove media asset by filename
if ($method === 'DELETE') {
    $raw_body = @file_get_contents('php://input');
    $body = @json_decode($raw_body, true) ?: [];
    if (!verify_admin($body)) {
        send_json(['success' => false, 'message' => 'Unauthorized: Invalid Admin credentials.'], 401);
    }

    $filename = $body['filename'] ?? $body['url'] ?? $_GET['filename'] ?? '';
    $clean_filename = basename(parse_url($filename, PHP_URL_PATH) ?: $filename);

    if (empty($clean_filename) || $clean_filename === '.' || $clean_filename === '..' || $clean_filename === '.htaccess') {
        send_json(['success' => false, 'message' => 'Invalid filename.'], 400);
    }

    $target = UPLOAD_DIR . '/' . $clean_filename;
    if (file_exists($target)) {
        if (@unlink($target)) {
            send_json(['success' => true, 'message' => 'Asset deleted successfully.']);
        } else {
            send_json(['success' => false, 'message' => 'Failed to delete file from disk.'], 500);
        }
    } else {
        send_json(['success' => true, 'message' => 'File already removed from server.']);
    }
}

// 3. POST: Upload file
if ($method !== 'POST') {
    send_json(['error' => 'Method not allowed'], 405);
}

// Verify Admin authentication (check $_POST, X-Admin-Token, Bearer token, or X-Admin-Key)
if (!verify_admin($_POST)) {
    send_json(['success' => false, 'message' => 'Unauthorized: Invalid Admin Secret Key or session token.'], 401);
}

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    $errorCode = isset($_FILES['file']['error']) ? $_FILES['file']['error'] : 'no_file';
    send_json(['success' => false, 'message' => 'No file uploaded or upload error code: ' . $errorCode], 400);
}

$file = $_FILES['file'];
$maxSize = 100 * 1024 * 1024; // 100 MB for images & high-definition videos

if ($file['size'] > $maxSize) {
    send_json(['success' => false, 'message' => 'File exceeds maximum limit of 100MB.'], 400);
}

// Strict Allowed MIME types mapping to verified extensions (Images & Web Videos)
$allowedMimeMap = [
    // Image formats
    'image/jpeg'      => ['jpg', 'jpeg'],
    'image/png'       => ['png'],
    'image/webp'      => ['webp'],
    'image/gif'       => ['gif'],
    // Video formats
    'video/mp4'       => ['mp4', 'm4v'],
    'video/webm'      => ['webm'],
    'video/quicktime' => ['mov'],
    'video/ogg'       => ['ogv', 'ogg']
];

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$detectedMime = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

// Check if detected MIME type is permitted
if (!array_key_exists($detectedMime, $allowedMimeMap)) {
    send_json([
        'success' => false, 
        'message' => 'Invalid file format. Only safe image formats (JPG, PNG, WebP, GIF) and web video formats (MP4, WebM, MOV, OGG) are allowed.'
    ], 400);
}

// Extract original extension and ensure it matches the verified MIME type
$originalExt = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
if (!in_array($originalExt, $allowedMimeMap[$detectedMime], true)) {
    send_json([
        'success' => false, 
        'message' => 'File extension does not match its detected content type.'
    ], 400);
}

// Standardize extension
$safeExt = $originalExt === 'jpeg' ? 'jpg' : $originalExt;

// Differentiate image vs video prefix
$isVideo = strpos($detectedMime, 'video/') === 0;
$prefix = $isVideo ? 'video_' : 'asset_';

// Generate high-entropy randomized filename
$cleanFilename = $prefix . date('Ymd_His') . '_' . bin2hex(random_bytes(6)) . '.' . $safeExt;
$targetPath = UPLOAD_DIR . '/' . $cleanFilename;

if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
    send_json([
        'success' => false, 
        'message' => 'Failed to save uploaded file. Check folder write permissions on public_html/uploads.'
    ], 500);
}

$publicUrl = UPLOAD_URL_PREFIX . $cleanFilename;

send_json([
    'success' => true,
    'url' => $publicUrl,
    'filename' => $cleanFilename,
    'size' => $file['size'],
    'mime' => $detectedMime,
    'type' => $isVideo ? 'video' : 'image',
    'message' => 'Media uploaded securely to Hostinger!'
]);
