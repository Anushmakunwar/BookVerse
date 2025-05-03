'use client';

import React, { forwardRef, TextareaHTMLAttributes } from 'react';
import { FieldError } from 'react-hook-form';
import { cn } from '@/lib/utils';

/**
 * FormTextarea props interface
 */
export interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: FieldError | string | null;
  helperText?: string;
  fullWidth?: boolean;
}

/**
 * FormTextarea component for form textareas with validation
 * 
 * @example
 * ```tsx
 * <FormTextarea
 *   label="Description"
 *   {...form.register('description')}
 *   error={form.formState.errors.description}
 * />
 * ```
 */
export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, helperText, className, fullWidth = true, ...props }, ref) => {
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
        
        <textarea
          ref={ref}
          className={cn(
            'w-full p-2 rounded-lg border focus:ring-1 outline-none transition-colors',
            error
              ? 'border-destructive focus:border-destructive focus:ring-destructive/30'
              : 'border-neutral-light focus:border-primary focus:ring-primary/30',
            className
          )}
          {...props}
        />
        
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

FormTextarea.displayName = 'FormTextarea';

export default FormTextarea;
