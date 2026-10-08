import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-20 h-20',
  };

  const textSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-6xl',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 font-display select-none ${className}`}>
      <img
        src="/logo.svg"
        alt="MDstash Icon"
        className={`${iconSizes[size]} object-contain drop-shadow-sm transition-transform duration-200 hover:scale-105`}
      />
      {showText && (
        <span className={`tracking-wider uppercase text-cream ${textSizes[size]}`}>
          MD<span className="text-pink">stash</span>
        </span>
      )}
    </div>
  );
};
