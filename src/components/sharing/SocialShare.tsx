import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Share2, 
  Copy, 
  Download, 
  Twitter, 
  Facebook, 
  Instagram, 
  LinkIcon, 
  Check,
  X,
  ExternalLink
} from 'lucide-react';

interface SocialShareProps {
  imageUrl: string;
  originalImage?: string;
  onClose?: () => void;
  isOpen: boolean;
}

export const SocialShare: React.FC<SocialShareProps> = ({ 
  imageUrl, 
  originalImage,
  onClose, 
  isOpen 
}) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleShare = async (platform: string) => {
    const shareText = "🚀 Amazing AI-enhanced image created with Enhance Pics! ✨ Transform your photos with cutting-edge AI technology.";
    const shareUrl = window.location.href;

    switch (platform) {
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
          '_blank',
          'width=600,height=400'
        );
        break;
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
          '_blank',
          'width=600,height=400'
        );
        break;
      case 'linkedin':
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
          '_blank',
          'width=600,height=400'
        );
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(imageUrl);
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        } catch (error) {
          console.error('Failed to copy:', error);
        }
        break;
      default:
        break;
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `enhanced_image_${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2000);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Enhanced Image - Enhance Pics',
          text: 'Check out this amazing AI-enhanced image!',
          url: window.location.href,
        });
      } catch (error) {
        console.error('Native share failed:', error);
      }
    }
  };

  return (
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
            className="bg-black/90 backdrop-blur-xl rounded-3xl border border-white/10 max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <Share2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Share & Download</h3>
                    <p className="text-white/60 text-sm">Share your enhanced image</p>
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
            </div>

            {/* Image Preview */}
            <div className="p-6 border-b border-white/10">
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src={imageUrl}
                  alt="Enhanced Image"
                  className="w-full h-32 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-green-500/20 backdrop-blur-sm rounded-lg border border-green-400/30">
                  <span className="text-green-400 text-xs font-medium">✨ AI Enhanced</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6">
              {/* Primary Actions */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <motion.button
                  onClick={handleDownload}
                  disabled={downloadSuccess}
                  className="flex flex-col items-center gap-2 p-4 glass rounded-2xl border border-white/10 hover:border-green-400/50 text-white hover:text-green-400 transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {downloadSuccess ? (
                    <>
                      <Check className="h-6 w-6 text-green-400" />
                      <span className="text-sm font-medium text-green-400">Downloaded!</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-6 w-6" />
                      <span className="text-sm font-medium">Download</span>
                    </>
                  )}
                </motion.button>

                <motion.button
                  onClick={() => handleShare('copy')}
                  disabled={copySuccess}
                  className="flex flex-col items-center gap-2 p-4 glass rounded-2xl border border-white/10 hover:border-blue-400/50 text-white hover:text-blue-400 transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {copySuccess ? (
                    <>
                      <Check className="h-6 w-6 text-green-400" />
                      <span className="text-sm font-medium text-green-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-6 w-6" />
                      <span className="text-sm font-medium">Copy Link</span>
                    </>
                  )}
                </motion.button>
              </div>

              {/* Social Platforms */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-white/70 mb-3">Share on social media</h4>
                <div className="grid grid-cols-3 gap-3">
                  <motion.button
                    onClick={() => handleShare('twitter')}
                    className="flex flex-col items-center gap-2 p-3 glass rounded-xl border border-white/10 hover:border-blue-400/50 text-white hover:text-blue-400 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Twitter className="h-5 w-5" />
                    <span className="text-xs font-medium">Twitter</span>
                  </motion.button>

                  <motion.button
                    onClick={() => handleShare('facebook')}
                    className="flex flex-col items-center gap-2 p-3 glass rounded-xl border border-white/10 hover:border-blue-600/50 text-white hover:text-blue-600 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Facebook className="h-5 w-5" />
                    <span className="text-xs font-medium">Facebook</span>
                  </motion.button>

                  <motion.button
                    onClick={() => handleShare('linkedin')}
                    className="flex flex-col items-center gap-2 p-3 glass rounded-xl border border-white/10 hover:border-blue-500/50 text-white hover:text-blue-500 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ExternalLink className="h-5 w-5" />
                    <span className="text-xs font-medium">LinkedIn</span>
                  </motion.button>
                </div>

                {/* Native Share (Mobile) */}
                {navigator.share && (
                  <motion.button
                    onClick={handleNativeShare}
                    className="w-full flex items-center justify-center gap-2 p-3 glass rounded-xl border border-white/10 hover:border-indigo-400/50 text-white hover:text-indigo-400 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Share2 className="h-4 w-4" />
                    <span className="text-sm font-medium">More sharing options</span>
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
