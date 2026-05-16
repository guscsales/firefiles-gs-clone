'use client';

import * as AvatarPrimitive from '@radix-ui/react-avatar';
import type React from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../utils';

const avatarVariants = tv({
  base: `relative inline-flex shrink-0 items-center justify-center
         bg-[var(--avatar-bg)] text-[var(--avatar-fg)]
         font-sans font-semibold uppercase select-none antialiased
         [font-synthesis:none]`,
  variants: {
    size: {
      xs: 'size-6 rounded-[0.375rem] text-[0.5625rem] leading-[0.75rem]',
      sm: 'size-8 rounded-[0.5rem] text-[0.6875rem] leading-[0.875rem]',
      md: 'size-10 rounded-[0.625rem] text-[0.875rem] leading-[1.125rem]',
      lg: 'size-14 rounded-[0.875rem] text-[1.125rem] leading-[1.375rem]'
    }
  },
  defaultVariants: { size: 'sm' }
});

const avatarStatusVariants = tv({
  base: 'absolute -right-0.5 -bottom-0.5 size-3 rounded-full ring-2 ring-[var(--background)]',
  variants: {
    status: {
      online: 'bg-[var(--avatar-status-online)]',
      offline: 'bg-muted-foreground',
      away: 'bg-cmni-gold',
      busy: 'bg-destructive'
    }
  }
});

const avatarSkeletonSizes = {
  xs: 'size-6 rounded-[0.375rem]',
  sm: 'size-8 rounded-[0.5rem]',
  md: 'size-10 rounded-[0.625rem]',
  lg: 'size-14 rounded-[0.875rem]'
} as const;

type AvatarSize = NonNullable<VariantProps<typeof avatarVariants>['size']>;

interface AvatarProps
  extends Omit<React.ComponentProps<typeof AvatarPrimitive.Root>, 'children'>,
    VariantProps<typeof avatarVariants> {
  loading?: boolean;
  status?: VariantProps<typeof avatarStatusVariants>['status'];
  children?: React.ReactNode;
}

function Avatar({
  className,
  size,
  status,
  loading,
  children,
  ...props
}: AvatarProps) {
  const resolvedSize: AvatarSize = size ?? 'sm';

  if (loading) {
    return (
      <AvatarPrimitive.Root
        data-slot="avatar"
        data-loading="true"
        className={cn(
          'inline-block animate-pulse border border-dashed border-[var(--avatar-skeleton-border)] bg-[var(--avatar-skeleton-bg)]',
          avatarSkeletonSizes[resolvedSize],
          className
        )}
        aria-hidden
        {...props}
      />
    );
  }

  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(avatarVariants({ size: resolvedSize }), className)}
      {...props}
    >
      <span className="flex size-full items-center justify-center overflow-hidden rounded-[inherit]">
        {children}
      </span>
      {status && (
        <span aria-hidden className={cn(avatarStatusVariants({ status }))} />
      )}
    </AvatarPrimitive.Root>
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn('size-full aspect-square object-cover', className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        'flex size-full items-center justify-center [&>svg]:size-[60%] [&>svg]:text-current',
        className
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarFallback, AvatarImage, avatarVariants };
