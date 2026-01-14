/**
 * Image Detector Utility
 * Auto-detects the number of images available in a CDN directory
 * Uses efficient HEAD requests to check image existence
 */

export interface ImageDetectorConfig {
  cdnBaseUrl: string;
  basePath: string;
  filePattern: (index: number) => string;
  maxImages?: number;
  batchSize?: number;
  concurrentRequests?: number;
}

export interface DetectionResult {
  totalImages: number;
  availableImages: number[];
  missingImages: number[];
  detectionTime: number;
}

/**
 * Check if a single image exists using HEAD request
 */
const checkImageExists = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      cache: 'no-cache',
    });
    return response.ok && response.status === 200;
  } catch (error) {
    return false;
  }
};

/**
 * Binary search to find the last available image
 * Efficient for continuous sequences
 */
const findLastImageBinary = async (
  cdnBaseUrl: string,
  basePath: string,
  filePattern: (index: number) => string,
  maxImages: number
): Promise<number> => {
  let left = 1;
  let right = maxImages;
  let lastFound = 0;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const url = `${cdnBaseUrl}${basePath}/${filePattern(mid)}`;
    const exists = await checkImageExists(url);

    if (exists) {
      lastFound = mid;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return lastFound;
};

/**
 * Check images in batches with concurrent requests
 * More thorough but slower than binary search
 */
const checkImagesBatch = async (
  cdnBaseUrl: string,
  basePath: string,
  filePattern: (index: number) => string,
  maxImages: number,
  batchSize: number,
  concurrentRequests: number
): Promise<{ available: number[]; missing: number[] }> => {
  const available: number[] = [];
  const missing: number[] = [];

  for (let i = 1; i <= maxImages; i += batchSize) {
    const batch = Array.from(
      { length: Math.min(batchSize, maxImages - i + 1) },
      (_, idx) => i + idx
    );

    // Process batch with concurrent requests
    const batchPromises = batch.map(async (index) => {
      const url = `${cdnBaseUrl}${basePath}/${filePattern(index)}`;
      const exists = await checkImageExists(url);
      return { index, exists };
    });

    // Split into chunks for concurrent processing
    for (let j = 0; j < batchPromises.length; j += concurrentRequests) {
      const chunk = batchPromises.slice(j, j + concurrentRequests);
      const results = await Promise.all(chunk);
      
      results.forEach(({ index, exists }) => {
        if (exists) {
          available.push(index);
        } else {
          missing.push(index);
        }
      });
    }
  }

  return { available, missing };
};

/**
 * Auto-detect images with smart strategy
 * 1. First uses binary search to quickly find the approximate count
 * 2. Then verifies a range around that count
 * 3. Optionally does full verification if needed
 */
export const detectImages = async (
  config: ImageDetectorConfig,
  strategy: 'fast' | 'thorough' = 'fast'
): Promise<DetectionResult> => {
  const startTime = Date.now();
  const {
    cdnBaseUrl,
    basePath,
    filePattern,
    maxImages = 200,
    batchSize = 10,
    concurrentRequests = 5,
  } = config;

  if (strategy === 'fast') {
    // Fast strategy: Binary search + verification around the last found image
    const lastImage = await findLastImageBinary(
      cdnBaseUrl,
      basePath,
      filePattern,
      maxImages
    );

    // Verify a small range to ensure we didn't miss any
    const verifyRange = 5;
    const available: number[] = [];
    const missing: number[] = [];

    for (let i = Math.max(1, lastImage - verifyRange); i <= Math.min(maxImages, lastImage + verifyRange); i++) {
      const url = `${cdnBaseUrl}${basePath}/${filePattern(i)}`;
      const exists = await checkImageExists(url);
      if (exists) {
        available.push(i);
      } else if (i <= lastImage) {
        missing.push(i);
      }
    }

    // Assume all images from 1 to lastImage exist (minus verified missing)
    const allAvailable = Array.from({ length: lastImage }, (_, i) => i + 1)
      .filter(i => !missing.includes(i));

    return {
      totalImages: lastImage,
      availableImages: allAvailable,
      missingImages: missing,
      detectionTime: Date.now() - startTime,
    };
  } else {
    // Thorough strategy: Check all images in batches
    const { available, missing } = await checkImagesBatch(
      cdnBaseUrl,
      basePath,
      filePattern,
      maxImages,
      batchSize,
      concurrentRequests
    );

    return {
      totalImages: available.length,
      availableImages: available.sort((a, b) => a - b),
      missingImages: missing.sort((a, b) => a - b),
      detectionTime: Date.now() - startTime,
    };
  }
};

/**
 * Cache detection results to avoid repeated checks
 */
const detectionCache = new Map<string, { result: DetectionResult; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export const detectImagesWithCache = async (
  config: ImageDetectorConfig,
  strategy: 'fast' | 'thorough' = 'fast'
): Promise<DetectionResult> => {
  const cacheKey = `${config.cdnBaseUrl}${config.basePath}`;
  const cached = detectionCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.result;
  }

  const result = await detectImages(config, strategy);
  detectionCache.set(cacheKey, { result, timestamp: Date.now() });

  return result;
};
