import {
  persistStore,
  persistReducer,
  type PersistConfig,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { encryptTransform } from "redux-persist-transform-encrypt";
import authReducer, {
  clearCredentials,
  setAccessToken,
} from "./slices/authSlice";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { httpClient } from "../http/httpClient";
import { authService } from "../http/services/authService";

const rootReducer = combineReducers({ auth: authReducer });
export type RootState = ReturnType<typeof rootReducer>;

const getSecretKey = () => {
  const envSecret = import.meta.env.VITE_PERSIST_SECRET;
  if (envSecret) {
    return envSecret;
  }
  return "dev-secret-key-change-in-production-2024";
};

const persistConfig: PersistConfig<RootState> = {
  key: "root",
  storage,
  whitelist: ["auth"],
  transforms: [
    encryptTransform({
      secretKey: getSecretKey(),
      onError: () => {},
    }),
  ],
};

const persistedReducer = persistReducer<RootState>(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);

persistor.subscribe(() => {
  const state = store.getState();
  if (state.auth.accessToken) {
    httpClient.setAuthToken(state.auth.accessToken);
  }
});

const initialState = store.getState();
if (initialState.auth.accessToken) {
  httpClient.setAuthToken(initialState.auth.accessToken);
}

httpClient.setOnUnauthorized(async () => {
  const { refreshToken } = store.getState().auth;
  if (!refreshToken) {
    store.dispatch(clearCredentials());
    return;
  }
  try {
    const res = await authService.refreshToken({ refreshToken });
    if (res.status === 200 && res.data) {
      store.dispatch(setAccessToken(res.data.accessToken));
    } else {
      store.dispatch(clearCredentials());
    }
  } catch {
    store.dispatch(clearCredentials());
  }
});

export type AppDispatch = typeof store.dispatch;
