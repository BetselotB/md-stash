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
            className={`w-full bg-[#F8F7E6] text-ink placeholder:text-ink/40 border border-[rgba(38,51,42,0.2)] rounded-xl py-2 text-sm focus:outline-none focus:border-orange focus:ring-2 focus:ring-orange/30 transition-colors duration-150 ${
              icon ? 'pl-9 pr-3' : 'px-3'
            } ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-red-300">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
