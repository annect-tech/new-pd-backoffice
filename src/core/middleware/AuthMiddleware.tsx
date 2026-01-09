import { type ReactNode, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { useNavigate } from "react-router";
import { APP_ROUTES } from "../../util/constants";
import { isTokenExpired, decodeJWT } from "../../utils/jwt";
import { clearCredentials } from "../store/slices/authSlice";

interface AuthMiddlewareProps {
  children: ReactNode;
}

export const AuthMiddleware = ({ children }: AuthMiddlewareProps) => {
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Verificar se o token existe
    if (!accessToken) {
      console.log("[AuthMiddleware] Token não encontrado, redirecionando para login");
      navigate(APP_ROUTES.LOGIN, { replace: true });
      return;
    }

    // Verificar se o token tem formato válido de JWT
    try {
      const parts = accessToken.split('.');
      if (parts.length !== 3) {
        console.error("[AuthMiddleware] Token inválido - formato incorreto");
        dispatch(clearCredentials());
        navigate(APP_ROUTES.LOGIN, { replace: true });
        return;
      }

      // Verificar se o token não é um mock
      if (accessToken.startsWith('mock-')) {
        console.error("[AuthMiddleware] Token mockado detectado - acesso negado");
        dispatch(clearCredentials());
        navigate(APP_ROUTES.LOGIN, { replace: true });
        return;
      }

      // Decodificar e validar o token
      const payload = decodeJWT(accessToken);

      // Verificar se o payload tem os campos esperados
      if (!payload.sub || !payload.roles || !payload.tenant_city_id) {
        console.error("[AuthMiddleware] Token inválido - payload incompleto");
        dispatch(clearCredentials());
        navigate(APP_ROUTES.LOGIN, { replace: true });
        return;
      }

      // Verificar se o token está expirado
      if (isTokenExpired(accessToken)) {
        console.log("[AuthMiddleware] Token expirado, redirecionando para login");
        dispatch(clearCredentials());
        navigate(APP_ROUTES.LOGIN, { replace: true });
        return;
      }

      console.log("[AuthMiddleware] Token válido, acesso permitido");
    } catch (error) {
      console.error("[AuthMiddleware] Erro ao validar token:", error);
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
