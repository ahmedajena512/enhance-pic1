import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock,
  Image as ImageIcon,
  Eye
} from 'lucide-react';
import { useEnhanceStore, EnhancedImage } from '../../store/useEnhanceStore';
import { format } from 'date-fns';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type FilterStatus = 'all' | 'completed' | 'failed';

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, onClose }) => {
  const { imageHistory, removeEnhancedImage, updateEnhancedImage } = useEnhanceStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedImage, setSelectedImage] = useState<EnhancedImage | null>(null);
  const setImageHistory = useEnhanceStore((state) => state.clearHistory);
  const addEnhancedImage = useEnhanceStore((state) => state.addEnhancedImage);

  // Filter and search logic
  const filteredHistory = useMemo(() => {
    let filtered = imageHistory;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    // Search functionality (by date or filename if available)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        format(item.createdAt, 'PPP').toLowerCase().includes(query) ||
        format(item.createdAt, 'pp').toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query)
      );
    }

    // Sort by creation date (newest first)
    return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [imageHistory, searchQuery, filterStatus]);

  const handleDownload = async (item: EnhancedImage) => {
    if (item.enhancedUrl || item.downloadUrl) {
      try {
        const url = item.enhancedUrl || item.downloadUrl!;
        const response = await fetch(url);
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `enhanced_${item.id}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      } catch (error) {
        console.error('Download failed:', error);
      }
    }
  };

  const handleDelete = (item: EnhancedImage) => {
    removeEnhancedImage(item.id);
  };

  const handleReviewChange = async (item: EnhancedImage, review: string) => {
    // Update local store
    updateEnhancedImage(item.id, { review });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'failed':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-black/90 backdrop-blur-xl rounded-3xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Enhancement History</h2>
                      <p className="text-white/60">
                        {filteredHistory.length} of {imageHistory.length} enhancements
                      </p>
                    </div>
                  </div>
                  <motion.button
                    onClick={onClose}
                    className="p-2 glass rounded-xl border border-white/10 hover:border-red-400/50 text-white/70 hover:text-white transition-all duration-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>

                {/* Search and Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <input
                      type="text"
                      placeholder="Search by date or ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 glass rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/40 focus:border-indigo-400/50 focus:outline-none transition-all duration-300"
                    />
                  </div>
                  <div className="flex gap-2">
                    {(['all', 'completed', 'failed'] as FilterStatus[]).map((status) => (
                      <motion.button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                          filterStatus === status
                            ? 'bg-indigo-500 text-white border border-indigo-400'
                            : 'glass border border-white/10 text-white/70 hover:text-white hover:border-indigo-400/50'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* History List */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {filteredHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <ImageIcon className="h-16 w-16 text-white/20 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white/60 mb-2">
                      {imageHistory.length === 0 ? 'No enhancements yet' : 'No results found'}
                    </h3>
                    <p className="text-white/40">
                      {imageHistory.length === 0 
                        ? 'Start enhancing images to see your history here'
                        : 'Try adjusting your search or filter criteria'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredHistory.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
                          {/* Image Preview */}
                          <img
                            src={item.enhancedUrl || item.downloadUrl}
                            alt="Enhanced preview"
                            className="w-20 h-20 object-cover rounded-xl border border-white/10"
                          />
                          <div className="flex-1 min-w-0">
                            {/* Image Link */}
                            <a
                              href={item.enhancedUrl || item.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-indigo-400 hover:underline text-xs truncate max-w-xs"
                            >
                              {item.enhancedUrl || item.downloadUrl}
                            </a>
                            {/* Review (editable) */}
                            <div className="mt-2">
                              <input
                                type="text"
                                value={item.review || ''}
                                onChange={e => handleReviewChange(item, e.target.value)}
                                placeholder="Add a review..."
                                className="w-full bg-transparent border-b border-white/10 focus:border-indigo-400/50 text-white/80 text-sm py-1 px-0 outline-none transition-all duration-200"
                                maxLength={120}
                              />
                            </div>
                          </div>
                          {/* Status Icon and Actions */}
                          <div className="flex flex-col items-end gap-2 min-w-[60px]">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(item.status)}`}>{getStatusIcon(item.status)}{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
                            <div className="flex gap-2 mt-2">
                              <button onClick={() => handleDownload(item)} className="p-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-white transition-all duration-200" title="Download"><Download className="h-4 w-4" /></button>
                              <button onClick={() => handleDelete(item)} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-white transition-all duration-200" title="Delete"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage.enhancedUrl}
                alt="Enhanced Image"
                className="w-full h-full object-contain"
              />
              <motion.button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm rounded-xl border border-white/20 text-white hover:text-red-400 transition-colors duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-5 w-5" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
