import { ASCENDING, DESCENDING } from "../constants/sorting";

export const nextSortingMode = (mode) => {
    return mode === ASCENDING ? DESCENDING : ASCENDING;
};
