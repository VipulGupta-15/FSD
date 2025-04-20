import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Moon, Sun, Globe, Shield, Save } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import FuturisticCard from '@/components/FuturisticCard';
import FuturisticButton from '@/components/FuturisticButton';
import { useToast } from '@/hooks/use-toast';

const StudentSettings: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    darkMode: true,
    emailNotifications: true,
    testReminders: true,
    language: 'english',
    privacyMode: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = (setting: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [setting]: !prev[setting] }));
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings(prev => ({ ...prev, language: e.target.value }));
  };

  const handleSaveSettings = async () => {
    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings Saved",
        description: "Your settings have been updated successfully.",
        variant: "default",
      });
      
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save your settings. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout title="Settings">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <FuturisticCard>
            <h2 className="text-2xl font-bold text-softWhite mb-6">Application Settings</h2>
            
            <div className="space-y-8">
              {/* Appearance */}
              <div>
                <h3 className="text-lg font-semibold text-softWhite mb-4 flex items-center">
                  <Sun size={20} className="mr-2 text-neonCyan" />
                  Appearance
                </h3>
                
                <div className="pl-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <label htmlFor="darkMode" className="text-softWhite/90">
                      Dark Mode
                    </label>
                    <button
                      onClick={() => handleToggle('darkMode')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.darkMode ? 'bg-neonCyan' : 'bg-deepBlue border border-softWhite/20'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Notifications */}
              <div>
                <h3 className="text-lg font-semibold text-softWhite mb-4 flex items-center">
                  <Bell size={20} className="mr-2 text-neonCyan" />
                  Notifications
                </h3>
                
                <div className="pl-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <label htmlFor="emailNotifications" className="text-softWhite/90">
                      Email Notifications
                    </label>
                    <button
                      onClick={() => handleToggle('emailNotifications')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.emailNotifications ? 'bg-neonCyan' : 'bg-deepBlue border border-softWhite/20'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label htmlFor="testReminders" className="text-softWhite/90">
                      Test Reminders
                    </label>
                    <button
                      onClick={() => handleToggle('testReminders')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.testReminders ? 'bg-neonCyan' : 'bg-deepBlue border border-softWhite/20'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.testReminders ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Language */}
              <div>
                <h3 className="text-lg font-semibold text-softWhite mb-4 flex items-center">
                  <Globe size={20} className="mr-2 text-neonCyan" />
                  Language
                </h3>
                
                <div className="pl-8">
                  <select
                    value={settings.language}
                    onChange={handleLanguageChange}
                    className="w-full bg-deepBlue/50 border border-neonCyan/30 rounded-lg px-4 py-2 text-softWhite focus:outline-none focus:ring-2 focus:ring-neonCyan/50"
                  >
                    <option value="english">English</option>
                    <option value="spanish">Spanish</option>
                    <option value="french">French</option>
                    <option value="german">German</option>
                    <option value="chinese">Chinese</option>
                    <option value="japanese">Japanese</option>
                  </select>
                </div>
              </div>
              
              {/* Privacy */}
              <div>
                <h3 className="text-lg font-semibold text-softWhite mb-4 flex items-center">
                  <Shield size={20} className="mr-2 text-neonCyan" />
                  Privacy
                </h3>
                
                <div className="pl-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <label htmlFor="privacyMode" className="text-softWhite/90">
                      Enhanced Privacy Mode
                    </label>
                    <button
                      onClick={() => handleToggle('privacyMode')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.privacyMode ? 'bg-neonCyan' : 'bg-deepBlue border border-softWhite/20'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.privacyMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-sm text-softWhite/60">
                    When enabled, your test history will only be visible to you and your instructors.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end pt-6 border-t border-neonCyan/10">
                <FuturisticButton onClick={handleSaveSettings} disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-deepBlue mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Save size={18} className="mr-2" />
                      Save Settings
                    </div>
                  )}
                </FuturisticButton>
              </div>
            </div>
          </FuturisticCard>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default StudentSettings;
