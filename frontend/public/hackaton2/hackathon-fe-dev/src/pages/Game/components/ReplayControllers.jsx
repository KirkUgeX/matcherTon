import "../../../assets/pages/Game/replay-controllers.scss";
import { ReplayButton } from "./ReplayButton";
import { current } from "@reduxjs/toolkit";
import { PlayerTypes } from "../../../constants/player-types";
import { FIRST_PLAYER_CELL, SECOND_PLAYER, SECOND_PLAYER_CELL } from "../../../constants/game";

export const ReplayControllers = ({
    currentField = [],
    finalField = [],
    currentMoves = [],
    moves = [],
    onButtonClick,
}) => {
    const onToStart = () => {
        const newMovesState = [];
        const newFieldState = finalField.map((row) => {
            return row.map((cell) => cell === "X" ? cell : "_");
        });
        onButtonClick(newFieldState, newMovesState);
    };

    const onToPrevious = () => {
        const lastMove = currentMoves[currentMoves.length - 1];
        const firstNotEmpty = currentField.findIndex((row) => isNotEmpty(row[lastMove]));
        const newFieldState = currentField.map((row, i) => {
            if (firstNotEmpty !== i) return [...row];
            return [
                ...row.slice(0, lastMove),
                "_",
                ...row.slice(lastMove + 1),
            ];
        });
        const newMovesState = currentMoves.slice(0, -1);
        onButtonClick(newFieldState, newMovesState);
    };
    const onToNext = () => {
        const nextMoveColumn = moves[currentMoves.length];
        const lastEmptyRow = currentField.findIndex((row) => isNotEmpty(row[nextMoveColumn]));
        const emptyRow = lastEmptyRow >= 0 ? lastEmptyRow - 1 : currentField.length - 1;
        const newFieldState = currentField.map((row, i) => {
            if (emptyRow !== i) return [...row];
            return [
                ...row.slice(0, nextMoveColumn),
                getNextMove(),
                ...row.slice(nextMoveColumn + 1),
            ];
        });
        const newMovesState = [...currentMoves, nextMoveColumn];
        onButtonClick(newFieldState, newMovesState);
    };
    const onToEnd = () => {
        const newFieldState = finalField.map((row) => [...row]);
        const newMovesState = [...moves];
        onButtonClick(newFieldState, newMovesState);
    };

    const isNotEmpty = (cell) => {
        return cell !== "_";
    };

    const getNextMove = () => {
        return currentMoves.length % 2 === 0 ? FIRST_PLAYER_CELL : SECOND_PLAYER_CELL;
    };

    return (
        <div className="replay-controllers">
            <ReplayButton
                disabled={currentMoves.length === 0}
                imgSrc="/images/game-controllers/arrow.svg"
                onClick={onToStart}
            />
            <ReplayButton
                disabled={currentMoves.length === 0}
                imgSrc="/images/game-controllers/arrow-1.svg"
                onClick={onToPrevious}
            />
            <div className="replay-controllers__moves replay-moves">
                <span className="replay-moves__current">
                    { currentMoves.length }
                </span>
                <span className="replay-moves__divider">/</span> {moves.length}
            </div>
            <ReplayButton
                disabled={currentMoves.length === moves.length}
                imgSrc="/images/game-controllers/arrow-3.svg"
                onClick={onToNext}
            />
            <ReplayButton
                disabled={currentMoves.length === moves.length}
                imgSrc="/images/game-controllers/arrow-2.svg"
                onClick={onToEnd}
            />
        </div>
    );
};
