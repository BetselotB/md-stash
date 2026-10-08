import React from 'react';
import { ArrowDown } from 'lucide-react';

interface StampBadgeProps {
  text?: string;
  className?: string;
  size?: number;
  icon?: React.ReactNode;
}

export const StampBadge: React.FC<StampBadgeProps> = ({
  text = 'private & honest · local first · works offline · ',
  className = '',
  size = 110,
  icon = <ArrowDown className="w-5 h-5 text-cream" />,
}) => {
  const radius = 37;
  const circumference = +(2 * Math.PI * radius).toFixed(1); // ~232.5

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Central icon */}
      <div className="absolute z-10 flex items-center justify-center w-9 h-9 rounded-full bg-forest border border-line shadow-sm">
        {icon}
      </div>

      {/* Rotating SVG text ring */}
      <svg
        className="w-full h-full animate-spin-slow origin-center"
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
          fontSize="8.2"
          letterSpacing="1.2"
          fontWeight="600"
          className="select-none opacity-90 font-mono"
        >
          <textPath href="#textCircle" startOffset="0%" textLength={circumference} lengthAdjust="spacing">
            {text}
          </textPath>
        </text>
      </svg>
    </div>
  );
};
