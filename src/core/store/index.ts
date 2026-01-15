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

// Gera uma chave secreta padrão para desenvolvimento se não estiver definida
const getSecretKey = () => {
  const envSecret = import.meta.env.VITE_PERSIST_SECRET;
  if (envSecret) {
    return envSecret;
  }
  // Chave padrão para desenvolvimento (NÃO usar em produção!)
  console.warn(
    "[store] VITE_PERSIST_SECRET não definida. Usando chave padrão para desenvolvimento."
  );
  return "dev-secret-key-change-in-production-2024";
};

const persistConfig: PersistConfig<RootState> = {
  key: "root",
  storage,
  whitelist: ["auth"],
  transforms: [
    encryptTransform({
      secretKey: getSecretKey(),
      onError: (err) => {
        console.error("[store] Erro ao criptografar dados persistidos:", err);
      },
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
console.log("[store] store criado");
export const persistor = persistStore(store);
console.log("[store] persistor criado");

// Configurar o token no httpClient quando o estado for restaurado
persistor.subscribe(() => {
  const state = store.getState();
  if (state.auth.accessToken) {
    httpClient.setAuthToken(state.auth.accessToken);
    console.log("[store] Token restaurado e configurado no httpClient");
  }
});

// Configurar o token inicial se já existir no estado
const initialState = store.getState();
if (initialState.auth.accessToken) {
  httpClient.setAuthToken(initialState.auth.accessToken);
  console.log("[store] Token inicial configurado no httpClient");
}

httpClient.setOnUnauthorized(async () => {
  const { refreshToken } = store.getState().auth;
  console.log("[store] onUnauthorized chamado, refreshToken:", refreshToken);
  if (!refreshToken) {
    console.warn("[store] refreshToken ausente, limpando credenciais");
    store.dispatch(clearCredentials());
    return;
  }
  try {
    // Usar novo formato: { refreshToken: string }
    const res = await authService.refreshToken({ refreshToken });
    console.log("[store] refreshToken resposta", res);
    if (res.status === 200 && res.data) {
      // Usar novo campo: accessToken (não access)
      store.dispatch(setAccessToken(res.data.accessToken));
      // Atualizar também o refreshToken se vier na resposta
      if (res.data.refreshToken) {
        // Note: não temos ação para atualizar refreshToken, mas o setAccessToken já atualiza o httpClient
        console.log("[store] Novo refreshToken também recebido");
      }
      console.log("[store] Novo accessToken definido");
    } else {
      console.warn("[store] refreshToken falhou, limpando credenciais");
      store.dispatch(clearCredentials());
    }
  } catch (err) {
    console.error("[store] Erro ao tentar refreshToken", err);
    store.dispatch(clearCredentials());
  }
});

export type AppDispatch = typeof store.dispatch;
