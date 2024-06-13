import "../../assets/components/Table/table-body.scss";
import { TableRow } from "./TableRow";
import classNames from "classnames";
import { useSelector } from "react-redux";
import t from "../../services/translation";

export const TableBody = ({
    rows,
    accentAmount,
    className,
    showMoreButton,
    onShowMore,
    indexReverse = false,
}) => {
    const ln = useSelector((state) => state.language.currentLanguage);

    const classes = classNames("table-body", className);
    const renderRows = () => {
        if (!rows.length)
            return (
                <div className="table-body__empty">{t(ln, "no_records")}</div>
            );
        return rows.map((row, i) => {
            const accent = Boolean(accentAmount >= i + 1);
            return (
                <TableRow
                    accent={accent}
                    key={`${row[0]}${i}`}
                    row={row}
                    index={indexReverse ? rows.length - i - 1 : i}
                />
            );
        });
    };

    const renderShowMoreButton = () => {
        if (!showMoreButton) return null;

        return (
            <div className="table-body__show-more-container">
                <div
                    onClick={onShowMore}
                    className="users-page__navigation-link table-body__show-more"
                >
                    {t(ln, "show_more")}
                </div>
            </div>
        );
    };

    return (
        <div className={classes}>
            {renderRows()}
            {renderShowMoreButton()}
        </div>
    );
};
