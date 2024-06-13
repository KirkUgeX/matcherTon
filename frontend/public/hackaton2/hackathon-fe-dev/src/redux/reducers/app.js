import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    loader: false,
    moveTimeLimit: 0 // seconds
};

const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
        showLoader(state, action) {
            state.loader = !state.loader;
        },
        setMoveTimeLimit(state, action) {
            state.moveTimeLimit = action.payload;
        }
    }
});

export const { showLoader, setMoveTimeLimit } = appSlice.actions;

export const appReducer = appSlice.reducer;
