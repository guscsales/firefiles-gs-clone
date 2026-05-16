'use client';

import { useEffect, useState } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../utils';

const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const INTERVAL_MS = 80;

const brailleLoaderVariants = tv({
  base: 'inline-block font-mono leading-5 font-medium text-current',
  variants: {
    size: {
      sm: 'text-sm',
      default: 'text-base',
      lg: 'text-lg'
    }
  },
  defaultVariants: {
    size: 'default'
  }
});

interface BrailleLoaderProps
  extends Omit<React.ComponentProps<'span'>, 'children'>,
    VariantProps<typeof brailleLoaderVariants> {}

function BrailleLoader({ size, className, ...props }: BrailleLoaderProps) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setFrame((prev) => (prev + 1) % FRAMES.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      data-slot="braille-loader"
      role="status"
      aria-label="Loading"
      className={cn(brailleLoaderVariants({ size }), className)}
      {...props}
    >
      {FRAMES[frame]}
    </span>
  );
}

export { BrailleLoader, brailleLoaderVariants };
