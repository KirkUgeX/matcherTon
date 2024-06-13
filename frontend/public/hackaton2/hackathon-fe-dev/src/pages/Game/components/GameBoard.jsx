import "../../../assets/pages/Game/game.scss";
import { FlagIcon } from "../../../assets/components/Icons/FlagIcon";

import { GameBoardColumn } from "./GameBoardColumn";
import { StrokeBlock } from "./StrokeBlock";
import { FIRST_PLAYER_CELL, SECOND_PLAYER_CELL } from "../../../constants/game";

export const GameBoard = ({ isReplay, fieldState, onColumnClick, userTurn, winningLine, timeRemaining, showWinningLine }) => {
    const createColumns = () => {
        let raws = [];
        for (let i = 0; i < fieldState[0].length; i++) {
            const column = fieldState.map(row => row[i]);
            raws.push(
                <GameBoardColumn
                    column={column}
                    columnNumber={i}
                    key={"column" + i}
                    onClick={onColumnClick}
                />
            );
        }
        return raws;
    };

    const renderStroke = () => {
        if (!winningLine || !showWinningLine) return null;

        return (
            <StrokeBlock type={winningLine.type} cells={winningLine.cells}/>
        );
    };

    const getTimer = () => {
        const timer = Math.ceil(timeRemaining).toFixed(0);

        if (timer >= 10) return timer;
        return `0${timer}`;
    };

    return (
        <div className="game-board">
            <div className="game-board__wrapper">{createColumns()}</div>
            <div className="game-board__control">
                <div className={`game-board__flag game-board__flag--left ${userTurn === FIRST_PLAYER_CELL ? "game-board__flag--active" : ""}`}>
                    <FlagIcon />
                </div>
                <div className="game-board__timer">
                    <span>0:{getTimer()}</span>
                </div>
                <div className={`game-board__flag game-board__flag--right ${userTurn === SECOND_PLAYER_CELL ? "game-board__flag--active" : ""}`}>
                    <FlagIcon />
                </div>
            </div>
            { renderStroke() }
        </div>
    );
};
