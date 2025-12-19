import React from 'react';
import { cn } from './utils';

export type AlertProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'destructive';
};

export const Alert: React.FC<AlertProps> = ({ children, className, variant = 'default', ...props }) => {
  const base = 'flex items-start gap-3 p-3 rounded-md border';
  const variants: Record<string, string> = {
    default: 'bg-white border-gray-200 text-gray-800',
    destructive: 'bg-red-50 border-red-200 text-red-800',
  };
  return (
    <div className={cn(base, variants[variant], className)} {...props}>
      {children}
    </div>
  );
};

export const AlertTitle: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={cn('font-semibold text-sm', className)} {...props}>
    {children}
  </div>
);

export const AlertDescription: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={cn('text-sm text-muted-foreground', className)} {...props}>
    {children}
  </div>
);

export default Alert;
