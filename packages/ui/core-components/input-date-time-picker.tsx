'use client';

import { add, format, isValid, set, sub } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { type Control, Controller } from 'react-hook-form';
import { cn } from '../utils';
import { Calendar } from './calendar';
import { Input, inputVariants } from './input';
import { InputWrapper } from './input-wrapper';
import { Label } from './label';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './select';
import { Skeleton } from './skeleton';

interface InputDateTimePickerProps {
  name: string;
  // biome-ignore lint/suspicious/noExplicitAny: any control allowed
  control: Control<any>;
  id?: string;
  label?: React.ReactNode;
  error?: React.ReactNode;
  loading?: boolean;
  placeholder?: string;
  required?: boolean;
  minDate?: Date;
}

interface TimePartInputProps {
  placeholder: string;
  min: number;
  max: number;
  externalValue: string;
  onChange: (value: string) => void;
  className?: string;
}

function TimePartInput({
  placeholder,
  min,
  max,
  externalValue,
  onChange,
  className
}: TimePartInputProps) {
  const [localValue, setLocalValue] = useState(externalValue);

  useEffect(() => {
    setLocalValue(externalValue);
  }, [externalValue]);

  const parsed =
    localValue === '' ? Number.NaN : Number.parseInt(localValue, 10);
  const isInvalid =
    localValue !== '' && (Number.isNaN(parsed) || parsed < min || parsed > max);

  return (
    <Input
      type="number"
      size="sm"
      min={min}
      max={max}
      placeholder={placeholder}
      value={localValue}
      aria-invalid={isInvalid}
      onChange={(e) => {
        const newValue = e.target.value;
        setLocalValue(newValue);
        if (newValue !== '') {
          onChange(newValue);
        }
      }}
      className={cn(
        'flex-1 text-center font-mono font-medium !rounded-md',
        className
      )}
    />
  );
}

export function InputDateTimePicker({
  name,
  control,
  label,
  error,
  loading,
  placeholder = '',
  required,
  minDate,
  ...props
}: InputDateTimePickerProps) {
  const [open, setOpen] = useState(false);

  const datePickerLimitations = useMemo(() => {
    const today = new Date();
    return {
      startMonth: sub(today, { years: 20 }),
      endMonth: add(today, { years: 10 })
    };
  }, []);

  const _handleTimeChange = useCallback(
    (
      currentDate: Date | null | undefined,
      field: 'hours' | 'minutes' | 'period',
      value: string,
      onChange: (date: Date) => void
    ) => {
      if (value === '') return;
      const base = currentDate || new Date();
      let hours = base.getHours();
      let minutes = base.getMinutes();
      const currentPeriod = hours >= 12 ? 'PM' : 'AM';

      if (field === 'hours') {
        const h12 = Number.parseInt(value, 10);
        if (Number.isNaN(h12)) return;
        hours = currentPeriod === 'PM' ? (h12 % 12) + 12 : h12 % 12;
      } else if (field === 'minutes') {
        const m = Number.parseInt(value, 10);
        if (Number.isNaN(m)) return;
        minutes = m;
      } else if (field === 'period') {
        const h12 = hours % 12 || 12;
        hours = value === 'PM' ? (h12 % 12) + 12 : h12 % 12;
      }

      onChange(set(base, { hours, minutes, seconds: 0, milliseconds: 0 }));
    },
    []
  );

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const dateValue = field.value as Date | null | undefined;
        const validDate = dateValue && isValid(dateValue) ? dateValue : null;
        const displayHours = validDate
          ? (validDate.getHours() % 12 || 12).toString()
          : '';
        const displayMinutes = validDate
          ? validDate.getMinutes().toString().padStart(2, '0')
          : '';
        const displayPeriod = validDate
          ? validDate.getHours() >= 12
            ? 'PM'
            : 'AM'
          : 'AM';

        return (
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
                      '!text-text-tertiary': !validDate
                    }
                  )}
                  aria-invalid={!!error}
                >
                  {validDate ? (
                    format(validDate, 'MM/dd/yyyy hh:mm a')
                  ) : (
                    <span>{placeholder}</span>
                  )}
                  <CalendarIcon className="ml-auto size-[0.8125rem] text-input-icon-fg" />
                </div>
                {error && (
                  <div className="text-xs text-destructive">{error}</div>
                )}
              </InputWrapper>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 bg-transparent border-0 rounded-none shadow-none gap-0"
              align="start"
            >
              <div className="flex flex-col gap-2.5 rounded-lg bg-popover border border-border shadow-floating p-3">
                <Calendar
                  mode="single"
                  captionLayout="dropdown"
                  selected={validDate ?? undefined}
                  onSelect={(date) => {
                    if (!date) return;
                    const current = validDate || new Date();
                    const merged = set(date, {
                      hours: current.getHours(),
                      minutes: current.getMinutes(),
                      seconds: 0,
                      milliseconds: 0
                    });
                    field.onChange(merged);
                  }}
                  disabled={minDate ? { before: minDate } : undefined}
                  className="!border-0 !shadow-none !p-0 !bg-transparent !rounded-none w-full"
                  {...datePickerLimitations}
                />
                <div className="flex items-center pt-1.5 gap-2">
                  <TimePartInput
                    placeholder="HH"
                    min={1}
                    max={12}
                    externalValue={displayHours}
                    onChange={(value) =>
                      _handleTimeChange(
                        dateValue,
                        'hours',
                        value,
                        field.onChange
                      )
                    }
                  />
                  <span className="text-sm font-medium text-input-text leading-[1.125rem]">
                    :
                  </span>
                  <TimePartInput
                    placeholder="MM"
                    min={0}
                    max={59}
                    externalValue={displayMinutes}
                    onChange={(value) =>
                      _handleTimeChange(
                        dateValue,
                        'minutes',
                        value,
                        field.onChange
                      )
                    }
                  />
                  <Select
                    value={displayPeriod}
                    onValueChange={(value) =>
                      _handleTimeChange(
                        dateValue,
                        'period',
                        value,
                        field.onChange
                      )
                    }
                  >
                    <SelectTrigger
                      size="sm"
                      className="flex-[1.2] min-w-0 !bg-input-bg !border-input-border-base !h-[var(--size-input-sm)] !rounded-md !px-[0.625rem] !py-[0.375rem] !text-[0.75rem]"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        );
      }}
    />
  );
}
