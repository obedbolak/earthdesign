import React from 'react';
import { cn } from './utils';

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  className?: string;
};

export const Label: React.FC<LabelProps> = ({ children, className, ...props }) => {
  return (
    <label {...props} className={cn('block text-sm font-medium text-gray-700', className)}>
      {children}
    </label>
  );
};

export default Label;
