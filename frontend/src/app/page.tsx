'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { bookService } from '@/lib/api/services/book.service';
import BookCard from '@/components/BookCard';
import { Button } from '@/components/ui/Button';
import { FaArrowRight, FaBook, FaBookmark, FaShoppingCart } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import HomeAnnouncements from '@/components/home/HomeAnnouncements';

interface Book {
  id: number;
  title: string;
  author: string;
  price: number;
  coverImage: string | null;
}

// Book interface for the featured books section

export default function Home() {
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  // Redirect admin users to admin page
  useEffect(() => {
    if (isAuthenticated && user?.role === 'Admin') {
      console.log('Admin user detected on homepage, redirecting to admin dashboard');
      router.push('/admin');
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        console.log('Fetching books...');
        // Make a direct fetch to the API
        const directResponse = await fetch('http://localhost:5261/api/Books');
        const data = await directResponse.json();
        console.log('Direct API response:', data);

        if (data && data.Data && Array.isArray(data.Data)) {
          const transformedBooks = data.Data.map(book => ({
            id: book.Id || book.id,
            title: book.Title || book.title,
            author: book.Author || book.author,
            price: book.Price || book.price || 0,
            coverImage: book.CoverImage || book.coverImage,
          }));
          console.log('Transformed books from direct API:', transformedBooks);
          setFeaturedBooks(transformedBooks.slice(0, 4));
        } else {
          console.error('Invalid direct API response:', data);
          // Try using the service as a fallback
          const response = await bookService.getAllBooks();
          console.log('Featured books response from service:', response);

          if (response.success && Array.isArray(response.books) && response.books.length > 0) {
            console.log('Books array length:', response.books.length);
            // Get up to 4 books for the featured section
            const books = response.books.slice(0, 4);
            console.log('Featured books:', books);
            setFeaturedBooks(books);
          } else {
            console.error('Both direct API and service failed to get books');
          }
        }
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  return (
    <div className="space-y-16">
      {/* Announcements Section */}
      <HomeAnnouncements />

      {/* Hero Section */}
      <section className="gradient-bg text-white rounded-3xl shadow-hover overflow-hidden">
        <div className="container mx-auto px-6 py-20 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-12 md:mb-0">
            <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight mb-6">
              Find Your <span className="text-accent">Perfect</span> Read
            </h1>
            <p className="text-gray-100 text-lg mb-10 max-w-lg">
              Explore our curated collection of books that will transport you to new worlds, expand your mind, and touch your heart.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/books">
                <Button className="bg-accent hover:bg-black/90 hover:cursor-pointer text-[#264653] font-medium px-8 py-3 rounded-full text-white border">
                  Explore Books
                  <FaArrowRight className="ml-2" />
                </Button>
              </Link>
              {/* Only show Sign In button if user is not authenticated */}
              {!isAuthenticated && (
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="border-white text-white hover:bg-white/10 rounded-full px-8 py-3 text-base"
                  >
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-secondary/20 rounded-full blur-2xl"></div>

              {/* Book stack */}
              <div className="relative z-10 grid grid-cols-2 gap-6">
                <div className="bg-primary p-6 rounded-2xl shadow-soft transform -rotate-6 transition-transform hover:rotate-0 duration-300">
                  <FaBook className="text-7xl text-white/80" />
                </div>
                <div className="bg-secondary p-6 rounded-2xl shadow-soft transform rotate-6 mt-12 transition-transform hover:rotate-0 duration-300">
                  <FaBook className="text-7xl text-white/80" />
                </div>
                <div className="bg-accent p-6 rounded-2xl shadow-soft transform -rotate-3 mt-4 transition-transform hover:rotate-0 duration-300">
                  <FaBook className="text-7xl text-white/80" />
                </div>
                <div className="bg-[#264653] p-6 rounded-2xl shadow-soft transform rotate-12 transition-transform hover:rotate-0 duration-300">
                  <FaBook className="text-7xl text-white/80" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-neutral-dark mb-2">Featured Books</h2>
              <p className="text-neutral max-w-2xl">Handpicked selections from our latest and most popular titles</p>
            </div>
            <Link href="/books" className="mt-4 md:mt-0">
              <Button
                variant="ghost"
                className="text-primary hover:text-primary-dark hover:bg-primary-light rounded-full px-6 py-2 transition-all duration-300"
              >
                View All <FaArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, index) => (
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredBooks.map((book) => (
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
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-primary-light rounded-3xl">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary-dark mb-4">Browse by Category</h2>
            <p className="text-neutral max-w-2xl mx-auto">Discover books in your favorite genres</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['Fiction', 'Non-Fiction', 'Mystery', 'Science Fiction', 'Romance', 'Biography', 'History', 'Self-Help'].map((category, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-soft p-6 text-center hover:shadow-hover transition-all duration-300 transform hover:-translate-y-1"
              >
                <h3 className="text-lg font-medium text-primary-dark">{category}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-neutral-dark mb-4">Why Choose BookVerse</h2>
            <p className="text-neutral max-w-2xl mx-auto">Experience the best online bookstore with features designed for book lovers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-2xl shadow-soft text-center group hover:shadow-hover transition-all duration-300">
              <div className="bg-primary-light w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary group-hover:rotate-6 transition-all duration-300">
                <FaBook className="text-primary text-3xl group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-neutral-dark">Extensive Collection</h3>
              <p className="text-neutral">Discover thousands of books across every genre imaginable, from bestsellers to rare finds.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-soft text-center group hover:shadow-hover transition-all duration-300">
              <div className="bg-secondary-light w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-secondary group-hover:rotate-6 transition-all duration-300">
                <FaBookmark className="text-secondary text-3xl group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-neutral-dark">Personalized Bookmarks</h3>
              <p className="text-neutral">Create your own reading wishlist by bookmarking titles you want to revisit later.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-soft text-center group hover:shadow-hover transition-all duration-300">
              <div className="bg-accent/20 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-accent group-hover:rotate-6 transition-all duration-300">
                <FaShoppingCart className="text-accent text-3xl group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-neutral-dark">Seamless Shopping</h3>
              <p className="text-neutral">Enjoy a smooth and secure checkout process with multiple payment options and fast delivery.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-[#264653] rounded-3xl text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Ready to Start Reading?</h2>
          <p className="text-gray-300 max-w-2xl mx-auto mb-10">Join thousands of happy readers who have found their next favorite book with us.</p>
          <Link href="/books">
            <Button className="bg-accent hover:bg-accent/90 text-[#264653] font-medium px-8 py-3 rounded-full text-white border hover:bg-black hover:cursor-pointer">
              Explore Our Collection
              <FaArrowRight className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
