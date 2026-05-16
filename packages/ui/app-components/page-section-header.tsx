import { cn } from '@/packages/ui/utils';

interface PageSectionHeaderProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageSectionHeader({
  eyebrow,
  title,
  description,
  actions,
  className
}: PageSectionHeaderProps) {
  return (
    <header
      className={cn(
        'sticky left-0 w-[100cqw] flex items-end gap-6 pt-8 pb-[1.375rem] px-6 border-b bg-cmni-light',
        className
      )}
    >
      <div className="flex flex-col grow gap-2.5">
        {eyebrow && (
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="inline-block w-3.5 h-px shrink-0 bg-hairline"
            />
            <span className="font-sans text-[0.625rem] leading-3 font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {eyebrow}
            </span>
          </div>
        )}
        <h1 className="font-heading text-[1.75rem] leading-[2.125rem] font-medium tracking-[-0.025em] text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-sm leading-5 text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
