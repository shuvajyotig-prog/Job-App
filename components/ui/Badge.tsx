import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'secondary' | 'accent' | 'hot';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const baseStyles = "inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold transition-colors border-2";
  
  const variants = {
    default: "bg-blue-100 text-blue-900 border-blue-200",
    outline: "bg-white border-neo-black text-neo-black hover:bg-slate-50",
    secondary: "bg-slate-100 text-slate-800 border-slate-200",
    accent: "bg-electric text-white border-electric",
    hot: "bg-hot-pink text-white border-hot-pink"
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};