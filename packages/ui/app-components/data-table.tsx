'use client';

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  type OnChangeFn,
  type SortingState,
  useReactTable
} from '@tanstack/react-table';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ChevronsUpDownIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/packages/ui/core-components/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/packages/ui/core-components/table';
import { cn } from '@/packages/ui/utils';

interface DataTablePagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

type DataTableError = { title: string; description?: string } | React.ReactNode;

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pagination?: DataTablePagination;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  onPageChange?: (page: number) => void;
  onRowClick?: (row: TData) => void;
  rowLink?: (row: TData) => string | undefined;
  isLoading?: boolean;
  toolbar?: React.ReactNode;
  error?: DataTableError;
  emptyTitle?: string;
  emptyDescription?: string;
}

function SortableHeader({
  label,
  sorted
}: {
  label: string;
  sorted: false | 'asc' | 'desc';
}) {
  return (
    <span className="flex items-center gap-1">
      {label}
      {sorted === 'asc' ? (
        <ArrowUpIcon className="size-[0.6875rem]" strokeWidth={2} />
      ) : sorted === 'desc' ? (
        <ArrowDownIcon className="size-[0.6875rem]" strokeWidth={2} />
      ) : (
        <ChevronsUpDownIcon
          className="size-[0.6875rem] text-foreground"
          strokeWidth={2}
        />
      )}
    </span>
  );
}

