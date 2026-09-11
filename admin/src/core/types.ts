/**
 * ŪRDHV ASCENS ECOSYSTEM — SHARED DATA CONTRACTS & TYPE DEFINITIONS
 * Version: 2.0.0
 * Canonical Reference: docs/superpowers/specs/2026-09-10-urdhv-ascens-ecosystem-design.md
 */

// ==========================================
// 1. BOOKLET & CDN CONTRACTS
// ==========================================

export type BookletCategory = 'student' | 'teacher';

export interface Booklet {
  id: string;                      // e.g. "student-01"
  courseId: string;                // e.g. "students-ai"
  title: string;                   // e.g. "Booklet 01 - AI Superpowers"
  shortDescription: string;
  category: BookletCategory;
  totalPages: number;              // e.g. 38
  pageFormat: 'webp';
  cdnBaseUrl: string;              // "https://student-booklet-01.pages.dev"
  pageDirectory: string;           // "/pages/"
  thumbnailDirectory: string;      // "/thumbnails/"
  coverPath: string;               // "/preview/cover.webp"
  customCoverUrl?: string;         // Admin override thumbnail URL (Manual Thumbnail Editor)
  version: string;                 // Semantic: "1.0.0"
  active: boolean;
  displayOrder: number;
}

export interface BookletManifest {
  bookletId: string;               // e.g. "student-01"
  title: string;                   // e.g. "Booklet 01 - AI Superpowers"
  version: string;                 // "1.0.0"
  totalPages: number;              // 38
  pageFormat: 'webp';
  pageDirectory: string;           // "/pages/"
  thumbnailDirectory: string;      // "/thumbnails/"
  cover: string;                   // "/preview/cover.webp"
}

// ==========================================
// 2. COURSE & LEARNING ACCESS CONTRACTS
// ==========================================

export interface Course {
  id: string;                      // e.g. "students-ai", "teachers-ai"
  title: string;                   // e.g. "AI Superpowers for Students"
  category: BookletCategory;
  description: string;
  bookletIds: string[];            // IDs of booklets in this course
  active: boolean;
  displayOrder: number;
}

export interface ReaderRecord {
  id: string;                      // UUID
  name: string;
  contact: string;                 // Primary Email
  phone?: string;                  // WhatsApp / Mobile Number
  city?: string;                   // City & State / Region
  ageGroup?: string;               // Demographic age bracket
  industry?: string;               // Career industry / Profession
  intent?: string;                 // Primary learning & commercial interest
  role: string;                    // "Individual Learner" | "Student" | "Educator" | "Parent" | "Professional"
  institution?: string;            // School/college/org
  courseSelected: string;          // Course ID
  consentGiven: boolean;           // Marketing communication & privacy consent flag
  registeredAt: string;            // ISO 8601
  ipHash: string;                  // SHA-256 hashed IP for rate & abuse prevention
}

export interface ReaderRegistrationInput {
  name: string;
  contact: string;                 // Email
  phone?: string;                  // WhatsApp / Phone
  city?: string;                   // City / Region
  ageGroup?: string;               // Age Group
  industry?: string;               // Industry / Profession
  intent?: string;                 // Primary Tech / Learning Intent
  role: string;
  institution?: string;
  courseSelected: string;
  consentGiven: boolean;
}

// ==========================================
// 3. ADVERTISEMENT & SPONSOR SYSTEM
// ==========================================

export interface TopBarSlide {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  destinationUrl: string;
  active: boolean;
  displayOrder: number;
  startDate?: string;              // ISO 8601 optional scheduling
  endDate?: string;                // ISO 8601 optional scheduling
}

export interface AdSlide {
  id: string;
  title?: string;
  imageUrl: string;
  destinationUrl: string;
  alt?: string;
  active: boolean;
  displayOrder?: number;
}

export interface SideAdPlacement {
  enabled: boolean;
  imageUrl: string;
  destinationUrl: string;
  alt?: string;
}

export interface MobileBannerConfig {
  enabled: boolean;
  rotationIntervalSeconds?: number;
  slides: AdSlide[];
}

