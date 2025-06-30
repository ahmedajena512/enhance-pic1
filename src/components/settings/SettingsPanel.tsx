import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Save, RotateCcw, Palette, Download, Bell, Shield } from 'lucide-react';
import { useEnhanceStore } from '../../store/useEnhanceStore';

interface SettingsConfig {
  defaultScale: number;
  defaultFaceEnhance: boolean;
  autoDownload: boolean;
  notifications: boolean;
  theme: 'dark' | 'light' | 'auto';
  quality: 'high' | 'medium' | 'low';
  format: 'jpg' | 'png' | 'webp';
}

export const SettingsPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<SettingsConfig>({
    defaultScale: 4,
    defaultFaceEnhance: false,
    autoDownload: false,
    notifications: true,
    theme: 'dark',
    quality: 'high',
    format: 'jpg'
  });

  const { enhancementSettings, setEnhancementSettings } = useEnhanceStore();

  const handleSave = () => {
    // Apply settings to store
    setEnhancementSettings({
      scale: settings.defaultScale,
      face_enhance: settings.defaultFaceEnhance
    });
    
    // Save to localStorage
    localStorage.setItem('enhanceSettings', JSON.stringify(settings));
    
    // Close panel
    setIsOpen(false);
  };

  const handleReset = () => {
    const defaultSettings: SettingsConfig = {
      defaultScale: 4,
      defaultFaceEnhance: false,
      autoDownload: false,
      notifications: true,
      theme: 'dark',
      quality: 'high',
      format: 'jpg'
    };
    setSettings(defaultSettings);
  };

  const settingGroups = [
    {
      title: 'Enhancement',
      icon: Palette,
      settings: [
        {
          label: 'Default Scale Factor',
          type: 'select',
          value: settings.defaultScale,
          onChange: (value: number) => setSettings(prev => ({ ...prev, defaultScale: value })),
          options: [
            { value: 2, label: '2x' },
            { value: 4, label: '4x' },
            { value: 6, label: '6x' },
            { value: 8, label: '8x' }
          ]
        },
        {
          label: 'Default Face Enhancement',
          type: 'toggle',
          value: settings.defaultFaceEnhance,
          onChange: (value: boolean) => setSettings(prev => ({ ...prev, defaultFaceEnhance: value }))
        },
        {
          label: 'Output Quality',
          type: 'select',
          value: settings.quality,
          onChange: (value: string) => setSettings(prev => ({ ...prev, quality: value as any })),
          options: [
            { value: 'high', label: 'High Quality' },
            { value: 'medium', label: 'Medium Quality' },
            { value: 'low', label: 'Low Quality' }
          ]
        },
        {
          label: 'Output Format',
          type: 'select',
          value: settings.format,
          onChange: (value: string) => setSettings(prev => ({ ...prev, format: value as any })),
          options: [
            { value: 'jpg', label: 'JPEG' },
            { value: 'png', label: 'PNG' },
            { value: 'webp', label: 'WebP' }
          ]
        }
      ]
    },
    {
      title: 'Behavior',
      icon: Bell,
      settings: [
        {
          label: 'Auto Download',
          type: 'toggle',
          value: settings.autoDownload,
          onChange: (value: boolean) => setSettings(prev => ({ ...prev, autoDownload: value }))
        },
        {
          label: 'Notifications',
          type: 'toggle',
          value: settings.notifications,
          onChange: (value: boolean) => setSettings(prev => ({ ...prev, notifications: value }))
        }
      ]
    },
    {
      title: 'Appearance',
      icon: Palette,
      settings: [
        {
          label: 'Theme',
          type: 'select',
          value: settings.theme,
          onChange: (value: string) => setSettings(prev => ({ ...prev, theme: value as any })),
          options: [
            { value: 'dark', label: 'Dark' },
            { value: 'light', label: 'Light' },
            { value: 'auto', label: 'Auto' }
          ]
        }
      ]
    }
  ];

  return (
    <>
      {/* Settings Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 glass rounded-lg border border-white/20 hover:border-indigo-400/50 text-white transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Settings className="h-4 w-4" />
        Settings
      </motion.button>

      {/* Settings Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Settings</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center"
                >
                  ×
                </button>
              </div>

              {/* Settings Groups */}
              <div className="space-y-8">
                {settingGroups.map((group, groupIndex) => (
                  <motion.div
                    key={group.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: groupIndex * 0.1 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <group.icon className="h-5 w-5 text-indigo-400" />
                      <h3 className="text-lg font-semibold text-white">{group.title}</h3>
                    </div>

                    <div className="space-y-4 pl-8">
                      {group.settings.map((setting, settingIndex) => (
                        <motion.div
                          key={setting.label}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (groupIndex * 0.1) + (settingIndex * 0.05) }}
                          className="flex items-center justify-between"
                        >
                          <label className="text-white/80 text-sm">{setting.label}</label>
                          
                          {setting.type === 'toggle' && (
                            <button
                              onClick={() => setting.onChange(!setting.value)}
                              className={`relative w-12 h-6 rounded-full transition-colors ${
                                setting.value ? 'bg-indigo-600' : 'bg-gray-600'
                              }`}
                            >
                              <motion.div
                                className="absolute top-1 w-4 h-4 bg-white rounded-full"
                                animate={{ x: setting.value ? 24 : 2 }}
                                transition={{ duration: 0.2 }}
                              />
                            </button>
                          )}
                          
                          {setting.type === 'select' && (
                            <select
                              value={setting.value}
                              onChange={(e) => setting.onChange(e.target.value as any)}
                              className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-400"
                            >
                              {setting.options?.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-8 pt-6 border-t border-white/20">
                <motion.button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </motion.button>
                
                <motion.button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors ml-auto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Save className="h-4 w-4" />
                  Save Settings
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}; 