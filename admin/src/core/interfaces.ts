export interface Project {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'DRAFT';
  description: string;
  shortDescription: string;
  media: {
    primary: string; // ID for the media
    gallery?: string[];
  };
  featured: boolean;
  sortOrder: number;
  seo?: {
    title: string;
    description: string;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  sortOrder: number;
}

export interface Media {
  id: string;
  type: 'image' | 'video';
  provider: 'cloudinary' | 'youtube';
  url: string;
  alt?: string;
  title?: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface SiteSettings {
  contactEmail: string;
  contactPhone: string;
  location: string;
  socialLinks: Record<string, string>;
}