export interface AdsConfig {
  topBar: {
    enabled: boolean;
    slides: TopBarSlide[];
    rotationIntervalSeconds: number; // default: 6
  };
  sideAds: {
    enabled: boolean;
    rotationIntervalSeconds?: number;
    slides: AdSlide[];
    leftAd: SideAdPlacement;
    rightAd: SideAdPlacement;
  };
  mobileBanner: MobileBannerConfig;
}

// ==========================================
// 4. MAIN SITE CONTENT & CMS SCHEMAS
// ==========================================

export interface LocalizedString {
  en: string;
  hi?: string;
}

export interface HeroContent {
  tagline: string;
  title: string;
  subtitle: string;
  description: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
}

export interface CapabilityItem {
  id: string;
  title: string;
  titleHi?: string;
  description: string;
  descriptionHi?: string;
  icon: string;                    // Lucide icon name
  category: string;
  featured?: boolean;
  mobileShortCopy?: string;
  active?: boolean;
  displayOrder?: number;
  tags?: string[];
}

export interface ServiceTier {
  id: string;
  name: string;
  price: number | string;
  pricingType: 'one-time' | 'monthly' | 'range' | 'starting' | 'custom';
  currency: 'INR' | 'USD';
  description: string;
  deliverables: string[];
  inclusions: string[];
  exclusions?: string[];
  isPopular?: boolean;
}

export interface ServiceItem {
  id: string;
  title: string;
  titleHi?: string;
  tagline?: string;
  description: string;
  descriptionHi?: string;
  category?: string;
  active?: boolean;
  featured?: boolean;
  displayOrder?: number;
  number?: string;
  tags?: string[];
  tiers?: ServiceTier[];
}

export interface ProjectItem {
  id: string;
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  description: string;
  tech: string[];
  status: 'ACTIVE' | 'FEATURED' | 'ARCHIVED' | string;
  lastUpdated: string;
  url?: string;
  client?: string;
  year?: string;
  imageUrl?: string;
  displayOrder: number;
}

export interface AboutContent {
  title: string;
  description: string;
  stats: Array<{
    label: string;
    value: string;
  }>;
  video?: {
    enabled: boolean;
    videoId: string;
    title: string;
    posterUrl: string;
  };
}

export interface ContactInfo {
  email: string;
  phone: string;
  location: string;
  tagline: string;
  title: string;
  heading: string;
  description: string;
}

export interface SocialPresence {
  instagram: string;
  linkedin: string;
  twitter: string;
  customLinks: Array<{ label: string; url: string }>;
}

export interface LegalPageContent {
  title: string;
  lastUpdated: string;
  sections: Array<{
    heading: string;
    content: string;
  }>;
}

export interface SiteSettings {
  companyName: string;
  tagline: string;
  productionBaseUrl: string;
  customDomainReady: boolean;
  primaryLanguage: 'en';
  enableHindi: boolean;
}

export interface ContentRecord {
  siteSettings: SiteSettings;
  hero: HeroContent;
  capabilities: {
    tagline: string;
    title: string;
    description: string;
    list: CapabilityItem[];
  };
  services: {
    tagline: string;
    title: string;
    description: string;
    list: ServiceItem[];
  };
  projects: {
    tagline: string;
    title: string;
    description: string;
    intervalSeconds?: number;
    autoplay?: boolean;
    list?: ProjectItem[];
  };
  projectsList: ProjectItem[];
  about: AboutContent;
  contact: ContactInfo;
  presence: SocialPresence;
  legal?: {
    termsAndConditions: LegalPageContent;
    privacyPolicy: LegalPageContent;
    refundPolicy: LegalPageContent;
  };
}

// ==========================================
// 5. CAROUSEL CONTRACTS (MAIN SITE)
// ==========================================

export type CarouselStateType = 
  | 'IDLE'        // Autoplay running smoothly
  | 'HOVER'       // Cursor over track, slowed/paused
  | 'DRAGGING'    // Direct pointer drag active
  | 'MOMENTUM'    // Inertial coasting after drag release
  | 'PAUSED'      // Accessibility toggle or tab hidden
  | 'FOCUS';      // Keyboard focus active on a card

export interface CarouselCard {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  imageUrl?: string;
  aspectRatio: '16:9' | '4:3' | '1:1';
  linkUrl?: string;
  tags?: string[];
  gradientTheme?: string;
}

// ==========================================
// 6. API RESPONSE CONTRACTS
// ==========================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  updatedAt?: string;
}
