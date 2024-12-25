import { WS_ACTION_TYPES } from "./ws.types";

const createAction = (type, payload) => ({ type, payload });

export const setCurrentWs = (ws) => 
    createAction(WS_ACTION_TYPES.SET_NEW_WS,ws);