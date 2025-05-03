'use client';

import React, { forwardRef, InputHTMLAttributes, useState } from 'react';
import { FieldError } from 'react-hook-form';
import { FaUpload, FaFile, FaTimes } from 'react-icons/fa';
import { cn } from '@/lib/utils';

/**
 * FormFileInput props interface
 */
export interface FormFileInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: FieldError | string | null;
  helperText?: string;
  fullWidth?: boolean;
  accept?: string;
  onFileChange?: (file: File | null) => void;
  previewUrl?: string;
}

/**
 * FormFileInput component for form file inputs with validation
 * 
 * @example
 * ```tsx
 * <FormFileInput
 *   label="Cover Image"
 *   accept="image/*"
 *   onFileChange={setFile}
 *   error={fileError}
 * />
 * ```
 */
export const FormFileInput = forwardRef<HTMLInputElement, FormFileInputProps>(
  (
    {
      label,
      error,
      helperText,
      className,
      fullWidth = true,
      accept,
      onFileChange,
      previewUrl,
      ...props
    },
    ref
  ) => {
    const [preview, setPreview] = useState<string | null>(previewUrl || null);
    const [fileName, setFileName] = useState<string | null>(null);

    const errorMessage = error
      ? typeof error === 'string'
        ? error
        : error.message
      : null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      
      if (file) {
        setFileName(file.name);
        
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = () => {
            setPreview(reader.result as string);
          };
          reader.readAsDataURL(file);
        } else {
          setPreview(null);
        }
      } else {
        setFileName(null);
        setPreview(null);
      }
      
      if (onFileChange) {
        onFileChange(file);
      }
    };

    const handleClear = () => {
      setFileName(null);
      setPreview(null);
      
      if (onFileChange) {
        onFileChange(null);
      }
    };

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
        
        <div
          className={cn(
            'border rounded-lg p-4',
            error
              ? 'border-destructive'
              : 'border-neutral-light',
            className
          )}
        >
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="max-h-48 mx-auto rounded"
              />
              <button
                type="button"
                onClick={handleClear}
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-soft"
                aria-label="Clear file"
              >
                <FaTimes className="text-destructive" />
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <FaUpload className="mx-auto text-2xl text-neutral mb-2" />
              <p className="text-sm text-neutral-dark">
                {fileName || 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-neutral mt-1">
                {accept
                  ? `Accepted formats: ${accept.replace(/\./g, '').replace(/,/g, ', ')}`
                  : 'All file types accepted'}
              </p>
            </div>
          )}
          
          <input
            type="file"
            ref={ref}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
            accept={accept}
            {...props}
          />
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

FormFileInput.displayName = 'FormFileInput';

export default FormFileInput;
