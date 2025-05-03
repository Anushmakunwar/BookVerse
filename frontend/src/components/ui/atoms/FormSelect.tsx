'use client';

import React, { forwardRef, SelectHTMLAttributes } from 'react';
import { FieldError } from 'react-hook-form';
import { cn } from '@/lib/utils';

/**
 * FormSelect props interface
 */
export interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: FieldError | string | null;
  helperText?: string;
  fullWidth?: boolean;
  options: Array<{ value: string; label: string }>;
}

/**
 * FormSelect component for form selects with validation
 * 
 * @example
 * ```tsx
 * <FormSelect
 *   label="Genre"
 *   options={[
 *     { value: 'fiction', label: 'Fiction' },
 *     { value: 'non-fiction', label: 'Non-Fiction' },
 *   ]}
 *   {...form.register('genre')}
 *   error={form.formState.errors.genre}
 * />
 * ```
 */
export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, error, helperText, className, fullWidth = true, options, ...props }, ref) => {
    const errorMessage = error
      ? typeof error === 'string'
        ? error
        : error.message
      : null;

    return (
      <div className={cn('mb-4', fullWidth ? 'w-full' : '')}>
        {label && (
          <label
            htmlFor={props.id || props.name}
            className="block text-sm font-medium text-neutral-dark mb-1"
          >
            {label}
          </label>
        )}
        
        <select
          ref={ref}
          className={cn(
            'w-full p-2 rounded-lg border focus:ring-1 outline-none transition-colors',
            error
              ? 'border-destructive focus:border-destructive focus:ring-destructive/30'
              : 'border-neutral-light focus:border-primary focus:ring-primary/30',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {errorMessage && (
          <p className="mt-1 text-xs text-destructive">{errorMessage}</p>
        )}
        
        {helperText && !errorMessage && (
          <p className="mt-1 text-xs text-neutral">{helperText}</p>
        )}
      </div>
    );
  }
);

FormSelect.displayName = 'FormSelect';

export default FormSelect;
