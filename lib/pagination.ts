export const DEFAULT_PAGE_SIZE = 20;

export type PaginationInput = {
  page?: number;
  pageSize?: number;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export function parsePage(value: string | undefined) {
  const page = Number(value);

  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }

  return page;
}

export function getPagination(input: PaginationInput = {}) {
  const page =
    Number.isInteger(input.page) && input.page && input.page > 0 ? input.page : 1;
  const pageSize =
    Number.isInteger(input.pageSize) && input.pageSize && input.pageSize > 0
      ? input.pageSize
      : DEFAULT_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return { page, pageSize, from, to };
}

export function createPaginatedResult<T>({
  items,
  total,
  page,
  pageSize,
}: {
  items: T[];
  total: number | null;
  page: number;
  pageSize: number;
}): PaginatedResult<T> {
  const safeTotal = total ?? items.length;

  return {
    items,
    total: safeTotal,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(safeTotal / pageSize)),
  };
}

export function emptyPaginatedResult<T>(
  page: number,
  pageSize: number,
): PaginatedResult<T> {
  return {
    items: [],
    total: 0,
    page,
    pageSize,
    pageCount: 1,
  };
}
