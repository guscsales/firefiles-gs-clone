'use client';

import { createContext, useContext } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../utils';

const alertVariants = tv({
  slots: {
    base: [
      '[font-synthesis:none] antialiased',
      'grid grid-cols-[auto_1fr_auto] [grid-template-rows:min-content_min-content]',
      'items-start gap-x-3 gap-y-0.5',
      'rounded-[0.625rem] py-3 px-3.5 border border-solid',
      '[&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:mt-0.5',
      '[&>svg]:row-span-full [&>svg]:col-start-1 [&>svg]:self-start'
    ],
    title:
      'col-start-2 row-start-1 self-start font-semibold text-[0.8125rem] leading-4',
    description: 'col-start-2 row-start-2 self-start text-xs leading-4',
    action: 'col-start-3 row-span-full self-center justify-self-end'
  },
  variants: {
    variant: {
      default: {
        base: 'bg-[var(--alert-default-bg)] border-[var(--alert-default-border)] [&>svg]:text-[var(--alert-default-icon-fg)]',
        title: 'text-[var(--alert-default-title-fg)]',
        description: 'text-[var(--alert-default-desc-fg)]'
      },
      info: {
        base: 'bg-[var(--alert-info-bg)] border-[var(--alert-info-border)] [&>svg]:text-[var(--alert-info-icon-fg)]',
        title: 'text-[var(--alert-info-title-fg)]',
        description: 'text-[var(--alert-info-desc-fg)]'
      },
      success: {
        base: 'bg-[var(--alert-success-bg)] border-[var(--alert-success-border)] [&>svg]:text-[var(--alert-success-icon-fg)]',
        title: 'text-[var(--alert-success-title-fg)]',
        description: 'text-[var(--alert-success-desc-fg)]'
      },
      warning: {
        base: 'bg-[var(--alert-warning-bg)] border-[var(--alert-warning-border)] [&>svg]:text-[var(--alert-warning-icon-fg)]',
        title: 'text-[var(--alert-warning-title-fg)]',
        description: 'text-[var(--alert-warning-desc-fg)]'
      },
      destructive: {
        base: 'bg-[var(--alert-destructive-bg)] border-[var(--alert-destructive-border)] [&>svg]:text-[var(--alert-destructive-icon-fg)]',
        title: 'text-[var(--alert-destructive-title-fg)]',
        description: 'text-[var(--alert-destructive-desc-fg)]'
      }
    }
  },
  defaultVariants: {
    variant: 'default'
  }
});

const actionVariants = tv({
  base: 'inline-flex font-semibold text-xs leading-4 cursor-pointer transition-opacity',
  variants: {
    style: {
      link: 'underline-offset-[3px] [text-decoration:underline_1px] hover:opacity-80',
      pill: 'rounded-[0.4375rem] py-1.5 px-2.5 hover:opacity-90'
    },
    variant: {
      default: '',
      info: '',
      success: '',
      warning: '',
      destructive: ''
    }
  },
  compoundVariants: [
    {
      style: 'link',
      variant: 'default',
      class: 'text-[var(--alert-default-action-fg)]'
    },
    {
      style: 'link',
      variant: 'info',
      class: 'text-[var(--alert-info-title-fg)]'
    },
    {
      style: 'link',
      variant: 'success',
      class: 'text-[var(--alert-success-title-fg)]'
    },
    {
      style: 'link',
      variant: 'warning',
      class: 'text-[var(--alert-warning-title-fg)]'
    },
    {
      style: 'link',
      variant: 'destructive',
      class: 'text-[var(--alert-destructive-title-fg)]'
    },
    {
      style: 'pill',
      variant: 'warning',
      class:
        'bg-[var(--alert-warning-action-bg)] text-[var(--alert-warning-action-fg)]'
    },
    {
      style: 'pill',
      variant: 'destructive',
      class:
        'bg-[var(--alert-destructive-action-bg)] text-[var(--alert-destructive-action-fg)]'
    }
  ],
  defaultVariants: {
    style: 'link',
    variant: 'default'
  }
});

type AlertVariant = NonNullable<VariantProps<typeof alertVariants>['variant']>;

const AlertContext = createContext<AlertVariant>('default');

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  const resolved: AlertVariant = variant ?? 'default';
  const { base } = alertVariants({ variant: resolved });
  return (
    <AlertContext.Provider value={resolved}>
      <div
        data-slot="alert"
        data-variant={resolved}
        role="alert"
        className={cn(base(), className)}
        {...props}
      />
    </AlertContext.Provider>
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  const variant = useContext(AlertContext);
  const { title } = alertVariants({ variant });
  return (
    <div
      data-slot="alert-title"
      className={cn(title(), className)}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const variant = useContext(AlertContext);
  const { description } = alertVariants({ variant });
  return (
    <div
      data-slot="alert-description"
      className={cn(description(), className)}
      {...props}
    />
  );
}

function AlertAction({ className, ...props }: React.ComponentProps<'div'>) {
  const variant = useContext(AlertContext);
  const { action } = alertVariants({ variant });
  const isPill = variant === 'warning' || variant === 'destructive';
  return (
    <div
      data-slot="alert-action"
      className={cn(
        action(),
        actionVariants({ style: isPill ? 'pill' : 'link', variant }),
        className
      )}
      {...props}
    />
  );
}

export { Alert, AlertAction, AlertDescription, AlertTitle };
