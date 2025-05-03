'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { bookService } from '@/lib/api/services/book.service';
import BookCard from '@/components/BookCard';
import { FaSearch } from 'react-icons/fa';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
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

export default function BooksPage() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [selectedPublisher, setSelectedPublisher] = useState('');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [minRating, setMinRating] = useState<number | ''>('');
  const [inStock, setInStock] = useState<boolean | null>(null);
  const [inLibrary, setInLibrary] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState('');

  const [genres, setGenres] = useState<string[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [formats, setFormats] = useState<string[]>([]);
  const [publishers, setPublishers] = useState<string[]>([]);
  const [error, setError] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage] = useState(8); // Number of books to display per page

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await bookService.getAllBooks();
      console.log('Books page response:', response);

      if (response.success && Array.isArray(response.books) && response.books.length > 0) {
        setBooks(response.books);
        setFilteredBooks(response.books);

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
      } else {
        console.error('Invalid books data or empty array:', response);
        // Try to make a direct fetch to the API
        try {
          const directResponse = await fetch('http://localhost:5261/api/Books');
          const data = await directResponse.json();
          console.log('Direct API response:', data);

          if (data && data.Data && Array.isArray(data.Data) && data.Data.length > 0) {
            const transformedBooks = data.Data.map(book => ({
              id: book.Id || book.id,
              title: book.Title || book.title,
              author: book.Author || book.author,
              price: book.Price || book.price || 0,
              coverImage: book.CoverImage || book.coverImage,
              genre: book.Genre || book.genre || 'Unknown',
              language: book.Language || book.language || 'English',
              format: book.Format || book.format || 'Paperback',
              publisher: book.Publisher || book.publisher || '',
              isAvailableInLibrary: book.IsAvailableInLibrary || book.isAvailableInLibrary || false,
              inventoryCount: book.InventoryCount || book.inventoryCount || 0,
              totalSold: book.TotalSold || book.totalSold || 0,
              averageRating: book.AverageRating || book.averageRating || 0,
              publishedDate: book.PublishedDate || book.publishedDate || new Date().toISOString(),
            }));

            console.log('Transformed books from direct API:', transformedBooks);
            setBooks(transformedBooks);
            setFilteredBooks(transformedBooks);

            // Extract unique values for filters
            const uniqueGenres = [...new Set(transformedBooks.map((book: Book) => book.genre))].filter(Boolean);
            const uniqueAuthors = [...new Set(transformedBooks.map((book: Book) => book.author))].filter(Boolean);
            const uniqueLanguages = [...new Set(transformedBooks.map((book: Book) => book.language))].filter(Boolean);
            const uniqueFormats = [...new Set(transformedBooks.map((book: Book) => book.format))].filter(Boolean);
            const uniquePublishers = [...new Set(transformedBooks.map((book: Book) => book.publisher))].filter(Boolean);

            setGenres(uniqueGenres);
            setAuthors(uniqueAuthors);
            setLanguages(uniqueLanguages);
            setFormats(uniqueFormats);
            setPublishers(uniquePublishers);
          } else {
            setError('Failed to load books');
            toast.error('Failed to load books');
          }
        } catch (directError) {
          console.error('Error with direct API call:', directError);
          setError(response.message || 'Failed to load books');
          toast.error('Failed to load books');
        }
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      setError('An error occurred while loading books');
      toast.error('An error occurred while loading books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Function to handle advanced search
  const handleAdvancedSearch = async () => {
    try {
      setLoading(true);
      setError('');

      const searchParams = {
        keyword: searchTerm,
        sortBy,
        genre: selectedGenre,
        author: selectedAuthor,
        minPrice: minPrice !== '' ? Number(minPrice) : undefined,
        maxPrice: maxPrice !== '' ? Number(maxPrice) : undefined,
        inStock,
        inLibrary,
        minRating: minRating !== '' ? Number(minRating) : undefined,
        language: selectedLanguage,
        format: selectedFormat,
        publisher: selectedPublisher
      };

      const response = await bookService.searchBooks(searchParams);

      if (response.success) {
        setFilteredBooks(response.books);
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

  useEffect(() => {
    // Apply all filters (search term, genre, author, etc.)
    let filtered = books.filter((book) => {
      // Search term filter (title or author)
      const matchesSearch = searchTerm === '' ||
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase());

      // Genre filter
      const matchesGenre = selectedGenre === '' || book.genre === selectedGenre;

      // Author filter
      const matchesAuthor = selectedAuthor === '' || book.author === selectedAuthor;

      return matchesSearch && matchesGenre && matchesAuthor;
    });

    // Apply sorting if selected
    if (sortBy) {
      filtered = [...filtered].sort((a, b) => {
        switch (sortBy) {
          case 'title_asc':
            return a.title.localeCompare(b.title);
          case 'title_desc':
            return b.title.localeCompare(a.title);
          case 'price_asc':
            return a.price - b.price;
          case 'price_desc':
            return b.price - a.price;
          case 'rating_desc':
            return b.averageRating - a.averageRating;
          case 'newest':
            return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
          default:
            return 0;
        }
      });
    }

    // Reset to first page when filters change
    setCurrentPage(1);
    setFilteredBooks(filtered);
  }, [searchTerm, selectedGenre, selectedAuthor, sortBy, books]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="relative mb-12 rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-background-dark z-10"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-40"></div>
        <div className="relative z-20 py-16 px-8 md:px-16 flex flex-col items-start">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">Explore Our Collection</h1>
          <p className="text-white/90 text-lg max-w-2xl mb-8">Discover books that will transport you to new worlds, expand your mind, and touch your heart.</p>

          {/* Search Bar */}
          <div className="w-full max-w-2xl bg-white/10 backdrop-blur-md rounded-xl p-2 flex flex-col md:flex-row gap-2">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaSearch className="text-white/70" />
              </div>
              <input
                type="text"
                placeholder="Search by title or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full bg-white/20 text-white placeholder-white/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent border-none"
              />
            </div>
            <Button
              onClick={() => router.push('/books/search')}
              className="bg-accent hover:bg-accent/90 text-[#264653] font-medium md:w-auto w-full"
            >
              Advanced Search
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mb-10 bg-white rounded-xl shadow-soft p-4 flex flex-wrap gap-4 items-center sticky top-24 z-30">
        <div className="font-medium text-neutral-dark">Filter by:</div>

        <div className="flex-grow flex flex-wrap gap-3">
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="px-4 py-2 rounded-lg bg-neutral-light text-neutral-dark border-none focus:ring-2 focus:ring-primary focus:outline-none text-sm"
          >
            <option value="">All Genres</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>

          <select
            value={selectedAuthor}
            onChange={(e) => setSelectedAuthor(e.target.value)}
            className="px-4 py-2 rounded-lg bg-neutral-light text-neutral-dark border-none focus:ring-2 focus:ring-primary focus:outline-none text-sm"
          >
            <option value="">All Authors</option>
            {authors.map((author) => (
              <option key={author} value={author}>
                {author}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 rounded-lg bg-neutral-light text-neutral-dark border-none focus:ring-2 focus:ring-primary focus:outline-none text-sm"
          >
            <option value="">Sort By</option>
            <option value="title_asc">Title (A-Z)</option>
            <option value="title_desc">Title (Z-A)</option>
            <option value="price_asc">Price (Low to High)</option>
            <option value="price_desc">Price (High to Low)</option>
            <option value="rating_desc">Highest Rated</option>
            <option value="newest">Newest First</option>
          </select>
        </div>

        <Button
          onClick={() => {
            setSearchTerm('');
            setSelectedGenre('');
            setSelectedAuthor('');
            setSortBy('');
            setCurrentPage(1); // Reset to first page
            // No need to fetch books again, just reset filters
            setFilteredBooks(books);
          }}
          variant="ghost"
          className="text-primary hover:bg-primary-light text-sm"
        >
          Clear Filters
        </Button>
      </div>

      {/* Results Count */}
      {!loading && !error && (
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-serif font-bold text-neutral-dark">
            {filteredBooks.length} {filteredBooks.length === 1 ? 'Book' : 'Books'} Found
          </h2>
          {filteredBooks.length > booksPerPage && (
            <div className="text-neutral-dark">
              Showing {(currentPage - 1) * booksPerPage + 1}-
              {Math.min(currentPage * booksPerPage, filteredBooks.length)} of {filteredBooks.length}
            </div>
          )}
        </div>
      )}

      {/* Books Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-neutral-light rounded-2xl h-96 animate-pulse shadow-soft">
              <div className="h-56 bg-neutral-light/80 rounded-t-2xl"></div>
              <div className="p-5 space-y-3">
                <div className="h-6 bg-neutral-light/80 rounded-full w-3/4"></div>
                <div className="h-4 bg-neutral-light/80 rounded-full w-1/2"></div>
                <div className="h-8 bg-neutral-light/80 rounded-full w-full mt-6"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-soft">
          <div className="text-destructive text-6xl mb-4">😕</div>
          <p className="text-destructive text-xl font-medium mb-6">{error}</p>
          <Button
            onClick={() => fetchBooks()}
            className="bg-primary hover:bg-primary-dark text-white"
          >
            Try Again
          </Button>
        </div>
      ) : filteredBooks.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {/* Display only the current page of books */}
            {filteredBooks
              .slice((currentPage - 1) * booksPerPage, currentPage * booksPerPage)
              .map((book) => (
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

          {/* Pagination controls */}
          {filteredBooks.length > booksPerPage && (
            <div className="mt-12 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredBooks.length / booksPerPage)}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  // Scroll to top when changing pages
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-soft">
          <div className="text-neutral text-6xl mb-4">🔍</div>
          <p className="text-neutral-dark text-xl font-medium mb-2">No books found</p>
          <p className="text-neutral mb-6">Try adjusting your search or filters to find what you're looking for.</p>
          <Button
            onClick={() => {
              setSearchTerm('');
              setSelectedGenre('');
              setSelectedAuthor('');
              setSortBy('');
              setCurrentPage(1); // Reset to first page
              // Reset to original books list
              setFilteredBooks(books);
            }}
            className="bg-primary hover:bg-primary-dark text-white"
          >
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
}
