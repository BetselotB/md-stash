import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  pill?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', size = 'md', pill = true, icon, className = '', disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-bold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-pink focus:ring-offset-2 focus:ring-offset-forest disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.98] cursor-pointer';

    const sizeStyles = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2 gap-2',
      lg: 'text-base px-6 py-3 gap-2.5 tracking-wide',
    };

    const variantStyles = {
      // The signature Brew-District style pink button with dark forest text
      primary: 'bg-pink text-forest hover:bg-pink-deep hover:shadow-glow shadow-sm',
      secondary: 'bg-forest text-cream hover:bg-forest-light border border-line',
      outline: 'bg-transparent text-cream border border-line hover:border-pink hover:text-pink',
      ghost: 'bg-transparent text-cream-dim hover:text-cream hover:bg-cream-faint',
      danger: 'bg-red-800 text-cream hover:bg-red-700 border border-red-600',
    };

    const shape = pill ? 'rounded-full' : 'rounded-lg';

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${shape} ${className}`}
        {...props}
      >
        {icon && <span className="inline-flex shrink-0">{icon}</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
