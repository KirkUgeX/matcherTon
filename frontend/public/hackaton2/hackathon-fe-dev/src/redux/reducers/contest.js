import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    contest: []
};

const contestSlice = createSlice({
    name: "contest",
    initialState,
    reducers: {
        setContests(state, { payload }) {
            state.contest = payload;
        },
    }
});

export const { setContests } = contestSlice.actions;

export const contestReducer = contestSlice.reducer;
