import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './components/layout/Header';
import { AnimatedBackground } from './components/ui/AnimatedBackground';
import { FileUpload } from './components/upload/FileUpload';
import { EnhancementControls } from './components/enhancement/EnhancementControls';
import { BeforeAfterSlider } from './components/enhancement/BeforeAfterSlider';
import { HistoryPanel } from './components/history/HistoryPanel';
import { SocialShare } from './components/sharing/SocialShare';
import { useEnhanceStore } from './store/useEnhanceStore';
import { enhanceImage, pollPrediction } from './services/replicateService';
import { Download, Sparkles, Clock, CheckCircle, XCircle, Share2, Eye } from 'lucide-react';
import { supabase } from './supabaseClient';

// Custom Floating Ball Component
const FloatingBall: React.FC = () => {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end">
      <a
        href="https://www.facebook.com/ahmedAJ512"
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex items-center gap-3 px-5 py-3 glass rounded-full border-2 border-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-xl backdrop-blur-xl animate-fade-in-up cursor-pointer"
        style={{ textDecoration: 'none' }}
        tabIndex={0}
      >
        <span className="text-white font-medium text-sm whitespace-nowrap">Created by Ahmed Ajena</span>
        <button
          className="ml-2 p-1 rounded-full hover:bg-white/10 text-white/60 hover:text-red-400 transition-colors duration-200"
          onClick={e => { e.stopPropagation(); e.preventDefault(); setVisible(false); }}
          title="Close"
        >
          ×
        </button>
      </a>
    </div>
  );
};

function useSupabaseUser() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    // Get current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    // Listen for changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);
  return user;
}

async function saveUserHistory(userId, enhancedImage) {
  console.log('Saving to Supabase:', { userId, enhancedImage });
  const { error } = await supabase
    .from('history')
    .insert([{
      user_id: userId,
      enhanced_url: enhancedImage.enhancedUrl,
      original_image_id: enhancedImage.originalImageId,
      settings: enhancedImage.settings,
      status: enhancedImage.status,
      download_url: enhancedImage.downloadUrl,
      review: enhancedImage.review || ''
    }]);
  if (error) {
    console.error('Error saving history:', error);
  } else {
    console.log('Saved history to Supabase!');
  }
}

