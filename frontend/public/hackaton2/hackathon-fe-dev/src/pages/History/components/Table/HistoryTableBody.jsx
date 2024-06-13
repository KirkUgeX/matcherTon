import "../../../../assets/components/Table/table-body.scss";
import classNames from "classnames";
import { useSelector } from "react-redux";
import t from "../../../../services/translation";
import { HistoryTableMatch } from "./HistoryTableMatch";
import { useEffect } from "react";
import { useState } from "react";
import { getTeamsIdNameHashTable } from "../../../../services/teams";
import { Loader } from "../../../../components/Loader";

export const HistoryTableBody = ({ rows, className, players }) => {
    const ln = useSelector((state) => state.language.currentLanguage);
    const eventId = useSelector((state) => state.event.event.id);
    const [teamsHash, setTeamsHash] = useState(null);
    const classes = classNames("history-table-body", className);

    useEffect(() => {
        getTeamsIdNameHashTable(eventId).then((res) => {
            setTeamsHash(res);
        });
    }, []);

    const renderTableBody = () => {
        return rows && rows.length ? (
            rows.map((match, i) => {
                return (
                    <HistoryTableMatch
                        match={match}
                        key={i}
                        players={players}
                        teamsHash={teamsHash}
                    />
                );
            })
        ) : (
            <span className="history-page__table-no-results">
                {t(ln, "no_results_found")}
            </span>
        );
    };

    const renderLoader = () => {
        return (
            <div className="history-page__table-loader">
                <Loader />
            </div>
        );
    };

    return (
        <div className={classes}>
            {teamsHash ? renderTableBody() : renderLoader()}
        </div>
    );
};
