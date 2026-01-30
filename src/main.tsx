import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { persistor, store } from "./core/store";
import { BrowserRouter } from "react-router";
import { ThemeProvider } from "./app/providers/ThemeProvider";
import { AuthProvider } from "./app/providers/AuthProvider";
import { AppRoutes } from "./app/routes/routes";
import ErrorBoundary from "./components/ErrorBoundary";
import "@/assets/i18n/i18n";
import "./index.css";
import { PersistGate } from "redux-persist/integration/react";


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <ThemeProvider>
            <ErrorBoundary>
              <AuthProvider>
                <AppRoutes />
              </AuthProvider>
            </ErrorBoundary>
          </ThemeProvider>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
