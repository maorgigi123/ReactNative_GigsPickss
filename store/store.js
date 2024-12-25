// Import necessary modules from Redux and Redux Persist
import { createStore, applyMiddleware, compose } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage for storage
import { rootReducer } from './root.reducer'; // Your combined reducers
import { loggerMiddleware } from './middleware/logger'; // Example logger middleware

// Configuration for Redux Persist
const persistConfig = {
  key: 'root', // Key for the persistor
  storage: AsyncStorage, // Use AsyncStorage for storage
  whitelist: ['ws', 'user'] // Reducers to persist
};

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Middleware setup
const middlewares = [];

// Add logger middleware in non-production environment
if (process.env.NODE_ENV !== 'production') {
  middlewares.push(loggerMiddleware);
}

// Compose enhancers including middleware
// const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// Create the Redux store
export const store = createStore(
  persistedReducer, // Pass persisted reducer
  compose(
    applyMiddleware(...middlewares) // Apply middleware
    // Other enhancers can be added here as needed
  )
);

// Create the Redux persistor
export const persistor = persistStore(store);
