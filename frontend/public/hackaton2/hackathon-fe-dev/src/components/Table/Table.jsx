import "../../assets/components/Table/table.scss";
import { TableHead } from "./TableHead";
import { TableBody } from "./TableBody";
import classNames from "classnames";
import { Loader } from "../Loader";
import { Transition } from "react-transition-group";

export const Table = ({ className = "", rows, names, accentAmount, paginatable, showMoreButton, onShowMore, indexReverse }) => {
    const classes = classNames("table", className);

    return (
        <div className={classes}>
            <TableHead names={names} />
            {rows === null ? (
                <div className="table__loader-container">
                    <Loader />
                </div>
            ) : (
                ""
            )}
            <Transition in={Boolean(rows)} timeout={700} mountOnEnter unmountOnExit>
                {(state) => (
                    <TableBody
                        accentAmount={accentAmount}
                        rows={rows}
                        className={state}
                        paginatable={paginatable}
                        showMoreButton={showMoreButton}
                        onShowMore={onShowMore}
                        indexReverse={indexReverse}
                    />
                )}
            </Transition>
        </div>
    );
};
