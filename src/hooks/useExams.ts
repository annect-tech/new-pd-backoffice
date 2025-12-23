import { useState, useCallback } from "react";
import { httpClient } from "../core/http/httpClient";
import type { Exam } from "../interfaces/exam";

const API_URL = import.meta.env.VITE_API_URL as string;

export const useExams = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generalAnchor, setGeneralAnchor] = useState<null | HTMLElement>(null);
  const [rowAnchor, setRowAnchor] = useState<null | HTMLElement>(null);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchExams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Substituir pelo endpoint real da API
      // const response = await httpClient.get<Exam[]>(API_URL, "/exams/");
      
      // Dados mockados para demonstração
      const mockExams: Exam[] = [
        {
          id: 1,
          score: 85,
          status: "aprovado",
          user_data: {
            cpf: "123.456.789-00",
            user: {
              first_name: "João",
              last_name: "Silva",
            },
          },
          exam_scheduled_hour: {
            hour: "08:00",
            exam_date: {
              date: "2024-03-20",
              local: {
                name: "Centro de Convenções",
              },
            },
          },
        },
        {
          id: 2,
          score: 90,
          status: "aprovado",
          user_data: {
            cpf: "987.654.321-00",
            user: {
              first_name: "Maria",
              last_name: "Santos",
            },
          },
          exam_scheduled_hour: {
            hour: "08:00",
            exam_date: {
              date: "2024-03-20",
              local: {
                name: "Centro de Convenções",
              },
            },
          },
        },
        {
          id: 3,
          score: 60,
          status: "reprovado",
          user_data: {
            cpf: "456.789.123-00",
            user: {
              first_name: "Pedro",
              last_name: "Oliveira",
            },
          },
          exam_scheduled_hour: {
            hour: "08:00",
            exam_date: {
              date: "2024-03-20",
              local: {
                name: "Centro de Convenções",
              },
            },
          },
        },
        {
          id: 4,
          score: 75,
          status: "aprovado",
          user_data: {
            cpf: "789.123.456-00",
            user: {
              first_name: "Ana",
              last_name: "Costa",
            },
          },
          exam_scheduled_hour: {
            hour: "14:00",
            exam_date: {
              date: "2024-03-20",
              local: {
                name: "Auditório Principal",
              },
            },
          },
        },
        {
          id: 5,
          score: 55,
          status: "reprovado",
          user_data: {
            cpf: "321.654.987-00",
            user: {
              first_name: "Carlos",
              last_name: "Souza",
            },
          },
          exam_scheduled_hour: {
            hour: "14:00",
            exam_date: {
              date: "2024-03-20",
              local: {
                name: "Auditório Principal",
              },
            },
          },
        },
      ];

      // Simular delay da API
      await new Promise((resolve) => setTimeout(resolve, 500));
      setExams(mockExams);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar exames");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOpenGeneralMenu = (event: React.MouseEvent<HTMLElement>) => {
    setGeneralAnchor(event.currentTarget);
  };

  const handleCloseGeneralMenu = () => {
    setGeneralAnchor(null);
  };

  const handleOpenRowMenu = (event: React.MouseEvent<HTMLElement>, rowId: number) => {
    event.stopPropagation();
    setRowAnchor(event.currentTarget);
    setSelectedRowId(rowId);
  };

  const handleCloseRowMenu = () => {
    setRowAnchor(null);
    setSelectedRowId(null);
  };

  const goToDetail = () => {
    if (selectedRowId) {
      // TODO: Implementar navegação para detalhes
      console.log("Ver detalhes do exame:", selectedRowId);
      handleCloseRowMenu();
    }
  };

  return {
    exams,
    loading,
    error,
    fetchExams,
    generalAnchor,
    rowAnchor,
    modalOpen,
    setModalOpen,
    handleOpenGeneralMenu,
    handleCloseGeneralMenu,
    handleOpenRowMenu,
    handleCloseRowMenu,
    goToDetail,
  };
};


