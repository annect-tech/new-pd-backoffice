import { useState, useCallback } from "react";
import { studentDataService, type StudentData } from "../core/http/services/studentDataService";

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

export const useStudentData = () => {
  const [students, setStudents] = useState<StudentData[]>([]);
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

  const fetchStudents = useCallback(
    async (page: number = 1, size: number = 10, search?: string) => {
      setLoading(true);
      try {
        const response = await studentDataService.list(page, size, search);

        if (response.status >= 200 && response.status < 300 && response.data) {
          const raw = response.data as any;
          let list: StudentData[] = [];
          
          if (Array.isArray(raw?.data)) {
            list = raw.data;
          } else if (Array.isArray(raw)) {
            list = raw;
          }

          setStudents(list);
          setPagination({
            currentPage: Number(raw?.currentPage ?? raw?.page ?? page),
            itemsPerPage: Number(raw?.itemsPerPage ?? raw?.size ?? size),
            totalItems: Number(raw?.totalItems ?? raw?.total ?? list.length),
            totalPages: Number(raw?.totalPages ?? Math.ceil((raw?.totalItems ?? raw?.total ?? list.length) / (raw?.itemsPerPage ?? raw?.size ?? size))),
          });
        } else {
          setStudents([]);
          setPagination((prev) => ({ ...prev, totalItems: 0, totalPages: 0 }));
          showSnackbar(
            response.message || "Erro ao buscar alunos",
            "error"
          );
        }
      } catch (error: any) {
        setStudents([]);
        setPagination((prev) => ({ ...prev, totalItems: 0, totalPages: 0 }));
        showSnackbar(
          error?.message || "Erro ao buscar alunos",
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
    [showSnackbar]
  );

  const fetchStudentById = useCallback(
    async (id: string | number) => {
      setLoading(true);
      try {
        const response = await studentDataService.getById(id);

        if (response.status >= 200 && response.status < 300 && response.data) {
          return response.data;
        } else {
          showSnackbar(response.message || "Erro ao buscar aluno", "error");
          return null;
        }
      } catch (error: any) {
        showSnackbar(error?.message || "Erro ao buscar aluno", "error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showSnackbar]
  );

  const createStudent = useCallback(
    async (payload: Partial<StudentData>) => {
      try {
        const response = await studentDataService.create(payload);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Aluno criado com sucesso", "success");
          return response.data;
        } else {
          showSnackbar(response.message || "Erro ao criar aluno", "error");
          return null;
        }
      } catch (error: any) {
        showSnackbar(error?.message || "Erro ao criar aluno", "error");
        return null;
      }
    },
    [showSnackbar]
  );

  const updateStudent = useCallback(
    async (id: string | number, payload: Partial<StudentData>) => {
      try {
        const response = await studentDataService.update(id, payload);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Aluno atualizado com sucesso", "success");
          return true;
        } else {
          showSnackbar(response.message || "Erro ao atualizar aluno", "error");
          return false;
        }
      } catch (error: any) {
        showSnackbar(error?.message || "Erro ao atualizar aluno", "error");
        return false;
      }
    },
    [showSnackbar]
  );

  const deleteStudent = useCallback(
    async (id: string | number) => {
      try {
        const response = await studentDataService.delete(id);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Aluno deletado com sucesso", "success");
          return true;
        } else {
          showSnackbar(response.message || "Erro ao deletar aluno", "error");
          return false;
        }
      } catch (error: any) {
        showSnackbar(error?.message || "Erro ao deletar aluno", "error");
        return false;
      }
    },
    [showSnackbar]
  );

  return {
    students,
    loading,
    pagination,
    snackbar,
    closeSnackbar,
    fetchStudents,
    fetchStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
  };
};
