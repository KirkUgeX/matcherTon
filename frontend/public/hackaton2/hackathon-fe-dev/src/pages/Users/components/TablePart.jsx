import t from "../../../services/translation";
import { Refresh } from "../../../components/Refresh";
import { Loader, Table, Tooltip } from "../../../components";
import { useSelector } from "react-redux";
import { Fragment, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getTopHumansTableData } from "../../../services/humans";
import { nextSortingMode } from "../../../utils/sortingMode";
import { ASCENDING } from "../../../constants/sorting";
import { tab } from "@testing-library/user-event/dist/tab";

export const TablePart = ({ showHumanRating }) => {
    const ln = useSelector(state => state.language.currentLanguage);

    const [tableData, setTableData] = useState(null);
    const [tableOptions, setTableOptions] = useState(null);
    const [sortingColumn, setSorting] = useState({
        name: "rating",
        value: "desc",
    });
    const [countForTableUpdate, setCountForTableUpdate] = useState(0);
    const [stopAutomaticRefreshingDueToError, setStopAutomaticRefreshingDueToError] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    useEffect(() => {
        const tableUpdateInterval = setInterval(() => {
            setCountForTableUpdate((current) => current + 1);
        }, 15000);
        return () => clearInterval(tableUpdateInterval);
    }, []);

    useEffect(() => {
        if (showHumanRating !== null && !stopAutomaticRefreshingDueToError) {
            updateTableWithCorrectSorting();
        }
    }, [countForTableUpdate, showHumanRating]);

    const updateTableWithCorrectSorting = () => {
        const sorting = showHumanRating ? { sortingName: "rating", sortingValue: "desc" } : false;
        updateTableData(sorting);
    };

    const updateTableData = (sorting) => {
        getTableData({
            pageNumber: 0,
            sortingName: sorting && sorting.sortingName,
            sortingValue: sorting && sorting.sortingValue,
            size: tableData?.length || 20
        })
            .then((tableData) => {
                setTableData(tableData);
            })
            .catch(() => {
                toast(t(ln, "failed_to_get_leaderboard_information"));
                setStopAutomaticRefreshingDueToError(true);
            });
    };

    const getTableData = async ({
        pageNumber = 0,
        sortingName,
        sortingValue,
        size
    }) => {
        const { humans, results } = await getTopHumansTableData(pageNumber, sortingName, sortingValue, size);
        setTableOptions(humans);
        setSorting({ name: sortingName, value: sortingValue });
        return results;
    };

    const onShowMoreLeadersClickHandler = async () => {
        const pageNumber = tableOptions.pageNumber + 1;
        const { name, value } = sortingColumn;
        const newTableData = await getTableData({
            pageNumber,
            sortingValue: value,
            sortingName: name,
        });
        setTableData((currentData) => [...currentData, ...newTableData]);
    };

    const isShowMore = () => {
        return !(
            tableOptions &&
            (tableOptions.pageNumber + 1 === tableOptions.totalPages
                || (tableOptions.pageNumber === 0 && tableOptions.totalPages === 0)
            )
        );
    };

    const isTableEmpty = () => {
        if (tableData && !tableData[0]) return true;
    };

    const isWithRating = () => {
        if (!tableData) return false;
        if (isTableEmpty()) return false;
        return !Number.isNaN(+tableData[0][tableData[0].length - 1]);
    };

    const getTableHeads = () => {
        const tableHeads = [
            t(ln, "place"),
            t(ln, "player_name"),
            t(ln, "number_of_games"),
            t(ln, "games_result"),
        ];
        if (!tableData) return tableHeads;
        if (isWithRating()) {
            const numberOfPointsColumn = (
                <span className="users-page-table__points" key="Number of points">
                    { t(ln, "number_of_points")}
                    <img
                        onMouseOver={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                        className="users-page-table__points-image"
                        src="/images/information.svg"
                        alt="information"/>
                    <Tooltip className="users-page-table__points-tooltip" bottomBadge={true} isShow={showTooltip}>{t(ln, "elo_rating")}</Tooltip>
                </span>
            );
            tableHeads.push(numberOfPointsColumn);
        }
        return tableHeads;
    };

    const getTableClassNames = () => {
        if (!isWithRating()) {
            return "users-page__table users-page__table--small";
        }
        return "users-page__table";
    };


    return (
        <div className="users-page__table-part">
            <h3>{t(ln, "leaderboard")}</h3>
            <Fragment>
                <Refresh
                    onRefresh={() => updateTableWithCorrectSorting()}
                    className={"users-page__table-refresh"}
                />
                <Table
                    className={getTableClassNames()}
                    names={getTableHeads()}
                    rows={tableData}
                    accentAmount={1}
                    onShowMore={onShowMoreLeadersClickHandler}
                    showMoreButton={isShowMore()}
                />
            </Fragment>
        </div>
    );
};
