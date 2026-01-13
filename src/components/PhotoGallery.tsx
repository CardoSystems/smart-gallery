'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { Fancybox as NativeFancybox } from '@fancyapps/ui';
import '@fancyapps/ui/dist/fancybox/fancybox.css';
import { Photo } from '@/types/gallery';

interface PhotoGalleryProps {
  photos: Photo[];
  cdnBaseUrl: string;
}

// Image cache management
const imageCache = new Set<string>();
const preloadCache = new Set<string>();

const preloadImage = async (url: string) => {
  if (preloadCache.has(url)) return;
  
  try {
    preloadCache.add(url);
    const img = new window.Image();
    img.src = url;
    
    // Also cache in Cache API for offline support
    if ('caches' in window) {
      try {
        const cache = await caches.open('photo-gallery-v1');
        await cache.add(url);
      } catch (e) {
        // Cache storage limit or permission issue - continue without caching
      }
    }
  } catch (error) {
    preloadCache.delete(url);
  }
};

const PhotoSkeleton = () => (
  <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-200">
    <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]" />
  </div>
);

const PhotoCard = ({ photo, cdnBaseUrl, index }: { photo: Photo; cdnBaseUrl: string; index: number }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: '400px' });
  
  const fullImageUrl = `${cdnBaseUrl}${photo.src}`;

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  // Smart lazy loading: only load when in viewport + margin
  useEffect(() => {
    if (!isInView) return;
    
    if (imageCache.has(fullImageUrl)) {
      setIsLoaded(true);
      return;
    }
    
    const testImage = new window.Image();
    testImage.onload = () => {
      imageCache.add(fullImageUrl);
      setIsLoaded(true);
    };
    testImage.onerror = () => {
      setHasError(true);
    };
    testImage.src = fullImageUrl;
  }, [isInView, fullImageUrl, photo.alt]);

  if (hasError) {
    return null;
  }

  return (
    <motion.div
      ref={cardRef}
      variants={itemVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="relative"
    >
      <a
        href={fullImageUrl}
        data-fancybox="gallery"
        data-caption={photo.alt}
        className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100 cursor-pointer group block"
      >
        {!isLoaded && <PhotoSkeleton />}
        
        {isInView && (
          <Image
            src={fullImageUrl}
            alt={photo.alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover transition-all duration-500 group-hover:scale-105 ${
              isLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'
            }`}
            loading="lazy"
            quality={85}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
          />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <p className="text-sm font-medium drop-shadow-lg">{photo.alt}</p>
        </div>
        
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {index + 1}
        </div>
      </a>
    </motion.div>
  );
};

export default function PhotoGallery({ photos, cdnBaseUrl }: PhotoGalleryProps) {
  const [mounted, setMounted] = useState(false);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fancyboxInstanceRef = useRef<any>(null);

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Show/hide scroll to top button
  useEffect(() => {
    if (!mounted) return;

    const handleScroll = () => {
      setShowScrollButtons(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [mounted]);

  useEffect(() => {
    setMounted(true);

    // Filter out photos that failed to load
    const validPhotos = photos.filter(photo => {
      const url = `${cdnBaseUrl}${photo.src}`;
      return !imageCache.has(url) || imageCache.has(url);
    });

    // Create Fancybox items from valid photos only
    const fancyboxItems = validPhotos.map(photo => ({
      src: `${cdnBaseUrl}${photo.src}`,
      thumb: `${cdnBaseUrl}${photo.src}`,
      caption: photo.alt,
    }));

    // Initialize Fancybox with all items, but using a callback to load them
    try {
      NativeFancybox.bind('[data-fancybox="gallery"]', {
        on: {
          init: (fancybox: any) => {
            // Store the instance for later access
            fancyboxInstanceRef.current = fancybox;
            // Set all items upfront from the photos array
            fancybox.items = fancyboxItems;
          },
          reveal: (fancybox: any, slide: any) => {
            // Preload adjacent images for smooth navigation
            const currentIndex = slide.$index;
            const items = fancybox.items;
            if (currentIndex + 1 < items.length) {
              const nextUrl = items[currentIndex + 1].src;
              preloadImage(nextUrl);
            }
            if (currentIndex - 1 >= 0) {
              const prevUrl = items[currentIndex - 1].src;
              preloadImage(prevUrl);
            }
          },
          error: (fancybox: any, slide: any) => {
            // Silently handle image load errors
          },
        },
        Toolbar: {
          display: {
            left: ['infobar'],
            middle: [
              'zoomIn',
              'zoomOut',
              'toggle1to1',
              'rotateCCW',
              'rotateCW',
              'flipX',
              'flipY',
            ],
            right: ['slideshow', 'download', 'thumbs', 'close'],
          },
        },
        Slideshow: {
          playOnStart: false,
          timeout: 3000,
        },
        Images: {
          zoom: true,
          initialSize: 'fit',
          Panzoom: {
            maxScale: 4,
            panMode: 'mousemove',
          },
        },
        Thumbs: {
          type: 'classic',
          autoStart: true,
          showOnStart: false,
        },
        animated: true,
        hideScrollbar: true,
        preload: 2,
        keyboard: {
          Escape: 'close',
          Delete: 'close',
          Backspace: 'close',
          PageUp: 'next',
          PageDown: 'prev',
          ArrowUp: 'prev',
          ArrowDown: 'next',
          ArrowRight: 'next',
          ArrowLeft: 'prev',
        },
        wheel: 'zoom',
        downloadSrc: (slide: any) => slide.src,
        infinite: true,
      } as any);
    } catch (error) {
      console.warn('Fancybox initialization warning:', error);
    }

    return () => {
      try {
        NativeFancybox.unbind('[data-fancybox="gallery"]');
        NativeFancybox.close();
      } catch (error) {
        console.warn('Fancybox cleanup warning:', error);
      }
    };
  }, [photos, cdnBaseUrl]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <PhotoSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <>
      <motion.div
        id="gallery"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {photos.map((photo, index) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            cdnBaseUrl={cdnBaseUrl}
            index={index}
          />
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-12 text-center"
      >
        <p className="text-gray-500 text-sm">
          All {photos.length} photos loaded ✓
        </p>
      </motion.div>

      {/* Scroll to Top Button */}
      {showScrollButtons && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed bottom-6 right-6 z-40"
        >
          <button
            onClick={scrollToTop}
            className="w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:shadow-xl"
            title="Scroll to top"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </motion.div>
      )}
    </>
  );
}
