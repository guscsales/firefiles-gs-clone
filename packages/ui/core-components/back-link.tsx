import { ChevronLeft } from 'lucide-react';
import { cn } from '../utils';
import { IntLink } from './int-link';

export function BackLink({
  className,
  children,
  ...props
}: React.ComponentProps<typeof IntLink>) {
  return (
    <IntLink
      className={cn(
        'inline-flex items-center self-start gap-1.5 font-medium text-foreground text-[0.8125rem] leading-4 hover:underline',
        className
      )}
      {...props}
    >
      <ChevronLeft className="size-3 shrink-0" />
      {children ?? 'Back'}
    </IntLink>
  );
}
