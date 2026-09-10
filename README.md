# ŪRDHV ASCENS — ADMINISTRATIVE CONTROL PLANE, BACKEND, DATABASE & STORAGE

> **Centralized Control Center, Hardened PHP API Gateway, Flat-File/NoSQL Database Engine & Storage Security Infrastructure**  
> *Engineered for High-Security Enterprise Operations. Zero Decoration Bloat.*

---

## 1. System Architecture & Repository Structure

This repository contains the administrative control plane, API services, database specifications, and storage security configurations for the **Ūrdhv Ascens** platform:

```
urdhv-ascens-admin/
├── admin/                         # Admin Control Plane & CMS Suite
│   ├── src/                       # Next.js / React Admin UI
│   │   ├── app/admin/             # Pages: Dashboard, Login, Booklets, Ads, Projects, etc.
│   │   ├── components/admin/      # AdminAuthGuard, AdminHeader, MediaManager, etc.
│   │   ├── lib/                   # API clients, session verification, storage connectors
│   │   └── core/                  # TypeScript interfaces, schemas & Firebase shim
│   └── .env.example               # Admin environment configuration template
│
├── backend/                       # Production Hostinger PHP 7.4+ API Gateway
│   ├── config.php                 # Rate limiting, session security, CORS, timing-safe auth
│   ├── auth.php                   # Timing-safe admin login/logout with brute-force lockout
│   ├── content.php                # Storefront CMS data endpoint with flock write locks
│   ├── booklets.php               # Curriculum booklet catalog management endpoint
│   ├── ads.php                    # Desktop flanking side ads & mobile top banner endpoint
│   ├── courses.php                # Public course registration endpoint
│   ├── readers.php                # Reader tracking & lead capture endpoint (Anti-IDOR)
│   └── upload.php                 # Hardened MIME-inspected media uploader (SVG blocked, RCE-proof)
│
├── database/                      # Data Stores & Row-Level Security (RLS)
│   ├── data/                      # Initial seed JSON flat-file stores
│   │   ├── content.json           # Storefront sections (Hero, About, Capabilities, etc.)
│   │   ├── booklets.json          # 12-booklet curriculum metadata & CDN URLs
│   │   ├── ads.json               # Desktop side ads & mobile top banner creative slides
│   │   ├── courses.json           # Available courses & catalog definitions
│   │   └── readers.json           # Registered learners & consent logs
│   └── firestore.rules            # Production Firestore Row-Level Security (RLS) rules
│
├── storage/                       # Storage Security & Execution Prevention
│   ├── storage.rules              # Firebase Cloud Storage security rules
│   └── uploads/
│       └── .htaccess              # Apache/LiteSpeed execution block (php_flag engine off)
│
├── .gitignore                     # Strictly ignores credentials, session tokens & logs
└── README.md                      # This comprehensive manual
```

---

## 2. 20-Point Security Hardening Implementation

| # | Security Vector | Implementation Detail |
| :---: | :--- | :--- |
| **1** | **Hide API Keys** | All API credentials, keys, and tokens injected solely through `.env.local` / environment variables. Clean `.env.example` templates provided. `.env*` strictly gitignored. |
| **2** | **Enable RLS (Row-Level Security)** | Defined in [`database/firestore.rules`](database/firestore.rules). Public read-only; admin-only writes; readers strictly isolated to their own records (`request.auth.uid == userId`). |
| **3** | **Test IDOR Attacks** | Public learner registrations in `readers.php` generate cryptographically random IDs (`reader_` + `bin2hex(random_bytes(8))`). Unauthenticated read or modification of arbitrary reader records is blocked. |
| **4** | **Scan GIT Secrets** | No tokens, PATs, or production passwords committed to git. Commit histories sanitized. |
| **5** | **Lock Admin Routes** | Client-side guarded by `AdminAuthGuard.tsx` (redirects unauthenticated users to `/admin/login`). Server-side guarded by `verify_admin()` checking `X-Admin-Key` or Bearer tokens. |
| **6** | **Test User Isolation** | Reader profile data and progress state are bound to session tokens or owner user IDs; no cross-account leakage. |
| **7** | **Rate Limit APIs** | Built-in IP rate limiter in [`backend/config.php`](backend/config.php) (`apply_rate_limit()`: 180 req/min per IP with SHA-256 hashed storage). Brute-force throttling in `auth.php`. |
| **8** | **Lock Storage Buckets** | Covered by [`storage/storage.rules`](storage/storage.rules) and [`storage/uploads/.htaccess`](storage/uploads/.htaccess). Apache/PHP execution engine is explicitly disabled inside `uploads/` (`php_flag engine off`), completely preventing Remote Code Execution (RCE). |
| **9** | **Validate All Inputs** | POST payloads across `content.php`, `booklets.php`, and `ads.php` undergo strict JSON decoding, type checking, and boundary validation. |
| **10** | **Block Unauthenticated Routes** | All write/save operations (`POST`, `DELETE`) on the API gateway require valid `X-Admin-Key` header, `Authorization: Bearer <token>`, or active session token. |
| **11** | **Test SQL Injection** | Data persistence utilizes atomic JSON transactions and Firestore documents, eliminating SQL injection surfaces. Input strings are sanitized against path traversal (`../`). |
| **12** | **Remove Sensitive Logs** | Client bundles stripped of debugging credentials, token dumps, or internal stack traces. `display_errors` is disabled in PHP. |
| **13** | **Block Field Tampering** | API updates validate incoming schemas against permitted field whitelists before saving to disk. |
| **14** | **Restrict File Uploads** | [`backend/upload.php`](backend/upload.php) uses `finfo_file` for true MIME-type inspection. Rejects SVGs (preventing Stored XSS). Renames files with high-entropy cryptographic hashes (`bin2hex(random_bytes(6))`). |
| **15** | **Secure Server Logic** | All permissions and rate limits are enforced server-side in PHP, not merely bypassed on the frontend. Uses timing-safe string comparison (`hash_equals`). |
| **16** | **Trim API Responses** | Password hashes, session file system paths, and internal server paths are never returned to client endpoints. |
| **17** | **Secure Auth Sessions** | High-entropy 48-character hex session tokens (`bin2hex(random_bytes(24))`) with 24-hour expiration (`SESSION_LIFETIME = 86400`) and instant revocation on logout. |
| **18** | **Scan Dependencies** | Zero high/critical vulnerabilities across dependencies. |
| **19** | **Test Record Access** | Direct access to unpublished assets or administrative audit logs blocked for unauthenticated callers. |
| **20** | **Attack Your Own App** | Automated penetration checks against simulated XSS payloads, directory traversal attacks, and unauthorized PUT/POST attempts. |

