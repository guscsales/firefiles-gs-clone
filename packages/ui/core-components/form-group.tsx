import type React from 'react';
import { cn } from '../utils';

function FormGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="form-group"
      className={cn('space-y-4', className)}
      {...props}
    />
  );
}

function FormGroupHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="form-group-header"
      className={cn('flex flex-col gap-1', className)}
      {...props}
    />
  );
}

function FormGroupTitle({ className, ...props }: React.ComponentProps<'h3'>) {
  return (
    <h3
      data-slot="form-group-title"
      className={cn(
        'font-sans font-semibold text-base md:text-base tracking-normal',
        className
      )}
      {...props}
    />
  );
}

function FormGroupDescription({
  className,
  ...props
}: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="form-group-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

function FormGroupContent({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="form-group-content"
      className={cn('space-y-1', className)}
      {...props}
    />
  );
}

export {
  FormGroup,
  FormGroupContent,
  FormGroupDescription,
  FormGroupHeader,
  FormGroupTitle
};
