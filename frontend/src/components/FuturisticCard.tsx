import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FuturisticCardProps {
  children: ReactNode;
  className?: string;
  glowing?: boolean;
  hoverable?: boolean;
}

const FuturisticCard: React.FC<FuturisticCardProps> = ({
  children,
  className,
  glowing = false,
  hoverable = false,
}) => {
  return (
    <div
      className={cn(
        'futuristic-card p-6 bg-deepBlue/40 backdrop-blur-md border border-neonCyan/20 rounded-lg',
        'shadow-[0_0_25px_rgba(0,0,0,0.2)]',
        glowing && 'shadow-[0_0_25px_rgba(0,250,255,0.1)]',
        hoverable && 'hover:scale-[1.02] hover:border-neonCyan/40 hover:shadow-[0_0_30px_rgba(0,250,255,0.15)] transition-all duration-300',
        className
      )}
    >
      {children}
    </div>
  );
};

export default FuturisticCard;