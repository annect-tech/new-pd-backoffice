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
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!accessToken) {
      navigate(APP_ROUTES.LOGIN, { replace: true });
      return;
    }

    try {
      const parts = accessToken.split('.');
      if (parts.length !== 3) {
        dispatch(clearCredentials());
        navigate(APP_ROUTES.LOGIN, { replace: true });
        return;
      }

      if (accessToken.startsWith('mock-')) {
        dispatch(clearCredentials());
        navigate(APP_ROUTES.LOGIN, { replace: true });
        return;
      }

      const payload = decodeJWT(accessToken);

      if (!payload.sub || !payload.roles || !payload.tenant_city_id) {
        dispatch(clearCredentials());
        navigate(APP_ROUTES.LOGIN, { replace: true });
        return;
      }

      if (isTokenExpired(accessToken)) {
        dispatch(clearCredentials());
        navigate(APP_ROUTES.LOGIN, { replace: true });
        return;
      }
    } catch {
      dispatch(clearCredentials());
      navigate(APP_ROUTES.LOGIN, { replace: true });
    }
  }, [accessToken, navigate, dispatch]);

  // Se não tiver token, não renderiza nada (vai redirecionar)
  if (!accessToken) {
    return null;
  }

  return <>{children}</>;
};
