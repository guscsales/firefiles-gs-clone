'use client';

import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';
import type * as React from 'react';

import { cn } from '@/packages/ui/utils';

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn('grid w-full gap-2', className)}
      {...props}
    />
  );
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        `group/radio-group-item peer relative flex aspect-square size-4 shrink-0 items-center justify-center
        rounded-full border border-radio-border bg-radio-bg outline-none transition-colors
        after:absolute after:-inset-x-3 after:-inset-y-2
        focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background
        disabled:cursor-not-allowed disabled:opacity-50
        aria-invalid:border-checkbox-error-border
        data-[state=checked]:border-radio-selected-border`,
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex size-4 items-center justify-center"
      >
        <span className="block size-2 rounded-full bg-radio-dot" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

interface BoxedRadioGroupItemProps
  extends React.ComponentProps<typeof RadioGroupPrimitive.Item> {
  label: React.ReactNode;
  description?: React.ReactNode;
}

function BoxedRadioGroupItem({
  className,
  label,
  description,
  ...props
}: BoxedRadioGroupItemProps) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-boxed-item"
      className={cn(
        `group/boxed-radio-item flex w-full cursor-pointer items-center gap-2.5 rounded-[0.625rem]
        border border-radio-card-border bg-radio-card-bg px-3.5 py-3 text-left
        outline-none transition-colors
        hover:border-foreground/30
        focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background
        disabled:cursor-not-allowed disabled:opacity-50
        data-[state=checked]:border-radio-card-selected-border`,
        className
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className="flex size-4 shrink-0 items-center justify-center rounded-full border border-radio-card-ring bg-transparent transition-colors group-data-[state=checked]/boxed-radio-item:border-radio-card-selected-border dark:group-data-[state=checked]/boxed-radio-item:bg-radio-card-selected-border"
      >
        <RadioGroupPrimitive.Indicator
          data-slot="radio-group-boxed-indicator"
          className="flex items-center justify-center"
        >
          <span className="block size-2 rounded-full bg-radio-dot" />
        </RadioGroupPrimitive.Indicator>
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-[0.8125rem] leading-4 font-medium text-foreground">
          {label}
        </span>
        {description && (
          <span className="text-xs leading-4 text-muted-foreground">
            {description}
          </span>
        )}
      </span>
    </RadioGroupPrimitive.Item>
  );
}

export { BoxedRadioGroupItem, RadioGroup, RadioGroupItem };
