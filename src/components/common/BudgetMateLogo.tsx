import React from 'react';

export interface BudgetMateLogoProps {
  size?: number;
  className?: string;
  color?: string;
}

export const BudgetMateLogo: React.FC<BudgetMateLogoProps> = ({
  size = 28,
  className = '',
  color = 'currentColor'
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="22 18 84 84"
      xmlns="http://www.w3.org/2000/svg"
      className={`flex-shrink-0 ${className}`}
    >
      <path
        d="M28 54L64 24L100 54"
        fill="none"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="36"
        y="54"
        width="56"
        height="42"
        rx="10"
        fill="none"
        stroke={color}
        strokeWidth="3.5"
      />
      <rect
        x="54"
        y="62"
        width="20"
        height="26"
        rx="2"
        fill="none"
        stroke={color}
        strokeWidth="2.8"
      />
      <line
        x1="58"
        y1="68"
        x2="70"
        y2="68"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <line
        x1="58"
        y1="74"
        x2="70"
        y2="74"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
};
