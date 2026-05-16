import { Slot } from '@radix-ui/react-slot';
import type React from 'react';
import { cn } from '../utils';

function CardLoadingBars() {
  return (
    <>
      <div className="w-[60%] h-3 rounded-sm shrink-0 bg-[var(--color-card-skeleton-strong)]" />
      <div className="w-[80%] h-2 rounded-sm shrink-0 bg-[var(--color-card-skeleton-soft)]" />
      <div className="h-px shrink-0 bg-[var(--color-card-border)] my-1" />
      <div className="w-[40%] h-2 rounded-sm shrink-0 bg-[var(--color-card-skeleton-soft)]" />
      <div className="w-[70%] h-3.5 rounded-sm shrink-0 bg-[var(--color-card-skeleton-strong)]" />
      <div className="w-[30%] h-2 rounded-sm shrink-0 bg-[var(--color-card-skeleton-soft)]" />
      <div className="w-[55%] h-3.5 rounded-sm shrink-0 bg-[var(--color-card-skeleton-strong)]" />
    </>
  );
}

function Card({
  className,
  padding = true,
  clickable = false,
  loading = false,
  asChild = false,
  children,
  ...props
}: {
  padding?: boolean;
  clickable?: boolean;
  loading?: boolean;
  asChild?: boolean;
} & React.ComponentProps<'div'>) {
  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      data-slot="card"
      className={cn(
        'bg-card text-card-foreground flex flex-col rounded-lg border border-[var(--color-card-border)]',
        {
          'p-[1.125rem]': padding,
          'gap-3': padding && !loading,
          'gap-2.5': padding && loading,
          'shadow-[var(--shadow-card)] cursor-pointer transition-shadow hover:border-ring/40':
            clickable,
          'pointer-events-none': loading
        },
        className
      )}
      {...props}
    >
      {loading ? <CardLoadingBars /> : children}
    </Comp>
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        'flex items-start justify-between gap-2 has-[>:not([data-slot=card-action])]:items-stretch [&:not(:has([data-slot=card-action]))]:flex-col [&:not(:has([data-slot=card-action]))]:gap-1',
        className
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        'font-heading font-medium text-base leading-5 tracking-[-0.01em] text-card-foreground',
        className
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn(
        'font-sans text-xs leading-4 text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        'shrink-0 text-[var(--color-input-icon-static-fg)]',
        className
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn('flex flex-col', className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center', className)}
      {...props}
    />
  );
}

export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
};
