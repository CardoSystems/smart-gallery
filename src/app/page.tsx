'use client';

import { useState } from 'react';
import PhotoGallery from '@/components/PhotoGallery';
import { WeatherWidget } from '@/components/WeatherWidget';
import { generatePhotosStatic } from '@/utils/photoGenerator';
import { 
  PHOTO_SETS, 
  getPhotoSetIds, 
  getImageCount,
  type PhotoSet 
} from '@/config/photo-sets.config';

export default function Home() {
  const photoSetIds = getPhotoSetIds();
  const defaultId = photoSetIds[0] || '19';
  const [selectedId, setSelectedId] = useState<string>(defaultId);
  
  // Get the selected photo set
  const selectedPhotoSet = PHOTO_SETS.find((set) => set.id === selectedId);
  const imageCount = getImageCount(selectedId);
  const photos = generatePhotosStatic(selectedId, imageCount);

  return (
    <div className="min-h-screen relative">
      <main className="container mx-auto px-4 py-12 max-w-7xl relative z-10">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Tradicionais Festas de Santa Eufémia 2025
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8 drop-shadow-md">
            Galeria de Fotos
          </p>
          <div className="flex gap-4 justify-center mb-6 flex-wrap">
            {PHOTO_SETS.map((photoSet) => (
              <button
                key={photoSet.id}
                onClick={() => setSelectedId(photoSet.id)}
                className={`px-6 py-2 rounded-lg shadow-sm transition-all duration-200 font-semibold ${
                  selectedId === photoSet.id
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {photoSet.date}
              </button>
            ))}
          </div>
          <div className="flex justify-center">
            <WeatherWidget />
          </div>
        </header>
        
        <PhotoGallery 
          key={selectedId}
          photos={photos} 
          cdnBaseUrl="https://cdn.cardoso.dpdns.org"
        />
        
        {/* Embedded Content Section */}
        <section className="mt-16 mb-8 px-4">
          <div className="w-full max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4 text-center drop-shadow-md">
              A equipa Fotográfica👇
            </h2>
            <div 
              className="w-full h-[70vh] md:h-[85vh] overflow-hidden relative pointer-events-none hover:pointer-events-auto rounded-xl shadow-2xl ring-1 ring-white/10"
            >
              <iframe
                src="https://same-cr6xi5okr4h-latest.netlify.app"
                className="w-full h-full border-0 absolute inset-0 pointer-events-auto rounded-xl"
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

