import type React from 'react';
import { cn } from '../utils';

function InputWrapper({
  className,
  children,
  inputTransparent = false,
  ...props
}: React.HTMLAttributes<HTMLElement> & { inputTransparent?: boolean }) {
  return (
    <div
      {...props}
      className={cn('flex flex-col gap-1 group', className, {
        'gap-0.5 -mx-1': inputTransparent
      })}
    >
      {children}
    </div>
  );
}

export { InputWrapper };
