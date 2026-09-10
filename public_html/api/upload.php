<?php
/**
 * Ūrdhv Ascens — Media Upload Endpoint (Hardened)
 * Handles uploading images safely to Hostinger's uploads directory.
 * SVG format is rejected to prevent Stored Cross-Site Scripting (XSS).
 */

require_once __DIR__ . '/config.php';

handle_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json(['error' => 'Method not allowed'], 405);
}

// Verify Admin authentication
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
