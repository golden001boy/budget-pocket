import type { PaginationMeta } from '@budget-pocket/shared';

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export interface ParsedPagination {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

export function parsePagination(searchParams: URLSearchParams): ParsedPagination {
  const rawPage = parseInt(searchParams.get('page') ?? '1', 10);
  const rawPageSize = parseInt(searchParams.get('pageSize') ?? String(DEFAULT_PAGE_SIZE), 10);

  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const pageSize = Number.isFinite(rawPageSize) && rawPageSize > 0
    ? Math.min(rawPageSize, MAX_PAGE_SIZE)
    : DEFAULT_PAGE_SIZE;

  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

export function buildPaginationMeta(total: number, page: number, pageSize: number): PaginationMeta {
  return { total, page, pageSize, totalPages: Math.max(Math.ceil(total / pageSize), 1) };
}
