'use client';

import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import type React from 'react';
import { type Control, Controller } from 'react-hook-form';
import { NumericFormat } from 'react-number-format';
import type { VariantProps } from 'tailwind-variants';
import { cn } from '../utils';
import { inputLoadingSizeMapper, inputVariants } from './input';
import { Label } from './label';
import { Skeleton } from './skeleton';

interface InputCurrencyProps extends VariantProps<typeof inputVariants> {
  name: string;
  // biome-ignore lint/suspicious/noExplicitAny: any control allowed
  control: Control<any>;
  id?: string;
  className?: string;
  label?: React.ReactNode;
  error?: React.ReactNode;
  loading?: boolean;
  numberProps?: React.ComponentProps<typeof NumericFormat>;
  floatNumber?: boolean;
}

const STEPPER_HEIGHT_BY_SIZE = {
  sm: 'h-[var(--size-input-sm)]',
  md: 'h-[var(--size-input-md)]',
  lg: 'h-[var(--size-input-lg)]'
} as const;

function InputNumber({
  className,
  size,
  label,
  error,
  loading,
  numberProps,
  floatNumber,
  ...props
}: InputCurrencyProps) {
  const sizeKey = size || 'md';

  return (
    <Controller
      name={props.name}
      control={props.control}
      render={({ field }) => {
        const currentValue =
          typeof field.value === 'number' ? field.value : Number(field.value);
        const safeCurrent = Number.isFinite(currentValue) ? currentValue : 0;

        const handleStep = (delta: number) => {
          const next = safeCurrent + delta;
          field.onChange(floatNumber ? next : Math.trunc(next));
        };

        return (
          <>
            {label &&
              (!loading ? (
                <Label htmlFor={props.id}>{label}</Label>
              ) : (
                <Skeleton className="w-30 h-3.5" />
              ))}
            {!loading ? (
              <div
                className={cn(
                  'flex items-stretch overflow-hidden rounded-[0.5rem] border border-solid border-[var(--color-input-border-base)] bg-[var(--color-input-bg)]',
                  STEPPER_HEIGHT_BY_SIZE[sizeKey],
                  'aria-invalid:border-[var(--color-input-border-error)]',
                  'has-[input:focus-visible]:border-[var(--color-input-border-focus)] has-[input:focus-visible]:shadow-[0_0_0_0.1875rem_var(--input-focus-ring)] transition-[box-shadow,border-color]'
                )}
                aria-invalid={!!error}
              >
                <NumericFormat
                  className={inputVariants({
                    size,
                    className: cn(
                      'border-0 bg-transparent rounded-none focus-visible:shadow-none focus-visible:border-0 hover:border-0 read-only:bg-transparent disabled:bg-transparent aria-invalid:border-0',
                      className
                    )
                  })}
                  aria-invalid={!!error}
                  getInputRef={field.ref}
                  value={field.value ?? ''}
                  onValueChange={(values) => {
                    field.onChange(
                      floatNumber
                        ? values.floatValue
                        : values.floatValue !== undefined
                          ? Math.trunc(values.floatValue)
                          : undefined
                    );
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  {...numberProps}
                />
                <div className="flex flex-col border-l border-solid border-[var(--color-input-border-base)] text-[var(--color-input-stepper-icon-fg)]">
                  <button
                    type="button"
                    aria-label="Increment"
                    tabIndex={-1}
                    onClick={() => handleStep(1)}
                    className="flex flex-1 items-center justify-center w-7 border-b border-solid border-[var(--color-input-border-base)] cursor-pointer hover:bg-[var(--color-input-bg-readonly)] transition-colors"
                  >
                    <ChevronUpIcon
                      className="size-2.5 shrink-0"
                      strokeWidth={2.4}
                    />
                  </button>
                  <button
                    type="button"
                    aria-label="Decrement"
                    tabIndex={-1}
                    onClick={() => handleStep(-1)}
                    className="flex flex-1 items-center justify-center w-7 cursor-pointer hover:bg-[var(--color-input-bg-readonly)] transition-colors"
                  >
                    <ChevronDownIcon
                      className="size-2.5 shrink-0"
                      strokeWidth={2.4}
                    />
                  </button>
                </div>
              </div>
            ) : (
              <Skeleton
                style={{ height: inputLoadingSizeMapper[sizeKey] }}
                className="w-full"
              />
            )}
            {error && (
              <div className="text-[0.6875rem] leading-[0.875rem] font-medium text-[var(--color-input-helper-error-fg)]">
                {error}
              </div>
            )}
          </>
        );
      }}
    />
  );
}

export { InputNumber };
