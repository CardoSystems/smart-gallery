export interface Photo {
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  thumbnail?: string;
}

export interface GalleryConfig {
  cdnBaseUrl: string;
  photos: Photo[];
}
