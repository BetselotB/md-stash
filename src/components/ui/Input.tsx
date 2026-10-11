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
            <div className="absolute left-3 text-ink/60 pointer-events-none flex items-center">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full bg-[var(--field-bg)] text-ink placeholder:text-ink/60 border border-[var(--field-border)] rounded-[10px] py-2 text-sm focus:outline-none focus:border-orange focus:ring-2 focus:ring-orange/40 transition-colors duration-150 ${
              icon ? 'pl-9 pr-3' : 'px-3'
            } ${
              error
                ? '!border-[var(--danger)] focus:!border-[var(--danger)] focus:!ring-[var(--danger)]/30'
                : ''
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-[var(--danger)] font-sans">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
