'use client';

/**
 * ImageDetectorUI Component
 * Provides a UI for detecting and viewing image availability
 */

import { useState } from 'react';
import { useImageDetector } from '@/hooks/useImageDetector';

interface ImageDetectorUIProps {
  cdnBaseUrl?: string;
  basePath?: string;
  filePattern?: (index: number) => string;
  maxImages?: number;
  autoDetect?: boolean;
}

export default function ImageDetectorUI({
  cdnBaseUrl = 'https://cdn.cardoso.dpdns.org',
  basePath = '/santaeufemia.pt/1904-SD',
  filePattern = (i) => `Festa-${i}.jpg`,
  maxImages = 200,
  autoDetect = false,
}: ImageDetectorUIProps) {
  const [strategy, setStrategy] = useState<'fast' | 'thorough'>('fast');

  const { result, isDetecting, error, detect } = useImageDetector({
    cdnBaseUrl,
    basePath,
    filePattern,
    maxImages,
    strategy,
    autoDetect,
  });

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">🔍 Image Detector</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          CDN: <code className="bg-gray-100 px-2 py-1 rounded">{cdnBaseUrl}</code>
        </p>
        <p className="text-sm text-gray-600">
          Path: <code className="bg-gray-100 px-2 py-1 rounded">{basePath}</code>
        </p>
      </div>

      <div className="mb-4 flex gap-4 items-center">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            value="fast"
            checked={strategy === 'fast'}
            onChange={(e) => setStrategy(e.target.value as 'fast')}
            className="w-4 h-4"
          />
          <span className="text-sm">Fast (Binary Search)</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            value="thorough"
            checked={strategy === 'thorough'}
            onChange={(e) => setStrategy(e.target.value as 'thorough')}
            className="w-4 h-4"
          />
          <span className="text-sm">Thorough (Check All)</span>
        </label>
      </div>

      <button
        onClick={detect}
        disabled={isDetecting}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isDetecting ? '🔄 Detecting...' : '🚀 Detect Images'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-semibold">❌ Error</p>
          <p className="text-red-600 text-sm mt-1">{error.message}</p>
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              ✅ Detection Complete
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Total Images:</p>
                <p className="text-2xl font-bold text-green-700">
                  {result.totalImages}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Detection Time:</p>
                <p className="text-2xl font-bold text-blue-700">
                  {result.detectionTime}ms
                </p>
              </div>
            </div>
          </div>

          {result.missingImages.length > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">
                ⚠️ Missing Images ({result.missingImages.length})
              </h4>
              <div className="max-h-32 overflow-y-auto">
                <p className="text-sm text-yellow-700">
                  {result.missingImages.join(', ')}
                </p>
              </div>
            </div>
          )}

          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">
              📋 Available Images
            </h4>
            <div className="max-h-48 overflow-y-auto">
              <p className="text-sm text-gray-700 font-mono">
                {result.availableImages.length > 20
                  ? `${result.availableImages.slice(0, 20).join(', ')}... and ${
                      result.availableImages.length - 20
                    } more`
                  : result.availableImages.join(', ')}
              </p>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">
              💻 Code Snippet
            </h4>
            <pre className="text-xs bg-white p-3 rounded overflow-x-auto">
              <code>{`// Update your photos.ts with:
const photos = generatePhotosStatic('1904-SD', ${result.totalImages});

// Or use dynamic detection:
const config = await getGalleryConfig();`}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
