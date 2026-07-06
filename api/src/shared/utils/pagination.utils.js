/**
 * Normalizes pagination query params.
 * Supports both page/limit and cursor-style (before) fetching used for
 * loading older chat messages.
 */
export function getPagination(query = {}) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 25, 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip, before: query.before || null };
}

/**
 * Builds a consistent paginated payload.
 */
export function buildPageResult({ items, page, limit, total }) {
  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
}
