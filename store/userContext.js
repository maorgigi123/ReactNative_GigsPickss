import React, { createContext, useState } from 'react';

// Create the UserContext
export const UserContext = createContext();

// Create a provider component
export const UserProvider = ({ children }) => {
    const [PathUserMessage, setPathUserMessage] = useState({ username: '' });

    return (
        <UserContext.Provider value={{ PathUserMessage, setPathUserMessage }}>
            {children}
        </UserContext.Provider>
    );
};