function PaginationControls({
  pagination,
  onPageChange
}: {
  pagination: DataTablePagination;
  onPageChange?: (page: number) => void;
}) {
  const { page, total, totalPages } = pagination;

  const getVisiblePages = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    pages.push(1);

    if (page > 3) {
      pages.push('ellipsis');
    }

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (page < totalPages - 2) {
      pages.push('ellipsis');
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="sticky bottom-0 left-0 z-30 w-[100cqw] flex items-center justify-between gap-3 px-6 py-3.5 bg-card border-t">
      <p className="font-sans text-[0.8125rem] leading-4 text-muted-foreground">
        {total} {total === 1 ? 'result' : 'results'}
      </p>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="First page"
            className={cn(
              'inline-flex items-center justify-center size-7 rounded-md text-foreground transition-colors cursor-pointer hover:bg-muted',
              page === 1 && 'opacity-40 pointer-events-none'
            )}
            onClick={() => onPageChange?.(1)}
            disabled={page === 1}
          >
            <ChevronsLeftIcon className="size-3.5" strokeWidth={2} />
          </button>
          <button
            type="button"
            aria-label="Previous page"
            className={cn(
              'inline-flex items-center justify-center size-7 rounded-md text-foreground transition-colors cursor-pointer hover:bg-muted',
              page === 1 && 'opacity-40 pointer-events-none'
            )}
            onClick={() => onPageChange?.(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeftIcon className="size-3.5" strokeWidth={2} />
          </button>

          {getVisiblePages().map((p, i) =>
            p === 'ellipsis' ? (
              <span
                key={`ellipsis-${i.toString()}`}
                className="px-1 font-sans text-xs leading-4 text-muted-foreground"
              >
                ...
              </span>
            ) : (
              <button
                type="button"
                key={p}
                aria-current={p === page ? 'page' : undefined}
                className={cn(
                  'inline-flex items-center justify-center min-w-7 h-7 rounded-md px-2 transition-colors cursor-pointer',
                  p === page
                    ? 'bg-secondary text-foreground font-sans font-semibold text-xs leading-4'
                    : 'text-muted-foreground font-sans font-medium text-xs leading-4 hover:bg-muted hover:text-foreground'
                )}
                onClick={() => onPageChange?.(p)}
              >
                {p}
              </button>
            )
          )}

          <button
            type="button"
            aria-label="Next page"
            className={cn(
              'inline-flex items-center justify-center size-7 rounded-md text-foreground transition-colors cursor-pointer hover:bg-muted',
              page === totalPages && 'opacity-40 pointer-events-none'
            )}
            onClick={() => onPageChange?.(page + 1)}
            disabled={page === totalPages}
          >
            <ChevronRightIcon className="size-3.5" strokeWidth={2} />
          </button>
          <button
            type="button"
            aria-label="Last page"
            className={cn(
              'inline-flex items-center justify-center size-7 rounded-md text-foreground transition-colors cursor-pointer hover:bg-muted',
              page === totalPages && 'opacity-40 pointer-events-none'
            )}
            onClick={() => onPageChange?.(totalPages)}
            disabled={page === totalPages}
          >
            <ChevronsRightIcon className="size-3.5" strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  );
}

function EmptyRow({
  colSpan,
  title,
  description
}: {
  colSpan: number;
  title: string;
  description?: string;
}) {
  return (
    <TableRow className="hover:bg-transparent border-b-0">
      <TableCell colSpan={colSpan} className="px-6 py-3.5">
        <div className="flex flex-col gap-1 rounded-[0.5rem] py-2.5 px-3 border border-dashed border-border">
          <div className="font-sans font-semibold text-xs leading-4 text-foreground">
            {title}
          </div>
          {description && (
            <div className="font-sans text-[0.6875rem] leading-[0.875rem] text-muted-foreground">
              {description}
            </div>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

function ErrorRow({
  colSpan,
  error
}: {
  colSpan: number;
  error: DataTableError;
}) {
  return (
    <TableRow className="hover:bg-transparent border-b-0">
      <TableCell colSpan={colSpan} className="px-6 py-3.5">
        {typeof error === 'object' &&
        error !== null &&
        'title' in (error as object) ? (
          <div className="flex flex-col gap-1 rounded-[0.5rem] py-2.5 px-3 bg-alert-destructive-bg">
            <div className="font-sans font-semibold text-xs leading-4 text-alert-destructive-title-fg">
              {(error as { title: string }).title}
            </div>
            {(error as { description?: string }).description && (
              <div className="font-sans text-[0.6875rem] leading-[0.875rem] text-alert-destructive-desc-fg">
                {(error as { description?: string }).description}
              </div>
            )}
          </div>
        ) : (
          (error as React.ReactNode)
        )}
      </TableCell>
    </TableRow>
  );
}

function LoadingRows({ columnCount }: { columnCount: number }) {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <TableRow
          key={`skeleton-${i.toString()}`}
          className="hover:bg-transparent"
        >
          {Array.from({ length: columnCount }).map((__, j) => (
            <TableCell
              key={`skeleton-${i.toString()}-${j.toString()}`}
              className="px-6 py-3.5 align-middle"
            >
              {j === 0 ? (
                <div className="flex items-center gap-2.5">
                  <Skeleton className="size-7 rounded-[0.4375rem]" />
                  <div className="flex flex-col gap-1 w-4/5">
                    <Skeleton className="h-2.5 w-3/5 rounded-sm" />
                    <Skeleton className="h-2 w-4/5 rounded-sm bg-skeleton-soft" />
                  </div>
                </div>
              ) : j === columnCount - 1 ? (
                <Skeleton className="h-3 w-[5.625rem] rounded-sm bg-skeleton-soft" />
              ) : (
                <Skeleton className="h-[1.125rem] w-[4.375rem] rounded-full" />
              )}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pagination,
  sorting,
  onSortingChange,
  onPageChange,
  onRowClick,
  rowLink,
  isLoading,
  toolbar,
  error,
  emptyTitle = 'No results',
  emptyDescription
}: DataTableProps<TData, TValue>) {
  const router = useRouter();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    state: {
      sorting
    },
    onSortingChange
  });

  const columnCount = columns.length;

  return (
    <div className="min-w-max rounded-[0.875rem] bg-card">
      {toolbar && (
        <div className="sticky top-0 left-0 z-30 w-[100cqw] flex items-center gap-2 px-6 py-3 border-b border-border bg-card">
          {toolbar}
        </div>
      )}
      <Table className="min-w-max" wrapperClassName="overflow-visible">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="border-b-0 hover:bg-transparent"
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={cn(
                    'sticky z-20 h-9 px-6 bg-secondary border-b border-border font-sans font-medium text-[0.6875rem] leading-[0.875rem] text-muted-foreground',
                    toolbar ? 'top-[55px]' : 'top-0',
                    header.column.getCanSort() &&
                      'cursor-pointer select-none hover:text-foreground'
                  )}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {header.isPlaceholder ? null : header.column.getCanSort() ? (
                    <SortableHeader
                      label={
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        ) as string
                      }
                      sorted={header.column.getIsSorted()}
                    />
                  ) : (
                    flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {error ? (
            <ErrorRow colSpan={columnCount} error={error} />
          ) : isLoading ? (
            <LoadingRows columnCount={columnCount} />
          ) : table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => {
              const href = rowLink?.(row.original);
              const isClickable = !!onRowClick || !!href;

              function handleRowClick(
                e: React.MouseEvent<HTMLTableRowElement>
              ) {
                if (onRowClick) {
                  onRowClick(row.original);
                  return;
                }

                if (!href) return;

                if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) {
                  window.open(href, '_blank');
                } else {
                  router.push(href);
                }
              }

              return (
                <TableRow
                  key={row.id}
                  className={cn(
                    'group border-b border-border transition-colors',
                    isClickable
                      ? 'cursor-pointer hover:bg-muted'
                      : 'hover:bg-transparent'
                  )}
                  onClick={handleRowClick}
                  onAuxClick={(e) => {
                    if (e.button === 1 && href) {
                      e.preventDefault();
                      window.open(href, '_blank');
                    }
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="px-6 py-3.5 align-middle"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          ) : (
            <EmptyRow
              colSpan={columnCount}
              title={emptyTitle}
              description={emptyDescription}
            />
          )}
        </TableBody>
      </Table>

      {pagination && (
        <PaginationControls
          pagination={pagination}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}

export type { DataTableError, DataTablePagination, DataTableProps };
export { SortableHeader };
