import styles from "../css/paginator.module.css";

interface PaginatorProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Paginator = ({ currentPage, totalPages, onPageChange }: PaginatorProps) => {
    const renderPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;
        const half = Math.floor(maxPagesToShow / 2);

        let startPage = Math.max(1, currentPage - half);
        let endPage = Math.min(totalPages, currentPage + half);

        if (currentPage <= half) {
            endPage = Math.min(totalPages, maxPagesToShow);
        }

        if (currentPage + half >= totalPages) {
            startPage = Math.max(1, totalPages - maxPagesToShow + 1);
        }

        if (startPage > 1) {
            pageNumbers.push(
                <li key={1} className="page-item">
                    <button
                        className={styles.edgeButton}
                        onClick={() => onPageChange(1)}
                    >
                        1
                    </button>
                </li>
            );
            if (startPage > 2) {
                pageNumbers.push(
                    <li key="start-ellipsis" className="page-item">
                        <span className={styles.ellipsis}>...</span>
                    </li>
                );
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <li key={i}>
                    <button
                        className={`${styles.pageButton} ${i === currentPage ? styles.active : ''}`}
                        onClick={() => onPageChange(i)}
                    >
                        {i}
                    </button>
                </li>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pageNumbers.push(
                    <li key="end-ellipsis" className="page-item">
                        <span className={styles.ellipsis}>...</span>
                    </li>
                );
            }
            pageNumbers.push(
                <li key={totalPages} className="page-item">
                    <button
                        className={styles.edgeButton}
                        onClick={() => onPageChange(totalPages)}
                    >
                        {totalPages}
                    </button>
                </li>
            );
        }

        return pageNumbers;
    };

    return (
        <nav className={styles.paginationWrapper}>
            <ul className={styles.pagination}>
                <li>
                    <button
                        className={`${styles.pageButton} ${currentPage === 1 ? styles.disabled : ''}`}
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <i className="bi bi-arrow-left"></i>
                    </button>
                </li>

                {renderPageNumbers()}

                <li>
                    <button
                        className={`${styles.pageButton} ${currentPage === totalPages ? styles.disabled : ''}`}
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        <i className="bi bi-arrow-right"></i>
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default Paginator;
