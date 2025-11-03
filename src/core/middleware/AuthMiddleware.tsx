import { type ReactNode, useEffect } from "react";
import { useAppSelector } from "../store/hooks";
import { useNavigate } from "react-router";
import { APP_ROUTES } from "../../util/constants";

interface AuthMiddlewareProps {
  children: ReactNode;
}

export const AuthMiddleware = ({ children }: AuthMiddlewareProps) => {
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const navigate = useNavigate();

  useEffect(() => {
    if (!accessToken) {
      navigate(APP_ROUTES.LOGIN);
    }
  }, [accessToken, navigate]);

  return <>{children}</>;
};
