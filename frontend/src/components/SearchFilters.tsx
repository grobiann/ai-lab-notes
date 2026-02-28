import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { SearchParams } from '../types/api';

interface SearchFiltersProps {
  onSearch: (params: SearchParams) => void;
  initialQuery?: string;
  initialCategory?: string;
  loading?: boolean;
}

/**
 * Search and filter controls for blog posts
 */
export const SearchFilters: React.FC<SearchFiltersProps> = ({
  onSearch,
  initialQuery = '',
  initialCategory = '',
  loading = false,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular' | 'featured'>('newest');
  const [categories, setCategories] = useState<string[]>([]);
  const [featured, setFeatured] = useState(false);

  // Load available categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await api.getCategories();
        setCategories(cats);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };

    loadCategories();
  }, []);

  const handleSearch = () => {
    const params: SearchParams = {
      q: query || undefined,
      category: category || undefined,
      sortBy,
      featured: featured || undefined,
      page: 1,
    };

    onSearch(params);
  };

  const handleReset = () => {
    setQuery('');
    setCategory('');
    setSortBy('newest');
    setFeatured(false);
    onSearch({ page: 1 });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-filters">
      <div className="filter-group">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search posts..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            className="search-input"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="btn btn-primary btn-search"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      <div className="filter-row">
        <div className="filter-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={category}
            onChange={e => setCategory(e.target.value)}
            disabled={loading}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="sortBy">Sort By</label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            disabled={loading}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="popular">Most Popular</option>
            <option value="featured">Featured</option>
          </select>
        </div>

        <div className="filter-group checkbox">
          <label htmlFor="featured">
            <input
              id="featured"
              type="checkbox"
              checked={featured}
              onChange={e => setFeatured(e.target.checked)}
              disabled={loading}
            />
            Featured Only
          </label>
        </div>

        <button onClick={handleReset} disabled={loading} className="btn btn-secondary">
          Reset
        </button>
      </div>
    </div>
  );
};
