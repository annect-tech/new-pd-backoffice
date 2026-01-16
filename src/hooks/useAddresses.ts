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

  const fetchAddresses = useCallback(
    async (
      page: number = 1,
      size: number = 10,
      search?: string,
      filters?: {
        city?: string;
        state?: string;
        neighborhood?: string;
        include_deleted?: boolean;
      }
    ) => {
      setLoading(true);
      try {
        const response = await addressesService.list(page, size, search, filters);

        if (response.status >= 200 && response.status < 300 && response.data) {
          const raw = response.data as any;
          const list = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];

          setAddresses(list);
          setPagination({
            currentPage: Number(raw?.currentPage ?? page),
            itemsPerPage: Number(raw?.itemsPerPage ?? size),
            totalItems: Number(raw?.totalItems ?? list.length),
            totalPages: Number(raw?.totalPages ?? 0),
          });
          showSnackbar("Dados carregados com sucesso", "success");
        } else {
          setAddresses([]);
          setPagination((prev) => ({ ...prev, totalItems: 0, totalPages: 0 }));
          showSnackbar(
            response.message || "Erro ao buscar endereços",
            "error"
          );
        }
      } catch (error: any) {
        setAddresses([]);
        setPagination((prev) => ({ ...prev, totalItems: 0, totalPages: 0 }));
        showSnackbar(
          error?.message || "Erro ao buscar endereços",
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
    [showSnackbar]
  );

  const createAddress = useCallback(
    async (payload: AddressPayload) => {
      try {
        const response = await addressesService.create(payload);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Endereço criado com sucesso!", "success");
          // Recarregar lista após criar
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
        showSnackbar(
          error?.message || "Erro ao criar endereço",
          "error"
        );
        return false;
      }
    },
    [showSnackbar, fetchAddresses]
  );

  const updateAddress = useCallback(
    async (id: number, payload: Partial<AddressPayload>) => {
      try {
        const response = await addressesService.update(id, payload);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Endereço atualizado com sucesso!", "success");
          // Recarregar lista após atualizar
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
        showSnackbar(
          error?.message || "Erro ao atualizar endereço",
          "error"
        );
        return false;
      }
    },
    [showSnackbar, fetchAddresses]
  );

  const deleteAddress = useCallback(
    async (id: number) => {
      try {
        const response = await addressesService.delete(id);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Endereço deletado com sucesso!", "success");
          // Recarregar lista após deletar
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
        showSnackbar(
          error?.message || "Erro ao deletar endereço",
          "error"
        );
        return false;
      }
    },
    [showSnackbar, fetchAddresses]
  );

  return {
    addresses,
    loading,
    pagination,
    snackbar,
    closeSnackbar,
    fetchAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
  };
};
