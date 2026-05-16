'use client';

import { ChevronDownIcon } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { type Control, Controller } from 'react-hook-form';
import { PatternFormat } from 'react-number-format';
import type { VariantProps } from 'tailwind-variants';
import { cn } from '../utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from './dropdown-menu';
import { inputLoadingSizeMapper, type inputVariants } from './input';
import { Label } from './label';
import { Skeleton } from './skeleton';

/**
 * Phone format patterns by country code (DDI)
 * # represents a digit
 */
export const PHONE_FORMATS: Record<
  string,
  { format: string; placeholder: string; name: string }
> = {
  '+1': {
    format: '(###) ###-####',
    placeholder: '(555) 555-5555',
    name: 'USA'
  },
  '+55': {
    format: '(##) #####-####',
    placeholder: '(11) 99999-9999',
    name: 'Brazil'
  }
};

export const PHONE_COUNTRY_CODES = Object.keys(PHONE_FORMATS);

const WRAPPER_HEIGHT_BY_SIZE = {
  sm: 'h-[var(--size-input-sm)]',
  md: 'h-[var(--size-input-md)]',
  lg: 'h-[var(--size-input-lg)]'
} as const;

/**
 * Parse a phone value to extract country code and number
 */
function parsePhoneValue(
  value: string | undefined,
  defaultCode: string
): { countryCode: string; phoneNumber: string } {
  const storedValue = value || '';
  const countryCode =
    PHONE_COUNTRY_CODES.find((code) => storedValue.startsWith(code)) ||
    defaultCode;
  const phoneNumber = storedValue.replace(countryCode, '').trim();
  return { countryCode, phoneNumber };
}

interface PhoneInputContentProps extends VariantProps<typeof inputVariants> {
  className?: string;
  onChange?: (value: string) => void;
  countryCode: string;
  onCountryChange: (code: string) => void;
  phoneNumber: string;
  disabled?: boolean;
  readOnly?: boolean;
  error?: React.ReactNode;
  inputRef?: React.Ref<HTMLInputElement>;
  inputReadOnly?: boolean;
  autoFocus?: boolean;
}

function PhoneInputContent({
  className,
  size,
  countryCode,
  onCountryChange,
  phoneNumber,
  onChange,
  disabled,
  readOnly,
  error,
  inputRef,
  inputReadOnly,
  autoFocus
}: PhoneInputContentProps) {
  const phoneFormat = PHONE_FORMATS[countryCode] || PHONE_FORMATS['+1'];
  const sizeKey = size || 'md';
  const isReadOnly = readOnly || inputReadOnly;
  const isDisabled = !!disabled;

  const handlePhoneChange = (formattedValue: string) => {
    if (!onChange) return;
    const cleanNumber = formattedValue.replace(/\D/g, '');
    if (cleanNumber) {
      onChange(`${countryCode} ${formattedValue}`);
    } else {
      onChange('');
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-[0.625rem] rounded-[0.5rem] px-[0.75rem] border border-solid border-[var(--color-input-border-base)] bg-[var(--color-input-bg)]',
        WRAPPER_HEIGHT_BY_SIZE[sizeKey],
        'transition-[box-shadow,border-color]',
        'has-[input:focus-visible]:border-[var(--color-input-border-focus)] has-[input:focus-visible]:shadow-[0_0_0_0.1875rem_var(--input-focus-ring)]',
        'has-[input:hover]:border-[var(--color-input-border-hover)]',
        isReadOnly && 'bg-[var(--color-input-bg-readonly)]',
        isDisabled && 'bg-[var(--color-input-bg-disabled)] cursor-not-allowed',
        !!error &&
          'border-[var(--color-input-border-error)] has-[input:focus-visible]:border-[var(--color-input-border-error)] has-[input:focus-visible]:shadow-[0_0_0_0.1875rem_rgb(194_78_58_/_0.12)]'
      )}
      aria-invalid={!!error}
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          data-slot="phone-cc-trigger"
          disabled={isDisabled || isReadOnly}
          className="flex items-center gap-[0.375rem] shrink-0 cursor-pointer outline-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="text-[0.8125rem] leading-[1rem] text-[var(--color-input-text)]">
            {countryCode}
          </span>
          <ChevronDownIcon
            className="size-[0.5625rem] shrink-0 text-[var(--color-input-icon-static-fg)]"
            strokeWidth={2}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-44">
          <DropdownMenuRadioGroup
            value={countryCode}
            onValueChange={onCountryChange}
          >
            {PHONE_COUNTRY_CODES.map((code) => {
              const format = PHONE_FORMATS[code];
              return (
                <DropdownMenuRadioItem key={code} value={code}>
                  <span className="font-medium">{code}</span>
                  <span className="text-muted-foreground">{format?.name}</span>
                </DropdownMenuRadioItem>
              );
            })}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <div
        className="w-px h-[0.875rem] shrink-0 bg-[var(--color-input-border-base)]"
        aria-hidden="true"
      />
      <PatternFormat
        format={phoneFormat?.format || ''}
        mask="_"
        className={cn(
          'flex-1 min-w-0 outline-none bg-transparent text-[0.8125rem] leading-[1rem] text-[var(--color-input-text)] placeholder:text-[var(--color-input-helper-fg)] selection:bg-primary selection:text-primary-foreground disabled:cursor-not-allowed disabled:text-[var(--color-input-text-disabled)]',
          className
        )}
        aria-invalid={!!error}
        aria-readonly={isReadOnly}
        placeholder={phoneFormat?.placeholder}
        value={phoneNumber}
        onValueChange={(values) => handlePhoneChange(values.formattedValue)}
        getInputRef={inputRef}
        disabled={isDisabled}
        readOnly={isReadOnly}
        autoFocus={autoFocus}
      />
    </div>
  );
}

