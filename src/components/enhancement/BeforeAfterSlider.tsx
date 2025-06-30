import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  className?: string;
  onModalOpen?: () => void;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  className = '',
  onModalOpen,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imgDimensions, setImgDimensions] = useState<{ width: number; height: number } | null>(null);
  
  // Motion values for the slider position (start at 50%)
  const sliderX = useMotionValue(50);
  const sliderPercent = useTransform(sliderX, (value) => `${value}%`);
  
  // Transform the slider position to clip the after image
  const clipPath = useTransform(
    sliderX,
    (value) => `inset(0 ${100 - value}% 0 0)`
  );

  // Handle pointer/touch events for dragging
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handlePointerMove = (e: PointerEvent | TouchEvent) => {
      if (!isDragging) return;
      
      const rect = container.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      sliderX.set(percentage);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
      document.addEventListener('touchmove', handlePointerMove);
      document.addEventListener('touchend', handlePointerUp);
    }

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('touchmove', handlePointerMove);
      document.removeEventListener('touchend', handlePointerUp);
    };
  }, [isDragging, sliderX]);

  const handlePointerDown = (e: React.PointerEvent | React.TouchEvent) => {
    const container = containerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    
    sliderX.set(percentage);
    setIsDragging(true);
    e.preventDefault();
  };

  const handleDrag = (_: any, info: PanInfo) => {
    const container = containerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const currentX = sliderX.get();
    const deltaPercent = (info.delta.x / rect.width) * 100;
    const newPercent = Math.max(0, Math.min(100, currentX + deltaPercent));
    sliderX.set(newPercent);
  };

  return (
    <motion.div 
      className={`relative overflow-hidden rounded-2xl group ${className}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      style={imgDimensions ? {
        aspectRatio: `${imgDimensions.width} / ${imgDimensions.height}`,
        maxWidth: '100%',
        maxHeight: '60vh',
        width: 'auto',
        height: 'auto',
        background: 'transparent',
      } : {}}
    >
      <div
        ref={containerRef}
        className="relative w-full h-full cursor-ew-resize select-none"
        onPointerDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        style={{ touchAction: 'none' }}
      >
        {/* Before Image (Background) */}
        <div className="absolute inset-0">
          <img
            src={beforeImage}
            alt="Original Image"
            className="w-full h-full object-contain"
            onLoad={e => {
              const img = e.currentTarget;
              setImgDimensions({ width: img.naturalWidth, height: img.naturalHeight });
            }}
            draggable={false}
          />
          {/* Before Label */}
          <motion.div 
            className="absolute top-4 left-4 px-3 py-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/20"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-white text-sm font-semibold">Original</span>
          </motion.div>
        </div>

        {/* After Image (Clipped) */}
        <motion.div
          className="absolute inset-0"
          style={{ clipPath }}
        >
          <img
            src={afterImage}
            alt="Enhanced Image"
            className="w-full h-full object-contain"
            draggable={false}
          />
          {/* After Label */}
          <motion.div 
            className="absolute top-4 right-4 px-3 py-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/20"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-white text-sm font-semibold">Enhanced</span>
          </motion.div>
        </motion.div>

        {/* Slider Line */}
        <motion.div
          className="absolute top-0 bottom-0 w-0.5 bg-white/80 shadow-2xl z-10 pointer-events-none"
          style={{
            left: sliderPercent,
            x: '-50%',
          }}
        />

        {/* Draggable Slider Handle */}
        <motion.div
          className="absolute top-0 bottom-0 w-12 z-20 flex items-center justify-center cursor-ew-resize"
          style={{
            left: sliderPercent,
            x: '-50%',
          }}
          drag="x"
          dragConstraints={containerRef}
          dragElastic={0}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
          onDrag={handleDrag}
          whileHover={{ scale: 1.05 }}
          whileDrag={{ scale: 1.1 }}
        >
          {/* Handle Button */}
          <motion.div
            className="w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center border-2 border-white/20 backdrop-blur-sm"
            whileHover={{ scale: 1.1, boxShadow: '0 8px 32px rgba(255,255,255,0.3)' }}
            whileTap={{ scale: 0.95 }}
            animate={{
              scale: isDragging ? 1.1 : 1,
              boxShadow: isDragging 
                ? '0 8px 32px rgba(255,255,255,0.4)' 
                : '0 4px 20px rgba(0,0,0,0.3)'
            }}
          >
            <div className="flex items-center gap-0.5">
              <ChevronLeft className="h-4 w-4 text-gray-700" />
              <ChevronRight className="h-4 w-4 text-gray-700" />
            </div>
          </motion.div>
        </motion.div>

        {/* Expand Button */}
        {onModalOpen && (
          <motion.button
            onClick={onModalOpen}
            className="absolute top-4 right-1/2 translate-x-1/2 p-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/20 text-white hover:text-indigo-400 transition-all duration-300"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : -20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="View Full Size"
          >
            <Maximize2 className="h-4 w-4" />
          </motion.button>
        )}

        {/* Instructions */}
        <motion.div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: isDragging ? 0 : (isHovered ? 1 : 0.7),
            y: isDragging ? 20 : 0 
          }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-white text-sm font-medium">
            {window.innerWidth <= 768 ? 'Touch and drag to compare' : 'Click and drag to compare'}
          </span>
        </motion.div>

        {/* Touch indicator for mobile */}
        <motion.div
          className="absolute inset-0 pointer-events-none md:hidden"
          initial={{ opacity: 1 }}
          animate={{ opacity: isDragging ? 0 : 0.3 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-white/30 rounded-full">
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-white/40 rounded-full flex items-center justify-center"
              style={{ left: sliderPercent, x: '-50%' }}
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.4, 0.7, 0.4]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="w-2 h-2 bg-white rounded-full" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
