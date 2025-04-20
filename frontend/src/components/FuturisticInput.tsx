import React, { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface FuturisticInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

const FuturisticInput = forwardRef<HTMLInputElement, FuturisticInputProps>(
  ({ className, label, icon, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="block text-sm font-medium text-softWhite/80 mb-1">{label}</label>
        )}
        <div className="relative group">
          {icon && (
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-neonCyan/70">
              {icon}
            </div>
          )}
          <input
            className={cn(
              "futuristic-input w-full bg-deepBlue/50 border border-neonCyan/20 px-4 py-2.5 rounded-md text-softWhite",
              "focus:outline-none focus:ring-2 focus:ring-neonCyan/30 focus:border-neonCyan/50",
              "transition-all duration-200 placeholder:text-softWhite/30",
              "hover:border-neonCyan/40 backdrop-blur-sm",
              "shadow-[0_0_15px_rgba(0,250,255,0.05)]",
              "group-hover:shadow-[0_0_15px_rgba(0,250,255,0.1)]",
              icon && "pl-10",
              error && "border-neonPink/50 focus:border-neonPink/80 focus:ring-neonPink/30",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && <p className="text-neonPink text-sm mt-1">{error}</p>}
      </div>
    );
  }
);

FuturisticInput.displayName = 'FuturisticInput';

export default FuturisticInput;
