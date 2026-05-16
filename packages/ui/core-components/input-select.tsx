'use client';

import type React from 'react';
import { type Control, Controller } from 'react-hook-form';
import { cn } from '../utils';
import { Label } from './label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from './select';
import { Skeleton } from './skeleton';

interface InputSelectProps extends React.ComponentProps<typeof Select> {
  name: string;
  // biome-ignore lint/suspicious/noExplicitAny: any control allowed
  control: Control<any>;
  options: {
    label: string;
    value: string;
    description?: string;
  }[];
  id?: string;
  label?: React.ReactNode;
  error?: React.ReactNode;
  loading?: boolean;
  size?: 'sm' | 'default';
  placeholder?: string;
  className?: string;
  optionsPlaceholder?: string;
}

export function InputSelect({
  name,
  control,
  options,
  id,
  label,
  error,
  loading,
  placeholder,
  size = 'default',
  className,
  optionsPlaceholder = 'Select an option',
  required,
  ...props
}: InputSelectProps) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <>
          {label &&
            (!loading ? (
              <Label
                htmlFor={id}
                className="flex items-center gap-0.5"
                withOptional={required === false}
              >
                {label}
              </Label>
            ) : (
              <Skeleton className="w-30 h-3.5" />
            ))}

          {!loading ? (
            <Select onValueChange={field.onChange} {...field} {...props}>
              <SelectTrigger className={cn('w-full', className)} error={error}>
                <SelectValue placeholder={placeholder} className="truncate" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>{optionsPlaceholder}</SelectLabel>
                  {options.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      description={option.description}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          ) : (
            <Skeleton
              data-size={size}
              className="w-full data-[size=default]:h-9 data-[size=sm]:h-8"
            />
          )}

          {error && <div className="text-xs text-destructive">{error}</div>}
        </>
      )}
    />
  );
}
