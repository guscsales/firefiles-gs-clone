'use client';

import type React from 'react';
import { type Control, Controller } from 'react-hook-form';
import { cn } from '../utils';
import { Label } from './label';
import { Skeleton } from './skeleton';
import { Switch } from './switch';

interface InputSwitchProps extends React.ComponentProps<typeof Switch> {
  name: string;
  // biome-ignore lint/suspicious/noExplicitAny: any control allowed
  control: Control<any>;
  id?: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  loading?: boolean;
  className?: string;
  required?: boolean;
}

export function InputSwitch({
  name,
  control,
  id: externalId,
  label,
  description,
  error,
  loading,
  className,
  required,
  ...props
}: InputSwitchProps) {
  const switchId = externalId || `switch-${name}`;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <label
          htmlFor={switchId}
          className={cn(
            'flex items-start justify-between gap-4 rounded-[0.625rem] py-3.5 px-4 border border-[var(--input-border-base)] bg-[var(--input-bg)] cursor-pointer select-none',
            className
          )}
        >
          <div className="flex flex-col gap-1 min-w-0 grow">
            {label &&
              (!loading ? (
                <Label
                  htmlFor={switchId}
                  className="text-[0.8125rem] leading-[1.125rem] font-medium text-[var(--input-text)] pointer-events-none"
                  withOptional={required === false}
                >
                  {label}
                </Label>
              ) : (
                <Skeleton className="w-24 h-3.5" />
              ))}

            {description && !loading && (
              <p className="text-xs leading-4 text-[var(--input-helper-fg)]">
                {description}
              </p>
            )}

            {error && (
              <div className="text-xs leading-4 text-[var(--input-helper-error-fg)]">
                {error}
              </div>
            )}
          </div>

          {!loading ? (
            <Switch
              id={switchId}
              checked={field.value}
              onCheckedChange={field.onChange}
              {...props}
            />
          ) : (
            <Skeleton className="h-5 w-9 rounded-full" />
          )}
        </label>
      )}
    />
  );
}
