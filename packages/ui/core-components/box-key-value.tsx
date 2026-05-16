'use client';

import { format } from 'date-fns/format';
import type React from 'react';
import { cn } from '../utils';
import { Skeleton } from './skeleton';

interface Props extends React.HTMLAttributes<HTMLElement> {
  label: React.ReactNode;
  value: React.ReactNode | Date;
  date?: boolean;
  loading?: boolean;
  dateFormat?: string;
  horizontal?: boolean;
  truncate?: boolean;
}

function BoxKeyValue({
  label,
  value,
  className,
  date,
  loading,
  dateFormat = 'MM/dd/yyyy',
  horizontal = false,
  truncate = false,
  ...props
}: Props) {
  return (
    <div
      className={cn('flex flex-col gap-0.5', className, {
        'flex-row items-center gap-1': horizontal
      })}
      {...props}
    >
      <div
        className={cn('font-light text-muted-foreground text-sm truncate', {
          'mt-0.5': horizontal
        })}
      >
        {loading ? <Skeleton className="h-5 w-20" /> : label}
      </div>
      {loading ? (
        <Skeleton className="h-6 w-24" />
      ) : (
        <div className="flex items-center gap-1">
          {date && value ? (
            format(new Date(value as string), dateFormat)
          ) : value != null && value !== undefined ? (
            <span className={cn({ truncate })}>{value as React.ReactNode}</span>
          ) : (
            '-'
          )}
        </div>
      )}
    </div>
  );
}

export { BoxKeyValue };
