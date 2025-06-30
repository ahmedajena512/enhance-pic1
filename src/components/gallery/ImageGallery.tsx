import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Download, Trash2, Eye, Calendar } from 'lucide-react';
import { useEnhanceStore } from '../../store/useEnhanceStore';
import { BeforeAfterSlider } from '../enhancement/BeforeAfterSlider';

export const ImageGallery: React.FC = () => {
  const { imageHistory, removeEnhancedImage } = useEnhanceStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'failed'>('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const filteredImages = imageHistory.filter(image => {
    const matchesSearch = image.originalImageId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || image.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleDownload = (image: any) => {
    if (image.enhancedUrl) {
      const link = document.createElement('a');
      link.href = image.enhancedUrl;
      link.download = `enhanced_${image.originalImageId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Enhancement History</h2>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
            <input
              type="text"
              placeholder="Search images..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-indigo-400"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-indigo-400"
          >
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Gallery Grid */}
      <AnimatePresence mode="wait">
        {filteredImages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 mx-auto mb-4 glass rounded-2xl flex items-center justify-center">
              <Eye className="h-8 w-8 text-white/60" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No images found</h3>
            <p className="text-white/60">
              {imageHistory.length === 0 
                ? "Start enhancing images to see them here" 
                : "Try adjusting your search or filter criteria"
              }
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredImages.map((image) => (
              <motion.div
                key={image.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="card-glass rounded-xl overflow-hidden group"
              >
                {/* Image Preview */}
                <div className="relative h-48">
                  {image.enhancedUrl ? (
                    <img
                      src={image.enhancedUrl}
                      alt="Enhanced"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                      <span className="text-white/60">No preview</span>
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      image.status === 'completed' 
                        ? 'bg-green-500/20 text-green-400' 
                        : image.status === 'failed'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {image.status}
                    </span>
                  </div>
                  
                  {/* Actions */}
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {image.enhancedUrl && (
                      <button
                        onClick={() => handleDownload(image)}
                        className="w-8 h-8 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => removeEnhancedImage(image.id)}
                      className="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Image Info */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(image.createdAt)}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Scale:</span>
                      <span className="text-white">{image.settings.scale}x</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Face Enhance:</span>
                      <span className="text-white">{image.settings.face_enhance ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                  
                  {image.enhancedUrl && (
                    <button
                      onClick={() => setSelectedImage(image.id)}
                      className="w-full mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm"
                    >
                      View Comparison
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Before/After Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Before & After Comparison</h3>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="w-8 h-8 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center"
                >
                  ×
                </button>
              </div>
              
              {selectedImage && (
                <BeforeAfterSlider
                  beforeImage="/placeholder-before.jpg"
                  afterImage="/placeholder-after.jpg"
                  className="w-full"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 