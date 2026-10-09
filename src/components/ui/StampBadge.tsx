import React from 'react';
import { ArrowDown } from 'lucide-react';

interface StampBadgeProps {
  text?: string;
  className?: string;
  size?: number | string;
  icon?: React.ReactNode;
  iconWrapperClassName?: string;
}

export const StampBadge: React.FC<StampBadgeProps> = ({
  text = 'private & honest · local first · private & honest · local first · ',
  className = '',
  size = 140,
  icon = <ArrowDown className="w-5 h-5 text-cream" />,
  iconWrapperClassName = 'w-10 h-10 rounded-full border border-cream/50 bg-transparent flex items-center justify-center',
}) => {
  const radius = 37;
  const circumference = +(2 * Math.PI * radius).toFixed(1); // ~232.5

  const dimensionStyle = typeof size === 'number' ? { width: `${size}px`, height: `${size}px` } : { width: size, height: size };

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={dimensionStyle}
    >
      {/* Central icon: thin outlined cream arrow with no dark background */}
      <div className={`absolute z-10 ${iconWrapperClassName}`}>
        {icon}
      </div>

      {/* Rotating SVG text ring */}
      <svg
        className="w-full h-full animate-spin-slow origin-center overflow-visible"
        viewBox="0 0 100 100"
      >
        <defs>
          <path
            id="textCircle"
            d={`M 50, 50 m -${radius}, 0 a ${radius},${radius} 0 1,1 ${radius * 2},0 a ${radius},${radius} 0 1,1 -${radius * 2},0`}
          />
        </defs>
        <text
          fill="var(--cream)"
          fontSize="9.2"
          letterSpacing="0.8"
          fontWeight="500"
          className="select-none font-display opacity-95"
        >
          <textPath href="#textCircle" startOffset="0%" textLength={circumference} lengthAdjust="spacing">
            {text}
          </textPath>
        </text>
      </svg>
    </div>
  );
};
