import type React from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../utils';
import { BrailleLoader } from './braille-loader';

const buttonVariants = tv({
  base: `inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0
      font-sans tracking-[-0.005em] antialiased [font-synthesis:none]
      cursor-pointer transition-colors
      [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[13px]
      outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--btn-focus-halo)]
      disabled:opacity-40 disabled:pointer-events-none
      aria-invalid:ring-2 aria-invalid:ring-destructive/40 aria-invalid:border-destructive`,
  variants: {
    variant: {
      default:
        'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] shadow-[var(--btn-primary-shadow)] hover:bg-[var(--btn-primary-bg-hover)] active:bg-[var(--btn-primary-bg-active)] font-semibold',
      'default-light':
        'bg-[var(--btn-default-light-bg)] text-[var(--btn-default-light-fg)] hover:bg-[var(--btn-default-light-bg-hover)] active:bg-[var(--btn-default-light-bg-active)] font-semibold',
      secondary:
        'bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-fg)] hover:bg-[var(--btn-secondary-bg-hover)] active:bg-[var(--btn-secondary-bg-active)] font-semibold',
      outline:
        'bg-transparent text-[var(--btn-outline-fg)] border border-[var(--btn-outline-border)] hover:bg-[var(--btn-outline-bg-hover)] active:bg-[var(--btn-outline-bg-active)] font-medium',
      ghost:
        'bg-transparent text-[var(--btn-ghost-fg)] hover:bg-[var(--btn-ghost-bg-hover)] active:bg-[var(--btn-ghost-bg-active)] font-semibold',
      destructive:
        'bg-[var(--btn-destructive-bg)] text-[var(--btn-destructive-fg)] hover:bg-[var(--btn-destructive-bg-hover)] active:bg-[var(--btn-destructive-bg-active)] font-semibold',
      'destructive-light':
        'bg-[var(--btn-destructive-light-bg)] text-[var(--btn-destructive-light-fg)] hover:bg-[var(--btn-destructive-light-bg-hover)] active:bg-[var(--btn-destructive-light-bg-active)] font-semibold',
      link: 'bg-transparent text-[var(--btn-link-fg)] [text-decoration:underline] [text-decoration-thickness:1px] underline-offset-[3px] hover:opacity-80 font-medium'
    },
    size: {
      xs: 'rounded-[6px] py-1 px-2 text-[11px] leading-[14px]',
      sm: 'rounded-[7px] py-1.5 px-2.5 text-[12px] leading-4',
      md: 'rounded-[8px] py-2 px-3 text-[13px] leading-4',
      lg: 'rounded-[9px] py-2.5 px-4 text-[14px] leading-[18px]',
      xl: 'rounded-[10px] py-3 px-[22px] text-[15px] leading-[18px]',
      'icon-sm': 'rounded-[7px] h-7 w-7 p-0 text-[13px] leading-4',
      'icon-md': 'rounded-[8px] h-8 w-8 p-0 text-[13px] leading-4',
      'icon-lg': 'rounded-[9px] h-9 w-9 p-0 text-[13px] leading-4'
    },
    handling: {
      true: 'opacity-50 pointer-events-none'
    }
  },
  compoundVariants: [
    { variant: 'outline', size: 'xs', class: 'py-[3px] px-[7px]' },
    { variant: 'outline', size: 'sm', class: 'py-[5px] px-[9px]' },
    { variant: 'outline', size: 'md', class: 'py-[7px] px-[11px]' },
    { variant: 'outline', size: 'lg', class: 'py-[9px] px-[15px]' },
    { variant: 'outline', size: 'xl', class: 'py-[11px] px-[21px]' },
    { variant: 'link', class: 'py-2 px-0 rounded-none' }
  ],
  defaultVariants: {
    variant: 'default',
    size: 'sm',
    handling: false
  }
});

interface ButtonProps
  extends Omit<React.ComponentProps<'button'>, 'size'>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  handling?: boolean;
  mobileChildren?: React.ReactNode;
}

function Button({
  className,
  variant,
  size,
  handling,
  loading,
  children,
  mobileChildren,
  ...props
}: ButtonProps) {
  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ variant, size, handling, className }))}
      disabled={handling || loading}
      {...props}
    >
      {handling && <BrailleLoader size="sm" />}

      {mobileChildren ? (
        <>
          <span className="sm:hidden">{mobileChildren}</span>
          <span className="hidden sm:inline">{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

export { Button, buttonVariants };
