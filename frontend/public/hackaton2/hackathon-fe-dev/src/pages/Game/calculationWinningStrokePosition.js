import {
    differenceBetweenCells,
    minLeftForDiagonals,
    minLeftForStraights,
    minTopForDiagonals,
    minTopForStraights,
    StrokeTypes
} from "./constrants";

const maxRowDistance = 5 * 64;

export const calculationWinningStrokePosition = (cells, type) => {

    const startingPosition = findTheStartingPosition(cells);

    if (isStraight(type)) {
        return calculateStraights(startingPosition);
    }
    return calculateForDiagonals(startingPosition);
};

const findTheStartingPosition = (cells) => {
    let startRow = 5;
    let startColumn = 8;
    // Trying to find the lowest column value and the biggest row value
    cells.forEach((cell) => {
        if (startColumn > cell.x) {
            startColumn = cell.x;
        }
        if (startRow > cell.y) {
            startRow = cell.y;
        }
    });

    return { startRow, startColumn };
};

const calculateStraights = (startingPosition) => {
    // Calculating straight margin-left (from left to right)
    const columnMargin = minLeftForStraights + differenceBetweenCells * startingPosition.startColumn;
    // Calculating straight margin-top, starting from the biggest margin possible
    const rowMargin = minTopForStraights + differenceBetweenCells * startingPosition.startRow;
    return { columnMargin, rowMargin };
};

const calculateForDiagonals = (startingPosition) => {
    const columnMargin = minLeftForDiagonals + differenceBetweenCells * startingPosition.startColumn;
    const rowMargin = minTopForDiagonals + differenceBetweenCells * startingPosition.startRow;
    return { columnMargin, rowMargin };
};

const isStraight = (type) => {
    return Boolean(type === StrokeTypes.ROW || type === StrokeTypes.COLUMN);
};
