import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedBackground: React.FC = () => {
  return (
    <>
      {/* Static Background Elements */}
      <div className="fixed inset-0 z-0">
        {/* Primary Gradient Orbs */}
        <motion.div 
          className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"
          animate={{ 
            x: [0, 50, 0], 
            y: [0, 30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        
        <motion.div 
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{ 
            x: [0, -40, 0], 
            y: [0, -20, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 1
          }}
        />
        
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl"
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.3, 1]
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        />

        {/* Radial Gradient Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.05),transparent_50%)]"></div>
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div 
            className="w-full h-full" 
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px), 
                               linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }}
          ></div>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 5 + 3,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </>
  );
};
