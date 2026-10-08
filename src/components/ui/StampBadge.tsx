import React from 'react';
import { ArrowDown } from 'lucide-react';

interface StampBadgeProps {
  text?: string;
  className?: string;
  size?: number;
  icon?: React.ReactNode;
}

export const StampBadge: React.FC<StampBadgeProps> = ({
  text = 'LOCAL FIRST · PRIVATE & HONEST · 100% OFFLINE · ',
  className = '',
  size = 110,
  icon = <ArrowDown className="w-5 h-5 text-cream" />,
}) => {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;

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
            d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
          />
        </defs>
        <text
          fill="var(--cream)"
          fontSize="9"
          letterSpacing="2.2"
          fontWeight="bold"
          className="uppercase select-none opacity-85"
        >
          <textPath href="#textCircle" startOffset="0%">
            {text}
          </textPath>
        </text>
      </svg>
    </div>
  );
};
