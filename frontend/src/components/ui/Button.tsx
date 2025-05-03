import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary-dark shadow-soft hover:shadow-hover',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-soft hover:shadow-hover',
        outline: 'border-2 border-current hover:bg-primary-light hover:text-primary',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary-dark shadow-soft hover:shadow-hover',
        accent: 'bg-accent text-[#264653] hover:bg-accent/90 shadow-soft hover:shadow-hover',
        ghost: 'hover:bg-primary-light hover:text-primary',
        link: 'underline-offset-4 hover:underline text-primary hover:text-primary-dark',
      },
      size: {
        default: 'h-10 py-2 px-5 text-sm rounded-lg',
        sm: 'h-9 px-4 text-xs rounded-lg',
        lg: 'h-12 px-8 text-base rounded-lg',
        xl: 'h-14 px-10 text-lg rounded-xl',
        icon: 'h-10 w-10 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
