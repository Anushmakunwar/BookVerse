'use client';

import React, { forwardRef, InputHTMLAttributes } from 'react';
import { FieldError } from 'react-hook-form';
import { cn } from '@/lib/utils';

/**
 * FormInput props interface
 */
export interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: FieldError | string | null;
  helperText?: string;
  fullWidth?: boolean;
}

/**
 * FormInput component for form inputs with validation
 * 
 * @example
 * ```tsx
 * <FormInput
 *   label="Email"
 *   type="email"
 *   {...form.register('email')}
 *   error={form.formState.errors.email}
 * />
 * ```
 */
export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
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
        
        <input
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

FormInput.displayName = 'FormInput';

export default FormInput;
