import * as VisuallyHiddenPrimitive from '@radix-ui/react-visually-hidden';
import type React from 'react';

function VisuallyHidden({
  ...props
}: React.ComponentProps<typeof VisuallyHiddenPrimitive.Root>) {
  return (
    <VisuallyHiddenPrimitive.Root data-slot="visually-hidden" {...props} />
  );
}

export { VisuallyHidden };
