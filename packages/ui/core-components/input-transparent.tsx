import type React from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { Skeleton } from './skeleton';

const inputTransparentVariants = tv({
  base: `w-full min-w-0 outline-none bg-transparent font-heading font-medium py-0.5 px-1 rounded-[0.375rem]
          text-[var(--color-input-text)]
          placeholder:text-[var(--color-input-helper-fg)] placeholder:transition-colors transition-colors
          focus:bg-[var(--color-input-bg-readonly)]
          selection:bg-primary selection:text-primary-foreground
          disabled:pointer-events-none disabled:cursor-not-allowed disabled:text-[var(--color-input-text-disabled)]
          aria-invalid:placeholder:text-[var(--color-input-helper-error-fg)]
          aria-invalid:text-[var(--color-input-helper-error-fg)]`,
  variants: {
    size: {
      sm: 'text-[1rem] leading-[1.375rem]',
      md: 'text-[1.25rem] leading-[1.625rem] tracking-[-0.01em]',
      lg: 'text-[1.75rem] leading-[2.125rem] tracking-[-0.015em]'
    }
  },
  defaultVariants: {
    size: 'md'
  }
});

const loadingSizeMapper = {
  sm: '1.5rem',
  md: '1.75rem',
  lg: '2rem'
};

interface InputProps
  extends Omit<React.ComponentProps<'input'>, 'size'>,
    VariantProps<typeof inputTransparentVariants> {
  error?: React.ReactNode;
  loading?: boolean;
}

function InputTransparent({
  className,
  type,
  size,
  error,
  loading,
  ...props
}: InputProps) {
  return (
    <>
      {!loading ? (
        <input
          type={type}
          data-slot="input"
          className={inputTransparentVariants({ size, className })}
          aria-invalid={!!error}
          {...props}
        />
      ) : (
        <Skeleton
          style={{ height: loadingSizeMapper[size || 'md'] }}
          className="w-full"
        />
      )}
      {error && (
        <div className="ml-1 text-[0.6875rem] leading-[0.875rem] font-medium text-[var(--color-input-helper-error-fg)]">
          {error}
        </div>
      )}
    </>
  );
}

export { InputTransparent, inputTransparentVariants };
