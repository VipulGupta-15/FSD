import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface FuturisticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const FuturisticButton: React.FC<FuturisticButtonProps> = ({
  className,
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  ...props
}) => {
  const variantStyles = {
    primary: 'futuristic-button',
    secondary: 'secondary-button',
    outline: 'bg-transparent border border-neonCyan text-neonCyan hover:bg-neonCyan/10 transition-all duration-300',
    ghost: 'bg-transparent text-softWhite hover:bg-white/5 transition-all duration-300'
  };

  const sizeStyles = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-6 py-2',
    lg: 'px-8 py-3 text-lg'
  };

  return (
    <button
      className={cn(
        'font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      <span className="flex items-center justify-center">
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {icon && !isLoading && <span className="mr-2">{icon}</span>}
        {children}
      </span>
    </button>
  );
};

export default FuturisticButton;
