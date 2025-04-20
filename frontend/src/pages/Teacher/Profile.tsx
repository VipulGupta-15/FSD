import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Key, Save } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import FuturisticCard from '@/components/FuturisticCard';
import FuturisticButton from '@/components/FuturisticButton';
import FuturisticInput from '@/components/FuturisticInput';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const TeacherProfile: React.FC = () => {
  const { userName } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // In a real implementation, we would fetch the user data from the backend
    // For now, we're just using what's available in the auth context
    setFormData(prev => ({
      ...prev,
      name: userName || '',
      email: localStorage.getItem('userEmail') || '',
    }));
  }, [userName]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Password validation
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirm password do not match.",
        variant: "destructive",
      });
      return;
    }

    // In a real implementation, we would send this data to the backend
    // For now, we're just simulating the API call
    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local storage
      localStorage.setItem('userName', formData.name);
      localStorage.setItem('userEmail', formData.email);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
        variant: "default",
      });
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update your profile. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout title="My Profile">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <FuturisticCard>
            <h2 className="text-2xl font-bold text-softWhite mb-6">Personal Information</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-softWhite/70 mb-2">
                    Full Name
                  </label>
                  <FuturisticInput
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Name"
                    required
                    icon={<User size={18} />}
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-softWhite/70 mb-2">
                    Email Address
                  </label>
                  <FuturisticInput
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    required
                    icon={<Mail size={18} />}
                  />
                </div>
              </div>
              
              <div className="pt-6 border-t border-neonCyan/10">
                <h3 className="text-lg font-semibold text-softWhite mb-4">Change Password</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-softWhite/70 mb-2">
                      Current Password
                    </label>
                    <FuturisticInput
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      icon={<Key size={18} />}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-softWhite/70 mb-2">
                        New Password
                      </label>
                      <FuturisticInput
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        icon={<Key size={18} />}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-softWhite/70 mb-2">
                        Confirm New Password
                      </label>
                      <FuturisticInput
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        icon={<Key size={18} />}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <FuturisticButton type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-deepBlue mr-2"></div>
                      Updating...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Save size={18} className="mr-2" />
                      Save Changes
                    </div>
                  )}
                </FuturisticButton>
              </div>
            </form>
          </FuturisticCard>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherProfile;
