'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaChartBar, FaChartLine, FaChartPie, FaDownload } from 'react-icons/fa';
import { bookService } from '@/lib/api/services/book.service';
import { dashboardService } from '@/lib/api/services/dashboard.service';
import ProtectedRoute from '@/components/ProtectedRoute';
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

export default function ReportsPage() {
  const router = useRouter();
  const [bookStats, setBookStats] = useState<BookStats>({
    totalBooks: 0,
    totalSold: 0,
    totalInStock: 0,
    topSellingBooks: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sales');

  useEffect(() => {
    const fetchBookStats = async () => {
      try {
        setLoading(true);
        console.log('Reports page: Fetching book stats using dashboard service...');

        // Use the dashboard service to get real stats from the backend
        const response = await dashboardService.getDashboardStats();
        console.log('Reports page: Dashboard stats response:', response);

        if (response.success) {
          console.log('Reports page: Successfully retrieved dashboard stats');

          // Get the stats from the response
          const stats = response.stats;

          // Handle both camelCase and PascalCase in the response
          const totalBooks = stats.totalBooks || stats.TotalBooks || 0;
          const totalSold = stats.totalSold || stats.TotalSold || 0;
          const totalInStock = stats.totalInStock || stats.TotalInStock || 0;

          // Process top selling books to ensure consistent property names
          const rawTopSellingBooks = stats.topSellingBooks || stats.TopSellingBooks || [];
          console.log('Reports page: Raw top selling books:', rawTopSellingBooks);

          // Get top 10 selling books with proper property handling
          const topSellingBooks = Array.isArray(rawTopSellingBooks)
            ? rawTopSellingBooks.map(book => ({
                id: book.id || book.Id || 0,
                title: book.title || book.Title || `Book #${book.id || book.Id || 0}`,
                totalSold: book.totalSold || book.TotalSold || 0
              }))
            : [];

          console.log('Reports page: Processed top selling books:', topSellingBooks);

          // Update the state with the real data
          setBookStats({
            totalBooks,
            totalSold,
            totalInStock,
            topSellingBooks
          });
        } else {
          console.log('API call failed, using sample data');
          // Sample data for demonstration
          setBookStats({
            totalBooks: 10,
            totalSold: 693,
            totalInStock: 209,
            topSellingBooks: [
              { id: 1, title: 'The Great Gatsby', totalSold: 120 },
              { id: 2, title: 'To Kill a Mockingbird', totalSold: 95 },
              { id: 3, title: '1984', totalSold: 88 },
              { id: 4, title: 'Pride and Prejudice', totalSold: 75 },
              { id: 5, title: 'The Catcher in the Rye', totalSold: 65 },
              { id: 6, title: 'The Hobbit', totalSold: 60 },
              { id: 7, title: 'Harry Potter and the Sorcerer\'s Stone', totalSold: 55 },
              { id: 8, title: 'The Lord of the Rings', totalSold: 50 },
              { id: 9, title: 'Animal Farm', totalSold: 45 },
              { id: 10, title: 'Brave New World', totalSold: 40 }
            ]
          });
        }
      } catch (error) {
        console.error('Error fetching book stats:', error);
        // Sample data for demonstration in case of error
        setBookStats({
          totalBooks: 10,
          totalSold: 693,
          totalInStock: 209,
          topSellingBooks: [
            { id: 1, title: 'The Great Gatsby', totalSold: 120 },
            { id: 2, title: 'To Kill a Mockingbird', totalSold: 95 },
            { id: 3, title: '1984', totalSold: 88 },
            { id: 4, title: 'Pride and Prejudice', totalSold: 75 },
            { id: 5, title: 'The Catcher in the Rye', totalSold: 65 },
            { id: 6, title: 'The Hobbit', totalSold: 60 },
            { id: 7, title: 'Harry Potter and the Sorcerer\'s Stone', totalSold: 55 },
            { id: 8, title: 'The Lord of the Rings', totalSold: 50 },
            { id: 9, title: 'Animal Farm', totalSold: 45 },
            { id: 10, title: 'Brave New World', totalSold: 40 }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookStats();
  }, []);

  const handleExportCSV = () => {
    // Create CSV content
    const headers = ['Title', 'Copies Sold'];

    // Handle both camelCase and PascalCase in the top selling books
    const rows = bookStats.topSellingBooks?.map(book => {
      const title = book.title || book.Title || `Book #${book.id || book.Id || 0}`;
      const totalSold = book.totalSold || book.TotalSold || 0;
      return [title, totalSold.toString()];
    }) || [];

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'top_selling_books.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ProtectedRoute adminOnly={true}>
      <AdminLayout>
        <div>
          <div className="flex items-center mb-6">
            <button
              onClick={() => router.back()}
              className="mr-4 text-black hover:text-neutral-dark"
            >
              <FaArrowLeft className="text-xl" />
            </button>
            <h1 className="text-3xl font-bold text-black">Reports</h1>
          </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('sales')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'sales'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaChartLine className="mr-2" /> Sales Report
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'inventory'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaChartBar className="mr-2" /> Inventory Report
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'performance'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaChartPie className="mr-2" /> Performance Metrics
            </button>
          </div>
        </div>

        {/* Report Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-neutral">Loading report data...</p>
          </div>
        ) : (
          <div>
            {activeTab === 'sales' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-soft p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-black">Top Selling Books</h2>
                    <button
                      onClick={handleExportCSV}
                      className="flex items-center text-sm text-primary hover:text-primary-dark"
                    >
                      <FaDownload className="mr-1" /> Export CSV
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rank
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Title
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Copies Sold
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {bookStats.topSellingBooks?.map((book, index) => {
                          // Handle both camelCase and PascalCase
                          const id = book.id || book.Id || 0;
                          const title = book.title || book.Title || `Book #${id}`;
                          const totalSold = book.totalSold || book.TotalSold || 0;

                          return (
                            <tr key={id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {index + 1}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {title}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {totalSold}
                              </td>
                            </tr>
                          );
                        })}
                        {bookStats.topSellingBooks?.length === 0 && (
                          <tr>
                            <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                              No sales data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-soft p-6">
                  <h2 className="text-xl font-semibold text-black mb-4">Sales Summary</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Total Books</p>
                      <p className="text-2xl font-bold text-black">{bookStats.totalBooks}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Total Books Sold</p>
                      <p className="text-2xl font-bold text-black">{bookStats.totalSold}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Books In Stock</p>
                      <p className="text-2xl font-bold text-black">{bookStats.totalInStock}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="text-xl font-semibold text-black mb-4">Inventory Status</h2>
                <p className="text-gray-500 mb-4">
                  Current inventory status across all books.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Total Books In Stock</p>
                    <p className="text-2xl font-bold text-black">{bookStats.totalInStock}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Total Books Sold</p>
                    <p className="text-2xl font-bold text-black">{bookStats.totalSold}</p>
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-sm text-gray-500 italic">
                    Note: Detailed inventory reports with low stock alerts and restock recommendations will be available in a future update.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="text-xl font-semibold text-black mb-4">Performance Metrics</h2>
                <p className="text-gray-500 mb-4">
                  Key performance indicators for your bookstore.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Sales Conversion Rate</p>
                    <p className="text-2xl font-bold text-black">
                      {bookStats.totalBooks > 0
                        ? `${((bookStats.totalSold / bookStats.totalBooks) * 100).toFixed(1)}%`
                        : '0%'}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Inventory Turnover</p>
                    <p className="text-2xl font-bold text-black">
                      {bookStats.totalInStock > 0
                        ? (bookStats.totalSold / bookStats.totalInStock).toFixed(2)
                        : '0'}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Books Per Category</p>
                    <p className="text-2xl font-bold text-black">Coming Soon</p>
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-sm text-gray-500 italic">
                    Note: Advanced analytics with charts and graphs will be available in a future update.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
