import { USER_ACTION_TYPES } from "./user.types";

const INITIAL_STATE = {
    currentUser: null,
    messages : [],
    current_location: null,
    players_locations: [],
    LoadForPost: {cover:'',status:false},
    currentRoute : 'home',
    UnreadMessages : [],
    isDarkMode : false
}


export const userReducer = (state = INITIAL_STATE, action={}) => {
    const { type, payload } = action;
    switch(type)
    {
        case USER_ACTION_TYPES.SET_ROUTE: 
            return{
                ...state,
                currentRoute:payload
            }
        case USER_ACTION_TYPES.SETTHEME:
            return {
                    ...state,
                    isDarkMode: action.payload === 'dark',
                };
        case USER_ACTION_TYPES.SetUnreadMessages: 
            return{
                ...state,
                UnreadMessages:payload.filter(msg => msg.Unread > 0)
            }
        case USER_ACTION_TYPES.SET_CURRENT_USER:
            return {
                ...state,
                currentUser:payload
            }
        case USER_ACTION_TYPES.ADD_FOLLOW: // this user add follow to other user
            return{
                ...state,
                currentUser:{
                    ...state.currentUser,
                    following_count : state.currentUser.following_count + 1
                }
            }
        
        case USER_ACTION_TYPES.REMOVE_FOLLOW: // this user add follow to other user
            return{
                ...state,
                currentUser:{
                    ...state.currentUser,
                    following_count : state.currentUser.following_count - 1
                }
            }
        case USER_ACTION_TYPES.SET_CURRENT_PROFILE_IMG:
            console.log('change profile image ', payload)
            return {
                ...state,
                currentUser: {
                    ...state.currentUser,
                    profile_img: payload
                }
             }

        case USER_ACTION_TYPES.SET_CURRENT_USERNAME : 
            console.log('change user name ', payload)
             return{
                ...state,
                currentUser : {
                    ...state.currentUser,
                    username : payload
                }
             }
        
        case USER_ACTION_TYPES.SET_CURRENT_BIO : 
            return{
            ...state,
            currentUser : {
                ...state.currentUser,
                biography : payload
            }
        }
        case USER_ACTION_TYPES.SET_UPDTE_MESSAGE:
            const { _id } = action.payload;
            return {
                ...state,
                messages: state.messages.map((conversation, index) => {
                    const updatedMessages = conversation.messages.map(message => {
                        if (message._id === _id) {
                            console.log('update read')
                            return {
                                ...message,
                                read: true // Set the read status to true for the specific message
                            };
                        }
                        return message; // Keep other messages unchanged
                    });

                    return {
                        ...conversation,
                        messages: updatedMessages
                    };
                    
                })
            };
            
        case USER_ACTION_TYPES.SET_CURRENT_MESSAGES:
            return {
            ...state,
            messages : payload.slice().sort((a, b) => {
                return new Date(a.timestamp) - new Date(b.timestamp);
            })
        }

        case USER_ACTION_TYPES.SET_ADD_MESSAGE:
           // Find the index of the conversation that matches the participants
           const conversationIndex = state.messages.findIndex(conversation => 
            (conversation.participants[0].username === payload.sender.username && conversation.participants[1].username === payload.recipient.username) ||
            (conversation.participants[1].username === payload.sender.username && conversation.participants[0].username === payload.recipient.username)
        );
        if (conversationIndex > -1) {
            // If the conversation exists, update the messages array within it
            return {
                ...state,
                messages: state.messages.map((conversation, index) => {
                    if (index === conversationIndex) {
                        return {
                            ...conversation,
                            messages: [...conversation.messages, payload] // Add the new message
                        };
                    }
                    return conversation; // Keep other conversations unchanged
                })
            };
        } else {
            // If no matching conversation exists, create a new one
            const newConversation = {
               
                messages: [{...payload}], // Array of messages
                participants: [payload.sender, payload.recipient], // Array of participants
            }

            return {
                ...state,
                messages : [...state.messages, newConversation]
            };
        }

        case USER_ACTION_TYPES.EDIT_CURRENT_MESSAGE:
            console.log('edit message')
            const { sender, recipient, content } = payload.message;
            const id = payload.id 
            // Find the index of the conversation that matches the participants
            const conversation_index = state.messages.findIndex(conversation =>
                (conversation.participants[0].username === sender.username && conversation.participants[1].username === recipient.username) ||
                (conversation.participants[1].username === sender.username && conversation.participants[0].username === recipient.username)
            );

            if (conversation_index > -1) {
                // If the conversation exists, update the specific message by id
                return {
                    ...state,
                    messages: state.messages.map((conversation, index) => {
                        if (index === conversation_index) {
                            return {
                                ...conversation,
                                messages: conversation.messages.map(message =>
                                    message._id === id ? { ...payload.message} : message // Update the message content if the id matches
                                )
                            };
                        }
                        return conversation; // Keep other conversations unchanged
                    })
                };
                } else {
                    // If no matching conversation is found, you may log an error or return the state as-is.
                    console.warn("Conversation not found for the given participants.");
                    return state;
                }

       
        case USER_ACTION_TYPES.SET_CURRENT_LOCATION:
            return {
                ...state,
                current_location:payload
            }

        case USER_ACTION_TYPES.SET_PLAYERS_LOCATION:
            const { username, location } = payload;
            // Update the existing location if the username matches
            const updatedLocations = state.players_locations.map(existingLocation =>
                existingLocation.username.username === username.username
                    ? { ...existingLocation, location } // Update location if username matches
                    : existingLocation
            );

            // Check if the username was found; if not, add the new location
            if (!updatedLocations.some(existingLocation => existingLocation.username.username === username.username)) {
                updatedLocations.push(payload);
            }

            return {
                ...state,
                players_locations: updatedLocations
            };
        case USER_ACTION_TYPES.SET_CURRENTPLAYERS:
            return {
                ...state,
                players_locations:payload
            }
        case USER_ACTION_TYPES.SET_LOAD_POST:
            return {
                ...state,
                LoadForPost:payload
            }

        default:
            return state;
    }
}
