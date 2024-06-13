import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    game: null
};

const gameSlice = createSlice({
    name: "game",
    initialState,
    reducers: {
        setGameState(state, { payload }) {
            state.game = payload;
        },
    }
});

export const { setGameState } = gameSlice.actions;

export const gameReducer = gameSlice.reducer;
