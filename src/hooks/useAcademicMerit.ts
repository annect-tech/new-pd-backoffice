import { useState, useCallback, useMemo } from "react";
import { httpClient } from "../core/http/httpClient";
import type { AcademicMerit } from "../interfaces/academicMerit";

const API_URL = import.meta.env.VITE_API_URL as string;

export const useAcademicMerit = () => {
  const [merits, setMerits] = useState<AcademicMerit[]>([]);
  const [allMerits, setAllMerits] = useState<AcademicMerit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchMerits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Substituir pelo endpoint real da API
      // const response = await httpClient.get<AcademicMerit[]>(API_URL, "/academic-merit/pending/");
      
      // Dados mockados para demonstração
      // Usando um PDF de exemplo público mais confiável
      const mockMerits: AcademicMerit[] = [
        {
          id: 1,
          document: "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf",
          created_at: "2024-03-10T10:00:00Z",
          updated_at: "2024-03-10T10:00:00Z",
          status: "aprovado",
          user_data_display: {
            user: {
              first_name: "João",
              last_name: "Silva",
            },
          },
        },
        {
          id: 2,
          document: "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf",
          created_at: "2024-03-11T14:30:00Z",
          updated_at: "2024-03-11T14:30:00Z",
          status: "aprovado",
          user_data_display: {
            user: {
              first_name: "Maria",
              last_name: "Santos",
            },
          },
        },
        {
          id: 3,
          document: "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf",
          created_at: "2024-03-12T09:15:00Z",
          updated_at: "2024-03-12T09:15:00Z",
          status: "reprovado",
          user_data_display: {
            user: {
              first_name: "Pedro",
              last_name: "Oliveira",
            },
          },
        },
      ];

      // Simular delay da API
      await new Promise((resolve) => setTimeout(resolve, 500));
      setMerits(mockMerits);
      setAllMerits(mockMerits);
      setCurrentIndex(0);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar documentos");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllMerits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Substituir pelo endpoint real da API
      // const response = await httpClient.get<AcademicMerit[]>(API_URL, "/academic-merit/all/");
      
      // Dados mockados para demonstração
      const mockAllMerits: AcademicMerit[] = [
        {
          id: 1,
          document: "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf",
          created_at: "2024-03-10T10:00:00Z",
          updated_at: "2024-03-10T10:00:00Z",
          status: "aprovado",
          user_data_display: {
            user: {
              first_name: "João",
              last_name: "Silva",
            },
          },
        },
        {
          id: 2,
          document: "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf",
          created_at: "2024-03-11T14:30:00Z",
          updated_at: "2024-03-11T14:30:00Z",
          status: "aprovado",
          user_data_display: {
            user: {
              first_name: "Maria",
              last_name: "Santos",
            },
          },
        },
        {
          id: 3,
          document: "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf",
          created_at: "2024-03-12T09:15:00Z",
          updated_at: "2024-03-12T09:15:00Z",
          status: "reprovado",
          user_data_display: {
            user: {
              first_name: "Pedro",
              last_name: "Oliveira",
            },
          },
        },
        {
          id: 4,
          document: "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf",
          created_at: "2024-03-13T08:00:00Z",
          updated_at: "2024-03-13T08:00:00Z",
          status: "aprovado",
          user_data_display: {
            user: {
              first_name: "Ana",
              last_name: "Costa",
            },
          },
        },
      ];

      // Simular delay da API
      await new Promise((resolve) => setTimeout(resolve, 500));
      setAllMerits(mockAllMerits);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar documentos");
    } finally {
      setLoading(false);
    }
  }, []);

  const currentMerit = useMemo(() => {
    return merits[currentIndex] || null;
  }, [merits, currentIndex]);

  const count = merits.length;

  const next = useCallback(() => {
    if (currentIndex < count - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, count]);

  const prev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const approveCurrent = useCallback(async () => {
    if (!currentMerit) return;

    setActionLoading(true);
    try {
      // TODO: Implementar chamada à API para aprovar
      // await httpClient.patch(API_URL, `/academic-merit/${currentMerit.id}/approve/`, {});
      
      // Simular delay da API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Remover o documento aprovado da lista
      const newMerits = merits.filter((m) => m.id !== currentMerit.id);
      setMerits(newMerits);
      
      // Ajustar o índice se necessário
      if (currentIndex >= newMerits.length && newMerits.length > 0) {
        setCurrentIndex(newMerits.length - 1);
      } else if (newMerits.length === 0) {
        setCurrentIndex(0);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao aprovar documento");
    } finally {
      setActionLoading(false);
    }
  }, [currentMerit, merits, currentIndex]);

  const recuseCurrent = useCallback(async () => {
    if (!currentMerit) return;

    setActionLoading(true);
    try {
      // TODO: Implementar chamada à API para reprovar
      // await httpClient.patch(API_URL, `/academic-merit/${currentMerit.id}/recuse/`, {});
      
      // Simular delay da API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Remover o documento reprovado da lista
      const newMerits = merits.filter((m) => m.id !== currentMerit.id);
      setMerits(newMerits);
      
      // Ajustar o índice se necessário
      if (currentIndex >= newMerits.length && newMerits.length > 0) {
        setCurrentIndex(newMerits.length - 1);
      } else if (newMerits.length === 0) {
        setCurrentIndex(0);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao reprovar documento");
    } finally {
      setActionLoading(false);
    }
  }, [currentMerit, merits, currentIndex]);

  return {
    loading,
    error,
    actionLoading,
    count,
    currentIndex,
    currentMerit,
    allMerits,
    approveCurrent,
    recuseCurrent,
    next,
    prev,
    fetchMerits,
    fetchAllMerits,
  };
};

