'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import { Button } from '@/components/ui/atoms/Button';
import { debounce } from '@/lib/utils';
import { BookSearchParams } from '@/lib/api/types';

/**
 * BookSearch props interface
 */
interface BookSearchProps {
  onSearch?: (params: BookSearchParams) => void;
  className?: string;
}

/**
 * BookSearch component provides a search interface for books
 * 
 * @example
 * ```tsx
 * <BookSearch onSearch={handleSearch} />
 * ```
 */
export const BookSearch: React.FC<BookSearchProps> = ({
  onSearch,
  className = '',
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<BookSearchParams>({
    genre: searchParams.get('genre') || '',
    author: searchParams.get('author') || '',
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    inStock: searchParams.get('inStock') === 'true',
    sortBy: searchParams.get('sortBy') || '',
  });

  // Update URL with search params
  const updateSearchParams = (params: BookSearchParams) => {
    const newParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        newParams.set(key, String(value));
      }
    });
    
    router.push(`/books/search?${newParams.toString()}`);
    
    if (onSearch) {
      onSearch(params);
    }
  };

  // Handle search form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateSearchParams({
      ...filters,
      keyword,
    });
  };

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFilters((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Handle clearing all filters
  const handleClearFilters = () => {
    setKeyword('');
    setFilters({
      genre: '',
      author: '',
      minPrice: undefined,
      maxPrice: undefined,
      inStock: false,
      sortBy: '',
    });
    
    router.push('/books/search');
    
    if (onSearch) {
      onSearch({});
    }
  };

  // Debounced search function
  const debouncedSearch = debounce(() => {
    updateSearchParams({
      ...filters,
      keyword,
    });
  }, 500);

  // Effect to handle automatic search on keyword change
  useEffect(() => {
    if (keyword.length > 2 || keyword.length === 0) {
      debouncedSearch();
    }
  }, [keyword]);

  return (
    <div className={`bg-white rounded-xl shadow-soft p-4 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search by title, author, or ISBN..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-light focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral" />
          </div>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <FaFilter />
            <span>Filters</span>
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-neutral-light">
            <div>
              <label htmlFor="genre" className="block text-sm font-medium text-neutral-dark mb-1">
                Genre
              </label>
              <select
                id="genre"
                name="genre"
                value={filters.genre}
                onChange={handleFilterChange}
                className="w-full p-2 rounded-lg border border-neutral-light focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              >
                <option value="">All Genres</option>
                <option value="Fiction">Fiction</option>
                <option value="Non-Fiction">Non-Fiction</option>
                <option value="Science Fiction">Science Fiction</option>
                <option value="Fantasy">Fantasy</option>
                <option value="Mystery">Mystery</option>
                <option value="Romance">Romance</option>
                <option value="Thriller">Thriller</option>
                <option value="Biography">Biography</option>
              </select>
            </div>

            <div>
              <label htmlFor="author" className="block text-sm font-medium text-neutral-dark mb-1">
                Author
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={filters.author || ''}
                onChange={handleFilterChange}
                placeholder="Author name"
                className="w-full p-2 rounded-lg border border-neutral-light focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="sortBy" className="block text-sm font-medium text-neutral-dark mb-1">
                Sort By
              </label>
              <select
                id="sortBy"
                name="sortBy"
                value={filters.sortBy}
                onChange={handleFilterChange}
                className="w-full p-2 rounded-lg border border-neutral-light focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              >
                <option value="">Default</option>
                <option value="title_asc">Title (A-Z)</option>
                <option value="title_desc">Title (Z-A)</option>
                <option value="price_asc">Price (Low to High)</option>
                <option value="price_desc">Price (High to Low)</option>
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
              </select>
            </div>

            <div>
              <label htmlFor="minPrice" className="block text-sm font-medium text-neutral-dark mb-1">
                Min Price
              </label>
              <input
                type="number"
                id="minPrice"
                name="minPrice"
                value={filters.minPrice || ''}
                onChange={handleFilterChange}
                min="0"
                step="0.01"
                placeholder="Min price"
                className="w-full p-2 rounded-lg border border-neutral-light focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="maxPrice" className="block text-sm font-medium text-neutral-dark mb-1">
                Max Price
              </label>
              <input
                type="number"
                id="maxPrice"
                name="maxPrice"
                value={filters.maxPrice || ''}
                onChange={handleFilterChange}
                min="0"
                step="0.01"
                placeholder="Max price"
                className="w-full p-2 rounded-lg border border-neutral-light focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              />
            </div>

            <div className="flex items-center">
              <label htmlFor="inStock" className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="inStock"
                  name="inStock"
                  checked={filters.inStock}
                  onChange={handleFilterChange}
                  className="h-4 w-4 text-primary border-neutral-light rounded focus:ring-primary"
                />
                <span className="ml-2 text-sm text-neutral-dark">In Stock Only</span>
              </label>
            </div>

            <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClearFilters}
                className="flex items-center gap-2"
              >
                <FaTimes />
                <span>Clear Filters</span>
              </Button>
              
              <Button type="submit" className="flex items-center gap-2">
                <FaSearch />
                <span>Search</span>
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default BookSearch;
