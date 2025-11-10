
import React, { useState } from 'react';

interface Category {
  name: string;
  keywords: string[];
}

interface SidebarProps {
  categories: Category[];
  onFilterChange: (filter: { type: 'category' | 'keyword' | null; value: string | null }) => void;
  activeFilter: { type: 'category' | 'keyword' | null; value: string | null };
}

const Sidebar: React.FC<SidebarProps> = ({ categories, onFilterChange, activeFilter }) => {
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const handleCategoryClick = (categoryName: string) => {
    setOpenCategory(prev => (prev === categoryName ? null : categoryName));
    onFilterChange({ type: 'category', value: categoryName });
  };

  const handleKeywordClick = (e: React.MouseEvent, keyword: string) => {
    e.stopPropagation();
    onFilterChange({ type: 'keyword', value: keyword });
  };

  const handleResetFilter = () => {
    onFilterChange({ type: null, value: null });
    setOpenCategory(null);
  };
  
  const isActive = (type: 'category' | 'keyword' | 'all', value?: string) => {
    if (type === 'all') return !activeFilter.type;
    return activeFilter.type === type && activeFilter.value === value;
  };

  return (
    <aside className="w-64 bg-bg-secondary p-4 flex-shrink-0 border-r border-border-color h-full overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 text-brand-dark">필터</h2>
      <nav>
        <ul>
          <li className="mb-2">
            <button
              onClick={handleResetFilter}
              className={`w-full text-left px-3 py-2 rounded-md font-semibold transition-colors ${
                isActive('all') ? 'bg-brand-secondary text-white' : 'hover:bg-gray-200'
              }`}
            >
              모든 아티클
            </button>
          </li>
          {categories.map(cat => (
            <li key={cat.name} className="mb-1">
              <button
                onClick={() => handleCategoryClick(cat.name)}
                className={`w-full text-left px-3 py-2 rounded-md font-semibold transition-colors ${
                  isActive('category', cat.name) ? 'bg-brand-secondary text-white' : 'hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
              {openCategory === cat.name && (
                <ul className="pl-4 mt-1 border-l-2 border-brand-light">
                  {cat.keywords.map(kw => (
                    <li key={kw}>
                      <button
                        onClick={(e) => handleKeywordClick(e, kw)}
                        className={`w-full text-left px-3 py-1 text-sm rounded-md transition-colors ${
                            isActive('keyword', kw) ? 'bg-brand-light text-brand-dark font-semibold' : 'hover:bg-gray-200 text-text-secondary'
                        }`}
                      >
                        # {kw}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
