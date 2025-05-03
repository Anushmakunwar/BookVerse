import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names into a single string
 * Uses clsx for conditional classes and tailwind-merge to handle Tailwind conflicts
 *
 * @param inputs - Class names to combine
 * @returns Combined class name string
 *
 * @example
 * ```tsx
 * <div className={cn('text-red-500', isActive && 'bg-blue-500', 'p-4')}>
 *   Conditional classes
 * </div>
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a price as a currency string
 *
 * @param price - Price to format
 * @param currency - Currency code (default: USD)
 * @returns Formatted price string
 *
 * @example
 * ```tsx
 * <p>{formatPrice(19.99)}</p> // "$19.99"
 * <p>{formatPrice(19.99, 'EUR')}</p> // "€19.99"
 * ```
 */
export function formatPrice(price: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
}

/**
 * Formats a date as a string
 *
 * @param date - Date to format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 *
 * @example
 * ```tsx
 * <p>{formatDate('2023-01-01')}</p> // "Jan 1, 2023"
 * ```
 */
export function formatDate(
  date: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
) {
  // Handle null, undefined, or empty string
  if (!date) {
    return 'N/A';
  }

  // Convert string to Date if needed
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  // Format the valid date
  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
}

/**
 * Truncates a string to a specified length
 *
 * @param str - String to truncate
 * @param length - Maximum length
 * @returns Truncated string
 *
 * @example
 * ```tsx
 * <p>{truncate('This is a long string', 10)}</p> // "This is a..."
 * ```
 */
export function truncate(str: string, length: number) {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
}

/**
 * Generates a random ID
 *
 * @returns Random ID string
 *
 * @example
 * ```tsx
 * <div id={generateId()}>Random ID</div>
 * ```
 */
export function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Debounces a function
 *
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 *
 * @example
 * ```tsx
 * const handleSearch = debounce((value) => {
 *   // Search logic
 * }, 300);
 * ```
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
) {
  let timeoutId: NodeJS.Timeout;
  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Extracts the member ID from an order object
 * Tries different properties that might contain the user ID
 *
 * @param order - Order object
 * @returns Member ID as a string or empty string if not found
 *
 * @example
 * ```tsx
 * const memberId = extractMemberId(order);
 * if (memberId) {
 *   // Process order
 * }
 * ```
 */
export function extractMemberId(order: any): string {
  // Log the order object to help with debugging
  console.log('Extracting member ID from order:', order);

  // Try different properties that might contain the user ID
  const memberId = order.userId ||
                  order.memberId ||
                  order.customerId ||
                  order.user?.id ||
                  order.member?.id ||
                  order.memberProfile?.userId ||
                  '';

  console.log('Extracted member ID:', memberId);
  return memberId ? memberId.toString() : '';
}