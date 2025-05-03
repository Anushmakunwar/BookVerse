'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaTrash, FaMinus, FaPlus, FaArrowLeft, FaShoppingBag, FaCheckCircle } from 'react-icons/fa';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { bookService } from '@/lib/api/services/book.service';
import { useCreateOrder } from '@/lib/react-query/hooks/useOrders';
import toast from 'react-hot-toast';

export default function CartPage() {
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const {
    items,
    totalItems,
    totalPrice,
    loading,
    hasInitiallyLoaded,
    isUpdating,
    isClearing,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart
  } = useCart();
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  // Debug log to see user's totalOrders and refresh user data
  useEffect(() => {
    if (user) {
      console.log('Current user totalOrders:', user.totalOrders);
    }

    // Refresh user data when the page loads
    const refreshUserData = async () => {
      try {
        if (isAuthenticated) {
          const authService = (await import('@/lib/api')).authService;
          const userResponse = await authService.getCurrentUser();

          if (userResponse.success && userResponse.user) {
            // Update localStorage with the latest user data
            localStorage.setItem('bookstore_user', JSON.stringify(userResponse.user));
            console.log('Refreshed user data on cart page load:', userResponse.user);
          }
        }
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    };

    refreshUserData();
  }, [user, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      // Only show loading state on initial load
      refreshCart();
    }
  }, [isAuthenticated, refreshCart]);

  const handleQuantityChange = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 99) {
      await updateCartItem(cartItemId, newQuantity);
    }
  };

  // Use the createOrder mutation
  const createOrderMutation = useCreateOrder();

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsCheckingOut(true);

    try {
      // Create a real order using the order service
      const result = await createOrderMutation.mutateAsync();

      if (result.success) {
        // Mark checkout as successful
        setCheckoutSuccess(true);

        // Wait a moment to show success state, then redirect to orders page
        setTimeout(() => {
          // The cart is already cleared by the useCreateOrder hook
          // Redirect to the orders page
          router.push('/member/orders');
        }, 1500);
      } else {
        toast.error(result.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('An error occurred during checkout. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!isAuthenticated || isAdmin) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-soft p-8">
          {!isAuthenticated ? (
            <>
              <h1 className="text-2xl font-serif font-bold text-black mb-4">Please Sign In</h1>
              <p className="text-neutral mb-6">You need to be signed in to view your cart.</p>
              <Link href="/login">
                <div className="bg-primary hover:bg-primary-dark text-black py-2 px-6 rounded-xl shadow-soft hover:shadow-hover transition-all duration-200 inline-flex items-center justify-center">
                  Sign In
                </div>
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-serif font-bold text-black mb-4">Admin Access Restricted</h1>
              <p className="text-neutral mb-6">Admin users cannot access the shopping cart. Please use a member account to shop.</p>
              <Link href="/books">
                <div className="bg-primary hover:bg-primary-dark text-black py-2 px-6 rounded-xl shadow-soft hover:shadow-hover transition-all duration-200 inline-flex items-center justify-center">
                  Browse Books
                </div>
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  // Only show loading state on initial load before we've loaded the cart for the first time
  const isInitialLoading = loading && !hasInitiallyLoaded;

  // Calculate total quantity of items in cart
  const totalQuantity = items.reduce((total, item) => total + item.quantity, 0);

  if (isInitialLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-black mb-8">Your Cart</h1>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-soft p-6 flex">
              <div className="w-24 h-24 bg-neutral-light rounded-xl"></div>
              <div className="ml-4 flex-grow space-y-2">
                <div className="h-6 bg-neutral-light rounded-xl w-3/4"></div>
                <div className="h-4 bg-neutral-light rounded-xl w-1/2"></div>
                <div className="h-4 bg-neutral-light rounded-xl w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Only show empty cart message after we've loaded the cart at least once
  if (items.length === 0 && hasInitiallyLoaded && !isInitialLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-soft p-8">
          <div className="text-primary mb-4">
            <FaShoppingBag className="mx-auto h-16 w-16" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-black mb-4">Your Cart is Empty</h1>
          <p className="text-neutral mb-6">Looks like you haven't added any books to your cart yet.</p>
          <Link href="/books">
            <div className="bg-primary hover:bg-primary-dark text-black py-2 px-6 rounded-xl shadow-soft hover:shadow-hover transition-all duration-200 inline-flex items-center justify-center">
              Browse Books
            </div>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <div className="bg-white rounded-2xl shadow-soft overflow-hidden min-h-[200px]">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-serif font-semibold text-black">
                  {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
                </h2>
                <Button
                  variant="ghost"
                  onClick={clearCart}
                  className="text-destructive hover:text-destructive/80 transition-colors duration-200"
                  disabled={isClearing}
                >
                  {isClearing ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-destructive border-t-transparent"></span>
                      Clearing...
                    </>
                  ) : (
                    <>
                      <FaTrash className="mr-2" />
                      Clear Cart
                    </>
                  )}
                </Button>
              </div>

              <div className="divide-y divide-neutral-light">
                {items.map((item) => (
                  <div key={item.id} className="py-4 flex flex-col sm:flex-row">
                    <div className="sm:w-24 h-32 bg-neutral-light rounded-xl overflow-hidden mb-4 sm:mb-0 flex-shrink-0">
                      <Link href={`/books/${item.bookId}`}>
                        <Image
                          src={item.coverImage ?
                            bookService.ensureValidImageUrl(item.coverImage) ||
                            `https://picsum.photos/seed/${item.bookId}/96/128` :
                            `https://picsum.photos/seed/${item.bookId}/96/128`}
                          alt={item.bookTitle}
                          width={96}
                          height={128}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Set a default image if the book cover fails to load
                            e.currentTarget.src = `https://picsum.photos/seed/${item.bookId}/96/128`;
                          }}
                        />
                      </Link>
                    </div>

                    <div className="sm:ml-4 flex-grow min-w-0">
                      <Link href={`/books/${item.bookId}`} className="text-lg font-medium text-black hover:text-primary transition-colors duration-200 block truncate">
                        {item.bookTitle}
                      </Link>
                      <p className="text-sm text-neutral truncate">{item.bookAuthor}</p>
                      <p className="text-primary font-medium">${item.price.toFixed(2)}</p>
                    </div>

                    <div className="mt-4 sm:mt-0 flex items-center flex-shrink-0">
                      <div className="flex items-center border border-neutral-light rounded-xl mr-4 overflow-hidden shadow-soft">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || isUpdating[item.id]}
                          className="px-2 py-1 text-black hover:bg-neutral-light transition-colors duration-200 disabled:opacity-50 disabled:text-neutral"
                        >
                          <FaMinus size={12} />
                        </button>
                        <span className="px-3 py-1 text-center w-8 font-medium">
                          {isUpdating[item.id] ? (
                            <span className="inline-block h-4 w-4 animate-pulse bg-neutral-light rounded-full"></span>
                          ) : (
                            item.quantity
                          )}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={item.quantity >= 99 || isUpdating[item.id]}
                          className="px-2 py-1 text-black hover:bg-neutral-light transition-colors duration-200 disabled:opacity-50 disabled:text-neutral"
                        >
                          <FaPlus size={12} />
                        </button>
                      </div>

                      <Button
                        variant="ghost"
                        onClick={() => removeFromCart(item.id)}
                        className="text-destructive hover:text-destructive/80 w-8 h-8 flex items-center justify-center transition-colors duration-200"
                        disabled={isUpdating[item.id]}
                      >
                        {isUpdating[item.id] ? (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-destructive border-t-transparent"></span>
                        ) : (
                          <FaTrash />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Link href="/books">
              <div className="bg-white text-black border border-primary text-primary hover:bg-primary/10 py-2 px-6 rounded-xl transition-colors duration-200 inline-flex items-center justify-center shadow-soft">
                <FaArrowLeft className="mr-2" />
                Continue Shopping
              </div>
            </Link>
          </div>
        </div>

        <div className="lg:w-1/3">
          <div className="bg-white rounded-2xl shadow-soft p-6 sticky top-4">
            <h2 className="text-lg font-serif font-semibold text-black mb-4">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-neutral">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>

              {/* Potential Discounts */}
              {items.length > 0 && (
                <div className="text-sm">
                  <div className="mb-2 font-medium text-black">Available Discounts:</div>

                  {/* Volume Discount - 5% for 5+ books */}
                  <div className={`flex items-center ${totalQuantity >= 5 ? 'text-green-600' : 'text-neutral'}`}>
                    <div className={`w-4 h-4 mr-2 rounded-full border ${totalQuantity >= 5 ? 'bg-green-600 border-green-600' : 'border-neutral'} flex items-center justify-center`}>
                      {totalQuantity >= 5 && <span className="text-white text-xs">✓</span>}
                    </div>
                    <span>
                      5% volume discount
                      {totalQuantity < 5 ? ` (${totalQuantity}/5 books)` : ` (Qualified!)`}
                    </span>
                  </div>

                  {/* Loyalty Discount - 10% after 10 orders */}
                  <div className={`flex items-center ${isAuthenticated && user?.totalOrders >= 10 ? 'text-green-600' : 'text-neutral'}`}>
                    <div className={`w-4 h-4 mr-2 rounded-full border ${isAuthenticated && user?.totalOrders >= 10 ? 'bg-green-600 border-green-600' : 'border-neutral'} flex items-center justify-center`}>
                      {isAuthenticated && user?.totalOrders >= 10 && <span className="text-white text-xs">✓</span>}
                    </div>
                    <span>
                      10% loyalty discount
                      {isAuthenticated
                        ? user?.totalOrders >= 10
                          ? ` (Qualified!)`
                          : ` (${user?.totalOrders || 0}/10 orders)`
                        : ` (login to check)`}
                    </span>
                  </div>

                  {/* Current Discount Summary */}
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <span className="font-medium">Current Discount: </span>
                    {(() => {
                      const volumeDiscount = totalQuantity >= 5 ? 5 : 0;
                      const loyaltyDiscount = isAuthenticated && user?.totalOrders >= 10 ? 10 : 0;
                      const totalDiscount = volumeDiscount + loyaltyDiscount;

                      return totalDiscount > 0
                        ? <span className="text-green-600 font-medium">{totalDiscount}%</span>
                        : <span className="text-neutral">None</span>;
                    })()}
                  </div>
                </div>
              )}

              <div className="flex justify-between text-neutral">
                <span>Shipping</span>
                <span>Free</span>
              </div>

              {/* Estimated Total with Discounts */}
              {items.length > 0 && (
                <div className="flex justify-between text-neutral">
                  <span>Estimated Discount</span>
                  <span className="text-green-600">
                    {(() => {
                      // Calculate volume discount (5% for 5+ books)
                      const volumeDiscount = totalQuantity >= 5 ? 0.05 : 0;

                      // Calculate loyalty discount (10% for 10+ orders)
                      const loyaltyDiscount = isAuthenticated && user?.totalOrders >= 10 ? 0.10 : 0;

                      // Calculate total discount percentage
                      const totalDiscountRate = volumeDiscount + loyaltyDiscount;

                      // Calculate discount amount
                      const discountAmount = totalPrice * totalDiscountRate;

                      // Format discount display
                      if (totalDiscountRate > 0) {
                        const discountPercentage = Math.round(totalDiscountRate * 100);
                        return `-$${discountAmount.toFixed(2)} (${discountPercentage}%)`;
                      } else {
                        return '$0.00';
                      }
                    })()}
                  </span>
                </div>
              )}

              <div className="border-t border-neutral-light pt-3 flex justify-between font-semibold text-black">
                <span>Estimated Total</span>
                <span>
                  {(() => {
                    // Calculate volume discount (5% for 5+ books)
                    const volumeDiscount = totalQuantity >= 5 ? 0.05 : 0;

                    // Calculate loyalty discount (10% for 10+ orders)
                    const loyaltyDiscount = isAuthenticated && user?.totalOrders >= 10 ? 0.10 : 0;

                    // Calculate total discount percentage
                    const totalDiscountRate = volumeDiscount + loyaltyDiscount;

                    // Calculate final price
                    const finalPrice = totalPrice * (1 - totalDiscountRate);

                    return `$${finalPrice.toFixed(2)}`;
                  })()}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isCheckingOut || checkoutSuccess}
              className="w-full bg-primary hover:bg-primary-dark text-black py-3 px-6 rounded-xl shadow-soft hover:shadow-hover transition-all duration-200 font-medium flex items-center justify-center"
            >
              {isCheckingOut ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent"></span>
                  Processing...
                </>
              ) : checkoutSuccess ? (
                <>
                  <FaCheckCircle className="mr-2" />
                  Order Placed!
                </>
              ) : (
                'Proceed to Checkout'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
