import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface EnhancementSettings {
  scale: number;
  face_enhance: boolean;
}

export interface ImageFile {
  id: string;
  file: File;
  preview: string;
  originalName: string;
  size: number;
  type: string;
  uploadedAt: Date;
}

export interface EnhancedImage {
  id: string;
  originalImageId: string;
  enhancedUrl: string;
  settings: EnhancementSettings;
  status: 'processing' | 'completed' | 'failed';
  predictionId?: string;
  createdAt: Date;
  downloadUrl?: string;
  review?: string;
  userId?: string;
}

export interface EnhanceStoreState {
  // UI State
  isLoading: boolean;
  error: string | null;
  
  // Image Management
  currentImage: ImageFile | null;
  enhancedImages: EnhancedImage[];
  
  // Enhancement Settings
  enhancementSettings: EnhancementSettings;
  
  // History
  imageHistory: EnhancedImage[];
  
  // Actions
  setCurrentImage: (image: ImageFile | null) => void;
  setEnhancementSettings: (settings: Partial<EnhancementSettings>) => void;
  addEnhancedImage: (image: EnhancedImage) => void;
  updateEnhancedImage: (id: string, updates: Partial<EnhancedImage>) => void;
  removeEnhancedImage: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearHistory: () => void;
  clearCurrentSession: () => void;
}

export const useEnhanceStore = create<EnhanceStoreState>()(
  persist(
    devtools(
      (set, get) => ({
        // Initial State
        isLoading: false,
        error: null,
        currentImage: null,
        enhancedImages: [],
        enhancementSettings: {
          scale: 4,
          face_enhance: false,
        },
        imageHistory: [],

        // Actions
        setCurrentImage: (image) => 
          set({ currentImage: image }, false, 'setCurrentImage'),

        setEnhancementSettings: (settings) =>
          set(
            (state) => ({
              enhancementSettings: { ...state.enhancementSettings, ...settings },
            }),
            false,
            'setEnhancementSettings'
          ),

        addEnhancedImage: (image) =>
          set(
            (state) => ({
              enhancedImages: [...state.enhancedImages, image],
              imageHistory: [...state.imageHistory, image],
            }),
            false,
            'addEnhancedImage'
          ),

        updateEnhancedImage: (id, updates) =>
          set(
            (state) => ({
              enhancedImages: state.enhancedImages.map((img) =>
                img.id === id ? { ...img, ...updates } : img
              ),
              imageHistory: state.imageHistory.map((img) =>
                img.id === id ? { ...img, ...updates } : img
              ),
            }),
            false,
            'updateEnhancedImage'
          ),

        removeEnhancedImage: (id) =>
          set(
            (state) => ({
              enhancedImages: state.enhancedImages.filter((img) => img.id !== id),
            }),
            false,
            'removeEnhancedImage'
          ),

        setLoading: (isLoading) => 
          set({ isLoading }, false, 'setLoading'),

        setError: (error) => 
          set({ error }, false, 'setError'),

        clearHistory: () =>
          set({ imageHistory: [] }, false, 'clearHistory'),

        clearCurrentSession: () =>
          set(
            {
              currentImage: null,
              enhancedImages: [],
              error: null,
              isLoading: false,
            },
            false,
            'clearCurrentSession'
          ),
      }),
      {
        name: 'enhance-store',
      }
    ),
    {
      name: 'enhance-history',
      partialize: (state) => ({ imageHistory: state.imageHistory }),
    }
  )
);

// Utility functions for working with the store
export const getEnhancedImageById = (id: string) => {
  const state = useEnhanceStore.getState();
  return state.enhancedImages.find((img) => img.id === id);
};

export const getImageHistoryByDate = (date: Date) => {
  const state = useEnhanceStore.getState();
  return state.imageHistory.filter(
    (img) => img.createdAt.toDateString() === date.toDateString()
  );
};

export const getTotalEnhancementsCount = () => {
  const state = useEnhanceStore.getState();
  return state.imageHistory.length;
};
