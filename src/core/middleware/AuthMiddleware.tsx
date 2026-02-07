import { type ReactNode, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { useNavigate } from "react-router";
import { APP_ROUTES } from "../../util/constants";
import { isTokenExpired, decodeJWT } from "../../util/jwt";
import { clearCredentials } from "../store/slices/authSlice";

interface AuthMiddlewareProps {
  children: ReactNode;
}

export const AuthMiddleware = ({ children }: AuthMiddlewareProps) => {
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const refreshToken = useAppSelector((state) => state.auth.refreshToken);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!accessToken && !refreshToken) {
      navigate(APP_ROUTES.LOGIN, { replace: true });
      return;
    }

    // Se não há accessToken mas há refreshToken, deixe o fluxo seguir para o refresh automático
    if (!accessToken && refreshToken) {
      return;
    }

    try {
      const parts = accessToken?.split('.');
      if (parts?.length !== 3) {
        if (!refreshToken) {
          dispatch(clearCredentials());
          navigate(APP_ROUTES.LOGIN, { replace: true });
        }
        return;
      }

      if (accessToken?.startsWith('mock-')) {
        if (!refreshToken) {
          dispatch(clearCredentials());
          navigate(APP_ROUTES.LOGIN, { replace: true });
        }
        return;
      }

      const payload = decodeJWT(accessToken || '');

      if (!payload.sub || !payload.roles || !payload.tenant_city_id) {
        if (!refreshToken) {
          dispatch(clearCredentials());
          navigate(APP_ROUTES.LOGIN, { replace: true });
        }
        return;
      }

      if (isTokenExpired(accessToken || '')) {
        // Não limpar credenciais se houver refreshToken; o refresh automático cuidará disso
        if (!refreshToken) {
          dispatch(clearCredentials());
          navigate(APP_ROUTES.LOGIN, { replace: true });
        }
        return;
      }
    } catch {
      if (!refreshToken) {
        dispatch(clearCredentials());
        navigate(APP_ROUTES.LOGIN, { replace: true });
      }
    }
  }, [accessToken, refreshToken, navigate, dispatch]);

  // Se não tiver token, não renderiza nada (vai redirecionar)
  if (!accessToken && !refreshToken) {
    return null;
  }

  return <>{children}</>;
};
