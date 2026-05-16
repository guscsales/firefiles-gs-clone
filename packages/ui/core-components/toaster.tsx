'use client';

import { CheckIcon, InfoIcon, XIcon } from 'lucide-react';
import { Toaster as Sonner, type ToasterProps, toast } from 'sonner';
import { cn } from '@/packages/ui/utils';

const intentRingClass =
  'inline-flex items-center justify-center shrink-0 size-5 rounded-full';

const intentIconClass =
  'size-[0.6875rem] stroke-[3.2] text-[var(--color-toast-icon-fg)]';

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="top-right"
      icons={{
        success: (
          <span
            className={cn(
              intentRingClass,
              'bg-[var(--color-toast-icon-success-bg)]'
            )}
          >
            <CheckIcon className={intentIconClass} />
          </span>
        ),
        error: (
          <span
            className={cn(
              intentRingClass,
              'bg-[var(--color-toast-icon-error-bg)]'
            )}
          >
            <XIcon className={intentIconClass} />
          </span>
        ),
        info: (
          <span
            className={cn(
              intentRingClass,
              'bg-[var(--color-toast-icon-info-bg)]'
            )}
          >
            <InfoIcon className={intentIconClass} />
          </span>
        )
      }}
      toastOptions={{
        unstyled: true,
        closeButton: true,
        classNames: {
          toast: cn(
            'group/toast w-85 flex items-center gap-3 p-3.5 rounded-lg',
            'bg-popover border-[1px] border-solid border-border',
            'shadow-toast antialiased [font-synthesis:none]',
            'pointer-events-auto'
          ),
          icon: 'shrink-0',
          content: 'grow flex flex-col gap-0.5 min-w-0',
          title:
            'font-sans font-medium text-[0.8125rem]/4 text-popover-foreground',
          description: 'font-sans text-xs/4 text-muted-foreground',
          closeButton: cn(
            'order-3 ml-auto shrink-0 inline-flex items-center justify-center',
            'size-[0.8125rem] bg-transparent border-0 p-0 cursor-pointer',
            'text-[var(--text-tertiary)] hover:opacity-80 transition-opacity',
            // override Sonner default absolute positioning
            '!relative !top-auto !left-auto !right-auto !bottom-auto'
          )
        }
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
