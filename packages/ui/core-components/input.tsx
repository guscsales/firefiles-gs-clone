'use client';

import { CheckIcon, CopyIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import type React from 'react';
import { useCallback, useState } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../utils';
import { Label } from './label';
import { Skeleton } from './skeleton';
import { toast } from './toaster';

const inputVariants = tv({
  base: `w-full min-w-0 block antialiased
          bg-[var(--input-bg)]
          text-[var(--input-text)]
          border border-solid border-[var(--input-border-base)]
          placeholder:text-[var(--input-helper-fg)]
          selection:bg-primary selection:text-primary-foreground
          transition-[color,box-shadow,border-color] outline-none
          hover:border-[var(--input-border-hover)]
          focus-visible:border-[var(--input-border-focus)]
          focus-visible:shadow-[0_0_0_0.1875rem_var(--input-focus-ring)]
          read-only:bg-[var(--input-bg-readonly)]
          read-only:cursor-default
          read-only:hover:border-[var(--input-border-base)]
          disabled:bg-[var(--input-bg-disabled)]
          disabled:text-[var(--input-text-disabled)]
          disabled:cursor-not-allowed
          disabled:hover:border-[var(--input-border-base)]
          aria-invalid:border-[var(--input-border-error)]
          aria-invalid:hover:border-[var(--input-border-error)]
          aria-invalid:focus-visible:border-[var(--input-border-error)]
          aria-invalid:focus-visible:shadow-[0_0_0_0.1875rem_rgb(194_78_58_/_0.12)]`,
  variants: {
    size: {
      sm: 'h-[var(--size-input-sm)] rounded-[0.4375rem] px-[0.625rem] py-[0.375rem] text-[0.75rem] leading-[1rem]',
      md: 'h-[var(--size-input-md)] rounded-[0.5rem] px-[0.75rem] py-[0.5rem] text-[0.8125rem] leading-[1rem]',
      lg: 'h-[var(--size-input-lg)] rounded-[0.5625rem] px-[0.875rem] py-[0.75rem] text-[0.875rem] leading-[1.125rem]'
    },
    hasTrailingActions: {
      sm: 'pr-[1.75rem]',
      sm2: 'pr-[2.625rem]',
      md: 'pr-[1.875rem]',
      md2: 'pr-[2.75rem]',
      lg: 'pr-[2rem]',
      lg2: 'pr-[3rem]'
    }
  },
  defaultVariants: {
    size: 'md'
  }
});

const inputLoadingSizeMapper = {
  sm: 'var(--size-input-sm)',
  md: 'var(--size-input-md)',
  lg: 'var(--size-input-lg)'
};

const ICON_SIZE = 13;
const COPY_RESET_DELAY = 2000;

interface InputProps
  extends Omit<React.ComponentProps<'input'>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: React.ReactNode;
  error?: React.ReactNode;
  loading?: boolean;
  helperText?: React.ReactNode;
  afterSlot?: React.ReactNode;
  withCopy?: boolean;
  withHide?: boolean;
  hidePlaceholder?: string;
}

function Input({
  className,
  type,
  size,
  label,
  error,
  loading,
  helperText,
  afterSlot,
  withCopy,
  withHide,
  hidePlaceholder = '••••••••••••••••••••••••',
  ...props
}: InputProps) {
  const [hidden, setHidden] = useState(!!withHide);
  const [copied, setCopied] = useState(false);

  const showActions = !!withHide || !!withCopy;
  const actionCount = (withHide ? 1 : 0) + (withCopy ? 1 : 0);
  const trailingKey =
    actionCount > 0
      ? `${size ?? 'md'}${actionCount === 2 ? '2' : ''}`
      : undefined;

  const handleCopy = useCallback(() => {
    if (copied) return;
    setCopied(true);
    const value = props.value?.toString() ?? '';
    navigator.clipboard.writeText(value);
    toast.success('Copied to clipboard');
    const timer = setTimeout(() => setCopied(false), COPY_RESET_DELAY);
    return () => clearTimeout(timer);
  }, [copied, props.value]);

  const inputElement = !loading ? (
    <input
      type={type}
      data-slot="input"
      className={inputVariants({
        size,
        hasTrailingActions: trailingKey as
          | 'sm'
          | 'sm2'
          | 'md'
          | 'md2'
          | 'lg'
          | 'lg2'
          | undefined,
        className
      })}
      aria-invalid={!!error}
      {...props}
      value={hidden ? hidePlaceholder : props.value}
    />
  ) : (
    <Skeleton
      style={{ height: inputLoadingSizeMapper[size || 'md'] }}
      className="w-full rounded-[0.5rem]"
    />
  );

  return (
    <>
      {label &&
        (!loading ? (
          <Label
            htmlFor={props.id}
            className="flex items-center gap-0.5 text-[0.75rem] leading-[1rem] font-medium text-[var(--input-text)]"
            withOptional={props.required === false}
          >
            {label}
          </Label>
        ) : (
          <Skeleton className="w-30 h-3.5" />
        ))}
      {!loading ? (
        <div className="flex items-center gap-2">
          <div className="relative w-full">
            {inputElement}
            {showActions && (
              <div
                className={cn(
                  'absolute inset-y-0 right-[0.625rem] inline-flex items-center gap-2 pointer-events-none',
                  '[&_button]:pointer-events-auto'
                )}
              >
                {withHide && (
                  <button
                    type="button"
                    onClick={() => setHidden(!hidden)}
                    title={hidden ? 'Show' : 'Hide'}
                    aria-label={hidden ? 'Show' : 'Hide'}
                    className="text-[var(--input-icon-fg)] hover:text-[var(--input-text)] cursor-pointer transition-colors"
                  >
                    {hidden ? (
                      <EyeIcon size={ICON_SIZE} />
                    ) : (
                      <EyeOffIcon size={ICON_SIZE} />
                    )}
                  </button>
                )}
                {withCopy && (
                  <button
                    type="button"
                    onClick={handleCopy}
                    title={copied ? 'Copied' : 'Copy'}
                    aria-label={copied ? 'Copied' : 'Copy'}
                    className={cn(
                      'text-[var(--input-icon-fg)] hover:text-[var(--input-text)] cursor-pointer transition-colors',
                      copied && 'cursor-default'
                    )}
                  >
                    {copied ? (
                      <CheckIcon size={ICON_SIZE} />
                    ) : (
                      <CopyIcon size={ICON_SIZE} />
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
          {afterSlot && (
            <div className="text-[var(--input-helper-fg)]">{afterSlot}</div>
          )}
        </div>
      ) : (
        inputElement
      )}
      {error && (
        <div className="text-[0.6875rem] leading-[0.875rem] font-medium text-[var(--input-helper-error-fg)]">
          {error}
        </div>
      )}
      {!error && helperText && (
        <div className="flex items-center gap-1 text-[0.6875rem] leading-[0.875rem] text-[var(--input-helper-fg)]">
          {helperText}
        </div>
      )}
    </>
  );
}

export { Input, inputLoadingSizeMapper, inputVariants };
