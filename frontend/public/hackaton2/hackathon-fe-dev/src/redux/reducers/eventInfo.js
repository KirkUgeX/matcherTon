import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    event: {}
};

const eventSlice = createSlice({
    name: "event",
    initialState,
    reducers: {
        setEventInfo(state, { payload }) {
            state.event = payload;
        },
    }
});

export const { setEventInfo } = eventSlice.actions;

export const eventReducer = eventSlice.reducer;
