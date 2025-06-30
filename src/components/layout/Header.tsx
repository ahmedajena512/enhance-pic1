import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, History, Settings, LogIn, LogOut } from 'lucide-react';

interface HeaderProps {
  onHistoryClick?: () => void;
  onSettingsClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onHistoryClick, 
  onSettingsClick
}) => {
  return (
    <motion.header 
      className="relative z-50 border-b border-white/10 glass sticky top-0"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3 text-lg font-semibold group"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25 transition-all duration-300 group-hover:shadow-indigo-500/40 group-hover:scale-105">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              {/* Floating glow effect */}
              <div className="absolute inset-0 w-10 h-10 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-2xl blur-xl animate-breathe"></div>
            </div>
            <span className="text-white font-semibold gradient-text">
              Enhance Pics
            </span>
          </motion.div>

          {/* Navigation Actions */}
          <motion.div 
            className="flex items-center gap-2 sm:gap-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* History Button */}
            <motion.button
              onClick={onHistoryClick}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 glass rounded-xl border border-white/10 hover:border-indigo-400/50 text-white/70 hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              title="View Enhancement History"
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline text-sm font-medium">History</span>
            </motion.button>
          </motion.div>
        </nav>
      </div>
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-blue-500/5 -z-10"></div>
    </motion.header>
  );
};
