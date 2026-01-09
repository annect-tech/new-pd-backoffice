import { useState, useCallback, useMemo } from "react";
import type { AcademicMerit } from "../interfaces/academicMerit";
import { academicMeritService } from "../core/http/services/academicMeritService";

export const useAcademicMerit = () => {
  const [merits, setMerits] = useState<AcademicMerit[]>([]);
  const [allMerits, setAllMerits] = useState<AcademicMerit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchMerits = useCallback(async (pOrEvent?: any, s: number = size) => {
    const p = typeof pOrEvent === "number" ? pOrEvent : page;
    setLoading(true);
    setError(null);
    try {
      // Use paginated list filtered by pending status
      const response = await academicMeritService.list(p, s, "pending");

      if (response.status >= 200 && response.status < 300 && response.data) {
        const meritData = Array.isArray(response.data.data) ? response.data.data : [];
        setMerits(meritData);
        setPage(response.data.currentPage || p);
        setSize(response.data.itemsPerPage || s);
        setTotalItems(response.data.totalItems || 0);
        setTotalPages(response.data.totalPages || 0);
        setCurrentIndex(0);
        return;
      }

      setMerits([]);
      setError(response.message || "Erro ao carregar documentos");
    } catch (err: any) {
      setMerits([]);
      setError(err.message || "Erro ao carregar documentos");
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  const fetchAllMerits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await academicMeritService.listAll();

      if (response.status >= 200 && response.status < 300 && response.data) {
        const meritData = Array.isArray(response.data) ? response.data : [];
        setAllMerits(meritData);
        return;
      }

      setAllMerits([]);
      setError(response.message || "Erro ao carregar documentos");
    } catch (err: any) {
      setAllMerits([]);
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
      const response = await academicMeritService.approve(currentMerit.id);

      if (response.status >= 200 && response.status < 300) {
        // Refresh list
        await fetchMerits();
      } else {
        setError(response.message || "Erro ao aprovar documento");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao aprovar documento");
    } finally {
      setActionLoading(false);
    }
  }, [currentMerit, fetchMerits]);

  const recuseCurrent = useCallback(async () => {
    if (!currentMerit) return;

    setActionLoading(true);
    try {
      const response = await academicMeritService.reject(currentMerit.id);

      if (response.status >= 200 && response.status < 300) {
        // Refresh list
        await fetchMerits();
      } else {
        setError(response.message || "Erro ao reprovar documento");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao reprovar documento");
    } finally {
      setActionLoading(false);
    }
  }, [currentMerit, fetchMerits]);

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
    page,
    size,
    totalItems,
    totalPages,
  };
};

