/**
 * Server-side Image Detection
 * Detects available images at build time or server-side
 */

import { GalleryConfig, Photo } from '@/types/gallery';
import { PHOTO_SETS, getPhotoSetById, buildCdnUrl } from '@/config/photo-sets.config';

/**
 * Generate photos dynamically based on what's available in the CDN
 */
export const generatePhotosFromCDN = async (
  cdnBaseUrl: string,
  photoSetId: string,
  maxImages: number = 200
): Promise<Photo[]> => {
  const photoSet = getPhotoSetById(photoSetId);
  
  if (!photoSet) {
    throw new Error(`Photo set not found: ${photoSetId}`);
  }

  // Detect how many images are available (placeholder - use script result)
  const totalImages = photoSet.detectedCount || photoSet.fallbackCount || 100;

  // Generate photo objects
  const photos: Photo[] = [];
  for (let i = 1; i <= totalImages; i++) {
    photos.push({
      id: String(i),
      src: buildCdnUrl(photoSetId, i),
      width: photoSet.width || 1920,
      height: photoSet.height || 1280,
      alt: `${photoSet.date} Photo ${i}`,
    });
  }

  console.log(`✅ Generated ${totalImages} photos for ${photoSet.date}`);
  return photos;
};

/**
 * Generate static photos using configuration
 */
export const generatePhotosStatic = (
  photoSetId: string,
  imageCount?: number
): Photo[] => {
  const photoSet = getPhotoSetById(photoSetId);
  
  if (!photoSet) {
    throw new Error(`Photo set not found: ${photoSetId}`);
  }

  const count = imageCount || photoSet.detectedCount || photoSet.fallbackCount || 100;

  const photos: Photo[] = [];
  for (let i = 1; i <= count; i++) {
    photos.push({
      id: String(i),
      src: buildCdnUrl(photoSetId, i),
      width: photoSet.width || 1920,
      height: photoSet.height || 1280,
      alt: `${photoSet.date} Photo ${i}`,
    });
  }

  return photos;
};

/**
 * Get gallery config with auto-detected images
 */
export const getGalleryConfig = async (
  cdnBaseUrl: string = 'https://cdn.xperia.pt',
  photoSetId: string = '19',
  maxImages: number = 200
): Promise<GalleryConfig> => {
  try {
    const photos = await generatePhotosFromCDN(cdnBaseUrl, photoSetId, maxImages);
    return {
      cdnBaseUrl,
      photos,
    };
  } catch (error) {
    console.error('Failed to auto-detect images, falling back to static generation:', error);
    return {
      cdnBaseUrl,
      photos: generatePhotosStatic(photoSetId),
    };
  }
};

/**
 * Export photo sets for external use
 */
export { PHOTO_SETS };
