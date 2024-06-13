import "../../../../assets/components/Table/table.scss";
import { HistoryTableHead } from "./HistoryTableHead";
import { HistoryTableBody } from "./HistoryTableBody";
import classNames from "classnames";
import { Transition } from "react-transition-group";
import { Loader } from "../../../../components";

export const HistoryTable = ({ className = "", players, rows, names }) => {
    const classes = classNames("table", className);
    return (
        <div className={classes}>
            <HistoryTableHead names={names} />
            {rows === null ? (
                <div className="table__loader-container">
                    <Loader />
                </div>
            ) : (
                ""
            )}
            <Transition
                in={Boolean(rows)}
                timeout={700}
                mountOnEnter
                unmountOnExit
            >
                {(state) => (
                    <HistoryTableBody
                        rows={rows}
                        className={state}
                        players={players}
                    />
                )}
            </Transition>
        </div>
    );
};
