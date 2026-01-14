# Auto Image Detection System

Automatically detects the number of images available in your CDN without hardcoding counts.

## 🎯 Problem Solved

Previously, the system was hardcoded to look for exactly 150 images. If your CDN had a different number of images (e.g., 120 in one folder, 180 in another), some images would be missed or 404 errors would occur.

This system automatically detects how many images are actually available in each CDN folder.

## 🚀 Quick Start

### Method 1: CLI Script (Recommended for Build Time)

Run the detection script to find out how many images exist:

```bash
npm run detect-images
```

This will output something like:
```
🎨 Starting image detection...

🔍 Detecting images in /santaeufemia.pt/1904-HD...
✅ 1904-HD: 147 images (2341ms)

📊 Detection Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   1904-HD: 147 images
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Method 2: Cloudflare Pages Function (Runtime Detection)

The detection API is available as a Cloudflare Pages Function at `/api/detect-images`:

```bash
# Fast detection (binary search)
curl https://your-site.pages.dev/api/detect-images

# Thorough detection (checks all images)
curl "https://your-site.pages.dev/api/detect-images?strategy=thorough"

# Custom path
curl "https://your-site.pages.dev/api/detect-images?basePath=/santaeufemia.pt/2024-event&filePattern=Event-{index}.jpg"
```

The function is automatically deployed with your site and runs on Cloudflare's edge network.

### Method 3: React Component

Add the detector UI to any page:

```tsx
import ImageDetectorUI from '@/components/ImageDetectorUI';

export default function DetectorPage() {
  return (
    <div className="p-8">
      <ImageDetectorUI />
    </div>
  );
}
```

### Method 4: Server-Side (Recommended for Production)

Update your page component to use automatic detection:

```tsx
// app/gallery/page.tsx
import PhotoGallery from '@/components/PhotoGallery';
import { getGalleryConfig } from '@/utils/photoGenerator';

export default async function GalleryPage() {
  // Automatically detects available images
  const config = await getGalleryConfig();
  
  return <PhotoGallery {...config} />;
}
```

### Method 5: React Hook (Client-Side)

```tsx
'use client';

import { useImageDetector } from '@/hooks/useImageDetector';

export default function MyGallery() {
  const { result, isDetecting, error } = useImageDetector({
    cdnBaseUrl: 'https://cdn.xperia.pt',
    basePath: '/santaeufemia.pt/1904-HD',
    filePattern: (i) => `Festa-${i}.jpg`,
    maxImages: 200,
    strategy: 'fast',
    autoDetect: true,
  });

  if (isDetecting) return <div>Detecting images...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!result) return null;

  return <div>Found {result.totalImages} images!</div>;
}
```

## 🔧 Configuration

### Adding New Image Sets

Edit `src/utils/photoGenerator.ts`:

```typescript
const IMAGE_SETS: Record<string, ImageSet> = {
  '1904-HD': {
    basePath: '/santaeufemia.pt/1904-HD',
    filePattern: (i) => `Festa-${i}.jpg`,
    width: 1920,
    height: 1280,
    altPattern: (i) => `Festa Photo ${i}`,
  },
  '2024-event': {
    basePath: '/santaeufemia.pt/2024-event',
    filePattern: (i) => `Event-${i}.jpg`,
    width: 1920,
    height: 1280,
    altPattern: (i) => `Event Photo ${i}`,
  },
};
```

Also update `scripts/detect-images.js` to include the new set.

## 📊 Detection Strategies

### Fast Strategy (Binary Search)
- ⚡ Very fast (typically < 3 seconds)
- 🎯 Assumes images are numbered sequentially (1, 2, 3, ...)
- ✅ Best for most use cases
- Uses binary search to find the last image number

### Thorough Strategy
- 🔍 Checks every image individually
- 📝 Detects gaps (e.g., if image 50 is missing)
- ⏱️ Slower but more comprehensive
- Reports which specific images are missing

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│         Detection Methods                   │
├─────────────────────────────────────────────┤
│                                             │
│  CLI Script          API Route             │
│  (Build time)        (Runtime)             │
│       │                  │                  │
│       └──────┬───────────┘                  │
│              │                              │
│       ┌──────▼──────────┐                   │
│       │ imageDetector.ts│                   │
│       │  (Core Logic)   │                   │
│       └──────┬──────────┘                   │
│              │                              │
│       ┌──────▼──────────┐                   │
│       │  Binary Search  │                   │
│       │  HEAD Requests  │                   │
│       └─────────────────┘                   │
│                                             │
└─────────────────────────────────────────────┘
```

## 🎨 How It Works

1. **Binary Search Algorithm**:
   - Starts by checking the middle image (e.g., image 100)
   - If exists, searches higher numbers (101-200)
   - If doesn't exist, searches lower numbers (1-99)
   - Converges to the exact last image number

2. **HEAD Requests**:
   - Uses HTTP HEAD instead of GET
   - Only fetches headers, not the full image
   - ~100x faster than downloading images
   - Minimal CDN bandwidth usage

3. **Caching**:
   - Results cached for 1 hour
   - Avoids repeated detections
   - Can be invalidated manually if needed

## 🔍 Files Created

```
src/
├── utils/
│   ├── imageDetector.ts      # Core detection logic
│   └── photoGenerator.ts     # Photo generation with auto-detection
├── hooks/
│   └── useImageDetector.ts   # React hook for client-side detection
└── components/
    └── ImageDetectorUI.tsx   # UI component for detection

functions/
└── api/
    └── detect-images.ts      # Cloudflare Pages Function (edge API)

scripts/
└── detect-images.js          # CLI script for build-time detection
```

## 💡 Best Practices

1. **Build Time**: Run `npm run detect-images` before deployment
2. **Server-Side**: Use `getGalleryConfig()` in Server Components
3. **Client-Side**: Use `useImageDetector` hook with caching
4. **Production**: Consider detecting at build time and caching results
5. **Multiple Sets**: Configure all image sets in `IMAGE_SETS`

## 🐛 Troubleshooting

### Images not detected
- Check CDN URL is accessible
- Verify file naming pattern is correct
- Check CORS headers allow HEAD requests
- Try thorough strategy to see gaps

### Slow detection
- Use fast strategy (binary search)
- Reduce maxImages parameter
- Consider build-time detection instead

### Missing images reported
- Check if images are actually missing on CDN
- Verify file naming is sequential
- Check if images are publicly accessible

## 📈 Performance

- **Fast Strategy**: ~2-3 seconds for 200 images
- **Thorough Strategy**: ~20-30 seconds for 200 images
- **HEAD Request Size**: ~500 bytes vs ~2MB for full image
- **Bandwidth Saved**: 99.9% vs downloading all images
