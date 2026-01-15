import { useState, useCallback } from "react";
import {
  faqService,
  type FAQ,
  type FAQPayload,
} from "../core/http/services/faqService";

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

export const useFaqs = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [currentFaq, setCurrentFaq] = useState<FAQ | null>(null);
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
   * Lista FAQs (admin)
   */
  const fetchFaqs = useCallback(
    async (page: number = 1, size: number = 10, search?: string) => {
      setLoading(true);
      try {
        const response = await faqService.list(page, size, search);

        if (response.status >= 200 && response.status < 300 && response.data) {
          const faqData = Array.isArray(response.data.data) ? response.data.data : [];
          setFaqs(faqData);
          setPagination({
            currentPage: response.data.currentPage || page,
            itemsPerPage: response.data.itemsPerPage || size,
            totalItems: response.data.totalItems || 0,
            totalPages: response.data.totalPages || 0,
          });
        } else {
          setFaqs([]);
          showSnackbar(
            response.message || "Erro ao buscar FAQs",
            "error"
          );
        }
      } catch (error: any) {
        setFaqs([]);
        showSnackbar(error?.message || "Erro ao buscar FAQs", "error");
      } finally {
        setLoading(false);
      }
    },
    [showSnackbar]
  );

  /**
   * Lista FAQs públicas (user)
   */
  const fetchPublicFaqs = useCallback(
    async (page: number = 1, size: number = 10) => {
      setLoading(true);
      try {
        const response = await faqService.listUser(page, size);

        if (response.status >= 200 && response.status < 300 && response.data) {
          const faqData = Array.isArray(response.data.data) ? response.data.data : [];
          setFaqs(faqData);
          setPagination({
            currentPage: response.data.currentPage || page,
            itemsPerPage: response.data.itemsPerPage || size,
            totalItems: response.data.totalItems || 0,
            totalPages: response.data.totalPages || 0,
          });
        } else {
          setFaqs([]);
          showSnackbar(
            response.message || "Erro ao buscar FAQs",
            "error"
          );
        }
      } catch (error: any) {
        setFaqs([]);
        showSnackbar(error?.message || "Erro ao buscar FAQs", "error");
      } finally {
        setLoading(false);
      }
    },
    [showSnackbar]
  );

  /**
   * Obtém uma FAQ por ID (admin)
   */
  const fetchFaqById = useCallback(
    async (id: string | number) => {
      setLoading(true);
      try {
        const response = await faqService.getById(id);

        if (response.status >= 200 && response.status < 300 && response.data) {
          setCurrentFaq(response.data as FAQ);
          return response.data as FAQ;
        } else {
          showSnackbar(
            response.message || "Erro ao buscar FAQ",
            "error"
          );
          return null;
        }
      } catch (error: any) {
        showSnackbar(error?.message || "Erro ao buscar FAQ", "error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showSnackbar]
  );

  /**
   * Cria uma nova FAQ (admin)
   */
  const createFaq = useCallback(
    async (payload: FAQPayload) => {
      try {
        const response = await faqService.create(payload);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("FAQ criada com sucesso!", "success");
          await fetchFaqs();
          return true;
        } else {
          showSnackbar(
            response.message || "Erro ao criar FAQ",
            "error"
          );
          return false;
        }
      } catch (error: any) {
        showSnackbar(error?.message || "Erro ao criar FAQ", "error");
        return false;
      }
    },
    [showSnackbar, fetchFaqs]
  );

  /**
   * Atualiza uma FAQ existente (admin)
   */
  const updateFaq = useCallback(
    async (id: string | number, payload: Partial<FAQPayload>) => {
      try {
        const response = await faqService.update(id, payload);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("FAQ atualizada com sucesso!", "success");
          await fetchFaqs();
          return true;
        } else {
          showSnackbar(
            response.message || "Erro ao atualizar FAQ",
            "error"
          );
          return false;
        }
      } catch (error: any) {
        showSnackbar(error?.message || "Erro ao atualizar FAQ", "error");
        return false;
      }
    },
    [showSnackbar, fetchFaqs]
  );

  /**
   * Deleta uma FAQ (admin)
   */
  const deleteFaq = useCallback(
    async (id: string | number) => {
      try {
        const response = await faqService.delete(id);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("FAQ deletada com sucesso!", "success");
          await fetchFaqs();
          return true;
        } else {
          showSnackbar(
            response.message || "Erro ao deletar FAQ",
            "error"
          );
          return false;
        }
      } catch (error: any) {
        showSnackbar(error?.message || "Erro ao deletar FAQ", "error");
        return false;
      }
    },
    [showSnackbar, fetchFaqs]
  );

  return {
    faqs,
    currentFaq,
    loading,
    pagination,
    snackbar,
    closeSnackbar,
    fetchFaqs,
    fetchPublicFaqs,
    fetchFaqById,
    createFaq,
    updateFaq,
    deleteFaq,
  };
};
