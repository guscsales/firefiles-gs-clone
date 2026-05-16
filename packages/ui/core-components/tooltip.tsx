'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import type React from 'react';

import { cn } from '../utils';

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 4,
  arrowPadding = 8,
  container,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> & {
  container?: React.ComponentProps<typeof TooltipPrimitive.Portal>['container'];
}) {
  return (
    <TooltipPrimitive.Portal container={container}>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        arrowPadding={arrowPadding}
        className={cn(
          'bg-[var(--tooltip-bg)] text-[var(--tooltip-fg)]',
          'rounded-md',
          'text-[0.6875rem] leading-[0.875rem] font-medium',
          'animate-in fade-in-0 zoom-in-95',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
          'data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2',
          'z-50 w-fit origin-(--radix-tooltip-content-transform-origin)',
          className
        )}
        {...props}
      >
        <span className="inline-flex items-center gap-2 px-2.5 py-1.5">
          {children}
        </span>
        <TooltipPrimitive.Arrow
          width={10}
          height={5}
          className="block fill-[var(--tooltip-bg)]"
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

function TooltipShortcut({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="tooltip-shortcut"
      className={cn(
        'inline-block rounded-[0.1875rem] px-1 py-px',
        'bg-[var(--tooltip-shortcut-bg)]',
        'font-mono font-medium text-[0.5625rem] leading-[0.75rem]',
        className
      )}
      {...props}
    />
  );
}

export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipShortcut,
  TooltipTrigger
};
