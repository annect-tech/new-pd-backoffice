import { useState, useCallback } from "react";
import {
  userProfileService,
  type UserProfile,
} from "../core/http/services/userProfileService";
import type { UserProfilePayload } from "../interfaces/profile";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export const useUserProfile = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
  });
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

  /**
   * Lista todos os perfis com paginação
   */
  const fetchProfiles = useCallback(
    async (page: number = 1, size: number = 10, search?: string) => {
      setLoading(true);
      try {
        const response = await userProfileService.list(page, size, search);

        if (response.status >= 200 && response.status < 300 && response.data) {
          const profileData = Array.isArray(response.data.data) ? response.data.data : [];
          setProfiles(profileData);
          setPagination({
            currentPage: response.data.currentPage || page,
            itemsPerPage: response.data.itemsPerPage || size,
            totalItems: response.data.totalItems || 0,
            totalPages: response.data.totalPages || 0,
          });
        } else {
          setProfiles([]);
          showSnackbar(
            response.message || "Erro ao buscar perfis",
            "error"
          );
        }
      } catch (error: any) {
        setProfiles([]);
        showSnackbar(error?.message || "Erro ao buscar perfis", "error");
      } finally {
        setLoading(false);
      }
    },
    [showSnackbar]
  );

  /**
   * Obtém um perfil específico por ID
   */
  const fetchProfileById = useCallback(
    async (id: string | number) => {
      setLoading(true);
      try {
        const response = await userProfileService.getById(id);

        if (response.status >= 200 && response.status < 300 && response.data) {
          setCurrentProfile(response.data as UserProfile);
          return response.data as UserProfile;
        } else {
          showSnackbar(
            response.message || "Erro ao buscar perfil",
            "error"
          );
          return null;
        }
      } catch (error: any) {
        showSnackbar(error?.message || "Erro ao buscar perfil", "error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showSnackbar]
  );

  /**
   * Obtém perfil por user_id (workaround)
   */
  const fetchProfileByUserId = useCallback(
    async (userId: number) => {
      setLoading(true);
      try {
        console.log(`[useUserProfile] Buscando perfil para userId: ${userId}`);
        const profile = await userProfileService.getByUserId(userId);
        console.log(`[useUserProfile] Perfil encontrado:`, profile);
        
        if (profile) {
          setCurrentProfile(profile);
          return profile;
        } else {
          console.log(`[useUserProfile] Perfil não encontrado para userId: ${userId}`);
          // Não mostrar snackbar aqui - é esperado que o perfil não exista em alguns casos
          return null;
        }
      } catch (error: any) {
        console.error(`[useUserProfile] Erro ao buscar perfil para userId ${userId}:`, error);
        // Não mostrar snackbar aqui - deixar o código chamador decidir
        // Re-lançar o erro para que o AppLayout possa tratá-lo
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Obtém perfil por CPF (workaround)
   */
  const fetchProfileByCpf = useCallback(
    async (cpf: string) => {
      setLoading(true);
      try {
        console.log(`[useUserProfile] Buscando perfil para CPF: ${cpf}`);
        const profile = await userProfileService.getByCpf(cpf);
        console.log(`[useUserProfile] Perfil encontrado por CPF:`, profile);
        
        if (profile) {
          setCurrentProfile(profile);
          return profile;
        } else {
          console.log(`[useUserProfile] Perfil não encontrado para CPF: ${cpf}`);
          return null;
        }
      } catch (error: any) {
        console.error(`[useUserProfile] Erro ao buscar perfil para CPF ${cpf}:`, error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Cria um novo perfil
   */
  const createProfile = useCallback(
    async (payload: UserProfilePayload & { user_id: number }) => {
      try {
        // Validar campos obrigatórios antes de enviar
        const requiredFields = [
          'user_id',
          'cpf',
          'personal_email',
          'bio',
          'occupation',
          'department',
          'equipment_patrimony',
          'work_location',
          'manager'
        ];

        // Validações de tamanho baseadas no schema do Prisma
        const fieldMaxLengths: Record<string, number> = {
          cpf: 14,
          personal_email: 255,
          occupation: 100,
          department: 100,
          equipment_patrimony: 50,
          work_location: 100,
          manager: 100,
        };
        
        const missingFields = requiredFields.filter(field => {
          const value = payload[field as keyof typeof payload];
          return value === undefined || value === null || value === '';
        });
        
        if (missingFields.length > 0) {
          const errorMessage = `Campos obrigatórios faltando: ${missingFields.join(', ')}`;
          console.error("[useUserProfile] Validação de payload:", errorMessage);
          showSnackbar(errorMessage, "error");
          throw new Error(errorMessage);
        }

        // Validar tamanhos dos campos
        const oversizedFields: string[] = [];
        for (const [field, maxLength] of Object.entries(fieldMaxLengths)) {
          const value = payload[field as keyof typeof payload];
          if (value && typeof value === 'string' && value.length > maxLength) {
            oversizedFields.push(`${field} (${value.length} > ${maxLength})`);
          }
        }
        
        if (oversizedFields.length > 0) {
          const errorMessage = `Campos excedem o tamanho máximo permitido: ${oversizedFields.join(', ')}`;
          console.error("[useUserProfile] Validação de tamanho:", errorMessage);
          showSnackbar(errorMessage, "error");
          throw new Error(errorMessage);
        }

        // Limpar e formatar payload
        const cleanCpf = payload.cpf?.replace(/\D/g, '') || '';
        
        // Validar CPF após limpeza
        if (cleanCpf.length < 11 || cleanCpf.length > 14) {
          const errorMessage = `CPF inválido. Deve ter entre 11 e 14 caracteres. Recebido: ${cleanCpf.length} caracteres.`;
          console.error("[useUserProfile] Validação de CPF:", errorMessage);
          showSnackbar(errorMessage, "error");
          throw new Error(errorMessage);
        }

        const cleanPayload: any = {
          ...payload,
          // Limpar CPF (remover máscara) - deve ter 11 dígitos
          cpf: cleanCpf,
        };

        // Garantir que as datas estejam no formato ISO (YYYY-MM-DD) se existirem
        if (cleanPayload.birth_date) {
          try {
            const birthDate = new Date(cleanPayload.birth_date);
            if (!isNaN(birthDate.getTime())) {
              cleanPayload.birth_date = birthDate.toISOString().split('T')[0];
            }
          } catch (e) {
            console.warn("[useUserProfile] Erro ao formatar birth_date:", e);
          }
        }

        if (cleanPayload.hire_date) {
          try {
            const hireDate = new Date(cleanPayload.hire_date);
            if (!isNaN(hireDate.getTime())) {
              cleanPayload.hire_date = hireDate.toISOString().split('T')[0];
            }
          } catch (e) {
            console.warn("[useUserProfile] Erro ao formatar hire_date:", e);
          }
        }

        // Remover campos undefined/null vazios (apenas opcionais)
        const optionalFields = ['profile_photo', 'birth_date', 'hire_date'];
        Object.keys(cleanPayload).forEach(key => {
          const value = cleanPayload[key];
          if ((value === undefined || value === null || value === '') && optionalFields.includes(key)) {
            delete cleanPayload[key];
          }
        });

        // Validar comprimento dos campos de string obrigatórios
        const stringFields = ['cpf', 'personal_email', 'bio', 'occupation', 'department', 'equipment_patrimony', 'work_location', 'manager'];
        for (const field of stringFields) {
          if (cleanPayload[field] && typeof cleanPayload[field] === 'string' && cleanPayload[field].trim().length === 0) {
            const errorMessage = `Campo ${field} não pode estar vazio.`;
            console.error("[useUserProfile] Validação de campo:", errorMessage);
            showSnackbar(errorMessage, "error");
            throw new Error(errorMessage);
          }
        }

        // Validar comprimento máximo dos campos conforme schema do banco
        const maxLengths: Record<string, number> = {
          cpf: 14,
          personal_email: 255,
          occupation: 100,
          department: 100,
          equipment_patrimony: 50,
          work_location: 100,
          manager: 100,
        };

        for (const [field, maxLength] of Object.entries(maxLengths)) {
          if (cleanPayload[field] && typeof cleanPayload[field] === 'string' && cleanPayload[field].length > maxLength) {
            const errorMessage = `Campo ${field} excede o tamanho máximo de ${maxLength} caracteres. Tamanho atual: ${cleanPayload[field].length}`;
            console.error("[useUserProfile] Validação de comprimento:", errorMessage);
            showSnackbar(errorMessage, "error");
            throw new Error(errorMessage);
          }
        }

        // Validar formato do email
        if (cleanPayload.personal_email) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(cleanPayload.personal_email)) {
            const errorMessage = "Email pessoal inválido.";
            console.error("[useUserProfile] Validação de email:", errorMessage);
            showSnackbar(errorMessage, "error");
            throw new Error(errorMessage);
          }
        }

        console.log("[useUserProfile] Criando perfil com payload limpo:", JSON.stringify(cleanPayload, null, 2));
        console.log("[useUserProfile] Tipos dos campos:", Object.keys(cleanPayload).reduce((acc, key) => {
          acc[key] = typeof cleanPayload[key];
          return acc;
        }, {} as Record<string, string>));

        const response = await userProfileService.create(cleanPayload);
        
        console.log("[useUserProfile] Resposta da API:", {
          status: response.status,
          message: response.message,
          data: JSON.stringify(response.data, null, 2),
          dataObject: response.data
        });

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Perfil criado com sucesso!", "success");
          await fetchProfiles();
          return true;
        } else {
          // Extrair mensagem de erro da resposta
          let errorMessage = response.message || "Erro ao criar perfil";
          
          // Tratamento especial para erro 403 (Forbidden - Sem permissão)
          if (response.status === 403) {
            errorMessage = "Sem permissão de acesso. Esta ação requer role ADMIN ou ADMIN_MASTER.";
          } 
          // Tratamento especial para erro 500 (Internal Server Error)
          else if (response.status === 500) {
            console.error("[useUserProfile] Erro 500 completo:", {
              status: response.status,
              message: response.message,
              data: response.data,
              payload: cleanPayload
            });
            
            // Tentar extrair mensagem mais específica
            if (response.data) {
              console.error("[useUserProfile] Dados do erro 500:", JSON.stringify(response.data, null, 2));
              
              if (typeof response.data === 'string') {
                errorMessage = response.data;
              } else if (response.data.message) {
                errorMessage = response.data.message;
              } else if (response.data.error) {
                errorMessage = typeof response.data.error === 'string' 
                  ? response.data.error 
                  : JSON.stringify(response.data.error);
              } else if (response.data.statusCode && response.data.message) {
                errorMessage = response.data.message;
              } else if (Array.isArray(response.data) && response.data.length > 0) {
                errorMessage = response.data.join(", ");
              } else {
                // Tentar encontrar qualquer mensagem de erro no objeto
                const errorKeys = Object.keys(response.data);
                for (const key of errorKeys) {
                  if (typeof response.data[key] === 'string' && response.data[key].length > 0) {
                    errorMessage = response.data[key];
                    break;
                  }
                }
              }
              
              // Verificar se é erro de constraint (ex: user_id já existe)
              const errorStr = JSON.stringify(response.data).toLowerCase();
              if (errorStr.includes('unique constraint') || errorStr.includes('duplicate key') || errorStr.includes('already exists') || errorStr.includes('unique violation') || errorStr.includes('p2002')) {
                if (errorStr.includes('user_id') || errorStr.includes('user_id_84fd5b2a')) {
                  errorMessage = "Já existe um perfil para este usuário. Não é possível criar outro perfil.";
                } else if (errorStr.includes('cpf') || errorStr.includes('cpf_67c2d866')) {
                  errorMessage = "Já existe um perfil com este CPF. Verifique o CPF informado.";
                } else {
                  errorMessage = "Dados duplicados. Verifique se o perfil já existe.";
                }
              } else {
                // Se não conseguimos identificar o erro específico, sugerir causas comuns
                errorMessage = `Erro ao criar perfil para o usuário ID ${cleanPayload.user_id}.\n\nCausas mais prováveis:\n• Já existe um perfil para este usuário no banco de dados\n• Já existe um perfil com este CPF: ${cleanPayload.cpf}\n• Erro no servidor backend\n\nSugestão: Verifique se já existe um perfil para este usuário antes de tentar criar novamente.`;
              }
            } else {
              // Se não há dados no erro, fornecer mensagem genérica mas útil
              errorMessage = `Erro interno do servidor ao criar perfil.\n\nInformações:\n• User ID: ${cleanPayload.user_id}\n• CPF: ${cleanPayload.cpf}\n\nPossíveis causas:\n• Perfil já existe para este usuário\n• Perfil já existe com este CPF\n• Erro no servidor backend\n\nAção recomendada: Verifique se já existe um perfil para este usuário.`;
            }
          } else {
            // Tentar extrair mensagem de erro mais detalhada do data
            if (response.data) {
              // Caso 1: data é um array de mensagens (ValidationPipe do NestJS)
              if (Array.isArray(response.data)) {
                errorMessage = response.data.join(", ");
              }
              // Caso 2: data é um objeto
              else if (typeof response.data === 'object') {
                // Verificar se há erros de validação por campo (ex: { cpf: ["erro1", "erro2"] })
                const errorKeys = Object.keys(response.data);
                if (errorKeys.length > 0) {
                  const firstKey = errorKeys[0];
                  const firstError = response.data[firstKey];
                  if (Array.isArray(firstError) && firstError.length > 0) {
                    errorMessage = firstError.join(", ");
                  } else if (typeof firstError === 'string') {
                    errorMessage = firstError;
                  } else if (response.data.message) {
                    errorMessage = response.data.message;
                  }
                } else if (response.data.message) {
                  errorMessage = response.data.message;
                }
              }
              // Caso 3: data é uma string
              else if (typeof response.data === 'string') {
                errorMessage = response.data;
              }
            }
            
            // Normalizar mensagens de erro comuns
            if (errorMessage.includes("user profile with this cpf already exists") || 
                errorMessage.includes("CPF já cadastrado") ||
                errorMessage.includes("cpf already exists")) {
              errorMessage = "Perfil de usuário com este CPF já existe.";
            }
            
            // Verificar se a mensagem contém "Sem permissão"
            if (errorMessage.includes("Sem permissão") || errorMessage.includes("permissão de acesso")) {
              errorMessage = "Sem permissão de acesso. Esta ação requer role ADMIN ou ADMIN_MASTER.";
            }
          }
          
          showSnackbar(errorMessage, "error");
          // Lançar erro com a mensagem real para que possa ser capturado pelo AppLayout
          throw new Error(errorMessage);
        }
      } catch (error: any) {
        // Se já é um Error com mensagem, apenas propagar
        if (error instanceof Error) {
          showSnackbar(error.message || "Erro ao criar perfil", "error");
          throw error;
        }
        // Caso contrário, criar novo erro
        const errorMessage = error?.message || "Erro ao criar perfil";
        showSnackbar(errorMessage, "error");
        throw new Error(errorMessage);
      }
    },
    [showSnackbar, fetchProfiles]
  );

  /**
   * Atualiza um perfil existente
   */
  const updateProfile = useCallback(
    async (id: string | number, payload: Partial<UserProfilePayload>) => {
      try {
        const response = await userProfileService.update(id, payload);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Perfil atualizado com sucesso!", "success");
          await fetchProfiles();
          if (currentProfile?.id === String(id)) {
            await fetchProfileById(id);
          }
          return true;
        } else {
          showSnackbar(
            response.message || "Erro ao atualizar perfil",
            "error"
          );
          return false;
        }
      } catch (error: any) {
        showSnackbar(error?.message || "Erro ao atualizar perfil", "error");
        return false;
      }
    },
    [showSnackbar, fetchProfiles, fetchProfileById, currentProfile]
  );

  /**
   * Deleta um perfil
   */
  const deleteProfile = useCallback(
    async (id: string | number) => {
      try {
        const response = await userProfileService.delete(id);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Perfil deletado com sucesso!", "success");
          await fetchProfiles();
          if (currentProfile?.id === String(id)) {
            setCurrentProfile(null);
          }
          return true;
        } else {
          showSnackbar(
            response.message || "Erro ao deletar perfil",
            "error"
          );
          return false;
        }
      } catch (error: any) {
        showSnackbar(error?.message || "Erro ao deletar perfil", "error");
        return false;
      }
    },
    [showSnackbar, fetchProfiles, currentProfile]
  );

  /**
   * Faz upload de foto de perfil
   */
  const uploadPhoto = useCallback(
    async (profileId: string, file: File) => {
      try {
        const response = await userProfileService.uploadPhoto(profileId, file);

        if (response.status >= 200 && response.status < 300 && response.data) {
          showSnackbar("Foto atualizada com sucesso!", "success");
          // Atualizar perfil atual se for o mesmo
          if (currentProfile?.id === profileId) {
            await fetchProfileById(profileId);
          }
          await fetchProfiles();
          return response.data.url;
        } else {
          showSnackbar(
            response.message || "Erro ao fazer upload da foto",
            "error"
          );
          return null;
        }
      } catch (error: any) {
        showSnackbar(error?.message || "Erro ao fazer upload da foto", "error");
        return null;
      }
    },
    [showSnackbar, fetchProfileById, fetchProfiles, currentProfile]
  );

  return {
    profiles,
    currentProfile,
    loading,
    pagination,
    snackbar,
    closeSnackbar,
    fetchProfiles,
    fetchProfileById,
    fetchProfileByUserId,
    fetchProfileByCpf,
    createProfile,
    updateProfile,
    deleteProfile,
    uploadPhoto,
  };
};
