export const StrokeTypes = {
    COLUMN: "column",
    ROW: "row",
    DIAGONAL_LEFT: "diagonal_left",
    DIAGONAL_RIGHT: "diagonal_right"
};

export const differenceBetweenCells = 64; // width and height = 56, + 8px of margin between them

// If win is by row or by column
export const minTopForStraights = 14;
export const minLeftForStraights = 14;

// If win is by any of diagonals
export const minTopForDiagonals = -27;
export const minLeftForDiagonals = 111;
