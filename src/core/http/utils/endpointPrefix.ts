import { store } from "../../store";

/**
 * Determina o prefixo de endpoint baseado nas roles do usuário
 * @returns "admin" se usuário tem role ADMIN/ADMIN_MASTER, "user" caso contrário
 */
export const getEndpointPrefix = (): "admin" | "user" => {
  const state = store.getState();
  const userRoles = state.auth.user?.roles || [];
  
  const hasAdminRole = userRoles.some(
    role => role.toUpperCase() === "ADMIN" || role.toUpperCase() === "ADMIN_MASTER"
  );
  
  return hasAdminRole ? "admin" : "user";
};
