import { USER_ACTION_TYPES } from "./user.types";

const createAction = (type, payload) => ({ type, payload });

export const setCurrentUser = (user) => 
    createAction(USER_ACTION_TYPES.SET_CURRENT_USER,user);

export const setCurrentMessages = (messages) => 
    createAction(USER_ACTION_TYPES.SET_CURRENT_MESSAGES,messages);

export const setAddMessage = (messages) => 
    createAction(USER_ACTION_TYPES.SET_ADD_MESSAGE,messages);

// Action Creator for Editing a Message
export const EditCurrentMessage = (message, id) => 
    createAction(USER_ACTION_TYPES.EDIT_CURRENT_MESSAGE, { message, id });


export const SET_CURRENT_LOCATION = (location) => 
    createAction(USER_ACTION_TYPES.SET_CURRENT_LOCATION,location);

export const SET_PLAYERS_LOCATION = (locations) => 
    createAction(USER_ACTION_TYPES.SET_PLAYERS_LOCATION,locations);

export const SET_CURRENTPLAYERS = (players) => 
    createAction(USER_ACTION_TYPES.SET_CURRENTPLAYERS,players);

export const SET_CURRENT_PROFILE_IMG = (img) => 
    createAction(USER_ACTION_TYPES.SET_CURRENT_PROFILE_IMG,img);

export const SET_CURRENT_USERNAME = (username) => 
    createAction(USER_ACTION_TYPES.SET_CURRENT_USERNAME,username);

export const SET_CURRENT_BIO = (bio) => 
    createAction(USER_ACTION_TYPES.SET_CURRENT_BIO,bio);


export const setUpdateMessage = (message) => 
    createAction(USER_ACTION_TYPES.SET_UPDTE_MESSAGE,message);

export const setLoadPost = (load) => 
    createAction(USER_ACTION_TYPES.SET_LOAD_POST,load);

export const addFollow = () => 
    createAction(USER_ACTION_TYPES.ADD_FOLLOW);

export const removeFollow = () => 
    createAction(USER_ACTION_TYPES.REMOVE_FOLLOW);

export const SetUnreadMessages = (UnreadMessages) => 
    createAction(USER_ACTION_TYPES.SetUnreadMessages,UnreadMessages);

export const SET_ROUTE = (route) => 
    createAction(USER_ACTION_TYPES.SET_ROUTE,route);


export const SetTheme = (Theme) => 
    createAction(USER_ACTION_TYPES.SETTHEME,Theme);