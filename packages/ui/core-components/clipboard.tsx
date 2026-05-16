'use client';

import { CheckIcon, CopyIcon } from 'lucide-react';
import type React from 'react';
import { useCallback, useState } from 'react';
import { cn } from '../utils';
import { Button } from './button';
import { toast } from './toaster';

const COPY_RESET_DELAY = 2000;

interface ClipboardProps
  extends Omit<React.ComponentProps<typeof Button>, 'onClick'> {
  value: string;
  onCopied?: () => void;
  onCopyFinished?: () => void;
  successMessage?: string;
}

function Clipboard({
  value,
  className,
  onCopied,
  onCopyFinished,
  successMessage = 'Copied to clipboard',
  children,
  ...props
}: ClipboardProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = useCallback(() => {
    if (copied) {
      return;
    }

    setCopied(true);
    navigator.clipboard.writeText(value);
    onCopied?.();

    toast.success(successMessage);

    const timer = setTimeout(() => {
      setCopied(false);
      onCopyFinished?.();
    }, COPY_RESET_DELAY);

    return () => clearTimeout(timer);
  }, [copied, value, onCopied, onCopyFinished, successMessage]);

  return (
    <Button
      type="button"
      onClick={handleClick}
      className={cn(className, {
        'cursor-default': copied
      })}
      {...props}
    >
      {children ? (
        children
      ) : copied ? (
        <CheckIcon className="size-4" />
      ) : (
        <CopyIcon className="size-4" />
      )}
    </Button>
  );
}

export { Clipboard };
