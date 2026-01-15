import { useState, useEffect, useCallback } from "react";
import { 
  usersService, 
  type UserResponse, 
  type UserProfileResponse,
  type CreateUserPayload,
  type CreateUserResponse,
} from "../core/http/services/usersService";

export interface UserWithProfile extends UserResponse {
  profile?: UserProfileResponse;
}

export function useUsers(page: number = 1, size: number = 10) {
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [creating, setCreating] = useState(false);
  const [toggling, setToggling] = useState(false);

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
    } catch (err: any) {
      console.error("[useUsers] Erro ao buscar usuários:", err);
      setError(err.message || "Erro ao carregar usuários");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  const createUser = useCallback(async (payload: CreateUserPayload): Promise<CreateUserResponse | null> => {
    setCreating(true);
    setError(null);
    
    try {
      // Remover birth_date do payload se existir (backend não aceita esse campo)
      const { birth_date, ...payloadWithoutBirthDate } = payload;
      
      const response = await usersService.createUser(payloadWithoutBirthDate);
      
      if (response.status === 201 || response.status === 200) {
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
            } else if (response.data.message) {
              errorMessage = response.data.message;
            } else if (Array.isArray(response.data) && response.data.length > 0) {
              errorMessage = response.data.join(", ");
            }
          }
        }
        
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      console.error("[useUsers] Erro ao criar usuário:", err);
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
      console.error("[useUsers] Erro ao alterar status do usuário:", err);
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
      console.log("[useMyProfile] Buscando perfil para userId:", userId);
      
      if (!userId) {
        setError("ID do usuário não encontrado");
        setLoading(false);
        return;
      }
      
      const profileData = await usersService.getMyProfile(userId);
      
      console.log("[useMyProfile] Dados do perfil recebidos:", profileData);
      
      if (profileData) {
        setProfile(profileData);
      } else {
        // Não é um erro crítico - o usuário pode simplesmente não ter perfil criado ainda
        console.log("[useMyProfile] Perfil não encontrado - usuário pode não ter perfil criado");
        setError(null); // Não definir erro, apenas deixar profile como null
        setProfile(null);
      }
    } catch (err: any) {
      console.error("[useMyProfile] Erro ao buscar perfil:", err);
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
