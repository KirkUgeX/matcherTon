import { configureStore } from "@reduxjs/toolkit";
import { rootReducer } from "./rootReducer";
import logger from "redux-logger";
import { getEnv } from "../services/env";

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => {
        if (getEnv() === "production") return getDefaultMiddleware();
        return getDefaultMiddleware().concat(logger);
    }
});
