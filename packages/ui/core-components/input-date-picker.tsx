'use client';

import { add, format, sub } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { type Control, Controller } from 'react-hook-form';
import { cn } from '../utils';
import { Calendar } from './calendar';
import { inputVariants } from './input';
import { InputWrapper } from './input-wrapper';
import { Label } from './label';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Skeleton } from './skeleton';

interface InputDatePickerProps {
  name: string;
  // biome-ignore lint/suspicious/noExplicitAny: any control allowed
  control: Control<any>;
  id?: string;
  label?: React.ReactNode;
  error?: React.ReactNode;
  loading?: boolean;
  placeholder?: string;
  calendarProps?: Omit<
    React.ComponentProps<typeof Calendar>,
    'selected' | 'onSelect'
  >;
  required?: boolean;
}

export function InputDatePicker({
  name,
  control,
  label,
  error,
  loading,
  placeholder = '',
  calendarProps = {},
  required,
  ...props
}: InputDatePickerProps) {
  const [open, setOpen] = useState(false);
  // TODO: @gus -> make this dynamic when a feature request is implemented
  const datePickerLimitations = useMemo(() => {
    const today = new Date();

    return {
      startMonth: sub(today, { years: 20 }),
      endMonth: add(today, { years: 10 })
    };
  }, []);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <InputWrapper>
              {label &&
                (!loading ? (
                  <Label htmlFor={props.id} withOptional={required === false}>
                    {label}
                  </Label>
                ) : (
                  <Skeleton className="w-30 h-3.5" />
                ))}
              <div
                className={cn(
                  inputVariants(),
                  'flex items-center cursor-pointer !bg-[var(--input-bg)]',
                  {
                    '!text-text-tertiary': !field.value
                  }
                )}
                aria-invalid={!!error}
              >
                {field.value ? (
                  format(field.value, 'MM/dd/yyyy')
                ) : (
                  <span>{placeholder}</span>
                )}
                <CalendarIcon className="ml-auto size-[0.8125rem] text-input-icon-fg" />
              </div>
              {error && <div className="text-xs text-destructive">{error}</div>}
            </InputWrapper>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 bg-transparent border-0 rounded-none shadow-none gap-0"
            align="start"
          >
            <Calendar
              mode={calendarProps.mode || 'single'}
              captionLayout="dropdown"
              onDayClick={() => {
                setOpen(false);
              }}
              selected={field.value}
              onSelect={field.onChange}
              {...datePickerLimitations}
              {...calendarProps}
              {...props}
            />
          </PopoverContent>
        </Popover>
      )}
    />
  );
}
