import React from 'react';

export interface CategorySvgIconProps {
  categoryName?: string;
  categoryId?: string;
  iconName?: string;
  className?: string;
  size?: number | string;
  variant?: 'black-badge' | 'minimal' | 'outline' | 'circle-badge';
  strokeWidth?: number;
}

export const CategorySvgIcon: React.FC<CategorySvgIconProps> = ({
  categoryName = '',
  categoryId = '',
  iconName = '',
  className = '',
  size = 20,
  variant = 'minimal',
  strokeWidth = 2
}) => {
  const normKey = (categoryName + ' ' + categoryId + ' ' + iconName).toLowerCase().trim();

  // Color & Variant styles
  const isBadge = variant === 'black-badge';
  const isCircle = variant === 'circle-badge';

  const svgSize = typeof size === 'number' ? `${size}px` : size;

  // Determine icon path based on category key
  const renderIconPaths = () => {
    // 1. ALL CATEGORIES / FILTER
    if (normKey.includes('all') || normKey === 'all categories') {
      return (
        <g stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
          <rect x="3" y="3" width="7" height="7" rx="2" />
          <rect x="14" y="3" width="7" height="7" rx="2" />
          <rect x="14" y="14" width="7" height="7" rx="2" />
          <rect x="3" y="14" width="7" height="7" rx="2" />
        </g>
      );
    }

    // 2. GROCERIES
    if (normKey.includes('grocer') || normKey.includes('shopping') || normKey.includes('cat-1')) {
      return (
        <g stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </g>
      );
    }

    // 3. RENT
    if (normKey.includes('rent') || normKey.includes('home') || normKey.includes('house') || normKey.includes('cat-2')) {
      return (
        <g stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </g>
      );
    }

    // 4. UTILITIES & ELECTRICITY
    if (normKey.includes('utilit') || normKey.includes('electr') || normKey.includes('zap') || normKey.includes('power') || normKey.includes('cat-3')) {
      return (
        <g stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" fillOpacity="0.1" />
        </g>
      );
    }

    // 5. INTERNET & WIFI
    if (normKey.includes('internet') || normKey.includes('wifi') || normKey.includes('cat-4')) {
      return (
        <g stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M5 12.55a11 11 0 0114.08 0" />
          <path d="M1.42 9a16 16 0 0121.16 0" />
          <path d="M8.53 16.11a6 6 0 016.95 0" />
          <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth={strokeWidth + 1} />
        </g>
      );
    }

    // 6. DINING OUT & TAKEAWAY
    if (normKey.includes('din') || normKey.includes('takeaway') || normKey.includes('utensil') || normKey.includes('food') || normKey.includes('cat-5')) {
      return (
        <g stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M18 8h1a4 4 0 010 8h-1" />
          <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
          <line x1="6" y1="1" x2="6" y2="4" />
          <line x1="10" y1="1" x2="10" y2="4" />
          <line x1="14" y1="1" x2="14" y2="4" />
        </g>
      );
    }

    // 7. ENTERTAINMENT & STREAMING
    if (normKey.includes('entertain') || normKey.includes('stream') || normKey.includes('film') || normKey.includes('movie') || normKey.includes('cat-6')) {
      return (
        <g stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
          <line x1="7" y1="2" x2="7" y2="22" />
          <line x1="17" y1="2" x2="17" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <line x1="2" y1="7" x2="7" y2="7" />
          <line x1="2" y1="17" x2="7" y2="17" />
          <line x1="17" y1="17" x2="22" y2="17" />
          <line x1="17" y1="7" x2="22" y2="7" />
        </g>
      );
    }

    // 8. TRANSPORT & FUEL
    if (normKey.includes('transport') || normKey.includes('fuel') || normKey.includes('car') || normKey.includes('cat-7')) {
      return (
        <g stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 002 12v4c0 .6.4 1 1 1h2" />
          <circle cx="7" cy="17" r="2" />
          <path d="M9 17h6" />
          <circle cx="17" cy="17" r="2" />
        </g>
      );
    }

    // 9. HOUSEHOLD SUPPLIES
    if (normKey.includes('household') || normKey.includes('suppli') || normKey.includes('package') || normKey.includes('clean') || normKey.includes('cat-8')) {
      return (
        <g stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
          <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </g>
      );
    }

    // 10. MEDICAL & HEALTHCARE
    if (normKey.includes('medic') || normKey.includes('health') || normKey.includes('heart') || normKey.includes('cat-9')) {
      return (
        <g stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </g>
      );
    }

    // 11. MAINTENANCE & REPAIRS
    if (normKey.includes('mainten') || normKey.includes('repair') || normKey.includes('wrench') || normKey.includes('cat-10')) {
      return (
        <g stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
        </g>
      );
    }

    // 12. OTHERS / MISCELLANEOUS
    return (
      <g stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth={strokeWidth + 1} />
      </g>
    );
  };

  if (isBadge) {
    return (
      <div className={`inline-flex items-center justify-center bg-black text-white rounded-xl p-2 shadow-xs transition-all hover:bg-neutral-800 ${className}`}>
        <svg
          width={svgSize}
          height={svgSize}
          viewBox="0 0 24 24"
          className="stroke-current flex-shrink-0"
        >
          {renderIconPaths()}
        </svg>
      </div>
    );
  }

  if (isCircle) {
    return (
      <div className={`inline-flex items-center justify-center bg-neutral-100 text-black border border-neutral-200 rounded-full p-2 transition-colors ${className}`}>
        <svg
          width={svgSize}
          height={svgSize}
          viewBox="0 0 24 24"
          className="stroke-current flex-shrink-0"
        >
          {renderIconPaths()}
        </svg>
      </div>
    );
  }

  return (
    <svg
      width={svgSize}
      height={svgSize}
      viewBox="0 0 24 24"
      className={`stroke-current text-black flex-shrink-0 transition-transform ${className}`}
    >
      {renderIconPaths()}
    </svg>
  );
};
