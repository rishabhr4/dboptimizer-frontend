import { configureStore } from '@reduxjs/toolkit'
import queryReducer from './slices/querySlice'

export const store = configureStore({
  reducer: {
    query: queryReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
