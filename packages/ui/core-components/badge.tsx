import { Slot } from '@radix-ui/react-slot';
import type React from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

import { cn } from '../utils';

const badgeVariants = tv({
  base: `inline-flex items-center justify-center w-fit shrink-0 whitespace-nowrap
      [&>svg]:size-3 [&>svg]:pointer-events-none gap-1
      focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:ring-offset-2
      focus-visible:ring-offset-background
      aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40
      aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden`,
  variants: {
    variant: {
      default:
        'bg-[var(--badge-default-bg)] text-[var(--badge-default-fg)] font-semibold',
      secondary:
        'bg-[var(--badge-secondary-bg)] text-[var(--badge-secondary-fg)] font-medium',
      destructive:
        'bg-[var(--badge-destructive-bg)] text-[var(--badge-destructive-fg)] font-semibold',
      success:
        'bg-[var(--badge-success-bg)] text-[var(--badge-success-fg)] font-semibold',
      warning:
        'bg-[var(--badge-warning-bg)] text-[var(--badge-warning-fg)] font-semibold',
      info: 'bg-[var(--badge-info-bg)] text-[var(--badge-info-fg)] font-semibold',
      outline:
        'border border-[var(--badge-outline-border)] text-[var(--badge-outline-fg)] font-medium',
      opposite:
        'bg-[var(--badge-opposite-bg)] text-[var(--badge-opposite-fg)] font-semibold',
      violet:
        'bg-[var(--badge-violet-bg)] text-[var(--badge-violet-fg)] font-semibold',
      emerald:
        'bg-[var(--badge-emerald-bg)] text-[var(--badge-emerald-fg)] font-semibold',
      sky: 'bg-[var(--badge-sky-bg)] text-[var(--badge-sky-fg)] font-semibold',
      orange:
        'bg-[var(--badge-orange-bg)] text-[var(--badge-orange-fg)] font-semibold'
    },
    size: {
      sm: 'rounded-sm py-px px-1.5 text-[0.625rem]/3 font-semibold',
      md: 'rounded-[0.3125rem] py-0.5 px-1.75 text-xs/4 font-semibold',
      lg: 'rounded-md py-1 px-3 text-[0.8125rem]/4 font-semibold'
    },
    withPill: {
      true: 'border-0 uppercase'
    },
    solid: {
      true: ''
    }
  },
  compoundVariants: [
    /* withPill — per-size shape */
    {
      withPill: true,
      size: 'sm',
      class:
        'rounded-sm py-0.5 px-1.75 gap-1.25 text-[0.5625rem]/3 tracking-[0.16em] font-semibold'
    },
    {
      withPill: true,
      size: 'md',
      class:
        'rounded-[999px] py-0.75 px-2 gap-1.25 text-[0.625rem]/3 tracking-[0.12em] font-semibold'
    },
    {
      withPill: true,
      size: 'lg',
      class:
        'rounded-[999px] py-1 px-2.5 gap-1.5 text-[0.625rem]/3 tracking-[0.14em] font-bold'
    },
    /* withPill (tinted) — per-variant tone overrides */
    {
      withPill: true,
      solid: false,
      variant: 'success',
      class:
        'bg-[var(--badge-pill-success-bg)] text-[var(--badge-pill-success-fg)]'
    },
    {
      withPill: true,
      solid: false,
      variant: 'emerald',
      class:
        'bg-[var(--badge-pill-success-bg)] text-[var(--badge-pill-success-fg)]'
    },
    {
      withPill: true,
      solid: false,
      variant: 'warning',
      class:
        'bg-[var(--badge-pill-warning-bg)] text-[var(--badge-pill-warning-fg)]'
    },
    {
      withPill: true,
      solid: false,
      variant: 'destructive',
      class:
        'bg-[var(--badge-pill-destructive-bg)] text-[var(--badge-pill-destructive-fg)]'
    },
    {
      withPill: true,
      solid: false,
      variant: 'outline',
      class:
        'bg-[var(--badge-pill-neutral-bg)] text-[var(--badge-pill-neutral-fg)]'
    },
    {
      withPill: true,
      solid: false,
      variant: 'default',
      class: 'bg-[var(--badge-pill-chip-bg)] text-[var(--foreground)]'
    },
    /* withPill (solid) — per-variant solid grounds */
    {
      withPill: true,
      solid: true,
      variant: 'warning',
      class: 'bg-[var(--badge-pill-warning-dot)] text-[#18191B]'
    },
    {
      withPill: true,
      solid: true,
      variant: 'destructive',
      class: 'bg-[var(--badge-pill-destructive-dot)] text-white'
    },
    {
      withPill: true,
      solid: true,
      variant: 'success',
      class: 'bg-[var(--badge-pill-success-dot)] text-white'
    }
  ],
  defaultVariants: {
    variant: 'default',
    size: 'md',
    withPill: false,
    solid: false
  }
});

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>;
type BadgeSize = NonNullable<VariantProps<typeof badgeVariants>['size']>;

const pillDotToneClass: Record<BadgeVariant, string> = {
  default: 'bg-[var(--badge-success-dot)]',
  secondary: 'bg-[var(--badge-pill-neutral-dot)]',
  destructive: 'bg-[var(--badge-pill-destructive-dot)]',
  success: 'bg-[var(--badge-pill-success-dot)]',
  warning: 'bg-[var(--badge-pill-warning-dot)]',
  info: 'bg-[var(--badge-info-dot)]',
  outline: 'bg-[var(--badge-pill-neutral-dot)]',
  opposite: 'bg-[var(--badge-default-fg)]',
  violet: 'bg-[var(--badge-violet-dot)]',
  emerald: 'bg-[var(--badge-pill-success-dot)]',
  sky: 'bg-[var(--badge-sky-dot)]',
  orange: 'bg-[var(--badge-orange-dot)]'
};

const pillDotSolidClass: Partial<Record<BadgeVariant, string>> = {
  warning: 'bg-[#18191B]',
  destructive: 'bg-white',
  success: 'bg-white'
};

const pillDotSizeClass: Record<BadgeSize, string> = {
  sm: 'size-1',
  md: 'size-[0.3125rem]',
  lg: 'size-1.5'
};

function Badge({
  className,
  variant,
  size,
  withPill,
  solid,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span';
  const resolvedVariant = variant ?? 'default';
  const resolvedSize = size ?? 'md';
  const dotTone =
    solid && pillDotSolidClass[resolvedVariant]
      ? pillDotSolidClass[resolvedVariant]
      : pillDotToneClass[resolvedVariant];
  const dotSize = pillDotSizeClass[resolvedSize];

  return (
    <Comp
      data-slot="badge"
      className={cn(
        badgeVariants({ variant, size, withPill, solid }),
        className
      )}
      {...props}
    >
      {withPill && (
        <span
          aria-hidden
          data-slot="badge-pill-dot"
          className={cn('inline-block rounded-full shrink-0', dotSize, dotTone)}
        />
      )}
      {children}
    </Comp>
  );
}

export { Badge, badgeVariants };
