/**
 * Base API response interface
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: any;
  data?: T;
}

/**
 * User interface
 */
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  token?: string;
}

/**
 * Book interface
 */
export interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  price: number;
  coverImage: string | null;
  genre: string;
  publishedDate: string;
  language: string;
  format: string;
  publisher: string;
  isAvailableInLibrary: boolean;
  inventoryCount: number;
  totalSold: number;
  averageRating: number;
  isbn: string;
  isOnSale: boolean;
  discountPrice?: number;
}

/**
 * Book list response
 */
export interface BookListResponse {
  success: boolean;
  message?: string;
  books: Book[];
  totalCount?: number;
  pageCount?: number;
}

/**
 * Book detail response
 */
export interface BookDetailResponse {
  success: boolean;
  message?: string;
  book: Book | null;
}

/**
 * Cart item interface
 */
export interface CartItem {
  id: number;
  bookId: number;
  quantity: number;
  book: Book;
}

/**
 * Cart response
 */
export interface CartResponse {
  success: boolean;
  message?: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

/**
 * Bookmark interface
 */
export interface Bookmark {
  id: number;
  bookId: number;
  book: Book;
}

/**
 * Bookmark response
 */
export interface BookmarkResponse {
  success: boolean;
  message?: string;
  bookmarks: Bookmark[];
}

/**
 * Search parameters for books
 */
export interface BookSearchParams {
  keyword?: string;
  sortBy?: string;
  genre?: string;
  minPrice?: number;
  maxPrice?: number;
  author?: string;
  inStock?: boolean;
  inLibrary?: boolean;
  minRating?: number;
  language?: string;
  format?: string;
  publisher?: string;
  isbn?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Book creation/update interface
 */
export interface BookInput {
  title: string;
  author: string;
  description: string;
  price: number;
  coverImage?: string;
  genre: string;
  publishedDate: string;
  language: string;
  format: string;
  publisher: string;
  isAvailableInLibrary: boolean;
  inventoryCount: number;
  isbn: string;
  isOnSale: boolean;
  discountPrice?: number;
}

/**
 * Order item interface
 */
export interface OrderItem {
  id: number;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  price: number;
  quantity: number;
  totalPrice: number;
  coverImage: string | null;
}

/**
 * Order interface
 */
export interface Order {
  id: number;
  orderDate: string;
  totalAmount: number;
  claimCode: string;
  isProcessed: boolean;
  isCancelled: boolean;
  items: OrderItem[];
}

/**
 * Order response
 */
export interface OrderResponse {
  success: boolean;
  message?: string;
}

/**
 * Order detail response
 */
export interface OrderDetailResponse {
  success: boolean;
  message?: string;
  order: Order | null;
}

/**
 * Order list response
 */
export interface OrderListResponse {
  success: boolean;
  message?: string;
  orders: Order[];
}

/**
 * Review interface
 */
export interface Review {
  id: number;
  bookId: number;
  bookTitle: string;
  memberName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

/**
 * Review response
 */
export interface ReviewResponse {
  success: boolean;
  message?: string;
}

/**
 * Review detail response
 */
export interface ReviewDetailResponse {
  success: boolean;
  message?: string;
  review: Review | null;
}

/**
 * Review list response
 */
export interface ReviewListResponse {
  success: boolean;
  message?: string;
  reviews: Review[];
}

/**
 * Create review input
 */
export interface CreateReviewInput {
  bookId: number;
  rating: number;
  comment: string;
}

/**
 * Update review input
 */
export interface UpdateReviewInput {
  rating: number;
  comment: string;
}

/**
 * Announcement interface
 */
export interface Announcement {
  id: number;
  message: string;
  startTime: string;
  endTime: string;
  createdBy: string;
  isActive: boolean;
}

/**
 * Announcement response
 */
export interface AnnouncementResponse {
  success: boolean;
  message?: string;
}

/**
 * Announcement detail response
 */
export interface AnnouncementDetailResponse {
  success: boolean;
  message?: string;
  announcement: Announcement | null;
}

/**
 * Announcement list response
 */
export interface AnnouncementListResponse {
  success: boolean;
  message?: string;
  announcements: Announcement[];
}

/**
 * Create announcement input
 */
export interface CreateAnnouncementInput {
  message: string;
  startTime: string;
  endTime: string;
}

/**
 * Update announcement input
 */
export interface UpdateAnnouncementInput {
  message: string;
  startTime: string;
  endTime: string;
}
