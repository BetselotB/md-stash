import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ icon, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 text-cream-dim pointer-events-none flex items-center">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full bg-forest text-cream placeholder-cream-dim/60 border border-line rounded-lg py-2 text-sm focus:outline-none focus:border-pink focus:ring-1 focus:ring-pink transition-colors duration-150 ${
              icon ? 'pl-9 pr-3' : 'px-3'
            } ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''} ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-red-300">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
