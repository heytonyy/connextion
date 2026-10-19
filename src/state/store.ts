import { configureStore } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/es/storage";
import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist/es/constants";
import cardReducer from "./reducers";

const PERSIST_VERSION = 3;
const persistConfig = {
  key: "root",
  storage,
  version: PERSIST_VERSION,
  // Saved games from older versions have a different shape; drop them and start fresh
  migrate: <S extends { _persist?: { version: number } }>(state: S | undefined) =>
    Promise.resolve(
      state?._persist?.version === PERSIST_VERSION ? state : undefined
    ),
};
const persistedReducer = persistReducer(persistConfig, cardReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// recommended typing from reduxjs/toolkit
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
