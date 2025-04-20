import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Lock, Mail, User, UserPlus } from 'lucide-react';
import FuturisticInput from '@/components/FuturisticInput';
import FuturisticButton from '@/components/FuturisticButton';
import FuturisticCard from '@/components/FuturisticCard';
import { useAuth } from '@/contexts/AuthContext';
import ParticleBackground from '@/components/ParticleBackground';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password is required'),
  role: z.enum(['teacher', 'student']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'student',
    },
  });

  const role = watch('role');

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setIsLoading(true);
      console.log("Registering with data:", data);
      await registerUser(data.name, data.email, data.password, data.role);
      
      // Navigate based on role
      if (data.role === 'teacher') {
        navigate('/teacher-dashboard');
      } else {
        navigate('/student-dashboard');
      }

      toast.success('Registration successful!');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
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
              fill="#FF007A"
              d="M47.7,-51.2C62.8,-37.7,76.8,-18.9,78.4,1.6C80,22.1,69.2,44.2,54.1,56.2C39,68.2,19.5,70.2,-0.4,70.5C-20.2,70.9,-40.4,69.5,-55.2,57.9C-70,46.3,-79.2,24.1,-79.6,1.5C-79.9,-21.2,-71.5,-42.4,-56.9,-55.9C-42.3,-69.4,-21.1,-75.3,-1.1,-74.1C18.9,-72.9,37.7,-64.7,47.7,-51.2Z"
              transform="translate(100 100) scale(1.1)"
            />
          </svg>
        </div>
      </div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neonCyan to-neonPink mb-2">MCQGenius</h1>
          <p className="text-softWhite/70">Create a new account</p>
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

            <input type="hidden" {...register('role')} />

            <FuturisticInput
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
              icon={<User size={18} />}
              error={errors.name?.message}
              {...register('name')}
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
              placeholder="Create a password"
              icon={<Lock size={18} />}
              error={errors.password?.message}
              {...register('password')}
            />

            <FuturisticInput
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              icon={<Lock size={18} />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <FuturisticButton
              type="submit"
              className="w-full"
              isLoading={isLoading}
              icon={<UserPlus size={18} />}
            >
              Create Account
            </FuturisticButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-softWhite/70 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-neonCyan hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </FuturisticCard>
      </div>
    </div>
  );
};

export default Register;
