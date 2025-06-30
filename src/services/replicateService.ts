export interface EnhancementOptions {
  scale: number;
  face_enhance: boolean;
}

export interface EnhancementResult {
  predictionId: string;
  outputUrl?: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  error?: string;
}

// Get the API base URL based on environment
const getApiBaseUrl = () => {
  // In development, use localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3001/api';
  }
  // In production, use the same domain as the frontend
  return '/api';
};

/**
 * Enhance an image using Real-ESRGAN model via our backend API
 */
export const enhanceImage = async (
  imageFile: File,
  options: EnhancementOptions
): Promise<EnhancementResult> => {
  try {
    // Convert file to base64 for API consumption
    const imageData = await fileToDataURL(imageFile);
    
    const response = await fetch(`${getApiBaseUrl()}/enhance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageData,
        scale: options.scale,
        face_enhance: options.face_enhance,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error enhancing image:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to enhance image');
  }
};

/**
 * Get prediction status and result via our backend API
 */
export const getPredictionStatus = async (predictionId: string): Promise<EnhancementResult> => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/prediction/${predictionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error getting prediction status:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to get prediction status');
  }
};

/**
 * Cancel a running prediction via our backend API
 */
export const cancelPrediction = async (predictionId: string): Promise<void> => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/prediction/${predictionId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error canceling prediction:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to cancel prediction');
  }
};

/**
 * Convert File to Data URL for API consumption with automatic resizing
 */
const fileToDataURL = async (file: File): Promise<string> => {
  // Check if image needs resizing based on file size (> 5MB) or dimensions
  const needsResize = file.size > 5 * 1024 * 1024; // 5MB
  
  if (needsResize) {
    const resizedFile = await resizeImage(file, 1500, 1500); // Max 1500x1500
    return convertFileToDataURL(resizedFile);
  }
  
  return convertFileToDataURL(file);
};

/**
 * Basic file to data URL conversion
 */
const convertFileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Resize image to prevent GPU memory issues
 */
const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'));
            return;
          }
          
          const resizedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          
          resolve(resizedFile);
        },
        'image/jpeg',
        0.8 // 80% quality
      );
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Download enhanced image
 */
export const downloadImage = async (url: string, filename: string): Promise<void> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Error downloading image:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to download image');
  }
};

/**
 * Poll prediction until completion
 */
export const pollPrediction = async (
  predictionId: string,
  onUpdate?: (result: EnhancementResult) => void,
  maxRetries: number = 60,
  interval: number = 2000
): Promise<EnhancementResult> => {
  let retries = 0;
  
  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const result = await getPredictionStatus(predictionId);
        
        if (onUpdate) {
          onUpdate(result);
        }
        
        if (result.status === 'succeeded' || result.status === 'failed' || result.status === 'canceled') {
          resolve(result);
          return;
        }
        
        retries++;
        if (retries >= maxRetries) {
          reject(new Error('Prediction polling timeout'));
          return;
        }
        
        setTimeout(poll, interval);
      } catch (error) {
        reject(error);
      }
    };
    
    poll();
  });
};
