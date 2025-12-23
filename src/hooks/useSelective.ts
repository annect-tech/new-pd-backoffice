import { useState, useCallback } from "react";
import { httpClient } from "../core/http/httpClient";
import type { UserProfile } from "../interfaces/userProfile";

const API_URL = import.meta.env.VITE_API_URL as string;

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

export const useSelective = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
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
    try {
      // TODO: Substituir pelo endpoint real da API
      // const response = await httpClient.get<UserProfile[]>(API_URL, "/seletivo/users/");
      
      // Dados mockados para demonstração
      const mockUsers: UserProfile[] = [
        {
          id: 1,
          cpf: "123.456.789-00",
          first_name: "João",
          last_name: "Silva",
          username: "joao.silva",
          birth_date: "1990-01-15",
          celphone: "(11) 98765-4321",
          email: "joao@email.com",
          allowed_city: { active: true, localidade: "São Paulo", uf: "SP" },
          personas: {
            professional_status: "Empregado",
            experience: "Sim",
            experience_duration: "2-5 anos",
            programming_knowledge_level: "Intermediário",
            motivation_level: "Alta",
            project_priority: "Alta",
            weekly_available_hours: "20-30",
            study_commitment: "Alto",
            frustration_handling: "Bom",
            profession: "Desenvolvedor",
            maritial_status: "Solteiro",
            family_income: "R$ 5.000 - R$ 10.000",
            education_level: "Superior Completo",
            pcd: "Não",
            internet_type: "Fibra",
            public_school: "Não",
          },
          addresses: [
            {
              id: 1,
              cep: "01310-100",
              logradouro: "Avenida Paulista",
              complemento: "Apto 101",
              bairro: "Bela Vista",
              localidade: "São Paulo",
              uf: "SP",
            },
          ],
          guardians: [
            {
              cpf: "987.654.321-00",
              relationship: "Pai",
              name: "José Silva",
              cellphone: "(11) 91234-5678",
              email: "jose@email.com",
            },
          ],
          registration_data: {
            professional_status: "Empregado",
            contract: "pendente",
          },
          contract: { status: "pendente" },
        },
        {
          id: 2,
          cpf: "987.654.321-00",
          first_name: "Maria",
          last_name: "Santos",
          username: "maria.santos",
          birth_date: "1992-05-20",
          celphone: "(11) 97654-3210",
          email: "maria@email.com",
          allowed_city: { active: true, localidade: "Rio de Janeiro", uf: "RJ" },
          personas: {
            professional_status: "Desempregado",
            experience: "Não",
            programming_knowledge_level: "Iniciante",
          },
          addresses: [],
          guardians: [],
          registration_data: {},
          contract: { status: "aprovado" },
        },
        {
          id: 3,
          cpf: "456.789.123-00",
          first_name: "Pedro",
          last_name: "Oliveira",
          username: "pedro.oliveira",
          birth_date: "1988-08-10",
          celphone: "(11) 96543-2109",
          email: "pedro@email.com",
          allowed_city: { active: false, localidade: "Belo Horizonte", uf: "MG" },
          personas: {},
          addresses: [],
          guardians: [],
          registration_data: {},
          contract: { status: "rejeitado" },
        },
      ];

      // Simular delay da API
      await new Promise((resolve) => setTimeout(resolve, 500));
      setUsers(mockUsers);
      showSnackbar("Dados carregados com sucesso", "success");
    } catch (error: any) {
      showSnackbar(
        error.message || "Erro ao carregar dados",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  const handleExportCSV = useCallback(() => {
    if (users.length === 0) {
      showSnackbar("Nenhum dado para exportar", "warning");
      return;
    }

    const headers = ["ID", "CPF", "Nome", "Data Nasc.", "Celular", "Email", "Cidade", "UF"];
    const rows = users.map((u) => [
      u.id,
      u.cpf,
      `${u.first_name} ${u.last_name}`,
      u.birth_date,
      u.celphone,
      u.email,
      u.allowed_city.localidade,
      u.allowed_city.uf,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `seletivo_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    showSnackbar("Arquivo CSV exportado com sucesso", "success");
  }, [users, showSnackbar]);

  const handleExportJSON = useCallback(() => {
    if (users.length === 0) {
      showSnackbar("Nenhum dado para exportar", "warning");
      return;
    }

    const jsonContent = JSON.stringify(users, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `seletivo_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    showSnackbar("Arquivo JSON exportado com sucesso", "success");
  }, [users, showSnackbar]);

  const handleExportXLSX = useCallback(() => {
    showSnackbar("Exportação XLSX em desenvolvimento", "info");
    // TODO: Implementar exportação XLSX usando biblioteca como xlsx
  }, [showSnackbar]);

  return {
    users,
    loading,
    snackbar,
    closeSnackbar,
    fetchUsers,
    handleExportCSV,
    handleExportJSON,
    handleExportXLSX,
  };
};


