/**
 * ŪRDHV ASCENS — HOSTINGER CONTROL CENTER API CLIENT
 * Connects frontend and admin CMS to Hostinger PHP backend.
 * Reference: Spec §3.2
 */

import type { Booklet, Course, ReaderRecord, AdsConfig, ContentRecord } from '@/core/types';

export const API_BASE = 
  process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== 'undefined' 
    ? (window.location.origin.includes('localhost') 
        ? 'http://localhost/urdhvascens/api' 
        : (window.location.origin.includes('hostingersite.com')
            ? `${window.location.origin}/api`
            : 'https://gold-cat-133405.hostingersite.com/api'))
    : 'https://gold-cat-133405.hostingersite.com/api');

function getAuthHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('urdhv_admin_token');
    const key = localStorage.getItem('urdhv_admin_key');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (key) {
      headers['X-Admin-Key'] = key;
    }
  }

  return headers;
}

// 1. AUTH API
export async function adminLogin(passwordOrKey: string, email = 'admin@urdhvascens.com') {
  const res = await fetch(`${API_BASE}/auth.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: passwordOrKey, email, adminKey: passwordOrKey })
  });
  const data = await res.json();
  if (data.success && data.token) {
    localStorage.setItem('urdhv_admin_token', data.token);
    localStorage.setItem('urdhv_admin_key', passwordOrKey);
  }
  return data;
}

export function adminLogout() {
  const token = localStorage.getItem('urdhv_admin_token');
  if (token) {
    fetch(`${API_BASE}/auth.php?action=logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ token })
    }).catch(() => {});
  }
  localStorage.removeItem('urdhv_admin_token');
  localStorage.removeItem('urdhv_admin_key');
}

export async function verifyAdminSession(): Promise<boolean> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('urdhv_admin_token') : null;
  const key = typeof window !== 'undefined' ? localStorage.getItem('urdhv_admin_key') : null;
  
  if (!token && !key) return false;

  try {
    const res = await fetch(`${API_BASE}/auth.php?action=verify`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    return !!data.authenticated;
  } catch {
    // If backend unreachable in dev, allow fallback key check
    return !!key && (key === 'urdhv_admin_2026_secure' || key.length >= 8);
  }
}

// 2. CONTENT API
export async function getLiveContent(): Promise<ContentRecord | null> {
  try {
    const res = await fetch(`${API_BASE}/content.php`);
    if (res.ok) {
      const data = await res.json();
      if (!data.error) return data;
    }
  } catch (err) {
    console.warn('Failed to fetch live content from API:', err);
  }
  return null;
}

export async function updateContent(content: Partial<ContentRecord>) {
  const res = await fetch(`${API_BASE}/content.php`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(content)
  });
  return await res.json();
}

// 3. BOOKLETS API & MANUAL THUMBNAIL EDITOR
export async function getBooklets(courseId?: string, category?: string): Promise<Booklet[]> {
  const params = new URLSearchParams();
  if (courseId) params.append('courseId', courseId);
  if (category) params.append('category', category);

  try {
    const res = await fetch(`${API_BASE}/booklets.php?${params.toString()}`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Failed to fetch booklets from API:', err);
  }
  return [];
}

export async function updateBooklet(booklet: Partial<Booklet> & { id: string }) {
  const res = await fetch(`${API_BASE}/booklets.php`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(booklet)
  });
  return await res.json();
}

export async function updateAllBooklets(booklets: Booklet[]) {
  const res = await fetch(`${API_BASE}/booklets.php`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ booklets })
  });
  return await res.json();
}

// 4. COURSES API
export async function getCourses(): Promise<Course[]> {
  try {
    const res = await fetch(`${API_BASE}/courses.php`, {
      headers: getAuthHeaders()
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Failed to fetch courses:', err);
  }
  return [];
}

export async function updateCourses(courses: Course[]) {
  const res = await fetch(`${API_BASE}/courses.php`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(courses)
  });
  return await res.json();
}

// 5. READERS API
export async function registerReader(input: {
  name: string;
  contact: string;
  role: string;
  institution?: string;
  courseSelected: string;
  consentGiven: boolean;
}) {
  const res = await fetch(`${API_BASE}/readers.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  return await res.json();
}

export async function getReaders(query = '', courseId = ''): Promise<{ total: number; readers: ReaderRecord[] }> {
  const params = new URLSearchParams();
  if (query) params.append('q', query);
  if (courseId) params.append('courseId', courseId);

  const res = await fetch(`${API_BASE}/readers.php?${params.toString()}`, {
    headers: getAuthHeaders()
  });
  return await res.json();
}

export async function deleteReader(id: string) {
  const res = await fetch(`${API_BASE}/readers.php`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    body: JSON.stringify({ id })
  });
  return await res.json();
}

export function getReadersCsvExportUrl(): string {
  return `${API_BASE}/readers.php?export=csv`;
}

// 6. ADS API
export async function getAds(): Promise<AdsConfig | null> {
  try {
    const res = await fetch(`${API_BASE}/ads.php`, {
      headers: getAuthHeaders()
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Failed to fetch ads:', err);
  }
  return null;
}

export async function updateAds(ads: AdsConfig) {
  const res = await fetch(`${API_BASE}/ads.php`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(ads)
  });
  return await res.json();
}

// 7. FILE UPLOAD API
export async function uploadAsset(file: File): Promise<{ success: boolean; url?: string; message?: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const headers: Record<string, string> = {};
  const token = localStorage.getItem('urdhv_admin_token');
  const key = localStorage.getItem('urdhv_admin_key');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (key) headers['X-Admin-Key'] = key;

  const res = await fetch(`${API_BASE}/upload.php`, {
    method: 'POST',
    headers,
    body: formData
  });
  return await res.json();
}
