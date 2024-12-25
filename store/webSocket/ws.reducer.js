import { WS_ACTION_TYPES } from "./ws.types";

const INITIAL_STATE = {
    currentWs: null,
}

export const wsReducer = (state = INITIAL_STATE, action={}) => {
    const { type, payload } = action;

    switch(type)
    {
        case WS_ACTION_TYPES.SET_NEW_WS:
            return {
                ...state,
                currentWs:payload
            }
        
        default:
            return state;
    }
}
