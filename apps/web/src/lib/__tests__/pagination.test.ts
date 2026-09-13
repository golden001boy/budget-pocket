import { parsePagination, buildPaginationMeta, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../pagination';

describe('parsePagination', () => {
  it('defaults to page 1 and the default page size when no params are given', () => {
    const result = parsePagination(new URLSearchParams());
    expect(result).toEqual({ page: 1, pageSize: DEFAULT_PAGE_SIZE, skip: 0, take: DEFAULT_PAGE_SIZE });
  });

  it('computes skip/take from valid page and pageSize params', () => {
    const result = parsePagination(new URLSearchParams({ page: '3', pageSize: '10' }));
    expect(result).toEqual({ page: 3, pageSize: 10, skip: 20, take: 10 });
  });

  it('clamps pageSize to MAX_PAGE_SIZE to prevent unbounded queries', () => {
    const result = parsePagination(new URLSearchParams({ pageSize: '99999' }));
    expect(result.pageSize).toBe(MAX_PAGE_SIZE);
    expect(result.take).toBe(MAX_PAGE_SIZE);
  });

  // Regression test (found during story 15.15's rollback drill): the check
  // above compares the result to the MAX_PAGE_SIZE constant itself, so it
  // would still pass even if that constant were quietly raised to an
  // unsafe value — it only proves clamping happens, not that the cap is
  // actually 100. Pinned to a literal here so changing the constant is a
  // deliberate, visible decision instead of a silent regression.
  it('caps pageSize at exactly 100, not just at whatever MAX_PAGE_SIZE currently is', () => {
    expect(MAX_PAGE_SIZE).toBe(100);
  });

  it('falls back to defaults for non-numeric page/pageSize instead of producing NaN', () => {
    const result = parsePagination(new URLSearchParams({ page: 'abc', pageSize: 'xyz' }));
    expect(result).toEqual({ page: 1, pageSize: DEFAULT_PAGE_SIZE, skip: 0, take: DEFAULT_PAGE_SIZE });
  });

  it('falls back to defaults for zero or negative page/pageSize', () => {
    expect(parsePagination(new URLSearchParams({ page: '0' })).page).toBe(1);
    expect(parsePagination(new URLSearchParams({ page: '-5' })).page).toBe(1);
    expect(parsePagination(new URLSearchParams({ pageSize: '0' })).pageSize).toBe(DEFAULT_PAGE_SIZE);
    expect(parsePagination(new URLSearchParams({ pageSize: '-10' })).pageSize).toBe(DEFAULT_PAGE_SIZE);
  });
});

describe('buildPaginationMeta', () => {
  it('computes totalPages by rounding up', () => {
    expect(buildPaginationMeta(45, 1, 20)).toEqual({ total: 45, page: 1, pageSize: 20, totalPages: 3 });
  });

  it('returns totalPages of 1 (not 0) when there are no results', () => {
    expect(buildPaginationMeta(0, 1, 20)).toEqual({ total: 0, page: 1, pageSize: 20, totalPages: 1 });
  });
});
