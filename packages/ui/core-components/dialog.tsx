'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { XIcon } from 'lucide-react';
import type React from 'react';

import { cn } from '../utils';

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        `data-[state=open]:animate-in data-[state=closed]:animate-out
        data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
        fixed inset-0 z-50 bg-dialog-overlay duration-300 ease-out`,
        className
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          `bg-popover data-[state=open]:animate-in data-[state=closed]:animate-out
          data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
          data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom
          sm:data-[state=closed]:slide-out-to-bottom-2 sm:data-[state=open]:slide-in-from-bottom-2
          sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95
          fixed inset-x-0 bottom-0 z-50 grid rounded-t-lg rounded-b-none border duration-300 ease-out outline-none
          shadow-[var(--shadow-dialog)]
          sm:inset-auto sm:top-1/2 sm:left-1/2
          sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg
          w-full sm:max-w-md`,
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent text-text-tertiary absolute top-6 right-6 -mt-[0.1875rem] inline-flex size-7 items-center justify-center rounded-md transition-colors hover:bg-accent focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5 cursor-pointer"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({
  className,
  padding = true,
  ...props
}: React.ComponentProps<'div'> & { padding?: boolean }) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        'flex flex-col gap-1.5 text-left mb-2',
        { 'pt-6 pb-2 px-6': padding },
        className
      )}
      {...props}
    />
  );
}

function DialogBody({
  className,
  padding = true,
  ...props
}: React.ComponentProps<'div'> & {
  padding?: boolean;
  spacious?: boolean;
}) {
  return (
    <div
      data-slot="dialog-body"
      className={cn(
        'flex flex-col gap-2 flex-1 overflow-y-auto max-h-[calc(100vh-13.7rem)] sm:max-h-128',
        {
          'pb-4 px-6': padding
        },
        className
      )}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  padding = true,
  ...props
}: React.ComponentProps<'div'> & { padding?: boolean }) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end border-t border-border',
        { 'pt-4 pb-5 px-6': padding },
        className
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        'font-heading text-lg leading-[1.375rem] font-medium tracking-[-0.01em] text-foreground',
        className
      )}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        'text-muted-foreground text-[0.8125rem] leading-[1.125rem]',
        className
      )}
      {...props}
    />
  );
}

function DialogForm({ className, ...props }: React.ComponentProps<'form'>) {
  return (
    <form
      data-slot="dialog-form"
      className={cn('flex flex-col items-stretch', className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogForm,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger
};
