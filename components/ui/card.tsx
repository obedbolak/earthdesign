import React from 'react';
import { cn } from './utils';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={cn('bg-white rounded-lg shadow-sm', className)} {...props}>
    {children}
  </div>
);

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={cn('px-6 py-4 border-b', className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className, ...props }) => (
  <h3 className={cn('text-lg font-semibold', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={cn('text-sm text-gray-500', className)} {...props}>
    {children}
  </div>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={cn('p-6', className)} {...props}>
    {children}
  </div>
);

export default Card;
