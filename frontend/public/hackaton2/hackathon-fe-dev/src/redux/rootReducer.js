import { combineReducers } from "@reduxjs/toolkit";
import { appReducer } from "./reducers/app";
import { userReducer } from "./reducers/user";
import { languageReducer } from "./reducers/language";
import { eventReducer } from "./reducers/eventInfo";
import { contestReducer } from "./reducers/contest";
import { gameReducer } from "./reducers/game";

export const rootReducer = combineReducers({
    app: appReducer,
    user: userReducer,
    event: eventReducer,
    language: languageReducer,
    contest: contestReducer,
    game: gameReducer
});
