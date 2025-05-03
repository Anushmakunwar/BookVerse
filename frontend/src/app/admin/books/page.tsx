'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { bookService } from '@/lib/api/services/book.service';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useBooks, useDeleteBook } from '@/lib/react-query/hooks/useBooks';
import { Pagination } from '@/components/ui/Pagination';
import AdminLayout from '@/components/layout/AdminLayout';

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
  isbn?: string;
}

export default function AdminBooksPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  // Use direct API call instead of React Query for more reliable data
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const booksPerPage = 10; // Number of books to display per page

  // Function to fetch books directly with pagination
  const fetchBooks = async (page = currentPage) => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5261';

      // Get the authentication token from localStorage
      const token = localStorage.getItem('token');

      // If searching, fetch all books to filter client-side
      const pageSize = searchTerm.trim() !== '' ? 1000 : booksPerPage;

      const response = await fetch(`${apiUrl}/api/Books?page=${page}&pageSize=${pageSize}&_t=${Date.now()}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Direct API books response:', data);

      // Extract books from the response
      const booksData = data.Data || data.data || [];

      // Get total count and calculate total pages
      const totalCount = data.TotalCount || data.totalCount || booksData.length;
      const calculatedTotalPages = Math.ceil(totalCount / booksPerPage);

      setTotalBooks(totalCount);
      setTotalPages(calculatedTotalPages);

      // Make sure we have valid book objects with required fields
      const validBooks = Array.isArray(booksData) ? booksData.map(book => ({
        id: book.id || book.Id || 0,
        title: book.title || book.Title || 'Untitled',
        author: book.author || book.Author || 'Unknown Author',
        price: typeof book.price === 'number' ? book.price :
               typeof book.Price === 'number' ? book.Price : 0,
        genre: book.genre || book.Genre || 'Unknown',
        format: book.format || book.Format || 'Unknown',
        inventoryCount: book.inventoryCount || book.InventoryCount || 0,
        isbn: book.isbn || book.ISBN || '',
        coverImage: book.coverImage || book.CoverImage || null,
        publishedDate: book.publishedDate || book.PublishedDate || '',
        language: book.language || book.Language || 'Unknown',
        publisher: book.publisher || book.Publisher || '',
        isAvailableInLibrary: book.isAvailableInLibrary || book.IsAvailableInLibrary || false,
        totalSold: book.totalSold || book.TotalSold || 0,
        averageRating: book.averageRating || book.AverageRating || 0
      })) : [];

      setBooks(validBooks);
      setCurrentPage(page);
      setLoading(false);
      setError('');
    } catch (err: any) {
      console.error('Error fetching books:', err);
      setError(err.message || 'Failed to load books');
      setLoading(false);
    }
  };

  // Fetch books on mount, page change, and when search term changes
  useEffect(() => {
    // Reset to page 1 when search term changes
    if (searchTerm.trim() !== '') {
      setCurrentPage(1);
    }
    fetchBooks(1);
  }, [searchTerm]);

  // Fetch books when page changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      fetchBooks(currentPage);
    }
  }, [currentPage]);

  // Initial fetch on mount
  useEffect(() => {
    fetchBooks(1);
  }, []);

  // Check for refresh parameter in URL
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const refresh = searchParams.get('refresh');

    if (refresh) {
      // If refresh parameter exists, fetch books again
      fetchBooks(1);

      // Remove the refresh parameter from the URL without reloading the page
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [router.asPath]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Use React Query mutation for deleting books
  const deleteBookMutation = useDeleteBook();

  // Filter books based on search term
  const filteredBooks = searchTerm.trim() === ''
    ? books // When not searching, books are already paginated from the API
    : books.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.isbn?.toLowerCase().includes(searchTerm.toLowerCase())
      );

  // Calculate total pages for search results
  useEffect(() => {
    if (searchTerm.trim() !== '') {
      const calculatedTotalPages = Math.ceil(filteredBooks.length / booksPerPage);
      setTotalPages(calculatedTotalPages || 1);
    }
  }, [filteredBooks.length, searchTerm]);

  // Get current page of books for search results
  const currentBooks = searchTerm.trim() !== ''
    ? filteredBooks.slice(
        (currentPage - 1) * booksPerPage,
        currentPage * booksPerPage
      )
    : filteredBooks;

  // We no longer need this useEffect since we're computing filteredBooks directly
  // from the books array and searchTerm in the component body

  // Handle book deletion
  const handleDeleteBook = async (id: number) => {
    if (!confirm('Are you sure you want to delete this book?')) {
      return;
    }

    try {
      setDeleteLoading(id);

      // Use the bookService instead of direct fetch for better error handling
      const result = await bookService.deleteBook(id);

      if (result.success) {
        toast.success('Book deleted successfully');
        // Remove the book from the local state
        setBooks(books.filter(book => book.id !== id));
        // Refresh the book list to ensure we have the latest data
        fetchBooks(currentPage);
      } else {
        toast.error(result.message || 'Failed to delete book');
      }
    } catch (error: any) {
      console.error('Error deleting book:', error);
      toast.error(error.message || 'An error occurred while deleting the book');
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <ProtectedRoute requiredRole="Admin">
      <AdminLayout>
        <div>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-black">Manage Books</h1>
            <Link href="/admin/books/add" className="w-auto">
              <div className="bg-primary hover:bg-primary-dark text-black font-medium py-3 px-6 rounded-xl shadow-soft hover:shadow-hover transition-all duration-200 flex items-center justify-center">
                <FaPlus className="mr-3" /> Add New Book
              </div>
            </Link>
          </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FaSearch className="text-neutral" />
          </div>
          <input
            type="text"
            placeholder="Search by title, author, or ISBN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-4 py-3 w-full border border-neutral-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-soft"
          />
        </div>
      </div>

      {/* Books Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-neutral">Loading books...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-destructive text-lg">{error}</p>
          <button
            onClick={() => router.refresh()}
            className="mt-4 bg-primary hover:bg-primary-dark text-black py-2 px-6 rounded-xl shadow-soft hover:shadow-hover transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      ) : currentBooks.length > 0 ? (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-soft">
          <table className="min-w-full divide-y divide-neutral-light">
            <thead>
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-black uppercase tracking-wider">
                  Book
                </th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-black uppercase tracking-wider">
                  Genre
                </th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-black uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-black uppercase tracking-wider">
                  Inventory
                </th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-black uppercase tracking-wider">
                  Format
                </th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-black uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-light">
              {currentBooks.map((book) => (
                <tr key={book.id} className="hover:bg-neutral-light/30 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {book.coverImage ? (
                          <img
                            className="h-10 w-10 object-cover rounded"
                            src={bookService.ensureValidImageUrl(book.coverImage)}
                            alt={book.title}
                            onError={(e) => {
                              e.currentTarget.src = `https://picsum.photos/seed/${book.id}/40/40`;
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-neutral-light flex items-center justify-center text-neutral">
                            No img
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-black">{book.title || 'Untitled'}</div>
                        <div className="text-sm text-neutral">{book.author || 'Unknown Author'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-black">{book.genre || 'Unknown'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-black">${(book.price || 0).toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-black">{book.inventoryCount || 0}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-black">{book.format || 'Unknown'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link href={`/admin/books/edit/${book.id}`}>
                        <button className="bg-primary/10 hover:bg-primary/20 text-primary p-2 rounded-lg transition-colors duration-200">
                          <FaEdit />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDeleteBook(book.id)}
                        className="bg-destructive/10 hover:bg-destructive/20 text-destructive p-2 rounded-lg transition-colors duration-200"
                        disabled={deleteLoading === book.id}
                      >
                        {deleteLoading === book.id ? (
                          <div className="animate-spin h-4 w-4 border-2 border-red-600 rounded-full border-t-transparent"></div>
                        ) : (
                          <FaTrash />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="py-4 px-6 border-t border-neutral-light">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <div className="text-sm text-neutral mb-4 sm:mb-0">
                Showing {currentBooks.length} of {totalBooks} books
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          {searchTerm.trim() !== '' ? (
            <>
              <p className="text-neutral text-lg">No books found matching "{searchTerm}".</p>
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 bg-primary hover:bg-primary-dark text-black py-3 px-6 rounded-xl shadow-soft hover:shadow-hover transition-all duration-200"
              >
                Clear Search
              </button>
            </>
          ) : (
            <>
              <p className="text-neutral text-lg">No books found in the catalog.</p>
              <Link href="/admin/books/add" className="inline-block mt-4">
                <div className="bg-primary hover:bg-primary-dark text-black py-3 px-6 rounded-xl shadow-soft hover:shadow-hover transition-all duration-200 flex items-center justify-center">
                  Add Your First Book
                </div>
              </Link>
            </>
          )}
        </div>
      )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