---

## 3. Hostinger Production Deployment Guide

### Step 1: Deploy Backend API & Data Stores
1. Log in to your Hostinger cPanel / File Manager.
2. Navigate to `public_html/`.
3. Create the `api/` directory:
   - Copy all PHP files from `backend/` into `public_html/api/`.
4. Create the `api/data/` directory:
   - Copy all JSON files from `database/data/` into `public_html/api/data/`.
   - Set folder permissions for `public_html/api/data/` to `0755` (or `0775`).
5. Create the `uploads/` directory:
   - Copy `storage/uploads/.htaccess` into `public_html/uploads/.htaccess`.
   - Set folder permissions for `public_html/uploads/` to `0755`.

### Step 2: Configure Production Admin Secret Key
In Hostinger cPanel -> Advanced -> Environment Variables, or inside `.htaccess`, set:
```apache
SetEnv URDHV_ADMIN_KEY "YourCustomSecurePassword2026"
```
*(Alternatively, update line 23 of `public_html/api/config.php`).*

### Step 3: Verify Live API Gateway Endpoints
- **Health / Content**: `GET https://urdhvascens.com/api/content.php`
- **Booklets**: `GET https://urdhvascens.com/api/booklets.php`
- **Ads**: `GET https://urdhvascens.com/api/ads.php`
- **Auth (OPTIONS / POST)**: `https://urdhvascens.com/api/auth.php`

---

## 4. Firebase Cloud Firestore & Storage Deployment

If utilizing Firebase for multi-cloud redundancy or real-time sync:

1. **Deploy Firestore Row-Level Security Rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```
   *(Or copy the contents of `database/firestore.rules` directly into Firebase Console -> Firestore Database -> Rules).*

2. **Deploy Cloud Storage Security Rules**:
   ```bash
   firebase deploy --only storage:rules
   ```
   *(Or copy the contents of `storage/storage.rules` directly into Firebase Console -> Storage -> Rules).*

---

## 5. Admin Control Center Modules

- **Dashboard** (`/admin`): System status, API connectivity check, and quick navigation.
- **Booklets & Covers** (`/admin/booklets`): Reorder modules, toggle active status, adjust page counts, customize cover image URLs, or select internal pages as covers.
- **Advertisements** (`/admin/ads`): Manage desktop flanking side ads and mobile top banner slides. Configure auto-rotation interval, destination URLs, and creative images.
- **Projects / Work** (`/admin/projects`): Add, edit, reorder, or delete portfolio case studies. Automatically reflected in the storefront slideshow.
- **Capabilities & Services** (`/admin/capabilities`, `/admin/services`): Live visual cards that feed the gapless infinite carousels on the storefront.
- **Media Library** (`/admin/media`): Secure media upload manager with MIME verification.
- **Registered Readers** (`/admin/readers`): Search, filter, inspect, and export learner access logs as CSV.
- **Site Settings** (`/admin/settings`): Configure hero taglines, blurred background opacity/blur levels, and webhook notifications.

---

## 6. License & Security Notice

Proprietary software developed for **Ūrdhv Ascens**. Unauthorized reproduction, reverse engineering, or penetration attempts are strictly prohibited.