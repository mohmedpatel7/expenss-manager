import { configureStore } from "@reduxjs/toolkit";

// Create the Redux store and add the encode and decode reducers
export const store = configureStore({
  reducer: {},
});

// Export types for use in the app
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
