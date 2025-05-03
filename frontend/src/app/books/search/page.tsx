'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaSearch, FaArrowLeft, FaFilter } from 'react-icons/fa';
import { bookService } from '@/lib/api/services/book.service';
import BookCard from '@/components/BookCard';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface Book {
  id: number;
  title: string;
  author: string;
  price: number;
  coverImage: string | null;
  genre: string;
  language: string;
  format: string;
  publisher: string;
  isAvailableInLibrary: boolean;
  inventoryCount: number;
  totalSold: number;
  averageRating: number;
  publishedDate: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(query);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Advanced filter states
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [selectedPublisher, setSelectedPublisher] = useState('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minRating, setMinRating] = useState<string>('');
  const [inStock, setInStock] = useState<boolean | null>(null);
  const [inLibrary, setInLibrary] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState('');

  // Filter options
  const [genres, setGenres] = useState<string[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [formats, setFormats] = useState<string[]>([]);
  const [publishers, setPublishers] = useState<string[]>([]);

  // Fetch filter options
  const fetchFilterOptions = async () => {
    try {
      const response = await bookService.getAllBooks();
      if (response.success) {
        // Extract unique values for filters
        const uniqueGenres = [...new Set(response.books.map((book: Book) => book.genre))].filter(Boolean);
        const uniqueAuthors = [...new Set(response.books.map((book: Book) => book.author))].filter(Boolean);
        const uniqueLanguages = [...new Set(response.books.map((book: Book) => book.language))].filter(Boolean);
        const uniqueFormats = [...new Set(response.books.map((book: Book) => book.format))].filter(Boolean);
        const uniquePublishers = [...new Set(response.books.map((book: Book) => book.publisher))].filter(Boolean);

        setGenres(uniqueGenres);
        setAuthors(uniqueAuthors);
        setLanguages(uniqueLanguages);
        setFormats(uniqueFormats);
        setPublishers(uniquePublishers);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  useEffect(() => {
    fetchFilterOptions();
    if (query) {
      searchBooks(query);
    }
  }, [query]);

  const searchBooks = async (q: string) => {
    try {
      setLoading(true);
      setError('');

      const searchParams = {
        keyword: q,
        sortBy,
        genre: selectedGenre,
        author: selectedAuthor,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        inStock,
        inLibrary,
        minRating: minRating ? Number(minRating) : undefined,
        language: selectedLanguage,
        format: selectedFormat,
        publisher: selectedPublisher
      };

      const response = await bookService.searchBooks(searchParams);

      if (response.success) {
        setBooks(response.books || []);
      } else {
        setError(response.message || 'Failed to search books');
        toast.error('Failed to search books');
      }
    } catch (error) {
      console.error('Error searching books:', error);
      setError('An error occurred while searching books');
      toast.error('An error occurred while searching books');
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSelectedGenre('');
    setSelectedAuthor('');
    setSelectedLanguage('');
    setSelectedFormat('');
    setSelectedPublisher('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setInStock(null);
    setInLibrary(null);
    setSortBy('');

    if (searchQuery) {
      searchBooks(searchQuery);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/books/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/books" className="inline-flex items-center text-primary hover:text-primary-dark transition-colors duration-200 mb-6">
        <FaArrowLeft className="mr-2" /> Back to Books
      </Link>

      {/* Hero Banner */}
      <div className="relative mb-10 rounded-2xl overflow-hidden shadow-soft">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-primary-dark/95 z-10"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-15"></div>
        <div className="relative z-20 py-10 px-8 md:px-10">
          <div className="bg-white/30 backdrop-blur-md px-5 py-3 rounded-xl inline-block mb-3">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-black drop-shadow-none">Advanced Book Search</h1>
          </div>
          <div className="bg-white/30 backdrop-blur-md px-5 py-2 rounded-lg inline-block mb-6 max-w-2xl">
            <p className="text-black text-lg font-medium">Find your perfect read with our powerful search tools.</p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="w-full max-w-3xl">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaSearch className="text-black" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, author, or genre..."
                  className="pl-10 pr-4 py-4 w-full bg-white/70 text-black placeholder-gray-600 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border-none shadow-inner text-lg"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  type="submit"
                  variant="default"
                  size="lg"
                  className="bg-white hover:bg-white/90 text-primary font-semibold text-base px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <FaSearch className="mr-2" />
                  Search
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  variant="secondary"
                  size="lg"
                  className="flex items-center bg-white/80 text-primary-dark font-semibold shadow-lg hover:bg-white transition-all duration-200 px-5 py-3 rounded-lg"
                >
                  <FaFilter className="mr-2" />
                  {showAdvancedFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="bg-white rounded-2xl shadow-soft p-6 mb-8 transition-all duration-300 transform">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-serif font-semibold text-neutral-dark">Advanced Filters</h2>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={resetFilters}
                variant="outline"
                size="sm"
                className="text-neutral-dark border-neutral hover:bg-neutral-light"
              >
                Reset All
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Genre Filter */}
            <div className="filter-group">
              <label className="block text-sm font-medium text-neutral-dark mb-2">Genre</label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full bg-neutral-light text-neutral-dark rounded-lg py-2.5 px-4 border-none focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"
              >
                <option value="">All Genres</option>
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            {/* Author Filter */}
            <div className="filter-group">
              <label className="block text-sm font-medium text-neutral-dark mb-2">Author</label>
              <select
                value={selectedAuthor}
                onChange={(e) => setSelectedAuthor(e.target.value)}
                className="w-full bg-neutral-light text-neutral-dark rounded-lg py-2.5 px-4 border-none focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"
              >
                <option value="">All Authors</option>
                {authors.map((author) => (
                  <option key={author} value={author}>
                    {author}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="filter-group">
              <label className="block text-sm font-medium text-neutral-dark mb-2">Price Range ($)</label>
              <div className="flex space-x-3 items-center">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-1/2 bg-neutral-light text-neutral-dark rounded-lg py-2.5 px-4 border-none focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"
                />
                <span className="text-neutral">—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-1/2 bg-neutral-light text-neutral-dark rounded-lg py-2.5 px-4 border-none focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div className="filter-group">
              <label className="block text-sm font-medium text-neutral-dark mb-2">Minimum Rating</label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="w-full bg-neutral-light text-neutral-dark rounded-lg py-2.5 px-4 border-none focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"
              >
                <option value="">Any Rating</option>
                <option value="1">1+ ★</option>
                <option value="2">2+ ★★</option>
                <option value="3">3+ ★★★</option>
                <option value="4">4+ ★★★★</option>
                <option value="4.5">4.5+ ★★★★★</option>
              </select>
            </div>

            {/* Language Filter */}
            <div className="filter-group">
              <label className="block text-sm font-medium text-neutral-dark mb-2">Language</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full bg-neutral-light text-neutral-dark rounded-lg py-2.5 px-4 border-none focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"
              >
                <option value="">All Languages</option>
                {languages.map((language) => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>
            </div>

            {/* Format Filter */}
            <div className="filter-group">
              <label className="block text-sm font-medium text-neutral-dark mb-2">Format</label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full bg-neutral-light text-neutral-dark rounded-lg py-2.5 px-4 border-none focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"
              >
                <option value="">All Formats</option>
                {formats.map((format) => (
                  <option key={format} value={format}>
                    {format}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div className="filter-group">
              <label className="block text-sm font-medium text-neutral-dark mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-neutral-light text-neutral-dark rounded-lg py-2.5 px-4 border-none focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"
              >
                <option value="">Relevance</option>
                <option value="title">Title (A-Z)</option>
                <option value="title_desc">Title (Z-A)</option>
                <option value="price">Price (Low to High)</option>
                <option value="price_desc">Price (High to Low)</option>
                <option value="date">Publication Date (Oldest)</option>
                <option value="date_desc">Publication Date (Newest)</option>
                <option value="popularity">Popularity (Most Sold)</option>
                <option value="rating">Rating (Highest)</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              type="button"
              onClick={() => searchBooks(searchQuery)}
              variant="default"
              size="lg"
              className="bg-primary hover:bg-primary-dark text-white shadow-soft hover:shadow-hover"
              disabled={loading}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-neutral-light rounded-2xl shadow-soft h-80 animate-pulse"></div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-soft">
          <p className="text-destructive font-medium text-lg">{error}</p>
          <Button
            onClick={() => searchBooks(searchQuery)}
            className="mt-4 bg-primary hover:bg-primary-dark text-white"
          >
            Try Again
          </Button>
        </div>
      ) : books.length === 0 && query ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-soft flex flex-col items-center">
          <div className="text-neutral mb-4 text-5xl">🔍</div>
          <h3 className="text-xl font-medium text-neutral-dark mb-2">No results found</h3>
          <p className="text-neutral mb-6">We couldn't find any books matching "{query}"</p>
          <Button
            onClick={resetFilters}
            variant="outline"
            className="border-primary text-primary hover:bg-primary-light"
          >
            Clear Filters
          </Button>
        </div>
      ) : books.length > 0 ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <p className="text-neutral-dark font-medium">
              <span className="text-primary font-bold">{books.length}</span> results for "{query}"
            </p>
            <div className="text-neutral-dark text-sm">
              {sortBy && (
                <span className="bg-primary-light text-primary px-3 py-1 rounded-full text-xs">
                  Sorted by: {sortBy.replace('_desc', ' (desc)').replace('_', ' ')}
                </span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard
                key={book.id}
                id={book.id}
                title={book.title}
                author={book.author}
                price={book.price}
                coverImage={book.coverImage}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-soft flex flex-col items-center">
          <div className="text-neutral mb-4 text-5xl">📚</div>
          <h3 className="text-xl font-medium text-neutral-dark mb-2">Ready to discover</h3>
          <p className="text-neutral mb-2">Enter a search term or use filters to find your next favorite book</p>
        </div>
      )}
    </div>
  );
}
