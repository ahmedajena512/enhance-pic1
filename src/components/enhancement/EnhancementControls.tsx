import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sliders, Zap, Sparkles, Settings, Info } from 'lucide-react';
import { useEnhanceStore } from '../../store/useEnhanceStore';

interface EnhancementControlsProps {
  onEnhance?: () => void;
  disabled?: boolean;
}

export const EnhancementControls: React.FC<EnhancementControlsProps> = ({ 
  onEnhance, 
  disabled = false 
}) => {
  const { enhancementSettings, setEnhancementSettings, isLoading } = useEnhanceStore();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [editingScale, setEditingScale] = useState(false);
  const [scaleInput, setScaleInput] = useState(enhancementSettings.scale.toString());

  const scaleLabels: Record<number, string> = {
    1: '1x - Light Touch',
    2: '2x - Subtle',
    3: '3x - Balanced',
    4: '4x - Standard',
    5: '5x - Enhanced',
    6: '6x - Strong',
    7: '7x - Intense',
    8: '8x - Maximum',
    9: '9x - Ultra',
    10: '10x - Extreme'
  };

  const handleScaleChange = (value: number[]) => {
    setEnhancementSettings({ scale: parseFloat(value[0].toFixed(2)) });
  };

  const handleFaceEnhanceToggle = () => {
    setEnhancementSettings({ 
      face_enhance: !enhancementSettings.face_enhance 
    });
  };

  const getScaleLabel = (scale: number) => {
    if (Number.isInteger(scale) && scaleLabels[scale]) {
      return scaleLabels[scale];
    }
    return `${scale}x - Custom`;
  };

  const handleScaleDisplayClick = () => {
    setScaleInput(enhancementSettings.scale.toString());
    setEditingScale(true);
  };

  const handleScaleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScaleInput(e.target.value);
  };

  const handleScaleInputBlur = () => {
    let value = parseFloat(scaleInput);
    if (isNaN(value)) value = enhancementSettings.scale;
    value = Math.max(0, Math.min(10, value));
    setEnhancementSettings({ scale: value });
    setEditingScale(false);
  };

  const handleScaleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    } else if (e.key === 'Escape') {
      setEditingScale(false);
    }
  };

  return (
    <motion.div 
      className="w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="card-glass rounded-3xl p-8 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full border border-white/20"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span className="text-sm font-medium text-white/80">Enhancement Settings</span>
          </motion.div>
          
          <h3 className="text-2xl font-semibold text-white">
            Customize Your Enhancement
          </h3>
          <p className="text-white/60 max-w-md mx-auto">
            Adjust the enhancement level and enable face-specific improvements for optimal results.
          </p>
        </div>

        {/* Scale Control */}
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-lg font-medium text-white">
                <Sliders className="h-5 w-5 text-indigo-400" />
                Enhancement Scale
              </label>
              <motion.div
                className="px-4 py-2 glass rounded-xl border border-white/20 cursor-pointer"
                whileHover={{ scale: 1.05 }}
                onClick={handleScaleDisplayClick}
              >
                {editingScale ? (
                  <input
                    type="number"
                    min={0}
                    max={10}
                    step={0.01}
                    value={scaleInput}
                    onChange={handleScaleInputChange}
                    onBlur={handleScaleInputBlur}
                    onKeyDown={handleScaleInputKeyDown}
                    className="text-lg font-semibold gradient-text bg-transparent border-none outline-none w-16 text-center"
                    autoFocus
                  />
                ) : (
                <span className="text-lg font-semibold gradient-text">
                  {enhancementSettings.scale}x
                </span>
                )}
              </motion.div>
            </div>
            
            <div className="relative">
              {/* Custom Slider */}
              <div className="relative w-full h-3 glass rounded-full border border-white/20 overflow-hidden">
                <motion.div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
                  style={{ width: `${(enhancementSettings.scale / 10) * 100}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(enhancementSettings.scale / 10) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Slider Handle */}
                <motion.div
                  className="absolute top-1/2 w-6 h-6 -mt-3 bg-white rounded-full shadow-lg border-2 border-indigo-400 cursor-pointer"
                  style={{ left: `calc(${(enhancementSettings.scale / 10) * 100}% - 12px)` }}
                  whileHover={{ scale: 1.2 }}
                  whileDrag={{ scale: 1.3 }}
                />
              </div>
              
              {/* Scale Input */}
              <input
                type="range"
                min="0"
                max="10"
                step="0.01"
                value={enhancementSettings.scale}
                onChange={(e) => handleScaleChange([parseFloat(e.target.value)])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={disabled || isLoading}
              />
              
              {/* Scale Markers */}
              <div className="flex justify-between mt-3 text-xs text-white/50">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <motion.div
                    key={num}
                    className={`w-1 h-1 rounded-full ${
                      num <= enhancementSettings.scale ? 'bg-indigo-400' : 'bg-white/30'
                    }`}
                    animate={{
                      backgroundColor: num <= enhancementSettings.scale ? '#6366f1' : 'rgba(255,255,255,0.3)'
                    }}
                    transition={{ duration: 0.2 }}
                  />
                ))}
              </div>
            </div>
            
            {/* Scale Description */}
            <motion.p 
              className="text-sm text-white/70 text-center glass px-4 py-2 rounded-xl border border-white/10"
              key={enhancementSettings.scale}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {getScaleLabel(enhancementSettings.scale)}
            </motion.p>
          </div>
        </motion.div>

        {/* Advanced Settings Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between p-4 glass rounded-2xl border border-white/20 hover:border-indigo-400/50 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-indigo-400" />
              <span className="font-medium text-white">Advanced Settings</span>
            </div>
            <motion.div
              animate={{ rotate: showAdvanced ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </button>

          {/* Advanced Settings Panel */}
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: showAdvanced ? 'auto' : 0, 
              opacity: showAdvanced ? 1 : 0 
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-6 space-y-4">
              {/* Face Enhancement Toggle */}
              <motion.div 
                className="p-4 glass rounded-2xl border border-white/10"
                whileHover={{ borderColor: 'rgba(99, 102, 241, 0.3)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-purple-400" />
                    <span className="font-medium text-white">Face Enhancement</span>
                  </div>
                  
                  <button
                    onClick={handleFaceEnhanceToggle}
                    disabled={disabled || isLoading}
                    className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                      enhancementSettings.face_enhance 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600' 
                        : 'bg-white/20'
                    }`}
                  >
                    <motion.div
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                      animate={{ x: enhancementSettings.face_enhance ? 24 : 2 }}
                      transition={{ duration: 0.2 }}
                    />
                  </button>
                </div>
                
                <div className="flex items-start gap-2 text-sm text-white/60">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>
                    Applies specialized face enhancement using GFPGAN technology for improved facial features and skin details.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Enhancement Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="pt-4"
        >
          <motion.button
            onClick={onEnhance}
            disabled={disabled || isLoading}
            className="w-full relative overflow-hidden px-10 py-5 glass rounded-2xl border-2 border-transparent bg-gradient-to-r from-indigo-700 to-blue-900 text-white font-semibold shadow-2xl shadow-indigo-900/30 transition-all duration-300 group disabled:from-gray-600 disabled:to-gray-700 disabled:shadow-none"
            whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -2 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              {isLoading ? (
                  <motion.div
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Enhance Image
                </>
              )}
            </span>
            {/* Button shimmer effect */}
            {!disabled && !isLoading && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
            )}
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};
