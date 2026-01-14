/**
 * Photo Sets Configuration
 * 
 * Centralized configuration for all photo gallery date sets.
 * Simply add a new object to PHOTO_SETS to add a new date.
 * 
 * Example:
 * {
 *   id: '21',
 *   date: '21 Abril 2024',
 *   cdnPath: '/santaeufemia.pt/2104-SD',
 *   fileName: 'Festa',
 *   fileExtension: 'jpg',
 * }
 */

export interface PhotoSet {
  /** Unique identifier (used internally) */
  id: string;
  
  /** Display date string (shown on buttons) */
  date: string;
  
  /** CDN path without leading slash (e.g., santaeufemia.pt/1904-SD) */
  cdnPath: string;
  
  /** Base filename pattern (e.g., 'Festa') */
  fileName: string;
  
  /** File extension (e.g., 'jpg') */
  fileExtension?: string;
  
  /** Image dimensions (optional, defaults to 1920x1280) */
  width?: number;
  height?: number;
  
  /** Auto-detected image count (filled by detection script) */
  detectedCount?: number;
  
  /** Fallback count if detection fails */
  fallbackCount?: number;
}

/**
 * All available photo sets for the gallery
 * Add new dates here - that's all you need to do!
 */
export const PHOTO_SETS: PhotoSet[] = [
  {
    id: '19',
    date: '19 Abril 2024',
    cdnPath: 'santaeufemia.pt/1904-SD',
    fileName: 'Festa',
    fileExtension: 'jpg',
    width: 1920,
    height: 1280,
    detectedCount: 100,
    fallbackCount: 100,
  },
  {
    id: '20',
    date: '20 Abril 2024',
    cdnPath: 'santaeufemia.pt/2004-SD',
    fileName: 'Festa',
    fileExtension: 'jpg',
    width: 1920,
    height: 1280,
    detectedCount: 110,
    fallbackCount: 110,
  },
  // Example: Add a new date like this:
  // {
  //   id: '21',
  //   date: '21 Abril 2024',
  //   cdnPath: 'santaeufemia.pt/2104-SD',
  //   fileName: 'Festa',
  //   fileExtension: 'jpg',
  //   width: 1920,
  //   height: 1280,
  //   detectedCount: 120,
  //   fallbackCount: 120,
  // },
];

/**
 * Get a photo set by ID
 */
export function getPhotoSetById(id: string): PhotoSet | undefined {
  return PHOTO_SETS.find((set) => set.id === id);
}

/**
 * Get all available photo set IDs
 */
export function getPhotoSetIds(): string[] {
  return PHOTO_SETS.map((set) => set.id);
}

/**
 * Get image count for a photo set
 * Returns detected count if available, falls back to fallbackCount
 */
export function getImageCount(id: string): number {
  const photoSet = getPhotoSetById(id);
  if (!photoSet) {
    console.warn(`Photo set not found: ${id}`);
    return 0;
  }
  return photoSet.detectedCount || photoSet.fallbackCount || 0;
}

/**
 * Build full CDN URL for a photo
 */
export function buildCdnUrl(photoSetId: string, imageIndex: number): string {
  const photoSet = getPhotoSetById(photoSetId);
  if (!photoSet) {
    throw new Error(`Photo set not found: ${photoSetId}`);
  }
  
  const baseName = `${photoSet.fileName}-${imageIndex}`;
  const fileName = photoSet.fileExtension 
    ? `${baseName}.${photoSet.fileExtension}`
    : baseName;
  
  return `/${photoSet.cdnPath}/${fileName}`;
}

/**
 * Get all photo sets as key-value pairs (for UI dropdowns, etc.)
 */
export function getPhotoSetsAsOptions(): { id: string; label: string }[] {
  return PHOTO_SETS.map((set) => ({
    id: set.id,
    label: set.date,
  }));
}

/**
 * Validate that all photo sets have required fields
 */
export function validatePhotoSets(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  PHOTO_SETS.forEach((set, index) => {
    if (!set.id) errors.push(`Photo set ${index}: missing id`);
    if (!set.date) errors.push(`Photo set ${index}: missing date`);
    if (!set.cdnPath) errors.push(`Photo set ${index}: missing cdnPath`);
    if (!set.fileName) errors.push(`Photo set ${index}: missing fileName`);
    
    // Check for duplicate IDs
    const duplicateId = PHOTO_SETS.filter((s) => s.id === set.id).length > 1;
    if (duplicateId) errors.push(`Photo set ${index}: duplicate id "${set.id}"`);
  });
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// Validate on load in development
if (process.env.NODE_ENV === 'development') {
  const validation = validatePhotoSets();
  if (!validation.valid) {
    console.warn('⚠️ Photo sets validation errors:');
    validation.errors.forEach((error) => console.warn(`  - ${error}`));
  }
}
