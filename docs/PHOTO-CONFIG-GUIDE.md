# Photo Sets Configuration Guide

## Overview

The new centralized photo sets configuration simplifies adding new dates/galleries to your project. Just add one entry to the config file and everything else is automatically handled.

## Quick Start: Adding a New Date

### Step 1: Edit the Config File

Open [src/config/photo-sets.config.ts](../src/config/photo-sets.config.ts) and add a new entry to the `PHOTO_SETS` array:

```typescript
{
  id: '21',                              // Unique ID (used internally)
  date: '21 Abril 2024',                 // Display label for button
  cdnPath: 'santaeufemia.pt/2104-SD',    // CDN path (without leading slash)
  fileName: 'Festa',                     // Base filename
  fileExtension: 'jpg',                  // File extension
  width: 1920,                           // Image width (optional, default: 1920)
  height: 1280,                          // Image height (optional, default: 1280)
  detectedCount: 0,                      // Auto-filled by detection script
  fallbackCount: 120,                    // Fallback if detection fails
}
```

### Step 2: Run Image Detection

```bash
npm run detect-images
```

This automatically:
- ✅ Detects how many images exist in your CDN
- ✅ Updates the config with `detectedCount`
- ✅ Validates the configuration

### Step 3: Done! 🎉

The gallery automatically:
- ✅ Shows new date button in the UI
- ✅ Loads correct number of images
- ✅ Works with the detection system

## Configuration File Fields

| Field | Required | Example | Purpose |
|-------|----------|---------|---------|
| `id` | ✅ | `'21'` | Unique identifier |
| `date` | ✅ | `'21 Abril 2024'` | Button label |
| `cdnPath` | ✅ | `'santaeufemia.pt/2104-SD'` | CDN directory path |
| `fileName` | ✅ | `'Festa'` | Image filename prefix |
| `fileExtension` | ❌ | `'jpg'` | File extension (default: 'jpg') |
| `width` | ❌ | `1920` | Image width (default: 1920) |
| `height` | ❌ | `1280` | Image height (default: 1280) |
| `detectedCount` | ❌ | `125` | Auto-filled by detection script |
| `fallbackCount` | ❌ | `100` | Fallback if detection fails |

## How It Works

The config flows through multiple parts of the app:

```
photo-sets.config.ts
    ↓
    ├─→ src/app/page.tsx          (renders buttons & gallery)
    ├─→ src/utils/photoGenerator.ts (generates photo objects)
    ├─→ scripts/detect-images.js   (auto-detects counts)
    └─→ src/data/photos.ts         (default gallery config)
```

## Configuration Validation

The config is automatically validated when you add entries. It checks:
- ✅ All required fields present
- ✅ No duplicate IDs
- ✅ Correct field formats

View validation errors in console during development.

## Usage Examples

### Example 1: Simple Date Add
```typescript
{
  id: '22',
  date: '22 Abril 2024',
  cdnPath: 'santaeufemia.pt/2204-SD',
  fileName: 'Festa',
  fallbackCount: 150,
}
```

### Example 2: Different Image Format
```typescript
{
  id: 'special',
  date: 'Special Event 2024',
  cdnPath: 'santaeufemia.pt/special-event',
  fileName: 'IMG',
  fileExtension: 'png',
  width: 2560,
  height: 1440,
  fallbackCount: 80,
}
```

### Example 3: High-Resolution Images
```typescript
{
  id: 'hires',
  date: '4K Gallery',
  cdnPath: 'santaeufemia.pt/4k-collection',
  fileName: 'Photo',
  fileExtension: 'jpg',
  width: 3840,
  height: 2160,
  detectedCount: 200,
}
```

## Available Utilities

The config provides several helper functions:

```typescript
import { 
  PHOTO_SETS,
  getPhotoSetById,
  getPhotoSetIds,
  getImageCount,
  buildCdnUrl,
  getPhotoSetsAsOptions,
  validatePhotoSets,
} from '@/config/photo-sets.config';

// Get a specific photo set
const photoSet = getPhotoSetById('21');

// Get all IDs
const ids = getPhotoSetIds(); // ['19', '20', '21']

// Get image count for a date
const count = getImageCount('21'); // 120

// Build CDN URL for an image
const url = buildCdnUrl('21', 1); // '/santaeufemia.pt/2104-SD/Festa-1.jpg'

// Get options for dropdowns/selects
const options = getPhotoSetsAsOptions();

// Validate configuration
const validation = validatePhotoSets();
```

## File Naming Conventions

The system assumes image files follow this pattern:
```
{fileName}-{imageNumber}.{fileExtension}

Examples:
- Festa-1.jpg
- Festa-100.jpg
- IMG-50.png
```

If your files have a different pattern, create a custom wrapper or modify the `buildCdnUrl()` function.

## Detection Script

The detection script automatically finds all images in configured CDN paths:

```bash
# Normal run
npm run detect-images

# With debug output
node scripts/detect-images.js --debug
```

The script:
1. Reads from `photo-sets.config.ts`
2. Uses binary search to find last image
3. Calculates total count
4. Shows detailed results

You can then manually update the config with the detected counts.

## Best Practices

✅ **Always run detection** after adding new dates  
✅ **Use consistent naming** across all date folders  
✅ **Set fallback counts** as backup if detection fails  
✅ **Validate configuration** before deployment  
✅ **Use the config file** - don't hardcode dates elsewhere  

## Troubleshooting

**Q: New date button doesn't appear**  
A: Run validation: `npm run detect-images --debug`

**Q: Images show 404 errors**  
A: Check CDN path matches exactly, verify image files exist

**Q: Can't detect image count**  
A: Set a fallback count, verify CDN path is accessible

**Q: Need different image dimensions per date?**  
A: Set `width` and `height` for each photo set

## Files Involved

- [src/config/photo-sets.config.ts](../src/config/photo-sets.config.ts) - Main configuration
- [src/app/page.tsx](../src/app/page.tsx) - Uses config for UI
- [src/utils/photoGenerator.ts](../src/utils/photoGenerator.ts) - Uses config for photos
- [scripts/detect-images.js](../scripts/detect-images.js) - Detects counts
- [src/data/photos.ts](../src/data/photos.ts) - Default gallery config
