export interface PaginatedResult<T> {
  data: T[]

  // strapi-style pagination
  pagination: {
    total: number // total records in db
    pageCount: number // total number of pages
    page: number // current page number
    pageSize: number // page size
  }
}
