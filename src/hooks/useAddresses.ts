import { useState, useCallback } from "react";
import {
  addressesService,
  type Address,
  type AddressPayload,
} from "../core/http/services/addressesService";

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

export const useAddresses = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [currentAddress, setCurrentAddress] = useState<Address | null>(null);
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
   * Lista endereços (admin)
   */
  const fetchAddresses = useCallback(
    async (page: number = 1, size: number = 10, search?: string) => {
      setLoading(true);
      try {
        const response = await addressesService.list(page, size, search);

        if (response.status >= 200 && response.status < 300 && response.data) {
          const addressData = Array.isArray(response.data.data) ? response.data.data : [];
          setAddresses(addressData);
          setPagination({
            currentPage: response.data.currentPage || page,
            itemsPerPage: response.data.itemsPerPage || size,
            totalItems: response.data.totalItems || 0,
            totalPages: response.data.totalPages || 0,
          });
        } else {
          setAddresses([]);
          showSnackbar(
            response.message || "Erro ao buscar endereços",
            "error"
          );
        }
      } catch (error: any) {
        setAddresses([]);
        showSnackbar(error?.message || "Erro ao buscar endereços", "error");
      } finally {
        setLoading(false);
      }
    },
    [showSnackbar]
  );

  /**
   * Lista endereços do usuário logado (user)
   */
  const fetchUserAddresses = useCallback(
    async (page: number = 1, size: number = 10, search?: string) => {
      setLoading(true);
      try {
        const response = await addressesService.listUser(page, size, search);

        if (response.status >= 200 && response.status < 300 && response.data) {
          const addressData = Array.isArray(response.data.data) ? response.data.data : [];
          setAddresses(addressData);
          setPagination({
            currentPage: response.data.currentPage || page,
            itemsPerPage: response.data.itemsPerPage || size,
            totalItems: response.data.totalItems || 0,
            totalPages: response.data.totalPages || 0,
          });
        } else {
          setAddresses([]);
          showSnackbar(
            response.message || "Erro ao buscar endereços",
            "error"
          );
        }
      } catch (error: any) {
        setAddresses([]);
        showSnackbar(error?.message || "Erro ao buscar endereços", "error");
      } finally {
        setLoading(false);
      }
    },
    [showSnackbar]
  );

  /**
   * Obtém um endereço por ID (admin)
   */
  const fetchAddressById = useCallback(
    async (id: string | number) => {
      setLoading(true);
      try {
        const response = await addressesService.getById(id);

        if (response.status >= 200 && response.status < 300 && response.data) {
          setCurrentAddress(response.data as Address);
          return response.data as Address;
        } else {
          showSnackbar(
            response.message || "Erro ao buscar endereço",
            "error"
          );
          return null;
        }
      } catch (error: any) {
        showSnackbar(error?.message || "Erro ao buscar endereço", "error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showSnackbar]
  );

  /**
   * Cria um novo endereço (admin)
   */
  const createAddress = useCallback(
    async (payload: AddressPayload) => {
      try {
        const response = await addressesService.create(payload);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Endereço criado com sucesso!", "success");
          await fetchAddresses();
          return true;
        } else {
          showSnackbar(
            response.message || "Erro ao criar endereço",
            "error"
          );
          return false;
        }
      } catch (error: any) {
        showSnackbar(error?.message || "Erro ao criar endereço", "error");
        return false;
      }
    },
    [showSnackbar, fetchAddresses]
  );

  /**
   * Cria um novo endereço para o usuário logado (user)
   */
  const createUserAddress = useCallback(
    async (payload: AddressPayload) => {
      try {
        const response = await addressesService.createUser(payload);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Endereço criado com sucesso!", "success");
          await fetchUserAddresses();
          return true;
        } else {
          showSnackbar(
            response.message || "Erro ao criar endereço",
            "error"
          );
          return false;
        }
      } catch (error: any) {
        showSnackbar(error?.message || "Erro ao criar endereço", "error");
        return false;
      }
    },
    [showSnackbar, fetchUserAddresses]
  );

  /**
   * Atualiza um endereço (admin)
   */
  const updateAddress = useCallback(
    async (id: string | number, payload: Partial<AddressPayload>) => {
      try {
        const response = await addressesService.update(id, payload);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Endereço atualizado com sucesso!", "success");
          await fetchAddresses();
          return true;
        } else {
          showSnackbar(
            response.message || "Erro ao atualizar endereço",
            "error"
          );
          return false;
        }
      } catch (error: any) {
        showSnackbar(error?.message || "Erro ao atualizar endereço", "error");
        return false;
      }
    },
    [showSnackbar, fetchAddresses]
  );

  /**
   * Atualiza um endereço do usuário logado (user)
   */
  const updateUserAddress = useCallback(
    async (id: string | number, payload: Partial<AddressPayload>) => {
      try {
        const response = await addressesService.updateUser(id, payload);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Endereço atualizado com sucesso!", "success");
          await fetchUserAddresses();
          return true;
        } else {
          showSnackbar(
            response.message || "Erro ao atualizar endereço",
            "error"
          );
          return false;
        }
      } catch (error: any) {
        showSnackbar(error?.message || "Erro ao atualizar endereço", "error");
        return false;
      }
    },
    [showSnackbar, fetchUserAddresses]
  );

  /**
   * Deleta um endereço (admin)
   */
  const deleteAddress = useCallback(
    async (id: string | number) => {
      try {
        const response = await addressesService.delete(id);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Endereço deletado com sucesso!", "success");
          await fetchAddresses();
          return true;
        } else {
          showSnackbar(
            response.message || "Erro ao deletar endereço",
            "error"
          );
          return false;
        }
      } catch (error: any) {
        showSnackbar(error?.message || "Erro ao deletar endereço", "error");
        return false;
      }
    },
    [showSnackbar, fetchAddresses]
  );

  /**
   * Deleta um endereço do usuário logado (user)
   */
  const deleteUserAddress = useCallback(
    async (id: string | number) => {
      try {
        const response = await addressesService.deleteUser(id);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Endereço deletado com sucesso!", "success");
          await fetchUserAddresses();
          return true;
        } else {
          showSnackbar(
            response.message || "Erro ao deletar endereço",
            "error"
          );
          return false;
        }
      } catch (error: any) {
        showSnackbar(error?.message || "Erro ao deletar endereço", "error");
        return false;
      }
    },
    [showSnackbar, fetchUserAddresses]
  );

  return {
    addresses,
    currentAddress,
    loading,
    pagination,
    snackbar,
    closeSnackbar,
    fetchAddresses,
    fetchUserAddresses,
    fetchAddressById,
    createAddress,
    createUserAddress,
    updateAddress,
    updateUserAddress,
    deleteAddress,
    deleteUserAddress,
  };
};
