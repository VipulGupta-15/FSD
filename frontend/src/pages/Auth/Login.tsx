import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Lock, Mail, LogIn } from 'lucide-react';
import FuturisticInput from '@/components/FuturisticInput';
import FuturisticButton from '@/components/FuturisticButton';
import FuturisticCard from '@/components/FuturisticCard';
import { useAuth } from '@/contexts/AuthContext';
import ParticleBackground from '@/components/ParticleBackground';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['teacher', 'student']),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      role: 'student',
    },
  });

  const role = watch('role');

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      console.log("Submitting login with data:", data);
      await login(data.email, data.password, data.role);
      
      // Navigate based on role
      if (data.role === 'teacher') {
        navigate('/teacher-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-[#11141b] via-[#0b101e] to-[#0a0e1a]">
      <ParticleBackground />
      
      <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
        <div className="w-full max-w-lg h-full max-h-lg opacity-20 blur-2xl">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path
              fill="#00FAFF"
              d="M48.8,-47.3C63.3,-33.4,75.7,-16.7,77.2,1.6C78.7,19.8,69.3,39.7,54.8,51.5C40.3,63.4,20.1,67.2,0.6,66.7C-19,66.1,-38,61.1,-53,49.6C-68,38.2,-79,20.1,-80.4,0.8C-81.8,-18.5,-73.6,-37,-59.9,-50.9C-46.1,-64.8,-26.7,-74.1,-7.3,-67.5C12.1,-60.9,34.2,-61.2,48.8,-47.3Z"
              transform="translate(100 100) scale(1.1)"
            />
          </svg>
        </div>
      </div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neonCyan to-neonPink mb-2">MCQGenius</h1>
          <p className="text-softWhite/70">Sign in to your account</p>
        </div>

        <FuturisticCard glowing hoverable className="backdrop-blur-md">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex gap-4 p-1 rounded-lg bg-deepBlue/70 mb-6 border border-neonCyan/10">
              <button
                type="button"
                onClick={() => setValue('role', 'student')}
                className={`flex-1 py-2 rounded-md transition-colors ${
                  role === 'student'
                    ? 'bg-gradient-to-r from-neonCyan to-neonCyan/80 text-deepBlue font-semibold'
                    : 'text-softWhite/70 hover:text-softWhite'
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setValue('role', 'teacher')}
                className={`flex-1 py-2 rounded-md transition-colors ${
                  role === 'teacher'
                    ? 'bg-gradient-to-r from-neonCyan to-neonCyan/80 text-deepBlue font-semibold'
                    : 'text-softWhite/70 hover:text-softWhite'
                }`}
              >
                Teacher
              </button>
            </div>

            <input 
              type="hidden" 
              {...register('role')}
            />

            <FuturisticInput
              label="Email"
              type="email"
              placeholder="Enter your email"
              icon={<Mail size={18} />}
              error={errors.email?.message}
              {...register('email')}
            />

            <FuturisticInput
              label="Password"
              type="password"
              placeholder="Enter your password"
              icon={<Lock size={18} />}
              error={errors.password?.message}
              {...register('password')}
            />

            <FuturisticButton
              type="submit"
              className="w-full"
              isLoading={isLoading}
              icon={<LogIn size={18} />}
            >
              Sign In
            </FuturisticButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-softWhite/70 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-neonCyan hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </FuturisticCard>
      </div>
    </div>
  );
};

export default Login;
