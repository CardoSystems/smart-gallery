'use client';

import { useState } from 'react';
import PhotoGallery from '@/components/PhotoGallery';
import { WeatherWidget } from '@/components/WeatherWidget';
import { Photo } from '@/types/gallery';

// Generate photos for a specific date
const generatePhotos = (date: '19' | '20'): Photo[] => {
  const photos: Photo[] = [];
  const dateFolder = date === '19' ? '1904-SD' : '2004-SD';
  
  for (let i = 1; i <= 150; i++) {
    photos.push({
      id: String(i),
      src: `/santaeufemia.pt/${dateFolder}/Festa-${i}.jpg`,
      width: 1920,
      height: 1280,
      alt: `Festa Photo ${i}`,
    });
  }
  
  return photos;
};

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<'19' | '20'>('19');
  const photos = generatePhotos(selectedDate);

  return (
    <div className="min-h-screen relative">
      <main className="container mx-auto px-4 py-12 max-w-7xl relative z-10">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Tradicionais Festas de Santa Eufémia 2024
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8 drop-shadow-md">
            Galeria de Fotos
          </p>
          <div className="flex gap-4 justify-center mb-6">
            <button
              onClick={() => setSelectedDate('19')}
              className={`px-6 py-2 rounded-lg shadow-sm transition-all duration-200 font-semibold ${
                selectedDate === '19'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              19 Abril 2024
            </button>
            <button
              onClick={() => setSelectedDate('20')}
              className={`px-6 py-2 rounded-lg shadow-sm transition-all duration-200 font-semibold ${
                selectedDate === '20'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              20 Abril 2024
            </button>
          </div>
          <div className="flex justify-center">
            <WeatherWidget />
          </div>
        </header>
        
        <PhotoGallery 
          key={selectedDate}
          photos={photos} 
          cdnBaseUrl="https://cdn.xperia.pt"
        />
        
        {/* Embedded Content Section */}
        <section className="mt-16 mb-8">
          <div className="w-full">
            <h2 className="text-2xl font-bold text-white mb-4 text-center drop-shadow-md">
              A equipa Fotográfica👇
            </h2>
            <div 
              className="w-full h-[90vh] overflow-hidden relative"
              onMouseEnter={(e) => {
                document.body.style.overflow = 'hidden';
              }}
              onMouseLeave={(e) => {
                document.body.style.overflow = 'auto';
              }}
              onWheel={(e) => {
                e.stopPropagation();
              }}
            >
              <iframe
                src="https://same-cr6xi5okr4h-latest.netlify.app"
                className="w-full h-full border-0 absolute inset-0"
                loading="lazy"
                title="Embedded Content"
                allow="fullscreen"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

