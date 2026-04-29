import { PaginationDTO } from '../types/dto/pagination.dto';

export default function TablePagination({
    pagination,
    onPageClick,
}: {
    pagination: PaginationDTO;
    onPageClick: (page: number) => void;
}) {
    const handlePageClick = (page: number) => {
        onPageClick(page);
    };

    const firstPage = 1;
    const previousPreviousPage =
        pagination.hasPreviousPage && pagination.totalPages > 2
            ? pagination.currentPage - 2
            : null;
    const previousPage = pagination.hasPreviousPage ? pagination.currentPage - 1 : null;
    const nextPage = pagination.hasNextPage ? pagination.currentPage + 1 : null;
    const nextNextPage =
        pagination.hasNextPage && pagination.totalPages > 2
            ? pagination.currentPage + 2
            : null;
    const lastPage = pagination.totalPages;

    const btnBase =
        'px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 border';
    const btnActive =
        'bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))] shadow-lg shadow-[hsl(var(--primary))/0.3]';
    const btnInactive =
        'bg-[hsl(var(--secondary))] text-slate-300 border-[hsl(var(--primary))/0.3] hover:bg-[hsl(var(--primary))/0.2] hover:border-[hsl(var(--primary))] cursor-pointer';
    const btnDisabled = 'text-slate-600 border-transparent cursor-default';

    return (
        <nav role="navigation" aria-label="Pagination Navigation" className="flex gap-1.5 items-center justify-center mt-6 flex-wrap">
            {pagination.currentPage > 3 ? (
                <>
                    <button
                        className={`${btnBase} ${btnInactive}`}
                        onClick={() => handlePageClick(firstPage)}
                    >
                        {firstPage}
                    </button>
                    <span className={`${btnBase} ${btnDisabled}`}>…</span>
                </>
            ) : null}

            {previousPreviousPage ? (
                <button
                    className={`${btnBase} ${btnInactive}`}
                    onClick={() => handlePageClick(previousPreviousPage)}
                >
                    {previousPreviousPage}
                </button>
            ) : null}

            {previousPage ? (
                <button
                    className={`${btnBase} ${btnInactive}`}
                    onClick={() => handlePageClick(previousPage)}
                >
                    {previousPage}
                </button>
            ) : null}

            <button className={`${btnBase} ${btnActive}`}>{pagination.currentPage}</button>

            {nextPage && nextPage <= pagination.totalPages ? (
                <button
                    className={`${btnBase} ${btnInactive}`}
                    onClick={() => handlePageClick(nextPage)}
                >
                    {nextPage}
                </button>
            ) : null}

            {nextNextPage && nextNextPage <= pagination.totalPages ? (
                <button
                    className={`${btnBase} ${btnInactive}`}
                    onClick={() => handlePageClick(nextNextPage)}
                >
                    {nextNextPage}
                </button>
            ) : null}

            {pagination.currentPage < pagination.totalPages - 2 ? (
                <>
                    <span className={`${btnBase} ${btnDisabled}`}>…</span>
                    <button
                        className={`${btnBase} ${btnInactive}`}
                        onClick={() => handlePageClick(lastPage)}
                    >
                        {lastPage}
                    </button>
                </>
            ) : null}
        </nav>
    );
}
