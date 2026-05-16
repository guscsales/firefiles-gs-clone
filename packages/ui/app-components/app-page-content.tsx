import { cn } from '@/packages/ui/utils';

interface AppPageContentProps extends React.ComponentProps<'div'> {
  paddingY?: boolean;
  paddingX?: boolean;
}

export function AppPageContent({
  className,
  paddingY = true,
  paddingX = true,
  ...props
}: AppPageContentProps) {
  return (
    <div
      className={cn('flex flex-col', className, {
        'py-5': paddingY,
        'px-5': paddingX
      })}
      {...props}
    />
  );
}
