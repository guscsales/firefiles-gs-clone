'use client';

import * as SheetPrimitive from '@radix-ui/react-dialog';
import { XIcon } from 'lucide-react';
import type React from 'react';

import { cn } from '../utils';

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return (
    <SheetPrimitive.Close
      data-slot="sheet-close"
      className={cn('cursor-pointer', className)}
      {...props}
    />
  );
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        `data-[state=open]:animate-in
        data-[state=closed]:animate-out data-[state=closed]:fade-out-0
        data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-sheet-overlay`,
        className
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  side = 'right',
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: 'top' | 'right' | 'bottom' | 'left';
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          'bg-popover fixed z-50 flex flex-col w-full sm:w-sheet sm:max-w-sheet sm:shadow-[var(--shadow-sheet)]',
          'max-sm:inset-0 max-sm:h-full max-sm:border-0 max-sm:data-[state=open]:animate-slide-fade-in-from-bottom max-sm:data-[state=closed]:animate-slide-fade-out-to-bottom',
          side === 'right' &&
            'sm:data-[state=closed]:animate-slide-fade-out-to-right sm:data-[state=open]:animate-slide-fade-in-from-right sm:inset-y-0 sm:right-0 sm:h-full sm:border-l sm:border-border',
          side === 'left' &&
            'sm:data-[state=closed]:animate-slide-fade-out-to-left sm:data-[state=open]:animate-slide-fade-in-from-left sm:inset-y-0 sm:left-0 sm:h-full sm:border-r sm:border-border',
          side === 'top' &&
            'sm:data-[state=closed]:animate-slide-fade-out-to-top sm:data-[state=open]:animate-slide-fade-in-from-top sm:inset-x-0 sm:top-0 sm:h-auto sm:border-b sm:border-border',
          side === 'bottom' &&
            'sm:data-[state=closed]:animate-slide-fade-out-to-bottom sm:data-[state=open]:animate-slide-fade-in-from-bottom sm:inset-x-0 sm:bottom-0 sm:h-auto sm:border-t sm:border-border',
          className
        )}
        {...props}
      >
        {children}
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({
  className,
  children,
  showClose = true,
  ...props
}: React.ComponentProps<'div'> & { showClose?: boolean }) {
  return (
    <div
      data-slot="sheet-header"
      className={cn(
        'flex items-center gap-2.5 py-[1.125rem] px-[1.375rem] border-b border-border [&>:first-child]:flex-1 [&>:first-child]:min-w-0',
        className
      )}
      {...props}
    >
      {children}
      {showClose && (
        <SheetPrimitive.Close className="text-input-icon-fg ring-offset-background focus:ring-ring data-[state=open]:bg-secondary inline-flex size-7 shrink-0 items-center justify-center rounded-[0.4375rem] cursor-pointer transition-colors hover:bg-accent focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
          <XIcon className="size-3.5" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      )}
    </div>
  );
}

function SheetBody({
  className,
  padding = true,
  ...props
}: React.ComponentProps<'div'> & {
  padding?: boolean;
}) {
  return (
    <div
      data-slot="sheet-body"
      className={cn(
        'flex flex-col flex-1 overflow-y-auto max-h-[calc(100dvh-8.75rem)] gap-[1.375rem]',
        { 'py-6 px-[1.375rem]': padding },
        className
      )}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn(
        'mt-auto sticky bottom-0 flex items-center gap-2 py-4 px-[1.375rem] border-t border-border bg-sheet-footer-bg max-sm:flex-col sm:justify-end',
        className
      )}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn(
        'text-foreground font-sans font-semibold text-sm leading-[1.125rem] tracking-normal',
        className
      )}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn('text-muted-foreground text-xs leading-4', className)}
      {...props}
    />
  );
}

function SheetForm({ className, ...props }: React.ComponentProps<'form'>) {
  return (
    <form
      data-slot="dialog-form"
      className={cn('flex flex-col h-full', className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetForm,
  SheetHeader,
  SheetTitle,
  SheetTrigger
};
