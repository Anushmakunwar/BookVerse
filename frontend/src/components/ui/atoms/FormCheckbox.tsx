'use client';

import React, { forwardRef, InputHTMLAttributes } from 'react';
import { FieldError } from 'react-hook-form';
import { cn } from '@/lib/utils';

/**
 * FormCheckbox props interface
 */
export interface FormCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: FieldError | string | null;
  helperText?: string;
}

/**
 * FormCheckbox component for form checkboxes with validation
 * 
 * @example
 * ```tsx
 * <FormCheckbox
 *   label="I agree to the terms and conditions"
 *   {...form.register('agree')}
 *   error={form.formState.errors.agree}
 * />
 * ```
 */
export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    const errorMessage = error
      ? typeof error === 'string'
        ? error
        : error.message
      : null;

    return (
      <div className="mb-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            ref={ref}
            className={cn(
              'h-4 w-4 rounded border-neutral-light text-primary focus:ring-primary',
              error ? 'border-destructive' : '',
              className
            )}
            {...props}
          />
          
          <label
            htmlFor={props.id || props.name}
            className="ml-2 block text-sm text-neutral-dark"
          >
            {label}
          </label>
        </div>
        
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

FormCheckbox.displayName = 'FormCheckbox';

export default FormCheckbox;