function App() {
  const { 
    currentImage, 
    enhancementSettings, 
    isLoading, 
    setLoading, 
    setError, 
    addEnhancedImage,
    updateEnhancedImage,
    enhancedImages
  } = useEnhanceStore();
  
  const [enhancedImageUrl, setEnhancedImageUrl] = useState<string | null>(null);
  const [enhancementStatus, setEnhancementStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle');
  const [showHistory, setShowHistory] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  const user = useSupabaseUser();
  console.log('App user:', user);
  const setImageHistory = useEnhanceStore((state) => state.clearHistory);

  // Fetch user history from Supabase on login
  useEffect(() => {
    async function fetchHistory() {
      if (user) {
        const { data, error } = await supabase
          .from('history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (!error && data) {
          setImageHistory();
          data.forEach(addEnhancedImage);
          console.log('Fetched data:', data, 'Error:', error);
        }
      } else {
        setImageHistory();
      }
    }
    fetchHistory();
  }, [user]);

  const handleFileSelect = useCallback((file: File) => {
    // Reset previous enhancement
    setEnhancedImageUrl(null);
    setEnhancementStatus('idle');
    setError(null);
  }, [setError]);

  const handleEnhance = useCallback(async () => {
    if (!currentImage) {
      setError('Please select an image first');
      return;
    }

    try {
      setLoading(true);
      setEnhancementStatus('processing');
      setError(null);

      // Create enhanced image record
      const enhancedImageId = crypto.randomUUID();
      const enhancedImage = {
        id: enhancedImageId,
        originalImageId: currentImage.id,
        enhancedUrl: '',
        settings: enhancementSettings,
        status: 'processing' as const,
        createdAt: new Date(),
      };

      addEnhancedImage(enhancedImage);

      // Start enhancement
      const result = await enhanceImage(currentImage.file, enhancementSettings);
      
      // Update with prediction ID
      updateEnhancedImage(enhancedImageId, { 
        predictionId: result.predictionId 
      });

      // Poll for completion
      const finalResult = await pollPrediction(
        result.predictionId,
        (update) => {
          updateEnhancedImage(enhancedImageId, {
            status: update.status === 'succeeded' ? 'completed' :
                    update.status === 'failed' ? 'failed' : 'processing'
          });
        }
      );

      if (finalResult.status === 'succeeded' && finalResult.outputUrl) {
        setEnhancedImageUrl(finalResult.outputUrl);
        setEnhancementStatus('completed');
        updateEnhancedImage(enhancedImageId, {
          status: 'completed',
          enhancedUrl: finalResult.outputUrl,
          downloadUrl: finalResult.outputUrl
        });
        if (user) {
          saveUserHistory(user.id, enhancedImage);
        }
      } else {
        throw new Error(finalResult.error || 'Enhancement failed');
      }

    } catch (error) {
      console.error('Enhancement error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Enhancement failed';
      
      // Check if it's a GPU memory error and suggest resizing
      if (errorMessage.includes('greater than the max size that fits in GPU memory') || 
          errorMessage.includes('Image too large')) {
        setError('Image is too large for processing. The image has been automatically resized for better compatibility. Please try again.');
      } else {
        setError(errorMessage);
      }
      
      setEnhancementStatus('failed');
    } finally {
      setLoading(false);
    }
  }, [currentImage, enhancementSettings, setLoading, setError, addEnhancedImage, updateEnhancedImage, user]);

  const handleDownload = useCallback(async () => {
    if (enhancedImageUrl && currentImage) {
      try {
        const response = await fetch(enhancedImageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `enhanced_${currentImage.originalName}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        setError('Failed to download image');
      }
    }
  }, [enhancedImageUrl, currentImage, setError]);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Header */}
      <Header onHistoryClick={() => setShowHistory(true)} />
      
      {/* History Panel */}
      <HistoryPanel isOpen={showHistory} onClose={() => setShowHistory(false)} />
      {/* Share Modal */}
      <SocialShare 
        isOpen={showShareModal}
        imageUrl={enhancedImageUrl || ''}
        originalImage={currentImage?.preview}
        onClose={() => setShowShareModal(false)}
      />
      
      {/* Custom Floating Ball */}
      <FloatingBall />
      
      {/* Main Content */}
      <main className="relative z-10 min-h-screen">
        {/* Hero Section */}
        <section className="pt-20 pb-32">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            
            {/* Hero Header */}
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.h1 
                className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span className="block text-white">Enhance your</span>
                <span className="block gradient-text">images with AI</span>
              </motion.h1>
            </motion.div>

            {/* Main Enhancement Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              
              {/* Left Column - Upload & Controls */}
              <div className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  <FileUpload onFileSelect={handleFileSelect} />
                </motion.div>

                {currentImage && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <EnhancementControls 
                      onEnhance={handleEnhance}
                      disabled={!currentImage || isLoading}
                    />
                  </motion.div>
                )}
              </div>

              {/* Right Column - Results */}
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <AnimatePresence mode="wait">
                  {enhancementStatus === 'idle' && (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="card-glass rounded-3xl p-12 text-center"
                    >
                      <div className="w-20 h-20 mx-auto mb-6 glass rounded-2xl flex items-center justify-center">
                        <Sparkles className="h-10 w-10 text-indigo-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-3">
                        Enhanced Image Preview
                      </h3>
                      <p className="text-white/60">
                        Upload an image and customize your enhancement settings to see the AI-powered results here.
                      </p>
                    </motion.div>
                  )}

                  {enhancementStatus === 'processing' && (
                    <motion.div
                      key="processing"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="card-glass rounded-3xl p-12 text-center"
                    >
                      <motion.div
                        className="w-20 h-20 mx-auto mb-6 glass rounded-2xl flex items-center justify-center"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Clock className="h-10 w-10 text-purple-400" />
                      </motion.div>
                      <h3 className="text-xl font-semibold text-white mb-3">
                        Enhancing Your Image
                      </h3>
                      <p className="text-white/60 mb-6">
                        Our AI is working its magic. This usually takes 30-60 seconds.
                      </p>
                      <div className="w-full glass rounded-full h-2 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </div>
                    </motion.div>
                  )}

                  {enhancementStatus === 'completed' && enhancedImageUrl && (
                    <motion.div
                      key="completed"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="card-glass rounded-3xl p-6 space-y-6"
                    >
                      {/* Success Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-green-400">
                          <CheckCircle className="h-6 w-6" />
                          <span className="font-semibold">Enhancement Complete!</span>
                        </div>
                        <motion.button
                          onClick={() => setShowComparisonModal(true)}
                          className="p-2 glass rounded-xl border border-white/10 hover:border-indigo-400/50 text-white/70 hover:text-indigo-400 transition-all duration-300"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="View Full Size Comparison"
                        >
                          <Eye className="h-4 w-4" />
                        </motion.button>
                      </div>

                      {/* Before/After Comparison Slider */}
                      {currentImage && (
                        <BeforeAfterSlider
                          beforeImage={currentImage.preview}
                          afterImage={enhancedImageUrl}
                          className="h-64"
                          onModalOpen={() => setShowComparisonModal(true)}
                        />
                      )}

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-4">
                        <motion.button
                          onClick={handleDownload}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg shadow-green-500/25"
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </motion.button>
                        
                        <motion.button
                          onClick={() => setShowShareModal(true)}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg shadow-indigo-500/25"
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Share2 className="h-4 w-4" />
                          Share
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {enhancementStatus === 'failed' && (
                    <motion.div
                      key="failed"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="card-glass rounded-3xl p-12 text-center"
                    >
                      <div className="w-20 h-20 mx-auto mb-6 glass rounded-2xl flex items-center justify-center">
                        <XCircle className="h-10 w-10 text-red-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-3">
                        Enhancement Failed
                      </h3>
                      <p className="text-white/60 mb-6">
                        Something went wrong during processing. Please try again.
                      </p>
                      <motion.button
                        onClick={() => setEnhancementStatus('idle')}
                        className="px-6 py-3 glass rounded-xl border border-white/20 hover:border-indigo-400/50 text-white transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Try Again
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Full Size Comparison Modal */}
      <AnimatePresence>
        {showComparisonModal && currentImage && enhancedImageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setShowComparisonModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <BeforeAfterSlider
                beforeImage={currentImage.preview}
                afterImage={enhancedImageUrl}
                className="h-[70vh]"
              />
              <motion.button
                onClick={() => setShowComparisonModal(false)}
                className="absolute top-4 right-4 p-3 bg-black/60 backdrop-blur-md rounded-xl border border-white/20 text-white hover:text-red-400 transition-colors duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <XCircle className="h-6 w-6" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
