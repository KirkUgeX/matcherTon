import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    currentLanguage: localStorage.getItem("ln") || "ua"
};

const languageSlice = createSlice({
    name: "language",
    initialState,
    reducers: {
        setLanguage(state, action) {
            localStorage.setItem("ln", action.payload);
            state.currentLanguage = action.payload;
        },
    }
});

export const { setLanguage } = languageSlice.actions;

export const languageReducer = languageSlice.reducer;