// Controlled version props (with react-hook-form)
interface InputPhoneNumberControlledProps
  extends VariantProps<typeof inputVariants> {
  name: string;
  // biome-ignore lint/suspicious/noExplicitAny: any control allowed
  control: Control<any>;
  id?: string;
  className?: string;
  label?: React.ReactNode;
  error?: React.ReactNode;
  loading?: boolean;
  defaultCountryCode?: string;
  disabled?: boolean;
  inputReadOnly?: boolean;
  autoFocus?: boolean;
}

// Uncontrolled version props (standalone)
interface InputPhoneNumberUncontrolledProps
  extends VariantProps<typeof inputVariants> {
  value?: string;
  onChange?: (value: string) => void;
  id?: string;
  className?: string;
  label?: React.ReactNode;
  error?: React.ReactNode;
  loading?: boolean;
  defaultCountryCode?: string;
  disabled?: boolean;
  readOnly?: boolean;
  name?: never;
  control?: never;
  inputReadOnly?: boolean;
  autoFocus?: boolean;
}

type InputPhoneNumberProps =
  | InputPhoneNumberControlledProps
  | InputPhoneNumberUncontrolledProps;

function InputPhoneNumber(props: InputPhoneNumberProps) {
  const {
    className,
    size,
    label,
    error,
    loading,
    defaultCountryCode = '+1',
    disabled,
    id,
    inputReadOnly = false,
    autoFocus = false
  } = props;

  // Check if it's controlled (react-hook-form) or uncontrolled mode
  const isControlled = 'control' in props && props.control !== undefined;

  const [internalCountryCode, setInternalCountryCode] =
    useState(defaultCountryCode);

  // Uncontrolled mode
  if (!isControlled) {
    const { value, onChange, readOnly } =
      props as InputPhoneNumberUncontrolledProps;
    const { countryCode, phoneNumber } = parsePhoneValue(
      value,
      internalCountryCode
    );

    // Sync internal state with value
    if (countryCode !== internalCountryCode && value) {
      setInternalCountryCode(countryCode);
    }

    const handleCountryChange = (newCode: string) => {
      setInternalCountryCode(newCode);
      // Clear input when country changes (different formats)
      if (onChange) {
        onChange('');
      }
    };

    return (
      <>
        {label &&
          (!loading ? (
            <Label htmlFor={id}>{label}</Label>
          ) : (
            <Skeleton className="w-30 h-3.5" />
          ))}
        {!loading ? (
          <PhoneInputContent
            className={className}
            size={size}
            countryCode={internalCountryCode}
            onCountryChange={handleCountryChange}
            phoneNumber={phoneNumber}
            onChange={onChange}
            disabled={disabled}
            readOnly={readOnly}
            error={error}
            inputReadOnly={inputReadOnly}
            autoFocus={autoFocus}
          />
        ) : (
          <Skeleton
            style={{ height: inputLoadingSizeMapper[size || 'md'] }}
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
  }

  // Controlled mode (react-hook-form)
  const { name, control } = props as InputPhoneNumberControlledProps;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const { countryCode, phoneNumber } = parsePhoneValue(
          field.value,
          internalCountryCode
        );

        // Sync internal state with field value
        if (countryCode !== internalCountryCode && field.value) {
          setInternalCountryCode(countryCode);
        }

        const handleCountryChange = (newCode: string) => {
          setInternalCountryCode(newCode);
          // Clear input when country changes (different formats)
          field.onChange('');
        };

        const handleChange = (value: string) => {
          field.onChange(value);
        };

        return (
          <>
            {label &&
              (!loading ? (
                <Label htmlFor={id}>{label}</Label>
              ) : (
                <Skeleton className="w-30 h-3.5" />
              ))}
            {!loading ? (
              <PhoneInputContent
                className={className}
                size={size}
                countryCode={internalCountryCode}
                onCountryChange={handleCountryChange}
                phoneNumber={phoneNumber}
                onChange={handleChange}
                disabled={disabled}
                error={error}
                inputRef={field.ref}
              />
            ) : (
              <Skeleton
                style={{ height: inputLoadingSizeMapper[size || 'md'] }}
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

export { InputPhoneNumber };
