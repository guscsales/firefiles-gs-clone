'use client';

import { Command as CommandPrimitive } from 'cmdk';
import { X } from 'lucide-react';
import * as React from 'react';
import { type Control, Controller } from 'react-hook-form';
import { cn } from '../utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList
} from './command';
import { InputWrapper } from './input-wrapper';
import { Label } from './label';
import { Skeleton } from './skeleton';

type Option = {
  label: string;
  value: string;
};

interface InputMultiSelectProps {
  name: string;
  // biome-ignore lint/suspicious/noExplicitAny: any control allowed
  control: Control<any>;
  options: Option[];
  id?: string;
  className?: string;
  error?: React.ReactNode;
  label?: React.ReactNode;
  loading?: boolean;
  placeholder?: string;
}

function InputMultiSelect({
  name,
  control,
  options,
  id,
  className,
  error,
  label,
  loading,
  placeholder = 'Select one or more options'
}: InputMultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        let selected = Array.isArray(field.value)
          ? options.filter((option) => field.value.includes(option.value))
          : [];

        function handleUnselect(option: Option) {
          const newValue = selected.filter((s) => s.value !== option.value);
          selected = newValue;
          field.onChange(newValue.map((s) => s.value));
        }

        function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
          const input = inputRef.current;
          if (input) {
            if (e.key === 'Delete' || e.key === 'Backspace') {
              if (input.value === '' && selected.length > 0) {
                const newValue = [...selected];
                newValue.pop();
                selected = newValue;
                field.onChange(newValue.map((s) => s.value));
              }
            }

            if (e.key === 'Escape') {
              input.blur();
            }
          }
        }

        const selectables = options.filter(
          (option) => !selected.some((s) => s.value === option.value)
        );

        return (
          <Command
            onKeyDown={handleKeyDown}
            className="overflow-visible rounded-none border-0 bg-transparent shadow-none"
          >
            <InputWrapper>
              {label &&
                (!loading ? (
                  <Label htmlFor={id}>{label}</Label>
                ) : (
                  <Skeleton className="w-30 h-3.5" />
                ))}
              {!loading ? (
                <div>
                  <div
                    data-slot="multi-select-container"
                    className={cn(
                      `flex flex-wrap items-center gap-[0.375rem]
                      bg-[var(--input-bg)]
                      border border-solid border-[var(--input-border-base)]
                      rounded-[0.5rem] p-[0.5rem]
                      transition-[color,box-shadow,border-color] outline-none
                      hover:border-[var(--input-border-hover)]
                      focus-within:border-[var(--input-border-focus)]
                      focus-within:shadow-[0_0_0_0.1875rem_var(--input-focus-ring)]
                      aria-invalid:border-[var(--input-border-error)]
                      aria-invalid:hover:border-[var(--input-border-error)]
                      aria-invalid:focus-within:border-[var(--input-border-error)]
                      aria-invalid:focus-within:shadow-[0_0_0_0.1875rem_rgb(194_78_58_/_0.12)]`,
                      className
                    )}
                    aria-invalid={!!error}
                  >
                    {selected.map((option) => {
                      return (
                        <span
                          key={option.value}
                          data-slot="multi-select-chip"
                          className="inline-flex items-center gap-1 rounded-full bg-[var(--input-popover-item-active-bg)] py-[0.125rem] pr-[0.375rem] pl-[0.5rem] text-[0.6875rem] leading-[0.875rem] font-medium text-[var(--input-text)] cursor-default select-none"
                        >
                          {option.label}
                          <button
                            type="button"
                            className="rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer text-[var(--input-icon-fg)] hover:text-[var(--input-text)] transition-colors"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleUnselect(option);
                              }
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onClick={() => handleUnselect(option)}
                            aria-label={`Remove ${option.label}`}
                          >
                            <X className="size-[0.625rem]" strokeWidth={2.4} />
                          </button>
                        </span>
                      );
                    })}
                    <CommandPrimitive.Input
                      ref={inputRef}
                      value={inputValue}
                      onValueChange={setInputValue}
                      onBlur={() => setOpen(false)}
                      onFocus={() => setOpen(true)}
                      placeholder={placeholder}
                      className="flex-1 min-w-[4rem] bg-transparent outline-none text-[0.75rem] leading-[1rem] text-[var(--input-text)] placeholder:text-[var(--input-helper-fg)] py-[0.125rem] px-[0.25rem]"
                    />
                  </div>
                  <div className="relative">
                    <CommandList>
                      {open && selectables.length > 0 ? (
                        <div className="absolute top-[0.125rem] z-10 w-full rounded-[0.625rem] border border-solid border-[var(--input-border-base)] bg-[var(--popover)] text-[var(--popover-foreground)] shadow-[var(--shadow-popover)] outline-none animate-in p-[0.375rem] flex flex-col gap-[0.125rem]">
                          <CommandEmpty className="px-[0.5rem] py-[0.4375rem] text-[0.8125rem] leading-[1rem] text-[var(--input-helper-fg)]">
                            No options found
                          </CommandEmpty>
                          <CommandGroup className="overflow-auto p-0">
                            {selectables.map((option) => {
                              return (
                                <CommandItem
                                  key={option.value}
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }}
                                  onSelect={() => {
                                    setInputValue('');
                                    selected = [...selected, option];
                                    field.onChange(
                                      selected.map((s) => s.value)
                                    );
                                  }}
                                  className="rounded-[0.375rem] px-[0.5rem] py-[0.4375rem] text-[0.8125rem] leading-[1rem] text-[var(--input-text)] cursor-pointer data-[selected=true]:bg-[var(--input-popover-item-active-bg)] data-[selected=true]:text-[var(--input-text)]"
                                >
                                  {option.label}
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </div>
                      ) : null}
                    </CommandList>
                  </div>
                </div>
              ) : (
                <Skeleton className="w-full h-10 rounded-[0.5rem]" />
              )}
              {error && (
                <div className="text-[0.6875rem] leading-[0.875rem] font-medium text-[var(--input-helper-error-fg)]">
                  {error}
                </div>
              )}
            </InputWrapper>
          </Command>
        );
      }}
    />
  );
}

export { InputMultiSelect };
