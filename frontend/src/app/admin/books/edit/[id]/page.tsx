'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { bookService } from '@/lib/api/services/book.service';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/components/layout/AdminLayout';

export default function EditBookPage() {
  const router = useRouter();
  const params = useParams();
  const bookId = Number(params.id);

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');

  // Book form state
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [inventoryCount, setInventoryCount] = useState('');
  const [isOnSale, setIsOnSale] = useState(false);
  const [genre, setGenre] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [discountPrice, setDiscountPrice] = useState('');
  const [isbn, setIsbn] = useState('');
  const [language, setLanguage] = useState('English');
  const [format, setFormat] = useState('Paperback');
  const [publisher, setPublisher] = useState('');
  const [isAvailableInLibrary, setIsAvailableInLibrary] = useState(true);
  const [publishedDate, setPublishedDate] = useState(
    new Date().toISOString().split('T')[0]
  );



  // Fetch book details
  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setFetchLoading(true);
        setError('');

        const response = await bookService.getBookById(bookId);

        if (response.success && response.book) {
          const book = response.book;
          setTitle(book.title);
          setAuthor(book.author);
          setDescription(book.description || '');
          setPrice(book.price.toString());
          setInventoryCount(book.inventoryCount?.toString() || '0');
          setIsOnSale(book.isOnSale || false);
          setGenre(book.genre || '');
          setCoverImage(book.coverImage || '');
          setDiscountPrice(book.discountPrice?.toString() || '');
          setIsbn(book.isbn || '');
          setLanguage(book.language || 'English');
          setFormat(book.format || 'Paperback');
          setPublisher(book.publisher || '');
          setIsAvailableInLibrary(book.isAvailableInLibrary || true);

          // Format the date for the date input
          if (book.publishedDate) {
            const date = new Date(book.publishedDate);
            setPublishedDate(date.toISOString().split('T')[0]);
          }
        } else {
          setError(response.message || 'Failed to load book details');
          toast.error('Failed to load book details');
        }
      } catch (error) {
        console.error('Error fetching book details:', error);
        setError('An error occurred while loading book details');
        toast.error('An error occurred while loading book details');
      } finally {
        setFetchLoading(false);
      }
    };

    if (bookId) {
      fetchBookDetails();
    }
  }, [bookId]);

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverImageFile(file);

    // Create a preview URL
    const previewUrl = URL.createObjectURL(file);
    setCoverImagePreview(previewUrl);

    // Clear the text input for cover image URL
    setCoverImage('');
  };

  // Clear the selected file
  const handleClearFile = () => {
    setCoverImageFile(null);
    setCoverImagePreview(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const bookData = {
        title,
        author,
        description,
        price: parseFloat(price),
        inventoryCount: parseInt(inventoryCount),
        isOnSale,
        genre,
        coverImage: coverImage || null, // This will be replaced if a file is uploaded
        discountPrice: isOnSale && discountPrice ? parseFloat(discountPrice) : null,
        isbn,
        language,
        format,
        publisher,
        isAvailableInLibrary,
        publishedDate: new Date(publishedDate).toISOString(),
        averageRating: 0
      };

      // First, update the book
      const response = await bookService.updateBook(bookId, bookData);

      if (response.success) {
        // If a file was selected, upload it
        if (coverImageFile) {
          console.log('Uploading cover image for book ID:', bookId);
          const uploadResponse = await bookService.uploadBookCover(bookId, coverImageFile);
          if (!uploadResponse.success) {
            toast.error('Book was updated but cover image upload failed: ' + uploadResponse.message);
          } else {
            console.log('Cover image uploaded successfully:', uploadResponse.coverImagePath);
          }
        }

        toast.success('Book updated successfully!');
        router.push('/admin/books');
      } else {
        toast.error(response.message || 'Failed to update book');
      }
    } catch (error) {
      console.error('Error updating book:', error);
      toast.error('An error occurred while updating the book');
    } finally {
      setLoading(false);
    }
  };



  const renderContent = () => {
    if (fetchLoading) {
      return (
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-neutral">Loading book details...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-destructive text-lg">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 bg-primary hover:bg-primary-dark text-black py-2 px-6 rounded-xl shadow-soft hover:shadow-hover transition-all duration-200"
          >
            Go Back
          </button>
        </div>
      );
    }

    return (
      <div>
      <div className="flex items-center mb-8">
        <button
          onClick={() => router.back()}
          className="mr-4 text-black hover:text-neutral-dark"
        >
          <FaArrowLeft className="text-xl" />
        </button>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-black">Edit Book</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-soft p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-black border-b pb-2">Basic Information</h2>

            <div>
              <label className="block text-sm font-medium text-black mb-1">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full border border-neutral-light rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">Author *</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
                className="w-full border border-neutral-light rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">ISBN *</label>
              <input
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                required
                className="w-full border border-neutral-light rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">Genre *</label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                required
                className="w-full border border-neutral-light rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">Publisher *</label>
              <input
                type="text"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                required
                className="w-full border border-neutral-light rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">Published Date *</label>
              <input
                type="date"
                value={publishedDate}
                onChange={(e) => setPublishedDate(e.target.value)}
                required
                className="w-full border border-neutral-light rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-black border-b pb-2">Additional Details</h2>

            <div>
              <label className="block text-sm font-medium text-black mb-1">Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                className="w-full border border-neutral-light rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">Cover Image</label>
              <div className="space-y-2">
                {/* Current image preview */}
                {coverImage && !coverImagePreview && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-1">Current image:</p>
                    <div className="relative h-40 w-32 bg-gray-100 border border-gray-300 rounded-md overflow-hidden">
                      <img
                        src={bookService.ensureValidImageUrl(coverImage) || ''}
                        alt="Current cover"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = `https://picsum.photos/seed/${bookId}/128/180`;
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* File upload */}
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-black file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                  />
                  {coverImageFile && (
                    <button
                      type="button"
                      onClick={handleClearFile}
                      className="text-red-600 hover:text-red-800"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* New image preview */}
                {coverImagePreview && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-1">New image preview:</p>
                    <div className="relative h-40 w-32 bg-gray-100 border border-gray-300 rounded-md overflow-hidden">
                      <img
                        src={coverImagePreview}
                        alt="Cover preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* OR divider */}
                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">OR</span>
                  </div>
                </div>

                {/* URL input */}
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Cover Image URL</label>
                  <input
                    type="text"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://example.com/book-cover.jpg"
                    className="w-full border border-neutral-light rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    disabled={!!coverImageFile}
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter a URL for the book cover image</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full border border-neutral-light rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Chinese">Chinese</option>
                <option value="Japanese">Japanese</option>
                <option value="Russian">Russian</option>
                <option value="Arabic">Arabic</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full border border-neutral-light rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="Paperback">Paperback</option>
                <option value="Hardcover">Hardcover</option>
                <option value="E-Book">E-Book</option>
                <option value="Audiobook">Audiobook</option>
                <option value="Limited Edition">Limited Edition</option>
                <option value="Signed Copy">Signed Copy</option>
                <option value="First Edition">First Edition</option>
                <option value="Collector's Edition">Collector's Edition</option>
                <option value="Deluxe Edition">Deluxe Edition</option>
              </select>
            </div>
          </div>

          {/* Pricing and Inventory */}
          <div className="space-y-4 md:col-span-2">
            <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Pricing and Inventory</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">Price ($) *</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  min="0.01"
                  step="0.01"
                  className="w-full border border-neutral-light rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">Inventory Count *</label>
                <input
                  type="number"
                  value={inventoryCount}
                  onChange={(e) => setInventoryCount(e.target.value)}
                  required
                  min="0"
                  className="w-full border border-neutral-light rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isOnSale"
                    checked={isOnSale}
                    onChange={(e) => setIsOnSale(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isOnSale" className="ml-2 block text-sm text-gray-700">
                    On Sale
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isAvailableInLibrary"
                    checked={isAvailableInLibrary}
                    onChange={(e) => setIsAvailableInLibrary(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isAvailableInLibrary" className="ml-2 block text-sm text-gray-700">
                    Available in Library
                  </label>
                </div>
              </div>
            </div>

            {isOnSale && (
              <div className="md:w-1/3">
                <label className="block text-sm font-medium text-black mb-1">Discount Price ($)</label>
                <input
                  type="number"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  min="0.01"
                  step="0.01"
                  className="w-full border border-neutral-light rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 mr-4"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-primary hover:bg-primary-dark text-black py-2 px-6 rounded-xl shadow-soft hover:shadow-hover transition-all duration-200 flex items-center justify-center"
            disabled={loading}
          >
            <FaSave className="mr-2" />
            {loading ? 'Saving...' : 'Update Book'}
          </Button>
        </div>
      </form>
    </div>
    );
  };

  return (
    <ProtectedRoute requiredRole="Admin">
      <AdminLayout>
        {renderContent()}
      </AdminLayout>
    </ProtectedRoute>
  );
}
