'use client';

import * as SelectPrimitive from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import type React from 'react';

import { cn } from '../utils';

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({
  className,
  size = 'default',
  children,
  error,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: 'sm' | 'default' | 'lg';
  error?: React.ReactNode;
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        `flex w-full items-center justify-between gap-2 antialiased
        bg-[var(--input-bg)] text-[var(--input-text)]
        text-[0.8125rem] leading-[1rem]
        border border-solid border-[var(--input-border-base)] rounded-[0.5rem]
        px-[0.75rem] py-[0.5rem]
        data-[size=sm]:min-h-[var(--size-input-sm)]
        data-[size=default]:min-h-[var(--size-input-md)]
        data-[size=lg]:min-h-[var(--size-input-lg)]
        data-[placeholder]:text-[var(--input-helper-fg)]
        transition-[color,box-shadow,border-color] outline-none cursor-pointer
        hover:border-[var(--input-border-hover)]
        focus-visible:border-[var(--input-border-focus)]
        focus-visible:shadow-[0_0_0_0.1875rem_var(--input-focus-ring)]
        data-[state=open]:border-[var(--input-border-focus)]
        disabled:cursor-not-allowed disabled:opacity-50
        disabled:hover:border-[var(--input-border-base)]
        aria-invalid:border-[var(--input-border-error)]
        aria-invalid:hover:border-[var(--input-border-error)]
        aria-invalid:focus-visible:border-[var(--input-border-error)]
        aria-invalid:focus-visible:shadow-[0_0_0_0.1875rem_rgb(194_78_58_/_0.12)]
        *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex
        *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2
        [&_svg]:pointer-events-none [&_svg]:shrink-0
        [&_svg:not([class*='text-'])]:text-[var(--input-icon-fg)]`,
        className
      )}
      aria-invalid={!!error}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-[0.6875rem]" strokeWidth={2} />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = 'popper',
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          `relative z-50 max-h-(--radix-select-content-available-height) min-w-32
          origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto
          rounded-[0.625rem] border border-solid border-[var(--input-border-base)]
          bg-[var(--popover)] text-[var(--popover-foreground)]
          shadow-[var(--shadow-popover)]
          data-[state=open]:animate-in data-[state=closed]:animate-out
          data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
          data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
          data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2
          data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2`,
          position === 'popper' &&
            'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            'p-[0.375rem] flex flex-col gap-[0.125rem]',
            position === 'popper' &&
              'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1'
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn(
        'text-[var(--input-helper-fg)] px-2 py-1.5 text-[0.6875rem] leading-[0.875rem] font-medium uppercase tracking-[0.08em]',
        className
      )}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  description,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item> & {
  description?: string;
}) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        `group relative flex w-full items-center gap-2
        rounded-[0.375rem] px-[0.5rem] py-[0.4375rem] pr-[1.75rem]
        text-[0.8125rem] leading-[1rem] text-[var(--input-text)]
        outline-hidden select-none cursor-pointer
        data-[highlighted]:bg-[var(--input-popover-item-active-bg)]
        data-[state=checked]:bg-[var(--input-popover-item-active-bg)]
        data-[state=checked]:font-medium
        data-[disabled]:pointer-events-none data-[disabled]:opacity-50
        [&_svg]:pointer-events-none [&_svg]:shrink-0
        *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2`,
        description && 'py-2',
        className
      )}
      {...props}
    >
      <span className="absolute right-[0.5rem] top-1/2 -translate-y-1/2 flex size-3 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon
            className="size-[0.75rem] text-[var(--input-text)]"
            strokeWidth={2.4}
          />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>
        {description ? (
          <span className="flex flex-col items-start">
            <span>{children}</span>
            <span className="text-[0.75rem] leading-[0.875rem] text-[var(--input-helper-fg)] font-normal">
              {description}
            </span>
          </span>
        ) : (
          children
        )}
      </SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn(
        'bg-[var(--input-border-base)] pointer-events-none -mx-1 my-1 h-px',
        className
      )}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        'flex cursor-default items-center justify-center py-1 text-[var(--input-icon-fg)]',
        className
      )}
      {...props}
    >
      <ChevronUpIcon className="size-[0.875rem]" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        'flex cursor-default items-center justify-center py-1 text-[var(--input-icon-fg)]',
        className
      )}
      {...props}
    >
      <ChevronDownIcon className="size-[0.875rem]" />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue
};
