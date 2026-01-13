import { GalleryConfig, Photo } from '@/types/gallery';

// Generate all 150 photos
const generatePhotos = (): Photo[] => {
  const photos: Photo[] = [];
  
  for (let i = 1; i <= 150; i++) {
    photos.push({
      id: String(i),
      src: `/santaeufemia.pt/1904-HD/Festa-${i}.jpg`,
      width: 1920,
      height: 1280,
      alt: `Festa Photo ${i}`,
    });
  }
  
  return photos;
};

export const galleryConfig: GalleryConfig = {
  cdnBaseUrl: 'https://cdn.xperia.pt',
  photos: generatePhotos(),
};
