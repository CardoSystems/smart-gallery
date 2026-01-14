# Cloudflare Pages Configuration

## Build Settings
- **Build command**: `npm ci && npm run build`
- **Build output directory**: `out`
- **Root directory**: `/`
- **Node version**: 20 or higher (recommended)

## Environment Variables
No environment variables required for basic setup.

## Prerequisites
- Next.js configured with `output: 'export'` ✓
- Static site generation enabled ✓
- No API routes (static only) ✓
- Remote image optimization disabled for CDN images ✓

## Deployment Steps

### Via GitHub (Recommended)
1. Push your code to GitHub
2. Go to Cloudflare Pages dashboard
3. Create new project → Connect to Git
4. Select your repository
5. Set build settings as above
6. Deploy

### Via Wrangler CLI
```bash
npm install -g wrangler
npm run build
wrangler pages deploy out
```

### Via Direct Upload
```bash
npm run build
# Upload the 'out' directory to Cloudflare Pages
```

## Pre-deployment Checklist
- [ ] Run `npm run build` locally and verify `out` directory
- [ ] Test with `npm run preview` to simulate production
- [ ] Verify all external resources (CDN, iframes) are accessible
- [ ] Check lighthouse score: `npm run build && npm run preview`

## Optimization Tips
- CDN images from `https://cdn.xperia.pt` are cached efficiently
- Static HTML/CSS/JS files are globally cached by Cloudflare
- Consider adding cache headers in `_headers` file for custom caching

## Troubleshooting
- **Build fails**: Ensure Node.js 20+ is available in build environment
- **Images not loading**: Verify CDN URL is accessible publicly
- **Iframe not embedding**: Check CORS settings on embedded site
