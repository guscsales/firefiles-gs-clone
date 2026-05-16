import type React from 'react';
import { cn } from '../utils';
import { Label } from './label';
import { Skeleton } from './skeleton';

interface TextareaProps extends React.ComponentProps<'textarea'> {
  label?: React.ReactNode;
  error?: React.ReactNode;
  loading?: boolean;
  helperText?: React.ReactNode;
}

function Textarea({
  className,
  label,
  error,
  loading,
  helperText,
  ...props
}: TextareaProps) {
  return (
    <>
      {label &&
        (!loading ? (
          <Label htmlFor={props.id} withOptional={props.required === false}>
            {label}
          </Label>
        ) : (
          <Skeleton className="w-30 h-3.5" />
        ))}
      {!loading ? (
        <textarea
          data-slot="textarea"
          className={cn(
            `flex w-full min-w-0 field-sizing-content min-h-[4.375rem] antialiased
            bg-[var(--textarea-bg)]
            text-[var(--input-text)] text-[0.8125rem] leading-[1.125rem]
            border border-solid border-[var(--textarea-border-base)] rounded-[0.5rem]
            px-[0.75rem] py-[0.625rem]
            placeholder:text-[var(--input-helper-fg)]
            selection:bg-primary selection:text-primary-foreground
            transition-[color,box-shadow,border-color] outline-none
            hover:border-[var(--input-border-hover)]
            focus-visible:border-[var(--input-border-focus)]
            focus-visible:shadow-[0_0_0_0.1875rem_var(--input-focus-ring)]
            read-only:bg-[var(--input-bg-readonly)]
            read-only:cursor-default
            read-only:hover:border-[var(--textarea-border-base)]
            disabled:bg-[var(--input-bg-disabled)]
            disabled:text-[var(--input-text-disabled)]
            disabled:cursor-not-allowed
            disabled:hover:border-[var(--textarea-border-base)]
            aria-invalid:border-[var(--input-border-error)]
            aria-invalid:hover:border-[var(--input-border-error)]
            aria-invalid:focus-visible:border-[var(--input-border-error)]
            aria-invalid:focus-visible:shadow-[0_0_0_0.1875rem_rgb(194_78_58_/_0.12)]`,
            className
          )}
          aria-invalid={!!error}
          {...props}
        />
      ) : (
        <Skeleton className="w-full h-[4.375rem] rounded-[0.5rem]" />
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

export { Textarea };
