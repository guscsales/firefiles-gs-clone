import Link from 'next/link';
import { Fragment } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/packages/ui/core-components/breadcrumb';
import { Separator } from '@/packages/ui/core-components/separator';
import { SidebarTrigger } from '@/packages/ui/core-components/sidebar';

interface AppPageHeaderProps {
  breadcrumbs: {
    label: string;
    description?: string;
    href?: string;
  }[];
  rightSlot?: React.ReactNode;
}

export function AppPageHeader({ breadcrumbs, rightSlot }: AppPageHeaderProps) {
  return (
    <header className="sticky left-0 w-[100cqw] flex bg-sidebar h-13 shrink-0 items-center justify-between gap-3 border-b border-sidebar-border transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-3 px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="data-[orientation=vertical]:h-4 data-[orientation=vertical]:self-auto bg-hairline"
        />
        <Breadcrumb>
          <BreadcrumbList className="gap-2">
            {breadcrumbs.map((item, index) => (
              <Fragment key={`${item.label}-${index.toString()}`}>
                {index < breadcrumbs.length - 1 ? (
                  <>
                    <BreadcrumbItem className="hidden md:block">
                      {item.href ? (
                        <BreadcrumbLink asChild>
                          <Link href={item.href}>{item.label}</Link>
                        </BreadcrumbLink>
                      ) : (
                        <span className="cursor-default">{item.label}</span>
                      )}
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                  </>
                ) : (
                  <BreadcrumbItem>
                    <BreadcrumbPage className="flex flex-col text-xs font-semibold text-foreground">
                      <span>{item.label}</span>
                      {item.description && (
                        <span className="text-[0.625rem] font-normal text-muted-foreground -mt-px">
                          {item.description}
                        </span>
                      )}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                )}
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {rightSlot && <div className="px-6">{rightSlot}</div>}
    </header>
  );
}
