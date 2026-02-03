import { useState, useCallback } from "react";
import { examScheduleService } from "../core/http/services/examScheduleService";
import type {
  ExamLocal,
  ExamDate,
  ExamHour,
  ScheduleWizardData,
  ScheduleBulkPayload,
} from "../interfaces/examScheduleTypes";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

export const useExamSchedule = () => {
  // Estados de dados
  const [locals, setLocals] = useState<ExamLocal[]>([]);
  const [dates, setDates] = useState<ExamDate[]>([]);
  const [hours, setHours] = useState<ExamHour[]>([]);
  
  // Estados de loading
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Estados de erro
  const [error, setError] = useState<string | null>(null);
  
  // Estado do wizard
  const [wizardData, setWizardData] = useState<ScheduleWizardData>({
    selectedDates: [],
    defaultHours: [],
    customHoursByDate: {},
    localId: undefined,
  });
  
  // Estado do step atual
  const [currentStep, setCurrentStep] = useState(0);
  
  // Snackbar
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

  // ============== FETCH OPERATIONS ==============

  /**
   * Busca todos os locais de prova
   * GET /user/exam
   */
  const fetchLocals = useCallback(async (page: number = 1, limit: number = 100, search?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await examScheduleService.listLocals(page, limit, search);
      
      if (response.status >= 200 && response.status < 300 && response.data) {
        const data = response.data;
        // A resposta pode vir paginada com propriedade "data" ou como array direto
        const list = Array.isArray(data) ? data : (data as any).data || [];
        setLocals(list);
      } else {
        setLocals([]);
        const errorMessage = response.message || "Erro ao carregar locais";
        setError(errorMessage);
        showSnackbar(errorMessage, "error");
      }
    } catch (err: any) {
      setLocals([]);
      const errorMessage = err?.message || "Erro ao carregar locais";
      setError(errorMessage);
      showSnackbar(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  /**
   * Busca datas de um local específico
   * GET /user/exam/dates/:localId
   */
  const fetchDates = useCallback(async (localId: string | number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await examScheduleService.listDates(localId);
      
      if (response.status >= 200 && response.status < 300 && response.data) {
        const data = response.data;
        const list = Array.isArray(data) ? data : [];
        setDates(list);
      } else {
        setDates([]);
        const errorMessage = response.message || "Erro ao carregar datas";
        setError(errorMessage);
        showSnackbar(errorMessage, "error");
      }
    } catch (err: any) {
      setDates([]);
      const errorMessage = err?.message || "Erro ao carregar datas";
      setError(errorMessage);
      showSnackbar(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  /**
   * Busca horários de uma data específica
   * GET /user/exam/hours/:dateId
   */
  const fetchHours = useCallback(async (dateId: string | number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await examScheduleService.listHours(dateId);
      
      if (response.status >= 200 && response.status < 300 && response.data) {
        const data = response.data;
        const list = Array.isArray(data) ? data : [];
        setHours(list);
      } else {
        setHours([]);
        const errorMessage = response.message || "Erro ao carregar horários";
        setError(errorMessage);
        showSnackbar(errorMessage, "error");
      }
    } catch (err: any) {
      setHours([]);
      const errorMessage = err?.message || "Erro ao carregar horários";
      setError(errorMessage);
      showSnackbar(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  // ============== WIZARD OPERATIONS ==============

  const updateWizardData = useCallback((updates: Partial<ScheduleWizardData>) => {
    setWizardData((prev) => ({ ...prev, ...updates }));
  }, []);

  const toggleDate = useCallback((date: Date) => {
    setWizardData((prev) => {
      const dateStr = date.toISOString().split("T")[0];
      const exists = prev.selectedDates.some(
        (d) => d.toISOString().split("T")[0] === dateStr
      );
      
      if (exists) {
        // Remove a data e seus horários personalizados
        const newCustomHours = { ...prev.customHoursByDate };
        delete newCustomHours[dateStr];
        
        return {
          ...prev,
          selectedDates: prev.selectedDates.filter(
            (d) => d.toISOString().split("T")[0] !== dateStr
          ),
          customHoursByDate: newCustomHours,
        };
      } else {
        // Adiciona a data
        return {
          ...prev,
          selectedDates: [...prev.selectedDates, date].sort(
            (a, b) => a.getTime() - b.getTime()
          ),
        };
      }
    });
  }, []);

  const toggleDefaultHour = useCallback((hour: string) => {
    setWizardData((prev) => {
      const exists = prev.defaultHours.includes(hour);
      
      if (exists) {
        return {
          ...prev,
          defaultHours: prev.defaultHours.filter((h) => h !== hour),
        };
      } else {
        return {
          ...prev,
          defaultHours: [...prev.defaultHours, hour].sort(),
        };
      }
    });
  }, []);

  const setCustomHoursForDate = useCallback((date: Date, hours: string[]) => {
    const dateStr = date.toISOString().split("T")[0];
    setWizardData((prev) => ({
      ...prev,
      customHoursByDate: {
        ...prev.customHoursByDate,
        [dateStr]: hours.sort(),
      },
    }));
  }, []);

  const useDefaultHoursForDate = useCallback((date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    setWizardData((prev) => {
      const newCustomHours = { ...prev.customHoursByDate };
      delete newCustomHours[dateStr];
      return {
        ...prev,
        customHoursByDate: newCustomHours,
      };
    });
  }, []);

  const addCustomHourToDate = useCallback((date: Date, hour: string) => {
    const dateStr = date.toISOString().split("T")[0];
    setWizardData((prev) => {
      const currentHours = prev.customHoursByDate[dateStr] || [...prev.defaultHours];
      if (currentHours.includes(hour)) return prev;
      
      return {
        ...prev,
        customHoursByDate: {
          ...prev.customHoursByDate,
          [dateStr]: [...currentHours, hour].sort(),
        },
      };
    });
  }, []);

  const removeCustomHourFromDate = useCallback((date: Date, hour: string) => {
    const dateStr = date.toISOString().split("T")[0];
    setWizardData((prev) => {
      const currentHours = prev.customHoursByDate[dateStr] || [...prev.defaultHours];
      
      return {
        ...prev,
        customHoursByDate: {
          ...prev.customHoursByDate,
          [dateStr]: currentHours.filter((h) => h !== hour),
        },
      };
    });
  }, []);

  const getHoursForDate = useCallback((date: Date): string[] => {
    const dateStr = date.toISOString().split("T")[0];
    return wizardData.customHoursByDate[dateStr] || wizardData.defaultHours;
  }, [wizardData.customHoursByDate, wizardData.defaultHours]);

  const isDateCustomized = useCallback((date: Date): boolean => {
    const dateStr = date.toISOString().split("T")[0];
    return dateStr in wizardData.customHoursByDate;
  }, [wizardData.customHoursByDate]);

  // ============== SAVE OPERATIONS ==============

  /**
   * Salva o agendamento usando o endpoint bulk
   * POST /user/exam/dates
   */
  const saveSchedule = useCallback(async () => {
    if (!wizardData.localId) {
      showSnackbar("Selecione um local de prova", "error");
      return false;
    }

    if (wizardData.selectedDates.length === 0) {
      showSnackbar("Selecione pelo menos uma data", "error");
      return false;
    }

    if (wizardData.defaultHours.length === 0) {
      showSnackbar("Defina pelo menos um horário padrão", "error");
      return false;
    }

    setSaving(true);
    try {
      // Prepara o payload no formato esperado pela API
      // POST /user/exam/dates com formato DD/MM/YYYY e horários HH:mm
      const schedules = wizardData.selectedDates.map((date) => {
        const hours = getHoursForDate(date);
        return {
          date: examScheduleService.formatDateToAPI(date), // DD/MM/YYYY
          hours: hours.map((h) => examScheduleService.formatHourToAPI(h)), // HH:mm
        };
      });

      const payload: ScheduleBulkPayload = {
        local_id: Number(wizardData.localId),
        schedules,
      };

      const response = await examScheduleService.createDatesBulk(payload);

      if (response.status >= 200 && response.status < 300) {
        showSnackbar(
          `Agendamento criado com sucesso! ${wizardData.selectedDates.length} data(s) cadastrada(s).`,
          "success"
        );
        
        // Reset wizard
        setWizardData({
          selectedDates: [],
          defaultHours: [],
          customHoursByDate: {},
          localId: wizardData.localId,
        });
        setCurrentStep(0);
        
        // Recarregar dados
        await fetchDates(wizardData.localId);
        
        return true;
      } else {
        const errorMessage = response.message || "Erro ao criar agendamento";
        showSnackbar(errorMessage, "error");
        return false;
      }
    } catch (err: any) {
      const errorMessage = err?.message || "Erro ao salvar agendamento";
      showSnackbar(errorMessage, "error");
      return false;
    } finally {
      setSaving(false);
    }
  }, [wizardData, getHoursForDate, showSnackbar, fetchDates]);

  // ============== CRUD OPERATIONS ==============

  /**
   * Cria um novo local de prova
   */
  const createLocal = useCallback(async (name: string, fullAddress: string, allowedCityId: number) => {
    setSaving(true);
    try {
      const response = await examScheduleService.createLocal({
        name,
        full_address: fullAddress,
        allowed_city_id: allowedCityId,
      });

      if (response.status >= 200 && response.status < 300) {
        showSnackbar("Local de prova criado com sucesso", "success");
        await fetchLocals();
        return response.data;
      } else {
        const errorMessage = response.message || "Erro ao criar local";
        showSnackbar(errorMessage, "error");
        return null;
      }
    } catch (err: any) {
      const errorMessage = err?.message || "Erro ao criar local";
      showSnackbar(errorMessage, "error");
      return null;
    } finally {
      setSaving(false);
    }
  }, [showSnackbar, fetchLocals]);

  /**
   * Atualiza um local de prova
   */
  const updateLocal = useCallback(async (
    id: string | number,
    data: { name?: string; full_address?: string; allowed_city_id?: number }
  ) => {
    setSaving(true);
    try {
      const response = await examScheduleService.updateLocal(id, data);

      if (response.status >= 200 && response.status < 300) {
        showSnackbar("Local atualizado com sucesso", "success");
        await fetchLocals();
        return true;
      } else {
        const errorMessage = response.message || "Erro ao atualizar local";
        showSnackbar(errorMessage, "error");
        return false;
      }
    } catch (err: any) {
      const errorMessage = err?.message || "Erro ao atualizar local";
      showSnackbar(errorMessage, "error");
      return false;
    } finally {
      setSaving(false);
    }
  }, [showSnackbar, fetchLocals]);

  /**
   * Deleta um local de prova
   */
  const deleteLocal = useCallback(async (id: string | number) => {
    setSaving(true);
    try {
      const response = await examScheduleService.deleteLocal(id);

      if (response.status >= 200 && response.status < 300) {
        showSnackbar("Local deletado com sucesso", "success");
        await fetchLocals();
        return true;
      } else {
        const errorMessage = response.message || "Erro ao deletar local";
        showSnackbar(errorMessage, "error");
        return false;
      }
    } catch (err: any) {
      const errorMessage = err?.message || "Erro ao deletar local";
      showSnackbar(errorMessage, "error");
      return false;
    } finally {
      setSaving(false);
    }
  }, [showSnackbar, fetchLocals]);

  /**
   * Adiciona um horário individual a uma data
   */
  const addHourToDate = useCallback(async (examDateId: number, hour: string) => {
    setSaving(true);
    try {
      const response = await examScheduleService.createHour({
        exam_date_id: examDateId,
        hour: examScheduleService.formatHourToAPI(hour),
      });

      if (response.status >= 200 && response.status < 300) {
        showSnackbar("Horário criado com sucesso", "success");
        return response.data;
      } else {
        const errorMessage = response.message || "Erro ao criar horário";
        showSnackbar(errorMessage, "error");
        return null;
      }
    } catch (err: any) {
      const errorMessage = err?.message || "Erro ao criar horário";
      showSnackbar(errorMessage, "error");
      return null;
    } finally {
      setSaving(false);
    }
  }, [showSnackbar]);

  /**
   * Atualiza uma data de prova
   */
  const updateDate = useCallback(async (id: string | number, newDate: string) => {
    setSaving(true);
    try {
      const response = await examScheduleService.updateDate(id, { date: newDate });

      if (response.status >= 200 && response.status < 300) {
        showSnackbar("Data atualizada com sucesso", "success");
        return true;
      } else {
        const errorMessage = response.message || "Erro ao atualizar data";
        showSnackbar(errorMessage, "error");
        return false;
      }
    } catch (err: any) {
      const errorMessage = err?.message || "Erro ao atualizar data";
      showSnackbar(errorMessage, "error");
      return false;
    } finally {
      setSaving(false);
    }
  }, [showSnackbar]);

  /**
   * Deleta uma data de prova
   */
  const deleteDate = useCallback(async (id: string | number) => {
    setSaving(true);
    try {
      const response = await examScheduleService.deleteDate(id);

      if (response.status >= 200 && response.status < 300) {
        showSnackbar("Data deletada com sucesso", "success");
        return true;
      } else {
        const errorMessage = response.message || "Erro ao deletar data";
        showSnackbar(errorMessage, "error");
        return false;
      }
    } catch (err: any) {
      const errorMessage = err?.message || "Erro ao deletar data";
      showSnackbar(errorMessage, "error");
      return false;
    } finally {
      setSaving(false);
    }
  }, [showSnackbar]);

  /**
   * Atualiza um horário
   */
  const updateHour = useCallback(async (id: string | number, newHour: string) => {
    setSaving(true);
    try {
      const response = await examScheduleService.updateHour(id, { 
        hour: examScheduleService.formatHourToAPI(newHour) 
      });

      if (response.status >= 200 && response.status < 300) {
        showSnackbar("Horário atualizado com sucesso", "success");
        return true;
      } else {
        const errorMessage = response.message || "Erro ao atualizar horário";
        showSnackbar(errorMessage, "error");
        return false;
      }
    } catch (err: any) {
      const errorMessage = err?.message || "Erro ao atualizar horário";
      showSnackbar(errorMessage, "error");
      return false;
    } finally {
      setSaving(false);
    }
  }, [showSnackbar]);

  /**
   * Deleta um horário
   */
  const deleteHour = useCallback(async (id: string | number) => {
    setSaving(true);
    try {
      const response = await examScheduleService.deleteHour(id);

      if (response.status >= 200 && response.status < 300) {
        showSnackbar("Horário deletado com sucesso", "success");
        return true;
      } else {
        const errorMessage = response.message || "Erro ao deletar horário";
        showSnackbar(errorMessage, "error");
        return false;
      }
    } catch (err: any) {
      const errorMessage = err?.message || "Erro ao deletar horário";
      showSnackbar(errorMessage, "error");
      return false;
    } finally {
      setSaving(false);
    }
  }, [showSnackbar]);

  // ============== NAVIGATION ==============

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(Math.max(0, Math.min(step, 3)));
  }, []);

  const resetWizard = useCallback(() => {
    setWizardData({
      selectedDates: [],
      defaultHours: [],
      customHoursByDate: {},
      localId: undefined,
    });
    setCurrentStep(0);
  }, []);

  return {
    // Data states
    locals,
    dates,
    hours,
    wizardData,
    currentStep,
    
    // Loading states
    loading,
    saving,
    error,
    
    // Snackbar
    snackbar,
    closeSnackbar,
    showSnackbar,
    
    // Fetch operations
    fetchLocals,
    fetchDates,
    fetchHours,
    
    // Wizard operations
    updateWizardData,
    toggleDate,
    toggleDefaultHour,
    setCustomHoursForDate,
    useDefaultHoursForDate,
    addCustomHourToDate,
    removeCustomHourFromDate,
    getHoursForDate,
    isDateCustomized,
    
    // Save operations
    saveSchedule,
    
    // CRUD operations
    createLocal,
    updateLocal,
    deleteLocal,
    addHourToDate,
    updateDate,
    deleteDate,
    updateHour,
    deleteHour,
    
    // Navigation
    nextStep,
    prevStep,
    goToStep,
    resetWizard,
  };
};
