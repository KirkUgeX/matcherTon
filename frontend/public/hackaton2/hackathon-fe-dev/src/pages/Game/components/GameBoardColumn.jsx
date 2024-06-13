import "../../../assets/pages/Game/game.scss";
import { GameBoardCell } from "./GameBoardCell";

export const GameBoardColumn = ({ column, columnNumber, onClick }) => {
    const createCells = () => {
        return column.map((cell, cellNumber) => {
            return (<GameBoardCell value={cell} cellNumber={cellNumber} columnNumber={columnNumber} key={columnNumber + cellNumber} />);
        });
    };

    return (
        <div
            className="game-board__column"
            id={"column" + columnNumber}
            onClick={() => onClick(columnNumber)}
        >
            {createCells()}
        </div>
    );
};
