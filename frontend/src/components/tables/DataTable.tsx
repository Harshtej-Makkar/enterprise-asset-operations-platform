import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface DataTablePagination {
  page: number; // 0-indexed
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

interface DataTableProps<TData> {
  /** TanStack column definitions */
  columns: ColumnDef<TData, unknown>[];
  /** The data rows to render */
  data: TData[];
  /** When true, shows a skeleton row pattern */
  isLoading?: boolean;
  /** Optional empty state. Defaults to "No results." */
  emptyState?: ReactNode;
  /** When provided, enables server-side pagination mode */
  pagination?: DataTablePagination;
  /** When provided, enables client-side pagination with this page size */
  pageSize?: number;
  /** Called when a row is clicked (not on interactive cell elements) */
  onRowClick?: (row: TData) => void;
  /** Optional className for the outer wrapper */
  className?: string;
  /** When true, row hover/focus styles are disabled (e.g. for static tables) */
  noHover?: boolean;
}

/**
 * Generic, design-token-backed data table.
 *
 * Supports two pagination modes:
 *  - server-side (via the `pagination` prop): parent owns the page state,
 *    the table shows the page count derived from `total`, and only
 *    renders the rows passed in. Used by all list pages with a backend.
 *  - client-side (via the `pageSize` prop): table slices `data` itself.
 *    Used by smaller inline tables (e.g. history on detail pages).
 *
 * The table is intentionally unopinionated about column rendering — each
 * ColumnDef brings its own cell. This component only handles:
 *   sort (single-column), pagination chrome, loading/empty states, row
 *   hover + click, and the design-system-styled table chrome.
 */
export function DataTable<TData>({
  columns,
  data,
  isLoading = false,
  emptyState,
  pagination,
  pageSize,
  onRowClick,
  className,
  noHover = false,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const isServerSide = !!pagination;

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: isServerSide,
    manualSorting: false,
    ...(isServerSide
      ? { pageCount: Math.max(1, Math.ceil(pagination!.total / pagination!.pageSize)) }
      : { getPaginationRowModel: getPaginationRowModel(), initialState: { pagination: { pageSize: pageSize ?? 10 } } }),
  });

  const rows = table.getRowModel().rows;
  const totalRows = isServerSide ? data.length : rows.length;
  const totalCount = isServerSide ? pagination!.total : data.length;
  const currentPage = isServerSide ? pagination!.page : table.getState().pagination.pageIndex;
  const currentPageSize = isServerSide ? pagination!.pageSize : table.getState().pagination.pageSize;

  const handlePageChange = (next: number) => {
    if (isServerSide) pagination!.onPageChange(next);
    else table.setPageIndex(next);
  };

  const pageCount = isServerSide
    ? Math.max(1, Math.ceil(pagination!.total / pagination!.pageSize))
    : table.getPageCount();

  return (
    <div className={cn('rounded-sm border border-border-default bg-bg-surface', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-body">
          <thead className="border-b border-border-default bg-bg-surface-raised">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortDir = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      style={{ width: header.getSize() || undefined }}
                      className="h-13 px-3 text-left align-middle font-mono text-caption font-medium uppercase tracking-wider text-text-secondary"
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1.5 hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-border-focus/40"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sortDir === 'asc' ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : sortDir === 'desc' ? (
                            <ArrowDown className="h-3 w-3" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-50" />
                          )}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skel-${i}`} className="border-b border-border-default/60 last:border-0">
                  {columns.map((_c, j) => (
                    <td key={j} className="h-12 px-3 align-middle">
                      <div className="h-3 w-3/4 animate-pulse rounded-sm bg-bg-surface-raised" />
                    </td>
                  ))}
                </tr>
              ))
            ) : totalRows === 0 ? (
              <tr>
                <td colSpan={columns.length} className="h-32 px-3 text-center align-middle text-text-secondary">
                  {emptyState ?? 'No results.'}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  className={cn(
                    'h-12 border-b border-border-default/60 last:border-0',
                    !noHover && onRowClick && 'cursor-pointer hover:bg-bg-surface-raised focus-within:bg-bg-surface-raised',
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 align-middle text-text-primary">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination chrome — always shown, even with one page, so the user
          sees total count and current position. */}
      <div className="flex flex-col gap-2 border-t border-border-default px-3 py-2 text-caption text-text-secondary sm:flex-row sm:items-center sm:justify-between">
        <div>
          {totalCount === 0
            ? '0 of 0'
            : `${currentPage * currentPageSize + 1}–${Math.min(
                (currentPage + 1) * currentPageSize,
                totalCount,
              )} of ${totalCount}`}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage === 0}
            onClick={() => handlePageChange(currentPage - 1)}
            className="grid h-8 w-8 place-items-center rounded-sm border border-border-default text-text-secondary hover:border-border-strong hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span>
            Page {currentPage + 1} of {pageCount}
          </span>
          <button
            type="button"
            disabled={currentPage >= pageCount - 1}
            onClick={() => handlePageChange(currentPage + 1)}
            className="grid h-8 w-8 place-items-center rounded-sm border border-border-default text-text-secondary hover:border-border-strong hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
