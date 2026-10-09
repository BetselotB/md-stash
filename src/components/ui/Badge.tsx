import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'orange' | 'sage' | 'forest' | 'cream';
  size?: 'xs' | 'sm' | 'md';
  onRemove?: () => void;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'forest',
  size = 'sm',
  onRemove,
  className = '',
}) => {
  const sizeStyles = {
    xs: 'text-[10px] px-2 py-0.5',
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5',
  };

  const variantStyles = {
    forest: 'bg-forest text-cream border border-line',
    sage: 'bg-sage-deep text-cream border border-line',
    orange: 'bg-orange/20 text-orange border border-orange/40',
    cream: 'bg-cream text-forest font-bold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:opacity-75 focus:outline-none ml-0.5 text-cream-dim hover:text-cream cursor-pointer"
        >
          ×
        </button>
      )}
    </span>
  );
};
