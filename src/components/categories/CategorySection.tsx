import React, { useState, useRef, useEffect } from 'react';
import { Category } from '../../types';
import { CategorySvgIcon } from './CategorySvgIcon';
import { ChevronDown, Check, Layers } from 'lucide-react';

interface CategorySectionProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  showQuickPills?: boolean;
  layout?: 'compact' | 'full';
  className?: string;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  showQuickPills = true,
  layout = 'full',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCategoryObj = categories.find(c => c.id === selectedCategory);
  const selectedName = selectedCategory === 'all' 
    ? 'All Categories' 
    : (selectedCategoryObj?.name || 'All Categories');

  return (
    <div className={`space-y-4 ${className}`}>
      
      {/* Category Dropdown & Control Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Custom Black Theme Category Dropdown */}
        <div className="relative w-full sm:w-72" ref={dropdownRef}>
          
          {/* Dropdown Trigger Box */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full bg-white hover:bg-neutral-50 text-black border border-neutral-200 hover:border-black rounded-full px-3.5 py-2 text-xs font-semibold flex items-center justify-between shadow-2xs transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-black/10"
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-black">
                <CategorySvgIcon
                  categoryName={selectedName}
                  categoryId={selectedCategory}
                  size={16}
                />
              </div>
              <span className="truncate font-display text-xs tracking-tight text-neutral-900 font-bold">
                {selectedName}
              </span>
            </div>
            
            <div className="flex items-center space-x-1 pl-2 border-l border-neutral-200">
              <ChevronDown className={`w-3.5 h-3.5 text-neutral-500 transition-transform duration-200 ${isOpen ? 'rotate-180 text-black' : ''}`} />
            </div>
          </button>

          {/* Native Select fallback for invisible screen reader / standard form behavior */}
          <select
            value={selectedCategory}
            onChange={(e) => onSelectCategory(e.target.value)}
            className="sr-only"
            tabIndex={-1}
            aria-label="Select Category"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* Minimalist Black-Theme Custom Dropdown Popup Menu */}
          {isOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-neutral-200 rounded-2xl shadow-xl py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-80 overflow-y-auto custom-scrollbar">
              
              {/* Dropdown Header */}
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 flex items-center justify-between">
                <span className="flex items-center space-x-1">
                  <Layers className="w-3 h-3" />
                  <span>Category Section</span>
                </span>
                <span className="bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded text-[9px]">
                  {categories.length + 1} categories
                </span>
              </div>

              {/* Option: All Categories */}
              <button
                type="button"
                onClick={() => {
                  onSelectCategory('all');
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-black text-white'
                    : 'text-neutral-800 hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <CategorySvgIcon
                    categoryName="All Categories"
                    categoryId="all"
                    size={18}
                    className={selectedCategory === 'all' ? 'text-white' : 'text-black'}
                  />
                  <span className="font-display font-medium">All Categories</span>
                </div>
                {selectedCategory === 'all' && (
                  <Check className="w-4 h-4 text-white stroke-[2.5]" />
                )}
              </button>

              <div className="my-1 border-t border-neutral-100" />

              {/* Option: Each Category */}
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      onSelectCategory(cat.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-black text-white font-bold'
                        : 'text-neutral-800 hover:bg-neutral-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <CategorySvgIcon
                        categoryName={cat.name}
                        categoryId={cat.id}
                        iconName={cat.icon}
                        size={18}
                        className={isSelected ? 'text-white' : 'text-black'}
                      />
                      <span>{cat.name}</span>
                    </div>

                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Quick Category Pills Bar (Black Theme Minimalism) */}
      {showQuickPills && (
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1 text-xs">
          
          {/* Pill: All */}
          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center space-x-1.5 transition-all flex-shrink-0 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-black text-white border-black shadow-xs'
                : 'bg-white text-neutral-700 border-neutral-200 hover:border-black hover:bg-neutral-50'
            }`}
          >
            <CategorySvgIcon
              categoryName="All Categories"
              categoryId="all"
              size={14}
              className={selectedCategory === 'all' ? 'text-white' : 'text-black'}
            />
            <span>All</span>
          </button>

          {/* Pill for each category */}
          {categories.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center space-x-1.5 transition-all flex-shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-black text-white border-black shadow-xs'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:border-black hover:bg-neutral-50'
                }`}
              >
                <CategorySvgIcon
                  categoryName={cat.name}
                  categoryId={cat.id}
                  iconName={cat.icon}
                  size={14}
                  className={isSelected ? 'text-white' : 'text-black'}
                />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      )}

    </div>
  );
};
