# Photography Gallery

A fast, modern photographer gallery built with Next.js 14, TypeScript, Tailwind CSS, PhotoSwipe, and Framer Motion. Optimized for Cloudflare Pages deployment.

## Features

- ⚡ **Blazing Fast**: Built with Next.js 14 and static export
- 🖼️ **PhotoSwipe Lightbox**: Touch-enabled, responsive image viewer
- ✨ **Smooth Animations**: Powered by Framer Motion
- 📱 **Fully Responsive**: Perfect on all devices
- 🎨 **Tailwind CSS**: Modern, utility-first styling
- 🚀 **Cloudflare Pages Ready**: Optimized for edge deployment

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **PhotoSwipe** - Lightweight, touch-enabled lightbox
- **Framer Motion** - Animation library
- **Cloudflare Pages** - Edge hosting

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or pnpm

### Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build

Build for production:
```bash
npm run build
```

This creates a static export in the `out` directory.

## Configuration

### Adding Photos

Edit `src/data/photos.ts` to add or modify photos:

```typescript
export const galleryConfig: GalleryConfig = {
  cdnBaseUrl: 'https://cdn.xperia.pt',
  photos: [
    {
      id: '1',
      src: '/path/to/image.jpg',
      width: 1920,
      height: 1280,
      alt: 'Photo description',
    },
    // Add more photos...
  ],
};
```

### CDN Configuration

Images are served from: `https://cdn.xperia.pt/`

To use a different CDN, update the `remotePatterns` in `next.config.ts`.

## Deployment to Cloudflare Pages

### Via Git Integration

1. Push your code to GitHub/GitLab
2. Connect repository to Cloudflare Pages
3. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Root directory**: `/`

### Via CLI

```bash
npm run build
npx wrangler pages deploy out
```

See [CLOUDFLARE.md](CLOUDFLARE.md) for detailed deployment instructions.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles
├── components/
│   └── PhotoGallery.tsx # Gallery component
├── data/
│   └── photos.ts        # Photo data
└── types/
    └── gallery.ts       # TypeScript types
```

## License

MIT

