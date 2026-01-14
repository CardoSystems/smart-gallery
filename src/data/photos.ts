import { GalleryConfig } from '@/types/gallery';
import { generatePhotosStatic } from '@/utils/photoGenerator';

/**
 * Static gallery configuration using the photo sets config
 * The first available photo set will be displayed by default
 * 
 * To add a new date:
 * 1. Edit src/config/photo-sets.config.ts
 * 2. Add your new date entry to the PHOTO_SETS array
 * 3. Run: npm run detect-images
 */
export const galleryConfig: GalleryConfig = {
  cdnBaseUrl: 'https://cdn.xperia.pt',
  photos: generatePhotosStatic('19'), // Default to first photo set
};

/**
 * Alternative: Use this in your page component for dynamic detection
 * 
 * Example:
 * import { getGalleryConfig } from '@/utils/photoGenerator';
 * 
 * export default async function GalleryPage() {
 *   const config = await getGalleryConfig();
 *   return <PhotoGallery {...config} />;
 * }
 */
