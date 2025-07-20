import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../Slices/AuthSlices";
import amountSlice from "../Slices/Amount";

// Create the Redux store and add the auth reducer
export const store = configureStore({
  reducer: {
    auth: authReducer,
    amountSlice: amountSlice,
  },
});

// Export types for use in the app
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
