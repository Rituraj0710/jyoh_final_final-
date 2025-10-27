import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { authApi, staffApi } from './services/auth';
import { otpAuthApi } from './services/otpAuth';

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [staffApi.reducerPath]: staffApi.reducer,
    [otpAuthApi.reducerPath]: otpAuthApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, staffApi.middleware, otpAuthApi.middleware), 
})

setupListeners(store.dispatch);


