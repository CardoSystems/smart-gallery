/**
 * Cloudflare Pages Function: /api/detect-images
 * Auto-detects available images in the CDN
 * 
 * Query parameters:
 * - basePath: The base path in the CDN (e.g., /santaeufemia.pt/1904-SD)
 * - filePattern: The file pattern (e.g., Festa-{index}.jpg)
 * - maxImages: Maximum number of images to check (default: 200)
 * - strategy: Detection strategy - 'fast' or 'thorough' (default: 'fast')
 */

interface ImageDetectorConfig {
  cdnBaseUrl: string;
  basePath: string;
  filePattern: (index: number) => string;
  maxImages?: number;
  batchSize?: number;
  concurrentRequests?: number;
}

interface DetectionResult {
  totalImages: number;
  availableImages: number[];
  missingImages: number[];
  detectionTime: number;
}

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

const detectImages = async (
  config: ImageDetectorConfig,
  strategy: 'fast' | 'thorough' = 'fast'
): Promise<DetectionResult> => {
  const startTime = Date.now();
  const {
    cdnBaseUrl,
    basePath,
    filePattern,
    maxImages = 200,
  } = config;

  if (strategy === 'fast') {
    const lastImage = await findLastImageBinary(
      cdnBaseUrl,
      basePath,
      filePattern,
      maxImages
    );

    const allAvailable = Array.from({ length: lastImage }, (_, i) => i + 1);

    return {
      totalImages: lastImage,
      availableImages: allAvailable,
      missingImages: [],
      detectionTime: Date.now() - startTime,
    };
  }

  // Thorough strategy would go here
  return {
    totalImages: 0,
    availableImages: [],
    missingImages: [],
    detectionTime: Date.now() - startTime,
  };
};

export async function onRequestGet(context: any) {
  try {
    const url = new URL(context.request.url);
    const searchParams = url.searchParams;
    
    const basePath = searchParams.get('basePath') || '/santaeufemia.pt/1904-SD';
    const filePattern = searchParams.get('filePattern') || 'Festa-{index}.jpg';
    const maxImages = parseInt(searchParams.get('maxImages') || '200', 10);
    const strategy = (searchParams.get('strategy') || 'fast') as 'fast' | 'thorough';

    const filePatternFn = (index: number) => 
      filePattern.replace('{index}', String(index));

    const config: ImageDetectorConfig = {
      cdnBaseUrl: 'https://cdn.xperia.pt',
      basePath,
      filePattern: filePatternFn,
      maxImages,
      batchSize: 10,
      concurrentRequests: 5,
    };

    const result = await detectImages(config, strategy);

    return new Response(JSON.stringify({
      success: true,
      data: result,
      message: `Detected ${result.totalImages} images in ${result.detectionTime}ms`,
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Image detection failed:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Detection failed',
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
