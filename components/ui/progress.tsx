import React from 'react';
import { cn } from './utils';

export type ProgressProps = {
  value?: number;
  className?: string;
};

export const Progress: React.FC<ProgressProps> = ({ value = 0, className }) => {
  const safe = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={cn('w-full bg-gray-200 rounded-full overflow-hidden', className)}>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safe}
        style={{ width: `${safe}%` }}
        className="h-2 bg-blue-600"
      />
    </div>
  );
};

export default Progress;
