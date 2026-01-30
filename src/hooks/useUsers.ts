import { useCallback, useEffect, useState } from "react";
import {
  usersService,
  type CreateUserPayload,
  type CreateUserResponse,
  type UserProfileResponse,
  type UserResponse,
} from "../core/http/services/usersService";

export interface UserWithProfile extends UserResponse {
  profile?: UserProfileResponse;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

export function useUsers(page: number = 1, size: number = 10) {
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [creating, setCreating] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "info",
  });

  const showSnackbar = useCallback(
    (message: string, severity: SnackbarState["severity"] = "info") => {
      setSnackbar({ open: true, message, severity });
    },
    []
  );

  const closeSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Buscar usuários
      const usersResponse = await usersService.listUsers(page, size);
      
      if (usersResponse.status !== 200) {
        throw new Error(usersResponse.message || "Erro ao buscar usuários");
      }

      const usersData = usersResponse.data?.data || [];
      const meta = usersResponse.data?.meta;

      // Buscar perfis para combinar com os usuários
      const profilesResponse = await usersService.listProfiles(1, 1000);
      const profilesData = profilesResponse.data?.data || [];

      // Combinar usuários com seus perfis
      const usersWithProfiles: UserWithProfile[] = usersData.map((user) => {
        const profile = profilesData.find((p) => p.user_id === user.id);
        return {
          ...user,
          profile: profile,
        };
      });

      setUsers(usersWithProfiles);
      setTotal(meta?.total || 0);
      setTotalPages(meta?.totalPages || 0);
      showSnackbar("Dados carregados com sucesso", "success");
    } catch (err: any) {
      const errorMessage = err.message || "Erro ao carregar usuários";
      setError(errorMessage);
      setUsers([]);
      showSnackbar(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }, [page, size, showSnackbar]);

  const createUser = useCallback(async (payload: CreateUserPayload): Promise<CreateUserResponse | null> => {
    setCreating(true);
    setError(null);
    
    try {
      // Enviar payload completo incluindo birth_date (formato DD-MM-YYYY)
      const response = await usersService.createUser(payload);
      
      if (response.status === 201 || response.status === 200) {
        // Ativar o usuário automaticamente após a criação
        try {
          const activateResponse = await usersService.toggleUserActive(payload.email, true);
          if (activateResponse.status !== 200) {
            // Se falhar ao ativar, logar o erro mas não impedir a criação
            console.warn("Usuário criado mas falhou ao ativar:", activateResponse.message);
          }
        } catch (activateError: any) {
          // Se falhar ao ativar, logar o erro mas não impedir a criação
          console.warn("Usuário criado mas falhou ao ativar:", activateError.message || activateError);
        }
        
        // Recarregar lista de usuários após criar
        await fetchUsers();
        return response.data || null;
      } else {
        // Extrair mensagem de erro mais detalhada
        let errorMessage = response.message || "Erro ao criar usuário";
        
        // Tratamento especial para erro 500 (Internal Server Error)
        if (response.status === 500) {
          errorMessage = "Erro interno do servidor. Verifique os logs do backend ou entre em contato com o suporte.";
          
          // Tentar extrair mensagem mais específica do data
          if (response.data) {
            if (typeof response.data === 'string') {
              errorMessage = response.data;
            } else if ((response.data as any).message) {
              errorMessage = (response.data as any).message;
            } else if (Array.isArray(response.data) && response.data.length > 0) {
              errorMessage = response.data.join(", ");
            }
          }
        }
        
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err.message || "Erro ao criar usuário";
      setError(errorMessage);
      // Re-lançar o erro para que o componente possa capturá-lo
      throw new Error(errorMessage);
    } finally {
      setCreating(false);
    }
  }, [fetchUsers]);

  const toggleUserActive = useCallback(async (email: string, isActive: boolean): Promise<boolean> => {
    setToggling(true);
    setError(null);
    
    try {
      const response = await usersService.toggleUserActive(email, isActive);
      
      if (response.status === 200) {
        // Recarregar lista de usuários após alterar status
        await fetchUsers();
        return true;
      } else {
        throw new Error(response.message || "Erro ao alterar status do usuário");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao alterar status do usuário");
      return false;
    } finally {
      setToggling(false);
    }
  }, [fetchUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    total,
    totalPages,
    creating,
    toggling,
    snackbar,
    closeSnackbar,
    refetch: fetchUsers,
    createUser,
    toggleUserActive,
  };
}

export function useMyProfile() {
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyProfile = async (userId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      if (!userId) {
        setError("ID do usuário não encontrado");
        setLoading(false);
        return;
      }
      
      const profileData = await usersService.getMyProfile(userId);
      
      if (profileData) {
        setProfile(profileData);
      } else {
        setError(null);
        setProfile(null);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao carregar perfil");
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    fetchMyProfile,
  };
}
