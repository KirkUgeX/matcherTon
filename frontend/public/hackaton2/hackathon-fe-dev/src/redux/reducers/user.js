import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    id: 0,
    role: "",
    teamId: 0
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser(state, { payload }) {
            return {
                id: payload.id,
                role: payload.role,
                teamId: payload.teamId,
            };
        },
        resetState() {
            return {
                ...initialState
            };
        }
    }
});

export const { setUser, resetState } = userSlice.actions;

export const userReducer = userSlice.reducer;
