import { StrokeTypes } from "../pages/Game/constrants";
import { BLOCKED_CELL, EMPTY_CELL } from "../constants/game";

export const checkIfAnyoneWon = (gameState) => {
    const rowWinner = checkingWinnerByRow(gameState);
    if (rowWinner) {
        return rowWinner;
    }

    const columnWinner = checkingWinnerByColumn(gameState);
    if (columnWinner) {
        return columnWinner;
    }

    const diagonalWinner = checkingWinnerByDiagonal(gameState);
    if (diagonalWinner) {
        return diagonalWinner;
    }
    //
    const anotherDiagonalWinner = checkWinnerByAnotherDiagonal(gameState);
    if (anotherDiagonalWinner) {
        return anotherDiagonalWinner;
    }

    return null;
};

const checkingWinnerByRow = (gameState) => {
    let winner = null;
    gameState.forEach((row, i) => {
        const rowSimilarCount = { value: -1, count: 0, cells: [], type: StrokeTypes.ROW };

        row.forEach((cellValue, j) => {
            const cell = { x: j, y: i, value: cellValue };
            const whoWon = checkingSimilarityAndWinner(rowSimilarCount, cell);
            if (whoWon) {
                winner = JSON.stringify(whoWon);
            }
        });
    });
    return winner;
};

const checkingWinnerByColumn = (gameState) => {
    let winner = null;
    // iterate columns
    for (let i = 0; i < gameState[0].length; i++) {
        const columnSimilarCount = { value: -1, count: 0, cells: [], type: StrokeTypes.COLUMN };
        // iterate rows
        for (let j = 0; j < gameState.length; j++) {
            const cell = { x: i, y: j, value: gameState[j][i] };
            const whoWon = checkingSimilarityAndWinner(columnSimilarCount, cell);
            if (whoWon) {
                winner = JSON.stringify(whoWon);
                break;
            }
        }
        if (winner) break;
    }
    return winner;
};

const checkingWinnerByDiagonal = (gameState) => {
    // start[/,/,/,/,/,/,/,/]
    //      [/,/,/,/,/,/,/,/]
    //      [/,/,/,/,/,/,/,/]
    //      [/,/,/,/,/,/,/,/]
    //      [/,/,/,/,/,/,/,/]
    //      [/,/,/,/,/,/,/,/] end
    let winner = null;
    const numberOfProcesses = (gameState.length + gameState[0].length) - 1; // for default field (6x8) it equals 13

    const rowsCount = gameState.length - 1; // 0..5
    const columnsCount = gameState[0].length - 1; // 0..7

    // initially updating by row
    for (let i = 0; i < numberOfProcesses; i++) {
        const startingCell = { row: 0, column: 0 };

        // calculate from which cells of the field we should start checking
        if (i > rowsCount) {
            startingCell.column = i - rowsCount;
            startingCell.row = rowsCount;
        } else {
            startingCell.row = i;
        }

        const processingCell = { ...startingCell };
        const arrayOfValues = [];
        while (processingCell.row >= 0 && processingCell.row <= rowsCount && processingCell.column >= 0 && processingCell.column <= columnsCount) {
            const cell = { x: processingCell.column , y: processingCell.row, value: gameState[processingCell.row][processingCell.column] };
            arrayOfValues.push(cell);
            processingCell.row--;
            processingCell.column++;
        }
        const rowWinner = arrayCheckingForWinner(arrayOfValues, StrokeTypes.DIAGONAL_LEFT);
        if (rowWinner) {
            winner = rowWinner;
            break;
        }
    }
    return winner;
};

const checkWinnerByAnotherDiagonal = (gameState) => {
    //      [\,\,\,\,\,\,\,\]start
    //      [\,\,\,\,\,\,\,\]
    //      [\,\,\,\,\,\,\,\]
    //      [\,\,\,\,\,\,\,\]
    //      [\,\,\,\,\,\,\,\]
    // end  [\,\,\,\,\,\,\,\]
    let winner = null;
    const numberOfProcesses = (gameState.length + gameState[0].length) - 1; // for default field it equals 13

    const rowsCount = gameState.length - 1; // 0..5
    const columnsCount = gameState[0].length - 1; // 0..7

    // initially updating by row
    for (let i = 0; i < numberOfProcesses; i++) {
        const startingCell = { row: 0, column: columnsCount };
        if (i > rowsCount) {
            startingCell.row = rowsCount;
            startingCell.column = numberOfProcesses - i - 1;
        } else {
            startingCell.row = i;
        }

        const processingCell = { ...startingCell };
        const arrayOfValues = [];
        while (processingCell.row >= 0 && processingCell.row <= rowsCount && processingCell.column >= 0 && processingCell.column <= columnsCount) {
            const cell = { x: processingCell.column , y: processingCell.row, value: gameState[processingCell.row][processingCell.column] };
            arrayOfValues.push(cell);
            processingCell.row--;
            processingCell.column--;
        }
        const rowWinner = arrayCheckingForWinner(arrayOfValues, StrokeTypes.DIAGONAL_RIGHT);
        if (rowWinner) {
            winner = rowWinner;
            break;
        }
    }
    return winner;
};

const arrayCheckingForWinner = (row, type) => {
    let winner = null;

    const rowSimilarCount = { value: -1, count: 0, cells: [], type };

    row.forEach((cell) => {
        const whoWon = checkingSimilarityAndWinner(rowSimilarCount, cell);
        if (whoWon) {
            winner = JSON.stringify(whoWon);
        }
    });

    return winner;
};

const checkingSimilarityAndWinner = (similarCount, cell) => {
    // check if the next cell equals to the previous one
    if (cell.value === similarCount.value && cell.value !== EMPTY_CELL && cell.value !== BLOCKED_CELL) {
        // if it equals then update count by one
        similarCount.count++;
        similarCount.cells.push({ x: cell.x, y: cell.y });
        // After updating the count check if it equals 4;
        if (similarCount.count === 4) {
            // When count equals 4 then we found a winner;
            return similarCount;
        }
    } else {
        // If the next cell not equals to the previous one then we should refresh the count and value of checking.
        similarCount.value = cell.value;
        similarCount.count = 1;
        similarCount.cells = [{ x: cell.x, y: cell.y }];
    }
};
