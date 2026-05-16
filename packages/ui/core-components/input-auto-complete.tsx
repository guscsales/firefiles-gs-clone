'use client';

import { Command as CommandPrimitive } from 'cmdk';
import { X } from 'lucide-react';
import * as React from 'react';
import { cn } from '../utils';
import { Badge } from './badge';
import { Command, CommandGroup, CommandItem, CommandList } from './command';
import { InputWrapper } from './input-wrapper';
import { Label } from './label';
import { Skeleton } from './skeleton';

type Option = {
  label: string;
  value: string;
};

interface InputAutoCompleteProps {
  options: Option[];
  onSelect: (value: string) => void;
  selectedValues?: string[];
  multiple?: boolean;
  onRemove?: (value: string) => void;
  onCreate?: (inputValue: string) => void;
  id?: string;
  className?: string;
  disabled?: boolean;
  error?: React.ReactNode;
  label?: React.ReactNode;
  loading?: boolean;
  placeholder?: string;
}

function InputAutoComplete({
  options,
  onSelect,
  selectedValues = [],
  multiple = false,
  onRemove,
  onCreate,
  id,
  className,
  disabled,
  error,
  label,
  loading,
  placeholder = 'Search...'
}: InputAutoCompleteProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = React.useState(() => {
    if (multiple) return '';
    const initial = options.find((o) => o.value === selectedValues[0]);
    return initial?.label ?? '';
  });

  // Sync displayed value with external single-select changes
  const lastSyncedValueRef = React.useRef<string | undefined>(
    multiple ? undefined : selectedValues[0]
  );
  React.useEffect(() => {
    if (multiple) return;
    const current = selectedValues[0];
    if (current !== lastSyncedValueRef.current) {
      lastSyncedValueRef.current = current;
      const opt = options.find((o) => o.value === current);
      setInputValue(opt?.label ?? '');
    }
  }, [multiple, selectedValues, options]);

  const selected = multiple
    ? options.filter((option) => selectedValues.includes(option.value))
    : [];

  const selectables = multiple
    ? options.filter((option) => !selectedValues.includes(option.value))
    : options;

  const filtered = inputValue
    ? selectables.filter((option) =>
        option.label.toLowerCase().includes(inputValue.toLowerCase())
      )
    : selectables;

  const showCreate = onCreate && inputValue.trim() && filtered.length === 0;

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const input = inputRef.current;
    if (!input) return;

    if (
      multiple &&
      (e.key === 'Delete' || e.key === 'Backspace') &&
      input.value === '' &&
      selected.length > 0
    ) {
      const last = selected[selected.length - 1];
      onRemove?.(last.value);
    }

    if (e.key === 'Escape') {
      input.blur();
    }
  }

  function handleSelect(value: string) {
    if (multiple) {
      setInputValue('');
    } else {
      const opt = options.find((o) => o.value === value);
      setInputValue(opt?.label ?? '');
      lastSyncedValueRef.current = value;
    }
    onSelect(value);
    if (!multiple) {
      inputRef.current?.blur();
    }
  }

  function handleCreate() {
    const value = inputValue.trim();
    if (!value || !onCreate) return;
    setInputValue('');
    onCreate(value);
  }

  // Wrapper styling — focus state driven by group-focus-within so
  // panel + wrapper visuals work without React state.
  const wrapperBase = cn(
    'rounded-[0.5rem] border border-solid border-[var(--color-input-border-base)] bg-[var(--color-input-bg)]',
    'transition-[box-shadow,border-color]',
    'hover:border-[var(--color-input-border-hover)]',
    'group-focus-within:border-[var(--color-input-border-focus)] group-focus-within:shadow-[0_0_0_0.1875rem_var(--input-focus-ring)] group-focus-within:hover:border-[var(--color-input-border-focus)]',
    !!error &&
      'border-[var(--color-input-border-error)] hover:border-[var(--color-input-border-error)] group-focus-within:border-[var(--color-input-border-error)] group-focus-within:shadow-[0_0_0_0.1875rem_rgb(194_78_58_/_0.12)] group-focus-within:hover:border-[var(--color-input-border-error)]',
    disabled && 'bg-[var(--color-input-bg-disabled)] cursor-not-allowed'
  );

  const wrapperLayout = multiple
    ? 'flex flex-wrap items-center gap-1 pt-1.5 pb-1.5 px-[0.625rem] min-h-[var(--size-input-md)]'
    : 'flex items-center gap-[0.5rem] py-[0.5rem] px-[0.75rem] h-[var(--size-input-md)]';

  return (
    <Command
      onKeyDown={handleKeyDown}
      className="overflow-visible rounded-none border-0 bg-transparent shadow-none"
      shouldFilter={false}
    >
      <InputWrapper>
        {label &&
          (!loading ? (
            <Label htmlFor={id}>{label}</Label>
          ) : (
            <Skeleton className="w-30 h-3.5" />
          ))}
        {!loading ? (
          <div className="relative group">
            <div
              className={cn(wrapperBase, wrapperLayout, className)}
              aria-invalid={!!error}
            >
              {multiple &&
                selected.map((option) => (
                  <Badge
                    key={option.value}
                    variant="secondary"
                    className="cursor-default select-none"
                  >
                    {option.label}
                    <button
                      type="button"
                      className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          onRemove?.(option.value);
                        }
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={() => onRemove?.(option.value)}
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-accent cursor-pointer" />
                    </button>
                  </Badge>
                ))}
              <CommandPrimitive.Input
                ref={inputRef}
                value={inputValue}
                onValueChange={setInputValue}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                  'flex-1 min-w-0 bg-transparent outline-none',
                  'text-[0.8125rem] leading-[1rem] text-[var(--color-input-text)]',
                  'placeholder:text-[var(--color-input-helper-fg)]',
                  'selection:bg-primary selection:text-primary-foreground',
                  multiple && 'ml-1'
                )}
              />
            </div>
            <CommandList>
              {filtered.length > 0 || showCreate ? (
                <div
                  className={cn(
                    'hidden group-focus-within:flex absolute left-0 right-0 top-full z-10 mt-[0.125rem] flex-col gap-[0.125rem] p-[0.375rem]',
                    'rounded-[0.625rem] border border-solid border-[var(--color-input-border-base)] bg-[var(--color-input-bg)]',
                    'shadow-[var(--shadow-input-popover)] outline-none'
                  )}
                >
                  <CommandGroup className="h-full max-h-32 overflow-auto p-0 flex flex-col gap-[0.125rem]">
                    {filtered.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onSelect={() => handleSelect(option.value)}
                        className={cn(
                          'flex items-center gap-[0.5rem] rounded-[0.375rem] py-[0.375rem] px-[0.5rem]',
                          'text-[0.75rem] leading-[1rem] text-[var(--color-input-text)]',
                          'cursor-pointer',
                          'data-[selected=true]:bg-[var(--color-input-popover-item-active-bg)] data-[selected=true]:font-medium',
                          'aria-selected:bg-[var(--color-input-popover-item-active-bg)] aria-selected:font-medium'
                        )}
                      >
                        {option.label}
                      </CommandItem>
                    ))}
                    {showCreate && (
                      <CommandItem
                        value={`__create__${inputValue}`}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onSelect={handleCreate}
                        className={cn(
                          'flex items-center gap-[0.5rem] rounded-[0.375rem] py-[0.375rem] px-[0.5rem]',
                          'text-[0.75rem] leading-[1rem] text-[var(--color-input-text)] font-medium',
                          'cursor-pointer',
                          'data-[selected=true]:bg-[var(--color-input-popover-item-active-bg)]',
                          'aria-selected:bg-[var(--color-input-popover-item-active-bg)]'
                        )}
                      >
                        Create &ldquo;{inputValue.trim()}&rdquo;
                      </CommandItem>
                    )}
                  </CommandGroup>
                </div>
              ) : null}
            </CommandList>
          </div>
        ) : (
          <Skeleton className="w-full h-10" />
        )}
        {error && (
          <div className="text-[0.6875rem] leading-[0.875rem] font-medium text-[var(--color-input-helper-error-fg)]">
            {error}
          </div>
        )}
      </InputWrapper>
    </Command>
  );
}

export type { Option as InputAutoCompleteOption };
export { InputAutoComplete };
