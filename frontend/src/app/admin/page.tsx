'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaBook, FaUsers, FaShoppingCart, FaChartLine, FaPlus, FaList, FaBullhorn, FaUserCog } from 'react-icons/fa';
import { Button } from '@/components/ui/Button';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { toast } from 'react-hot-toast';
import { dashboardService, DashboardStats } from '@/lib/api/services/dashboard.service';
import AdminLayout from '@/components/layout/AdminLayout';

interface BookStats {
  totalBooks: number;
  totalSold: number;
  totalInStock: number;
  topSellingBooks?: Array<{
    id: number;
    title: string;
    totalSold: number;
  }>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [bookStats, setBookStats] = useState<BookStats>({
    totalBooks: 0,
    totalSold: 0,
    totalInStock: 0,
    topSellingBooks: []
  });
  const [loading, setLoading] = useState(true);

  const fetchBookStats = async () => {
    try {
      setLoading(true);
      console.log('Admin dashboard: Fetching book stats...');
      const response = await dashboardService.getDashboardStats();
      console.log('Admin dashboard: Response received:', response);

      if (response.success) {
        console.log('Admin dashboard: Stats data:', response.stats);

        // Log top selling books specifically
        console.log('Admin dashboard: Top selling books:', response.stats.topSellingBooks);
        if (Array.isArray(response.stats.topSellingBooks) && response.stats.topSellingBooks.length > 0) {
          console.log('Admin dashboard: First top selling book:', response.stats.topSellingBooks[0]);
          console.log('Admin dashboard: Top selling book properties:', Object.keys(response.stats.topSellingBooks[0]));
        }

        // Handle both camelCase and PascalCase in the response
        const stats = response.stats;

        // Process top selling books to ensure consistent property names
        const topSellingBooks = Array.isArray(stats.topSellingBooks || stats.TopSellingBooks)
          ? (stats.topSellingBooks || stats.TopSellingBooks).map(book => ({
              id: book.id || book.Id || 0,
              title: book.title || book.Title || '',
              totalSold: book.totalSold || book.TotalSold || 0
            }))
          : [];

        setBookStats({
          totalBooks: stats.totalBooks || stats.TotalBooks || 0,
          totalSold: stats.totalSold || stats.TotalSold || 0,
          totalInStock: stats.totalInStock || stats.TotalInStock || 0,
          topSellingBooks: topSellingBooks
        });
        console.log('Admin dashboard: State updated with new stats');
      } else {
        console.error('Failed to fetch dashboard stats:', response.message);
        toast.error('Failed to load dashboard statistics');
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('An error occurred while loading dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookStats();
  }, []);

  return (
    <ProtectedRoute adminOnly={true}>
      <AdminLayout>
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-neutral-dark mb-8">Admin Dashboard</h1>

          {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-soft p-6 overflow-hidden relative group card-hover">
            <div className="absolute right-0 top-0 w-24 h-24 bg-primary/10 rounded-bl-3xl -mr-8 -mt-8 transition-all duration-300 group-hover:bg-primary/20"></div>
            <div className="flex items-center">
              <div className="bg-primary/10 p-4 rounded-xl mr-4 text-primary">
                <FaBook className="text-2xl" />
              </div>
              <div>
                <p className="text-neutral font-medium">Total Books</p>
                <p className="text-3xl font-bold text-neutral-dark">{loading ? '...' : bookStats.totalBooks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-6 overflow-hidden relative group card-hover">
            <div className="absolute right-0 top-0 w-24 h-24 bg-accent/10 rounded-bl-3xl -mr-8 -mt-8 transition-all duration-300 group-hover:bg-accent/20"></div>
            <div className="flex items-center">
              <div className="bg-accent/10 p-4 rounded-xl mr-4 text-accent">
                <FaShoppingCart className="text-2xl" />
              </div>
              <div>
                <p className="text-neutral font-medium">Total Books Sold</p>
                <p className="text-3xl font-bold text-neutral-dark">{loading ? '...' : bookStats.totalSold}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-6 overflow-hidden relative group card-hover">
            <div className="absolute right-0 top-0 w-24 h-24 bg-secondary/10 rounded-bl-3xl -mr-8 -mt-8 transition-all duration-300 group-hover:bg-secondary/20"></div>
            <div className="flex items-center">
              <div className="bg-secondary/10 p-4 rounded-xl mr-4 text-secondary">
                <FaList className="text-2xl" />
              </div>
              <div>
                <p className="text-neutral font-medium">Books In Stock</p>
                <p className="text-3xl font-bold text-neutral-dark">{loading ? '...' : bookStats.totalInStock}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-soft p-8 mb-8">
          <h2 className="text-2xl font-serif font-bold text-neutral-dark mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            <Link href="/admin/books" className="w-full">
              <div className="w-full bg-primary hover:bg-primary-dark text-black font-medium py-4 px-6 rounded-xl shadow-soft hover:shadow-hover transition-all duration-200 flex items-center justify-center">
                <FaBook className="mr-3 text-lg" /> Manage Books
              </div>
            </Link>
            <Link href="/admin/books/add" className="w-full">
              <div className="w-full bg-accent hover:bg-accent/90 text-black font-medium py-4 px-6 rounded-xl shadow-soft hover:shadow-hover transition-all duration-200 flex items-center justify-center">
                <FaPlus className="mr-3 text-lg" /> Add New Book
              </div>
            </Link>
            <Link href="/admin/announcements" className="w-full">
              <div className="w-full bg-primary hover:bg-primary-dark text-black font-medium py-4 px-6 rounded-xl shadow-soft hover:shadow-hover transition-all duration-200 flex items-center justify-center">
                <FaBullhorn className="mr-3 text-lg" /> Manage Announcements
              </div>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Link href="/admin/users" className="w-full">
              <div className="w-full bg-secondary hover:bg-secondary-dark text-black font-medium py-4 px-6 rounded-xl shadow-soft hover:shadow-hover transition-all duration-200 flex items-center justify-center">
                <FaUserCog className="mr-3 text-lg" /> Manage Users
              </div>
            </Link>
            <Link href="/admin/reports" className="w-full">
              <div className="w-full bg-secondary hover:bg-secondary-dark text-black font-medium py-4 px-6 rounded-xl shadow-soft hover:shadow-hover transition-all duration-200 flex items-center justify-center">
                <FaChartLine className="mr-3 text-lg" /> View Reports
              </div>
            </Link>
            <Link href="/staff/orders" className="w-full">
              <div className="w-full bg-accent hover:bg-accent/90 text-black font-medium py-4 px-6 rounded-xl shadow-soft hover:shadow-hover transition-all duration-200 flex items-center justify-center">
                <FaShoppingCart className="mr-3 text-lg" /> Process Orders
              </div>
            </Link>
          </div>
        </div>

        {/* Top Selling Books */}
        <div className="bg-white rounded-2xl shadow-soft p-8">
          <h2 className="text-2xl font-serif font-bold text-neutral-dark mb-6">Top Selling Books</h2>
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="h-12 bg-neutral-light rounded-lg"></div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-light">
                <thead>
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-neutral-dark uppercase tracking-wider">Title</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-neutral-dark uppercase tracking-wider">Copies Sold</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-neutral-dark uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-light">
                  {bookStats.topSellingBooks?.map((book) => {
                    // Log each book to debug
                    console.log('Rendering book:', book);

                    // Handle both camelCase and PascalCase
                    const id = book.id || book.Id || 0;
                    const title = book.title || book.Title || `Book #${id}`;
                    const totalSold = book.totalSold || book.TotalSold || 0;

                    return (
                      <tr key={id} className="hover:bg-neutral-light/30 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-dark">
                          {title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral">
                          {totalSold}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link href={`/admin/books/edit/${id}`}>
                            <div className="inline-flex bg-primary/10 hover:bg-primary/20 text-primary font-medium px-4 py-2 rounded-lg transition-colors duration-200">
                              Edit
                            </div>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                  {bookStats.topSellingBooks?.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-6 text-center text-neutral">
                        No sales data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}