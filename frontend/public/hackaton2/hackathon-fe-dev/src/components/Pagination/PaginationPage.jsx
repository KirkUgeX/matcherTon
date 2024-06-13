import classNames from "classnames";

export const PaginationPage = ({ onClick, pageNumber, isActive }) => {
    const classes = classNames(
        "pagination-button",
        { "pagination-button--active": isActive }
    );

    return <div className={classes} onClick={() => onClick(pageNumber)}>{ pageNumber }</div>;
};
