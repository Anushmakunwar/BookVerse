import { z } from 'zod';

/**
 * Book form schema
 */
export const bookSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  author: z
    .string()
    .min(1, 'Author is required')
    .max(100, 'Author must be less than 100 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(2000, 'Description must be less than 2000 characters'),
  price: z
    .number({
      required_error: 'Price is required',
      invalid_type_error: 'Price must be a number',
    })
    .min(0, 'Price must be at least 0')
    .max(1000, 'Price must be less than 1000'),
  genre: z
    .string()
    .min(1, 'Genre is required'),
  publishedDate: z
    .string()
    .min(1, 'Published date is required'),
  language: z
    .string()
    .min(1, 'Language is required'),
  format: z
    .string()
    .min(1, 'Format is required'),
  publisher: z
    .string()
    .min(1, 'Publisher is required'),
  isAvailableInLibrary: z
    .boolean()
    .default(false),
  inventoryCount: z
    .number({
      required_error: 'Inventory count is required',
      invalid_type_error: 'Inventory count must be a number',
    })
    .min(0, 'Inventory count must be at least 0')
    .max(10000, 'Inventory count must be less than 10000'),
  isbn: z
    .string()
    .min(1, 'ISBN is required')
    .max(20, 'ISBN must be less than 20 characters'),
  isOnSale: z
    .boolean()
    .default(false),
  discountPrice: z
    .number({
      invalid_type_error: 'Discount price must be a number',
    })
    .min(0, 'Discount price must be at least 0')
    .max(1000, 'Discount price must be less than 1000')
    .optional()
    .nullable(),
});

/**
 * Book search schema
 */
export const bookSearchSchema = z.object({
  keyword: z.string().optional(),
  genre: z.string().optional(),
  author: z.string().optional(),
  minPrice: z
    .number()
    .min(0, 'Minimum price must be at least 0')
    .optional(),
  maxPrice: z
    .number()
    .min(0, 'Maximum price must be at least 0')
    .optional(),
  inStock: z.boolean().optional(),
  sortBy: z.string().optional(),
});
