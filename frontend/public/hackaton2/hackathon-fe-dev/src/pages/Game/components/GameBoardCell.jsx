import "../../../assets/pages/Game/game.scss";
import classNames from "classnames";
import { BLOCKED_CELL, EMPTY_CELL, FIRST_PLAYER_CELL, SECOND_PLAYER_CELL } from "../../../constants/game";

export const GameBoardCell = ({
    cellNumber,
    columnNumber,
    value
}) => {
    const classes = classNames(
        "board-cell",
        { "board-cell--initial": value === EMPTY_CELL },
        { "board-cell--blue": value === FIRST_PLAYER_CELL },
        { "board-cell--orange": value === SECOND_PLAYER_CELL },
        { "board-cell--inactive": value === BLOCKED_CELL },
    );
    return (
        <div
            className={classes}
            id={"cell-" + columnNumber + "-" + cellNumber}
        ></div>
    );
};
