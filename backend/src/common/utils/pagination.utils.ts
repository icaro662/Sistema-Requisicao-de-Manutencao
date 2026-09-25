import { PaginatedResult } from '../interfaces/pagination.interface';

export function createPaginatedResult<T>(
  data: T[],
  total: number,
  page = 1,
  limit = 20,
): PaginatedResult<T> {
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}
