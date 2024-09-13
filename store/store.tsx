import { configureStore} from '@reduxjs/toolkit';

import authReducer from './authSlice';
import websocketReducer from './websocketSlice';
import meReducer from './meSlice';
import groupReducer from './groupSlice';
import usersReducer from './usersSlice';
import messagesReducer from './messagesSlice';

export const store = configureStore ({
    reducer: {
        auth: authReducer,
        websocket: websocketReducer,
        me: meReducer,
        group: groupReducer,
        users: usersReducer,
        messages: messagesReducer,
    },
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware ({
            serializableCheck: false,
    })
});
