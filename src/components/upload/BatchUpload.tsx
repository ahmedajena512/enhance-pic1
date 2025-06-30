import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, X, CheckCircle, Clock, AlertCircle, Download } from 'lucide-react';
import { useEnhanceStore } from '../../store/useEnhanceStore';
import { enhanceImage, pollPrediction } from '../../services/replicateService';

interface BatchImage {
  id: string;
  file: File;
  preview: string;
  originalName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  enhancedUrl?: string;
  error?: string;
}

export const BatchUpload: React.FC = () => {
  const [batchImages, setBatchImages] = useState<BatchImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { enhancementSettings } = useEnhanceStore();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages: BatchImage[] = acceptedFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      originalName: file.name,
      status: 'pending'
    }));

    setBatchImages(prev => [...prev, ...newImages]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.tiff']
    },
    multiple: true
  });

  const removeImage = (id: string) => {
    setBatchImages(prev => {
      const image = prev.find(img => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const processBatch = async () => {
    if (batchImages.length === 0) return;

    setIsProcessing(true);
    const pendingImages = batchImages.filter(img => img.status === 'pending');

    for (const image of pendingImages) {
      try {
        setBatchImages(prev => 
          prev.map(img => 
            img.id === image.id 
              ? { ...img, status: 'processing' }
              : img
          )
        );

        const result = await enhanceImage(image.file, enhancementSettings);
        const finalResult = await pollPrediction(result.predictionId);

        if (finalResult.status === 'succeeded' && finalResult.outputUrl) {
          setBatchImages(prev => 
            prev.map(img => 
              img.id === image.id 
                ? { ...img, status: 'completed', enhancedUrl: finalResult.outputUrl }
                : img
            )
          );
        } else {
          throw new Error(finalResult.error || 'Enhancement failed');
        }

      } catch (error) {
        setBatchImages(prev => 
          prev.map(img => 
            img.id === image.id 
              ? { ...img, status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' }
              : img
          )
        );
      }
    }

    setIsProcessing(false);
  };

  const downloadAll = () => {
    const completedImages = batchImages.filter(img => img.status === 'completed' && img.enhancedUrl);
    
    completedImages.forEach((image, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = image.enhancedUrl!;
        link.download = `enhanced_${image.originalName}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 100);
    });
  };

  const completedCount = batchImages.filter(img => img.status === 'completed').length;
  const failedCount = batchImages.filter(img => img.status === 'failed').length;
  const processingCount = batchImages.filter(img => img.status === 'processing').length;

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragActive 
            ? 'border-indigo-400 bg-indigo-50/10' 
            : 'border-white/20 hover:border-indigo-400/50'
        }`}
      >
        <input {...getInputProps()} />
        
        <motion.div
          className="w-16 h-16 mx-auto mb-4 glass rounded-2xl flex items-center justify-center"
          animate={{ y: isDragActive ? -5 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Upload className="h-8 w-8 text-indigo-400" />
        </motion.div>
        
        <h3 className="text-xl font-semibold text-white mb-2">
          {isDragActive ? 'Drop images here' : 'Upload Multiple Images'}
        </h3>
        <p className="text-white/60">
          Drag & drop multiple images or click to browse
        </p>
      </div>

      {batchImages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-4 items-center justify-between p-4 glass rounded-xl"
        >
          <div className="flex items-center gap-4 text-sm">
            <span className="text-white/80">Total: {batchImages.length}</span>
            <span className="text-green-400">✓ {completedCount}</span>
            <span className="text-yellow-400">⏳ {processingCount}</span>
            <span className="text-red-400">✗ {failedCount}</span>
          </div>
          
          <div className="flex gap-3">
            {completedCount > 0 && (
              <motion.button
                onClick={downloadAll}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="h-4 w-4" />
                Download All ({completedCount})
              </motion.button>
            )}
            
            {!isProcessing && (
            <motion.button
              onClick={processBatch}
                disabled={batchImages.filter(img => img.status === 'pending').length === 0}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
                Process All
            </motion.button>
            )}
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {batchImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {batchImages.map((image) => (
              <motion.div
                key={image.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative group card-glass rounded-xl overflow-hidden"
              >
                <div className="relative h-48">
                  <img
                    src={image.preview}
                    alt={image.originalName}
                    className="w-full h-full object-cover"
                  />
                  
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    {image.status === 'pending' && (
                      <div className="text-center">
                        <Clock className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                        <p className="text-white text-sm">Pending</p>
                      </div>
                    )}
                    
                    {image.status === 'processing' && (
                      <div className="text-center">
                        <motion.div
                          className="h-8 w-8 border-2 border-indigo-400 border-t-transparent rounded-full mx-auto mb-2"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <p className="text-white text-sm">Processing...</p>
                      </div>
                    )}
                    
                    {image.status === 'completed' && (
                      <div className="text-center">
                        <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                        <p className="text-white text-sm">Completed</p>
                      </div>
                    )}
                    
                    {image.status === 'failed' && (
                      <div className="text-center">
                        <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                        <p className="text-white text-sm">Failed</p>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => removeImage(image.id)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="p-3">
                  <p className="text-white text-sm font-medium truncate">
                    {image.originalName}
                  </p>
                  <p className="text-white/60 text-xs">
                    {(image.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 