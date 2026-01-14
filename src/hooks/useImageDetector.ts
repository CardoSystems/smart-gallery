/**
 * React Hook for Image Detection
 * Provides an easy way to detect and manage CDN images in React components
 */

import { useState, useEffect, useCallback } from 'react';
import { detectImagesWithCache, ImageDetectorConfig, DetectionResult } from '@/utils/imageDetector';

interface UseImageDetectorOptions extends ImageDetectorConfig {
  strategy?: 'fast' | 'thorough';
  autoDetect?: boolean;
}

interface UseImageDetectorReturn {
  result: DetectionResult | null;
  isDetecting: boolean;
  error: Error | null;
  detect: () => Promise<void>;
}

export const useImageDetector = (options: UseImageDetectorOptions): UseImageDetectorReturn => {
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { strategy = 'fast', autoDetect = true, ...config } = options;

  const detect = useCallback(async () => {
    setIsDetecting(true);
    setError(null);

    try {
      const detectionResult = await detectImagesWithCache(config, strategy);
      setResult(detectionResult);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Detection failed'));
    } finally {
      setIsDetecting(false);
    }
  }, [config, strategy]);

  useEffect(() => {
    if (autoDetect) {
      detect();
    }
  }, [autoDetect, detect]);

  return {
    result,
    isDetecting,
    error,
    detect,
  };
};
