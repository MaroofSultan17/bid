export interface PaginationDTO {
    currentPage: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    perPage: number;
    totalItems: number;
    totalPages: number;
    orderBy: string;
    orderDirection: string;
}
