import { PaginationPage } from "./PaginationPage";

export const Pagination = ({ totalPages, pageNumber, onClick }) => {
    const getPagesRange = () => {
        // only if totalPages > 5
        if (pageNumber === 1) return [1, 3];
        if (pageNumber === 2) return [1, 4];
        const lastIndex = pageNumber + 2 > totalPages ? totalPages : pageNumber + 2;
        return [pageNumber - 2, lastIndex];
    };

    const onButtonClick = (pageNumber) => {
        return onClick(pageNumber);
    };
    const renderPages = () => {
        const pageButtons = [];

        const range = totalPages <= 5 ? [1, totalPages] : getPagesRange();

        for(let i = range[0]; i <= range[1]; i++) {
            const isActive = (i === pageNumber);
            pageButtons.push(
                <PaginationPage
                    pageNumber={i} onClick={onButtonClick} isActive={isActive}
                />
            );
        }
        return pageButtons;
    };

    return (
        <div className="pagination">
            { renderPages() }
        </div>
    );
};
