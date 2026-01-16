import { type ReactNode, useMemo } from "react";
import { Navigate, useLocation } from "react-router";
import { useAppSelector } from "../store/hooks";
import { APP_ROUTES } from "../../util/constants";
import { decodeJWT } from "../../util/jwt";

interface RoleGuardProps {
  allowedRoles: string[];
  children: ReactNode;
}

export const RoleGuard = ({ allowedRoles, children }: RoleGuardProps) => {
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const user = useAppSelector((state) => state.auth.user);
  const location = useLocation();

  const userRoles = useMemo(() => {
    if (user?.roles?.length) return user.roles;
    if (!accessToken) return [];
    try {
      const payload = decodeJWT(accessToken);
      return Array.isArray(payload.roles) ? payload.roles : [];
    } catch {
      return [];
    }
  }, [accessToken, user?.roles]);

  const isAllowed = useMemo(() => {
    const allowed = new Set(allowedRoles.map((r) => r.toUpperCase()));
    return userRoles.some((r) => allowed.has(String(r).toUpperCase()));
  }, [allowedRoles, userRoles]);

  if (!accessToken) {
    return <Navigate to={APP_ROUTES.LOGIN} replace state={{ from: location }} />;
  }

  if (!isAllowed) {
    return <Navigate to={APP_ROUTES.UNAUTHORIZED} replace />;
  }

  return <>{children}</>;
};

