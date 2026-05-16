import { cn } from '../utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-skeleton-strong animate-pulse rounded-sm', className)}
      {...props}
    />
  );
}

export { Skeleton };
