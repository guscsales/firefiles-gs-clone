'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { Tabs as TabsPrimitive } from 'radix-ui';
import type * as React from 'react';

import { cn } from '@/packages/ui/utils';

function Tabs({
  className,
  orientation = 'horizontal',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        'group/tabs flex gap-2 data-horizontal:flex-col',
        className
      )}
      {...props}
    />
  );
}

const tabsListVariants = cva(
  'group/tabs-list inline-flex w-fit items-center group-data-vertical/tabs:flex-col',
  {
    variants: {
      variant: {
        default:
          'rounded-[0.625rem] bg-tabs-list-bg p-1 group-data-vertical/tabs:items-stretch',
        line: 'gap-6 border-b border-tabs-line-border bg-transparent rounded-none p-0 group-data-vertical/tabs:border-b-0 group-data-vertical/tabs:border-r group-data-vertical/tabs:border-r-tabs-line-border'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);

function TabsList({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        'inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-tabs-trigger-fg cursor-pointer transition-colors',
        'hover:text-tabs-trigger-active-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:pointer-events-none disabled:opacity-40 disabled:text-foreground dark:disabled:text-tabs-trigger-fg',
        'data-[state=active]:text-tabs-trigger-active-fg data-[state=active]:font-semibold',
        // default variant — pill row
        'group-data-[variant=default]/tabs-list:rounded-[0.4375rem] group-data-[variant=default]/tabs-list:px-3 group-data-[variant=default]/tabs-list:py-1.5 group-data-[variant=default]/tabs-list:text-xs/4 group-data-[variant=default]/tabs-list:font-medium',
        'group-data-[variant=default]/tabs-list:data-[state=active]:bg-tabs-trigger-active-bg group-data-[variant=default]/tabs-list:data-[state=active]:shadow-tabs-trigger-active',
        // line variant — underline row
        'group-data-[variant=line]/tabs-list:rounded-none group-data-[variant=line]/tabs-list:px-0 group-data-[variant=line]/tabs-list:py-2.5 group-data-[variant=line]/tabs-list:text-[0.8125rem]/4 group-data-[variant=line]/tabs-list:font-medium group-data-[variant=line]/tabs-list:border-b-2 group-data-[variant=line]/tabs-list:border-b-transparent group-data-[variant=line]/tabs-list:-mb-px',
        'group-data-[variant=line]/tabs-list:data-[state=active]:border-b-tabs-line-indicator',
        // svg sizing
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('flex-1 text-sm outline-none', className)}
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger, tabsListVariants };
