'use client';

import { CheckIcon } from 'lucide-react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';
import type * as React from 'react';
import { cn } from '@/packages/ui/utils';

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        `peer relative flex size-4 shrink-0 items-center justify-center rounded-sm
        border border-checkbox-border bg-checkbox-bg transition-colors outline-none
        after:absolute after:-inset-x-3 after:-inset-y-2
        focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background
        disabled:cursor-not-allowed disabled:opacity-50
        aria-invalid:border-checkbox-error-border
        data-[state=checked]:border-transparent data-[state=checked]:bg-checkbox-checked-bg data-[state=checked]:text-checkbox-checked-fg
        data-[state=indeterminate]:border-transparent data-[state=indeterminate]:bg-checkbox-checked-bg data-[state=indeterminate]:text-checkbox-checked-fg`,
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="group/checkbox-indicator grid place-content-center text-current transition-none"
      >
        <CheckIcon className="size-2.5 stroke-[3] group-data-[state=indeterminate]/checkbox-indicator:hidden" />
        <span className="hidden h-0.5 w-2 rounded-[0.0625rem] bg-current group-data-[state=indeterminate]/checkbox-indicator:block" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
