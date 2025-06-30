import React, { useCallback, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image as ImageIcon, X, Sparkles, Zap } from 'lucide-react';
import { useEnhanceStore } from '../../store/useEnhanceStore';

interface FileUploadProps {
  onFileSelect?: (file: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const { setCurrentImage, currentImage } = useEnhanceStore();
  const [isHovering, setIsHovering] = useState(false);
  const [imgDimensions, setImgDimensions] = useState<{ width: number; height: number } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const imageFile = {
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        originalName: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
      };
      
      setCurrentImage(imageFile);
      onFileSelect?.(file);
    }
  }, [setCurrentImage, onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.bmp', '.tiff']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const removeCurrentImage = () => {
    if (currentImage) {
      URL.revokeObjectURL(currentImage.preview);
      setCurrentImage(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {!currentImage ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            {/* Upload Area */}
            <motion.div
              className={`
                relative drop-zone rounded-3xl p-12 text-center cursor-pointer
                transition-all duration-500 ease-out overflow-hidden
                ${isDragActive ? 'drag-active scale-105' : ''}
              `}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              {...(getRootProps() as any)}
            >
              <input {...getInputProps()} />
              
              {/* Animated Background Grid */}
              <div className="absolute inset-0 opacity-10">
                <div 
                  className="w-full h-full animate-pulse" 
                  style={{
                    backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px), 
                                     linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)`,
                    backgroundSize: '20px 20px'
                  }}
                ></div>
              </div>

              {/* Upload Icon with Animation */}
              <motion.div
                className="relative mx-auto w-24 h-24 mb-6"
                animate={{
                  y: isHovering || isDragActive ? -10 : 0,
                  rotate: isDragActive ? 10 : 0,
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-24 h-24 glass rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
                  <motion.div
                    animate={isDragActive ? { scale: [1, 1.2, 1], rotate: [0, 180, 360] } : {}}
                    transition={{ duration: 0.6 }}
                  >
                    {isDragActive ? (
                      <Zap className="h-10 w-10 text-indigo-400" />
                    ) : (
                      <Upload className="h-10 w-10 text-indigo-400" />
                    )}
                  </motion.div>
                </div>
              </motion.div>

              {/* Upload Text */}
              <motion.div
                animate={{ y: isDragActive ? -5 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-2xl font-semibold text-white mb-3">
                  {isDragActive ? 'Drop your image here!' : 'Upload Your Image'}
                </h3>
                <p className="text-white/70 mb-6 max-w-md mx-auto leading-relaxed">
                  Drag and drop your image here, or click to browse. We support JPG, PNG, WebP formats up to 50MB.
                </p>
              </motion.div>

              {/* Upload Button */}
              <motion.button
                className="inline-flex items-center gap-3 px-10 py-5 glass rounded-2xl border-2 border-transparent bg-gradient-to-r from-indigo-700 to-blue-900 text-white font-semibold shadow-2xl shadow-indigo-900/30 transition-all duration-300 relative overflow-hidden group hover:from-blue-800 hover:to-indigo-900"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <ImageIcon className="h-5 w-5" />
                Choose Image
              </motion.button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            {/* Image Preview */}
            <div
              className="mx-auto rounded-3xl overflow-hidden border border-white/10 flex items-center justify-center"
              style={imgDimensions ? {
                aspectRatio: `${imgDimensions.width} / ${imgDimensions.height}`,
                maxWidth: '100%',
                maxHeight: '60vh',
                width: 'auto',
                height: 'auto',
                background: 'transparent',
              } : {}}
            >
              <img
                src={currentImage.preview}
                alt="Preview"
                ref={imgRef}
                className="block max-w-full max-h-full rounded-3xl"
                style={{ display: 'block' }}
                onLoad={e => {
                  const img = e.currentTarget;
                  setImgDimensions({ width: img.naturalWidth, height: img.naturalHeight });
                }}
              />
            </div>

              {/* Remove Button */}
              <motion.button
                onClick={removeCurrentImage}
                className="absolute top-4 right-4 z-10 p-2 glass rounded-xl border border-white/20 hover:border-red-400/50 text-white/70 hover:text-red-400 transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-4 w-4" />
              </motion.button>

              {/* File Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-white truncate mr-4">
                    {currentImage.originalName}
                  </h4>
                  <span className="px-3 py-1 glass text-sm text-white/70 rounded-full border border-white/10">
                    {formatFileSize(currentImage.size)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <ImageIcon className="h-4 w-4" />
                  <span>{currentImage.type}</span>
                  <span>•</span>
                  <span>Ready for enhancement</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
