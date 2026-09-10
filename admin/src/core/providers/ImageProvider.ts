export interface ImageTransformationOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'scale' | 'fit';
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'png' | 'jpg';
}

/**
 * Interface for Image CDN Provider
 */
export interface ImageProviderService {
  /**
   * Generates a CDN URL for the given media ID and transformation options.
   * @param id The ID or path of the media
   * @param options Transformation options
   */
  getUrl(id: string, options?: ImageTransformationOptions): string;
}

/**
 * Cloudinary Provider Implementation
 */
export class CloudinaryProvider implements ImageProviderService {
  private cloudName: string;

  constructor(cloudName: string) {
    this.cloudName = cloudName;
  }

  getUrl(id: string, options?: ImageTransformationOptions): string {
    // If it's already a full URL or we don't have a cloudName, return as is
    if (id.startsWith('http') || !this.cloudName) {
      return id;
    }

    const transformations: string[] = [];

    if (options?.width) transformations.push(`w_${options.width}`);
    if (options?.height) transformations.push(`h_${options.height}`);
    if (options?.crop) transformations.push(`c_${options.crop}`);
    
    transformations.push(`q_${options?.quality || 'auto'}`);
    transformations.push(`f_${options?.format || 'auto'}`);

    const transformationString = transformations.join(',');

    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transformationString}/${id}`;
  }
}

// Singleton instance to be used across the app
export const imageProvider = new CloudinaryProvider(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '');
