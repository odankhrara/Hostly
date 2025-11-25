import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import propertiesReducer from './slices/propertiesSlice'
import bookingsReducer from './slices/bookingsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    properties: propertiesReducer,
    bookings: bookingsReducer,
  },
})

// TypeScript types (for future TypeScript migration)
// export type RootState = ReturnType<typeof store.getState>
// export type AppDispatch = typeof store.dispatch

