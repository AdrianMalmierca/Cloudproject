import { Request } from "express";

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Parse and validate pagination parameters from request query
 * @param query - Request query object
 * @param defaultLimit - Default limit if not provided or invalid (default: 10)
 * @returns Validated pagination parameters
 */
export function parsePaginationParams(
  query: Request["query"],
  defaultLimit: number = 10
): PaginationParams {
  const parsedPage = parseInt(query.page as string, 10);
  const parsedLimit = parseInt(query.limit as string, 10);

  const page = Math.max(1, isNaN(parsedPage) ? 1 : parsedPage);
  const limit = Math.max(
    1,
    isNaN(parsedLimit) || parsedLimit === 0 ? defaultLimit : parsedLimit
  );

  return { page, limit };
}

/**
 * Calculate total pages from total count and limit
 * @param total - Total number of items
 * @param limit - Items per page
 * @returns Total number of pages
 */
export function calculateTotalPages(total: number, limit: number): number {
  return Math.ceil(total / limit);
}

/**
 * Create pagination metadata object
 * @param page - Current page
 * @param limit - Items per page
 * @param total - Total number of items
 * @returns Pagination metadata
 */
export function createPaginationMetadata(
  page: number,
  limit: number,
  total: number
): PaginationMetadata {
  return {
    page,
    limit,
    total,
    totalPages: calculateTotalPages(total, limit),
  };
}

