# Cloudflare Pages Functions

This directory contains Cloudflare Pages Functions that run on the edge.

## `/api/detect-images`

Auto-detects the number of images available in the CDN.

**Endpoint:** `https://your-site.pages.dev/api/detect-images`

**Query Parameters:**
- `basePath` - CDN path (default: `/santaeufemia.pt/1904-SD`)
- `filePattern` - Naming pattern with `{index}` placeholder (default: `Festa-{index}.jpg`)
- `maxImages` - Maximum images to check (default: `200`)
- `strategy` - Detection method: `fast` or `thorough` (default: `fast`)

**Example:**
```bash
curl "https://your-site.pages.dev/api/detect-images?basePath=/santaeufemia.pt/1904-SD&strategy=fast"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalImages": 125,
    "availableImages": [1, 2, 3, ...],
    "missingImages": [],
    "detectionTime": 2380
  },
  "message": "Detected 125 images in 2380ms"
}
```

## How It Works

Cloudflare Pages Functions are serverless functions that run on Cloudflare's edge network. They're automatically deployed with your static site and provide API functionality without a separate backend server.

The function uses:
- Binary search algorithm for fast detection
- HEAD requests to minimize bandwidth
- Edge computing for low latency worldwide

## Deployment

Functions are automatically deployed when you push to Cloudflare Pages. No additional configuration needed!
