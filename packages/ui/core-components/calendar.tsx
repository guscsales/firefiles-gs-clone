'use client';

import { format } from 'date-fns';
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from 'lucide-react';
import * as React from 'react';
import {
  type DayButton,
  DayPicker,
  getDefaultClassNames
} from 'react-day-picker';
import { cn } from '../utils';
import type { Button } from './button';

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  buttonVariant: _buttonVariant = 'ghost',
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>['variant'];
}) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      labels={{
        labelMonthDropdown: () => 'Select the month',
        labelYearDropdown: () => 'Select the year',
        labelDayButton: (date, { today, selected }) => {
          let label = format(date, 'PPPP');
          if (today) label = `Today, ${label}`;
          if (selected) label = `${label}, selected`;
          return label;
        },
        labelWeekNumber: (weekNumber) => `Week ${weekNumber}`,
        labelNext: () => 'Next month',
        labelPrevious: () => 'Previous month'
      }}
      showOutsideDays={showOutsideDays}
      className={cn(
        'group/calendar bg-popover text-popover-foreground border border-border rounded-lg shadow-floating p-3 w-fit',
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          format(date, 'MMMM').replace(/^\w/, (c) => c.toUpperCase()),
        ...formatters
      }}
      classNames={{
        root: cn('w-fit', defaultClassNames.root),
        months: cn('flex flex-col gap-2.5 relative', defaultClassNames.months),
        month: cn('flex flex-col gap-2.5 w-full', defaultClassNames.month),
        nav: cn(
          'absolute inset-x-0 top-0 flex items-center justify-between gap-2 z-10',
          defaultClassNames.nav
        ),
        button_previous: cn(
          'inline-flex items-center justify-center shrink-0 size-6 rounded-md border border-border text-input-text cursor-pointer transition-colors hover:bg-accent aria-disabled:opacity-50 aria-disabled:cursor-not-allowed select-none',
          defaultClassNames.button_previous
        ),
        button_next: cn(
          'inline-flex items-center justify-center shrink-0 size-6 rounded-md border border-border text-input-text cursor-pointer transition-colors hover:bg-accent aria-disabled:opacity-50 aria-disabled:cursor-not-allowed select-none',
          defaultClassNames.button_next
        ),
        month_caption: cn(
          'flex items-center justify-center gap-2 grow',
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          'flex items-center justify-center gap-2 text-xs font-medium',
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          'relative flex items-center rounded-md py-[0.1875rem] px-2 gap-1.5 bg-input-bg border border-input-border-base hover:border-input-border-hover has-focus:border-input-border-focus transition-colors',
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          'absolute inset-0 opacity-0 cursor-pointer',
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          'flex items-center gap-1.5 text-xs font-medium text-input-text select-none [&>svg]:size-[0.5625rem] [&>svg]:text-input-icon-fg',
          defaultClassNames.caption_label
        ),
        table: 'w-full border-collapse',
        weekdays: cn('flex gap-0.5', defaultClassNames.weekdays),
        weekday: cn(
          'flex-1 text-center font-medium text-text-tertiary text-[0.6875rem] leading-[0.875rem] select-none',
          defaultClassNames.weekday
        ),
        week: cn('flex w-full gap-0.5', defaultClassNames.week),
        week_number_header: cn(
          'select-none w-7',
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          'text-[0.6875rem] select-none text-text-tertiary',
          defaultClassNames.week_number
        ),
        day: cn(
          'flex-1 h-7 flex items-center justify-center group/day select-none',
          defaultClassNames.day
        ),
        range_start: cn(
          'rounded-l-md bg-accent',
          defaultClassNames.range_start
        ),
        range_middle: cn(
          'rounded-none bg-accent',
          defaultClassNames.range_middle
        ),
        range_end: cn('rounded-r-md bg-accent', defaultClassNames.range_end),
        today: cn('', defaultClassNames.today),
        outside: cn(
          'text-input-text-disabled aria-selected:text-input-text-disabled',
          defaultClassNames.outside
        ),
        disabled: cn(
          'text-input-text-disabled opacity-50',
          defaultClassNames.disabled
        ),
        hidden: cn('invisible', defaultClassNames.hidden),
        ...classNames
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          );
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === 'left') {
            return (
              <ChevronLeftIcon
                className={cn('size-[0.6875rem]', className)}
                {...props}
              />
            );
          }

          if (orientation === 'right') {
            return (
              <ChevronRightIcon
                className={cn('size-[0.6875rem]', className)}
                {...props}
              />
            );
          }

          return (
            <ChevronDownIcon
              className={cn('size-[0.5625rem]', className)}
              {...props}
            />
          );
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex h-7 w-7 items-center justify-center text-center">
                {children}
              </div>
            </td>
          );
        },
        ...components
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  children,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  const isToday = !!modifiers.today;
  const isSelectedSingle =
    !!modifiers.selected &&
    !modifiers.range_start &&
    !modifiers.range_end &&
    !modifiers.range_middle;
  const isRangeStart = !!modifiers.range_start;
  const isRangeEnd = !!modifiers.range_end;
  const isRangeMiddle = !!modifiers.range_middle;
  const isOutside = !!modifiers.outside;
  const isDisabled = !!modifiers.disabled;

  // Hover applies only to default cells (not today/selected/range/disabled)
  const allowHover =
    !isToday &&
    !isSelectedSingle &&
    !isRangeStart &&
    !isRangeEnd &&
    !isRangeMiddle &&
    !isDisabled;

  return (
    <button
      ref={ref}
      type="button"
      data-slot="calendar-day"
      data-day={day.date.toLocaleDateString()}
      data-today={isToday || undefined}
      data-selected-single={isSelectedSingle || undefined}
      data-range-start={isRangeStart || undefined}
      data-range-end={isRangeEnd || undefined}
      data-range-middle={isRangeMiddle || undefined}
      className={cn(
        'flex items-center justify-center w-full h-full text-xs leading-4 outline-none cursor-pointer rounded-md',
        'focus-visible:ring-2 focus-visible:ring-ring/50',
        isOutside && 'text-input-text-disabled',
        isDisabled && 'opacity-50 cursor-not-allowed',
        !isOutside && !isDisabled && 'text-input-text',
        className
      )}
      {...props}
    >
      <span
        className={cn(
          'flex items-center justify-center size-6 rounded-md transition-colors',
          allowHover &&
            'group-hover/day:bg-accent group-hover/day:border group-hover/day:border-border',
          isToday &&
            'rounded-full bg-btn-primary-bg text-btn-primary-fg font-semibold',
          isSelectedSingle &&
            !isToday &&
            'bg-btn-primary-bg text-btn-primary-fg font-semibold'
        )}
      >
        {children}
      </span>
    </button>
  );
}

export { Calendar, CalendarDayButton };
