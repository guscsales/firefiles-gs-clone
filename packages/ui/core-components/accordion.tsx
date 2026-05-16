'use client';

import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { Accordion as AccordionPrimitive } from 'radix-ui';
import type * as React from 'react';
import { cn } from '@/packages/ui/utils';

type AccordionTriggerProps = React.ComponentProps<
  typeof AccordionPrimitive.Trigger
> & {
  hideChevron?: boolean;
  /** Wrap trigger in `<h3>` for document outline (e.g. marketing FAQ under an `h2`). */
  headingLevel?: 'h3';
};

function Accordion({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn('flex w-full flex-col', className)}
      {...props}
    />
  );
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        'not-last:border-b not-last:border-border transition-colors',
        'hover:bg-muted/50 data-[disabled]:hover:bg-transparent',
        className
      )}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  hideChevron,
  headingLevel,
  ...props
}: AccordionTriggerProps) {
  const triggerClassName = cn(
    'group/accordion-trigger flex flex-1 cursor-pointer items-center justify-between gap-2.5 px-4.5 py-3.5',
    'font-sans text-sm/4.5 font-medium tracking-[-0.005em] text-foreground',
    'outline-none',
    'focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'data-[state=open]:pb-2 data-[state=open]:font-semibold',
    'data-[disabled]:cursor-not-allowed [&[data-disabled]>:first-child]:opacity-50',
    '**:data-[slot=accordion-trigger-icon]:size-3.5 **:data-[slot=accordion-trigger-icon]:shrink-0',
    headingLevel === 'h3' && 'w-full',
    className
  );

  const chevron = !hideChevron ? (
    <>
      <ChevronDownIcon
        data-slot="accordion-trigger-icon"
        className="pointer-events-none text-[var(--color-text-tertiary)] dark:text-foreground group-aria-expanded/accordion-trigger:hidden"
      />
      <ChevronUpIcon
        data-slot="accordion-trigger-icon"
        className="pointer-events-none hidden text-foreground group-aria-expanded/accordion-trigger:inline"
      />
    </>
  ) : null;

  if (headingLevel === 'h3') {
    return (
      <AccordionPrimitive.Header asChild>
        <h3 className="m-0 flex w-full">
          <AccordionPrimitive.Trigger
            data-slot="accordion-trigger"
            className={triggerClassName}
            {...props}
          >
            {children}
            {chevron}
          </AccordionPrimitive.Trigger>
        </h3>
      </AccordionPrimitive.Header>
    );
  }

  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={triggerClassName}
        {...props}
      >
        {children}
        {chevron}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-hidden transition-[height] duration-200 ease-out data-[state=closed]:h-0 data-[state=open]:h-[var(--radix-accordion-content-height)]"
      {...props}
    >
      <div
        className={cn(
          'px-4.5 pb-3.5 text-[0.8125rem]/4.5 text-muted-foreground',
          '[&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4',
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
