import { useState, useCallback } from "react";
import {
  personaService,
  type Persona,
  type PersonaPayload,
} from "../core/http/services/personaService";

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

export const usePersona = () => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [currentPersona, setCurrentPersona] = useState<Persona | null>(null);
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
   * Lista personas (admin)
   */
  const fetchPersonas = useCallback(
    async (page: number = 1, size: number = 10) => {
      setLoading(true);
      try {
        const response = await personaService.list(page, size);

        if (response.status >= 200 && response.status < 300 && response.data) {
          const personaData = Array.isArray(response.data.data) ? response.data.data : [];
          setPersonas(personaData);
          setPagination({
            currentPage: response.data.currentPage || page,
            itemsPerPage: response.data.itemsPerPage || size,
            totalItems: response.data.totalItems || 0,
            totalPages: response.data.totalPages || 0,
          });
        } else {
          setPersonas([]);
          showSnackbar(
            response.message || "Erro ao buscar personas",
            "error"
          );
        }
      } catch (error: any) {
        setPersonas([]);
        showSnackbar(error?.message || "Erro ao buscar personas", "error");
      } finally {
        setLoading(false);
      }
    },
    [showSnackbar]
  );

  /**
   * Lista personas disponíveis (user)
   */
  const fetchUserPersonas = useCallback(
    async (page: number = 1, size: number = 10) => {
      setLoading(true);
      try {
        const response = await personaService.listUser(page, size);

        if (response.status >= 200 && response.status < 300 && response.data) {
          const personaData = Array.isArray(response.data.data) ? response.data.data : [];
          setPersonas(personaData);
          setPagination({
            currentPage: response.data.currentPage || page,
            itemsPerPage: response.data.itemsPerPage || size,
            totalItems: response.data.totalItems || 0,
            totalPages: response.data.totalPages || 0,
          });
        } else {
          setPersonas([]);
          showSnackbar(
            response.message || "Erro ao buscar personas",
            "error"
          );
        }
      } catch (error: any) {
        setPersonas([]);
        showSnackbar(error?.message || "Erro ao buscar personas", "error");
      } finally {
        setLoading(false);
      }
    },
    [showSnackbar]
  );

  /**
   * Obtém uma persona por ID (admin)
   */
  const fetchPersonaById = useCallback(
    async (id: string | number) => {
      setLoading(true);
      try {
        const response = await personaService.getById(id);

        if (response.status >= 200 && response.status < 300 && response.data) {
          setCurrentPersona(response.data as Persona);
          return response.data as Persona;
        } else {
          showSnackbar(
            response.message || "Erro ao buscar persona",
            "error"
          );
          return null;
        }
      } catch (error: any) {
        showSnackbar(error?.message || "Erro ao buscar persona", "error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showSnackbar]
  );

  /**
   * Obtém uma persona por ID (user)
   */
  const fetchUserPersonaById = useCallback(
    async (id: string | number) => {
      setLoading(true);
      try {
        const response = await personaService.getUserById(id);

        if (response.status >= 200 && response.status < 300 && response.data) {
          setCurrentPersona(response.data as Persona);
          return response.data as Persona;
        } else {
          showSnackbar(
            response.message || "Erro ao buscar persona",
            "error"
          );
          return null;
        }
      } catch (error: any) {
        showSnackbar(error?.message || "Erro ao buscar persona", "error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showSnackbar]
  );

  /**
   * Atualiza uma persona existente (admin)
   */
  const updatePersona = useCallback(
    async (id: string | number, payload: Partial<PersonaPayload>) => {
      try {
        const response = await personaService.update(id, payload);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Persona atualizada com sucesso!", "success");
          await fetchPersonas();
          return true;
        } else {
          showSnackbar(
            response.message || "Erro ao atualizar persona",
            "error"
          );
          return false;
        }
      } catch (error: any) {
        showSnackbar(error?.message || "Erro ao atualizar persona", "error");
        return false;
      }
    },
    [showSnackbar, fetchPersonas]
  );

  /**
   * Cria uma nova persona (user)
   */
  const createUserPersona = useCallback(
    async (payload: PersonaPayload) => {
      try {
        const response = await personaService.createUser(payload);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Persona criada com sucesso!", "success");
          await fetchUserPersonas();
          return true;
        } else {
          showSnackbar(
            response.message || "Erro ao criar persona",
            "error"
          );
          return false;
        }
      } catch (error: any) {
        showSnackbar(error?.message || "Erro ao criar persona", "error");
        return false;
      }
    },
    [showSnackbar, fetchUserPersonas]
  );

  /**
   * Atualiza uma persona do usuário logado (user)
   */
  const updateUserPersona = useCallback(
    async (id: string | number, payload: Partial<PersonaPayload>) => {
      try {
        const response = await personaService.updateUser(id, payload);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Persona atualizada com sucesso!", "success");
          await fetchUserPersonas();
          return true;
        } else {
          showSnackbar(
            response.message || "Erro ao atualizar persona",
            "error"
          );
          return false;
        }
      } catch (error: any) {
        showSnackbar(error?.message || "Erro ao atualizar persona", "error");
        return false;
      }
    },
    [showSnackbar, fetchUserPersonas]
  );

  /**
   * Deleta uma persona (admin)
   */
  const deletePersona = useCallback(
    async (id: string | number) => {
      try {
        const response = await personaService.delete(id);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Persona deletada com sucesso!", "success");
          await fetchPersonas();
          return true;
        } else {
          showSnackbar(
            response.message || "Erro ao deletar persona",
            "error"
          );
          return false;
        }
      } catch (error: any) {
        showSnackbar(error?.message || "Erro ao deletar persona", "error");
        return false;
      }
    },
    [showSnackbar, fetchPersonas]
  );

  /**
   * Deleta uma persona do usuário logado (user)
   */
  const deleteUserPersona = useCallback(
    async (id: string | number) => {
      try {
        const response = await personaService.deleteUser(id);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Persona deletada com sucesso!", "success");
          await fetchUserPersonas();
          return true;
        } else {
          showSnackbar(
            response.message || "Erro ao deletar persona",
            "error"
          );
          return false;
        }
      } catch (error: any) {
        showSnackbar(error?.message || "Erro ao deletar persona", "error");
        return false;
      }
    },
    [showSnackbar, fetchUserPersonas]
  );

  return {
    personas,
    currentPersona,
    loading,
    pagination,
    snackbar,
    closeSnackbar,
    fetchPersonas,
    fetchUserPersonas,
    fetchPersonaById,
    fetchUserPersonaById,
    updatePersona,
    createUserPersona,
    updateUserPersona,
    deletePersona,
    deleteUserPersona,
  };
};
