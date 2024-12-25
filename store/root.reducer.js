import { combineReducers } from "redux";

import { userReducer } from "./user/user.reducer";
import { wsReducer } from "./webSocket/ws.reducer";

export const rootReducer = combineReducers({
    user : userReducer,
    ws : wsReducer
});