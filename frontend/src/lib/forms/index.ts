import { useState } from 'react';
import { useForm, UseFormProps, FieldValues, SubmitHandler, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

/**
 * Custom hook for form handling with React Hook Form and Zod
 * 
 * @param schema - Zod schema for form validation
 * @param options - React Hook Form options
 * @returns Form handling utilities
 * 
 * @example
 * ```tsx
 * const { form, onSubmit, isSubmitting, error } = useZodForm({
 *   schema: loginSchema,
 *   onSubmit: async (data) => {
 *     await login(data);
 *   },
 * });
 * ```
 */
export function useZodForm<TSchema extends z.ZodType<any, any, any>, TContext = any>({
  schema,
  onSubmit,
  ...formOptions
}: {
  schema: TSchema;
  onSubmit: SubmitHandler<z.infer<TSchema>>;
} & UseFormProps<z.infer<TSchema>, TContext>) {
  type FormValues = z.infer<TSchema>;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    ...formOptions,
  });

  const handleSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      await onSubmit(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error('Form submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(handleSubmit),
    isSubmitting,
    error,
  };
}

/**
 * Get form field error message
 * 
 * @param form - React Hook Form instance
 * @param name - Field name
 * @returns Error message or null
 * 
 * @example
 * ```tsx
 * const errorMessage = getFieldErrorMessage(form, 'email');
 * ```
 */
export function getFieldErrorMessage<T extends FieldValues>(
  form: UseFormReturn<T>,
  name: keyof T
): string | null {
  const error = form.formState.errors[name];
  return error ? (error.message as string) : null;
}

/**
 * Check if a form field has an error
 * 
 * @param form - React Hook Form instance
 * @param name - Field name
 * @returns True if the field has an error
 * 
 * @example
 * ```tsx
 * const hasError = hasFieldError(form, 'email');
 * ```
 */
export function hasFieldError<T extends FieldValues>(
  form: UseFormReturn<T>,
  name: keyof T
): boolean {
  return !!form.formState.errors[name];
}
